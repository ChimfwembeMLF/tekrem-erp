<?php

namespace App\Http\Controllers\AI;

use App\Http\Controllers\Controller;
use App\Models\AI\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ServiceController extends Controller
{
    /**
     * Display a listing of AI services.
     */
    public function index(Request $request)
    {
        $companyId = session('current_company_id');
        $query = Service::query()
            ->where('company_id', $companyId)
            ->when($request->search, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('provider', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($request->provider, function ($query, $provider) {
                $query->where('provider', $provider);
            })
            ->when($request->status !== null, function ($query) use ($request) {
                $query->where('is_enabled', $request->status === 'enabled');
            });

        $services = $query->withCount('models')
            ->orderBy('priority')
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        $providers = Service::where('company_id', $companyId)->distinct()->pluck('provider')->sort()->values();

        return Inertia::render('AI/Services/Index', [
            'services' => $services,
            'providers' => $providers,
            'filters' => $request->only(['search', 'provider', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new service.
     */
    public function create()
    {
        $companyId = session('current_company_id');
        return Inertia::render('AI/Services/Create', [
            'company_id' => $companyId
        ]);
    }

    /**
     * Store a newly created service.
     */
    public function store(Request $request)
    {
        $companyId = session('current_company_id');
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'provider' => ['required', 'string', 'in:mistral,openai,anthropic'],
            'api_key' => ['nullable', 'string'],
            'api_url' => ['nullable', 'url'],
            'description' => ['nullable', 'string'],
            'is_enabled' => ['boolean'],
            'is_default' => ['boolean'],
            'priority' => ['integer', 'min:0'],
            'supported_features' => ['array'],
            'cost_per_token' => ['nullable', 'numeric', 'min:0'],
            'rate_limit_per_minute' => ['nullable', 'integer', 'min:1'],
            'max_tokens_per_request' => ['nullable', 'integer', 'min:1'],
            'configuration' => ['array'],
        ]);
        $validated['slug'] = Str::slug($validated['name']);
        $validated['company_id'] = $companyId;
        $originalSlug = $validated['slug'];
        $counter = 1;
        while (Service::where('slug', $validated['slug'])->where('company_id', $companyId)->exists()) {
            $validated['slug'] = $originalSlug . '-' . $counter;
            $counter++;
        }
        $service = Service::create($validated);
        if ($validated['is_default'] ?? false) {
            $service->setAsDefault();
        }
        return redirect()->route('ai.services.show', $service)
            ->with('success', 'AI service created successfully.');
    }

    /**
     * Display the specified service.
     */
    public function show(Service $service)
    {
        $companyId = session('current_company_id');
        if ($service->company_id !== $companyId) {
            abort(403, 'Unauthorized');
        }
        $service->load(['models' => function ($query) {
            $query->orderBy('is_default', 'desc')->orderBy('name');
        }]);
        $usageStats = $service->getUsageStats('30 days');
        $connectionStatus = $service->testConnection();
        return Inertia::render('AI/Services/Show', [
            'service' => $service,
            'usageStats' => $usageStats,
            'connectionStatus' => $connectionStatus,
        ]);
    }

    /**
     * Show the form for editing the specified service.
     */
    public function edit(Service $service)
    {
        $companyId = session('current_company_id');
        if ($service->company_id !== $companyId) {
            abort(403, 'Unauthorized');
        }
        return Inertia::render('AI/Services/Edit', [
            'service' => $service,
        ]);
    }

    /**
     * Update the specified service.
     */
    public function update(Request $request, Service $service)
    {
        $companyId = session('current_company_id');
        if ($service->company_id !== $companyId) {
            abort(403, 'Unauthorized');
        }
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'provider' => ['required', 'string', 'in:mistral,openai,anthropic'],
            'api_key' => ['nullable', 'string'],
            'api_url' => ['nullable', 'url'],
            'description' => ['nullable', 'string'],
            'is_enabled' => ['boolean'],
            'is_default' => ['boolean'],
            'priority' => ['integer', 'min:0'],
            'supported_features' => ['array'],
            'cost_per_token' => ['nullable', 'numeric', 'min:0'],
            'rate_limit_per_minute' => ['nullable', 'integer', 'min:1'],
            'max_tokens_per_request' => ['nullable', 'integer', 'min:1'],
            'configuration' => ['array'],
        ]);
        if ($validated['name'] !== $service->name) {
            $newSlug = Str::slug($validated['name']);
            $originalSlug = $newSlug;
            $counter = 1;
            while (Service::where('slug', $newSlug).where('company_id', $companyId).where('id', '!=', $service->id).exists()) {
                $newSlug = $originalSlug . '-' . $counter;
                $counter++;
            }
            $validated['slug'] = $newSlug;
        }
        $service->update($validated);
        if ($validated['is_default'] ?? false) {
            $service->setAsDefault();
        }
        return redirect()->route('ai.services.show', $service)
            ->with('success', 'AI service updated successfully.');
    }

    /**
     * Remove the specified service.
     */
    public function destroy(Service $service)
    {
        $companyId = session('current_company_id');
        if ($service->company_id !== $companyId) {
            abort(403, 'Unauthorized');
        }
        if ($service->models()->where('company_id', $companyId)->count() > 0) {
            return redirect()->route('ai.services.index')
                ->with('error', 'Cannot delete service that has associated models.');
        }
        $service->delete();
        return redirect()->route('ai.services.index')
            ->with('success', 'AI service deleted successfully.');
    }

    /**
     * Test connection to the specified service.
     */
    public function testConnection(Service $service)
    {
        $companyId = session('current_company_id');
        if ($service->company_id !== $companyId) {
            abort(403, 'Unauthorized');
        }
        $result = $service->testConnection();
        return response()->json($result);
    }

    /**
     * Set the specified service as default.
     */
    public function setDefault(Service $service)
    {
        $companyId = session('current_company_id');
        if ($service->company_id !== $companyId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.'
            ], 403);
        }
        if (!$service->is_enabled) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot set disabled service as default.'
            ], 400);
        }
        $service->setAsDefault();
        return response()->json([
            'success' => true,
            'message' => 'Service set as default successfully.'
        ]);
    }

    /**
     * Toggle service enabled status.
     */
    public function toggleStatus(Service $service)
    {
        $companyId = session('current_company_id');
        if ($service->company_id !== $companyId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.'
            ], 403);
        }
        $newStatus = !$service->is_enabled;
        if (!$newStatus && $service->is_default) {
            $alternativeService = Service::where('id', '!=', $service->id)
                ->where('is_enabled', true)
                ->where('company_id', $companyId)
                ->first();
            if ($alternativeService) {
                $alternativeService->setAsDefault();
            }
        }
        $service->update(['is_enabled' => $newStatus]);
        $status = $newStatus ? 'enabled' : 'disabled';
        return response()->json([
            'success' => true,
            'message' => "Service {$status} successfully.",
            'is_enabled' => $newStatus
        ]);
    }
}
