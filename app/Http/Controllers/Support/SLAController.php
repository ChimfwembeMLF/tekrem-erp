<?php

namespace App\Http\Controllers\Support;

use App\Http\Controllers\Controller;
use App\Models\Support\SLA;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SLAController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = SLA::query()
            ->where('company_id', currentCompanyId())
            ->withCount(['tickets' => function ($q) {
                $q->where('company_id', currentCompanyId());
            }])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($request->active !== null, function ($query) use ($request) {
                $query->where('is_active', $request->boolean('active'));
            });

        $slas = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Support/SLA/Index', [
            'slas' => $slas,
            'filters' => $request->only(['search', 'active']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Support/SLA/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('s_l_a_s', 'name')->where(fn($q) => $q->where('company_id', currentCompanyId()))],
            'description' => ['nullable', 'string'],
            'response_time_hours' => ['required', 'integer', 'min:1', 'max:168'], // Max 1 week
            'resolution_time_hours' => ['required', 'integer', 'min:1', 'max:720'], // Max 30 days
            'escalation_time_hours' => ['required', 'integer', 'min:1', 'max:168'],
            'business_hours_only' => ['boolean'],
            'is_active' => ['boolean'],
            'is_default' => ['boolean'],
            'priority_levels' => ['nullable', 'array'],
            'conditions' => ['nullable', 'array'],
        ]);

        $validated['company_id'] = currentCompanyId();

        // If this is set as default, unset other defaults for this company
        if ($validated['is_default']) {
            SLA::where('company_id', currentCompanyId())
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }

        $sla = SLA::create($validated);

        return redirect()->route('support.sla.policies.show', $sla)
            ->with('success', 'SLA policy created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(SLA $policy): Response
    {
        // Ensure SLA belongs to current company
        if ($policy->company_id !== currentCompanyId()) {
            abort(404);
        }

        $policy->loadCount(['tickets' => function ($q) {
            $q->where('company_id', currentCompanyId());
        }]);

        // Get compliance data for the last 30 days
        $startDate = now()->subDays(30);
        $endDate = now();
        $compliance = $policy->getCompliancePercentage($startDate, $endDate, currentCompanyId());

        // Get recent tickets using this SLA for current company
        $recentTickets = $policy->tickets()
            ->where('company_id', currentCompanyId())
            ->with(['category', 'assignedTo', 'createdBy', 'requester'])
            ->latest()
            ->take(10)
            ->get();

        // Get SLA performance metrics for current company
        $metrics = [
            'total_tickets' => $policy->tickets()->where('company_id', currentCompanyId())->count(),
            'compliance_30_days' => $compliance,
            'avg_response_time' => $policy->tickets()
                ->where('company_id', currentCompanyId())
                ->whereNotNull('first_response_at')
                ->avg('response_time_minutes'),
            'avg_resolution_time' => $policy->tickets()
                ->where('company_id', currentCompanyId())
                ->whereNotNull('resolved_at')
                ->avg('resolution_time_minutes'),
            'breached_tickets' => $policy->tickets()
                ->where('company_id', currentCompanyId())
                ->where('created_at', '>=', $startDate)
                ->get()
                ->filter(function ($ticket) use ($policy) {
                    return $policy->isBreached($ticket, 'resolution');
                })
                ->count(),
        ];

        return Inertia::render('Support/SLA/Show', [
            'sla' => $policy,
            'metrics' => $metrics,
            'recentTickets' => $recentTickets,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(SLA $policy): Response
    {
        // Ensure SLA belongs to current company
        if ($policy->company_id !== currentCompanyId()) {
            abort(404);
        }
        return Inertia::render('Support/SLA/Edit', [
            'sla' => $policy,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SLA $policy): RedirectResponse
    {
        // Ensure SLA belongs to current company
        if ($policy->company_id !== currentCompanyId()) {
            abort(404);
        }
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('s_l_a_s', 'name')->ignore($policy->id)->where(fn($q) => $q->where('company_id', currentCompanyId()))],
            'description' => ['nullable', 'string'],
            'response_time_hours' => ['required', 'integer', 'min:1', 'max:168'],
            'resolution_time_hours' => ['required', 'integer', 'min:1', 'max:720'],
            'escalation_time_hours' => ['required', 'integer', 'min:1', 'max:168'],
            'business_hours_only' => ['boolean'],
            'is_active' => ['boolean'],
            'is_default' => ['boolean'],
            'priority_levels' => ['nullable', 'array'],
            'conditions' => ['nullable', 'array'],
        ]);

        // If this is set as default, unset other defaults for this company
        if ($validated['is_default'] && !$policy->is_default) {
            SLA::where('company_id', currentCompanyId())
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }

        $policy->update($validated);

        return redirect()->route('support.sla.policies.show', $policy)
            ->with('success', 'SLA policy updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SLA $policy): RedirectResponse
    {
        // Ensure SLA belongs to current company
        if ($policy->company_id !== currentCompanyId()) {
            abort(404);
        }
        // Check if SLA has tickets for this company
        if ($policy->tickets()->where('company_id', currentCompanyId())->count() > 0) {
            return redirect()->route('support.sla.policies.index')
                ->with('error', 'Cannot delete SLA policy that has tickets. Please reassign tickets first.');
        }

        // Check if it's the default SLA
        if ($policy->is_default) {
            return redirect()->route('support.sla.policies.index')
                ->with('error', 'Cannot delete the default SLA policy. Please set another SLA as default first.');
        }

        $policy->delete();

        return redirect()->route('support.sla.policies.index')
            ->with('success', 'SLA policy deleted successfully.');
    }

    /**
     * Activate an SLA policy.
     */
    public function activate(SLA $policy): JsonResponse
    {
        // Ensure SLA belongs to current company
        if ($policy->company_id !== currentCompanyId()) {
            abort(404);
        }
        $policy->update(['is_active' => true]);

        return response()->json(['message' => 'SLA policy activated successfully.']);
    }
}
