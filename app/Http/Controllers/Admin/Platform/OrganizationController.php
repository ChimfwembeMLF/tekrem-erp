<?php

namespace App\Http\Controllers\Admin\Platform;

use App\Http\Controllers\Controller;
use App\Models\BillingPlan;
use App\Models\Organization;
use App\Services\Organizations\OrganizationProvisioner;
use App\Services\Organizations\PlatformOrganizationService;
use App\Support\Organizations\OrganizationContext;
use App\Support\Organizations\OrganizationUrl;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationController extends Controller
{
    public function __construct(
        private OrganizationContext $context,
        private OrganizationProvisioner $provisioner,
        private PlatformOrganizationService $platformOrganizationService,
        private OrganizationUrl $organizationUrl,
    ) {}

    public function create(): Response
    {
        return Inertia::render('Admin/Platform/Organizations/Create', [
            'plans' => BillingPlan::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(['id', 'name', 'slug', 'trial_days', 'price_monthly', 'price_yearly', 'currency']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'organization_name' => ['required', 'string', 'max:255'],
            'organization_email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'billing_plan_id' => ['required', 'exists:billing_plans,id'],
            'billing_cycle' => ['required', 'in:monthly,yearly'],
            'owner_mode' => ['required', 'in:new,existing'],
            'owner_name' => ['required_if:owner_mode,new', 'nullable', 'string', 'max:255'],
            'owner_email' => [
                'required',
                'email',
                'max:255',
                Rule::when($request->input('owner_mode') === 'new', ['unique:users,email']),
            ],
            'owner_password' => ['required_if:owner_mode,new', 'nullable', 'confirmed', Password::defaults()],
        ]);

        $organization = $this->platformOrganizationService->create($data);

        return redirect()
            ->route('admin.platform.organizations.show', $organization)
            ->with('success', "Organization “{$organization->name}” created.");
    }

    public function index(): Response
    {
        $organizations = $this->context->withoutScope(function () {
            return Organization::query()
                ->with(['owner:id,name,email', 'activeSubscription.billingPlan'])
                ->withCount('users')
                ->orderBy('name')
                ->get()
                ->map(fn (Organization $organization) => $this->transformOrganization($organization));
        });

        return Inertia::render('Admin/Platform/Organizations/Index', [
            'organizations' => $organizations,
            'plans' => BillingPlan::query()->orderBy('sort_order')->get(['id', 'name', 'slug']),
            'tenantRouting' => $this->tenantRoutingPayload(),
        ]);
    }

    public function show(Organization $organization): Response
    {
        $organization->load([
            'owner:id,name,email',
            'users:id,name,email',
            'activeSubscription.billingPlan',
            'subscriptions.billingPlan',
        ]);

        return Inertia::render('Admin/Platform/Organizations/Show', [
            'organization' => $this->transformOrganization($organization, detailed: true),
            'plans' => BillingPlan::query()->where('is_active', true)->orderBy('sort_order')->get(['id', 'name', 'slug', 'price_monthly', 'price_yearly', 'currency']),
            'tenantRouting' => $this->tenantRoutingPayload(),
        ]);
    }

    public function updateStatus(Request $request, Organization $organization): RedirectResponse
    {
        $data = $request->validate([
            'status' => 'required|in:trial,active,suspended,cancelled',
        ]);

        $organization->update(['status' => $data['status']]);

        return back()->with('success', 'Organization status updated.');
    }

    public function changePlan(Request $request, Organization $organization): RedirectResponse
    {
        $data = $request->validate([
            'billing_plan_id' => 'required|exists:billing_plans,id',
            'billing_cycle' => 'required|in:monthly,yearly',
        ]);

        $plan = BillingPlan::query()->findOrFail($data['billing_plan_id']);

        $this->provisioner->startSubscription(
            $organization,
            $plan,
            billingCycle: $data['billing_cycle'],
            trialing: false,
        );

        if ($organization->status === 'trial') {
            $organization->update(['status' => 'active', 'trial_ends_at' => null]);
        }

        return back()->with('success', "Plan changed to {$plan->name}.");
    }

    /**
     * @return array<string, mixed>
     */
    protected function transformOrganization(Organization $organization, bool $detailed = false): array
    {
        $subscription = $organization->activeSubscription;
        $plan = $subscription?->billingPlan;

        $payload = [
            'id' => $organization->id,
            'name' => $organization->name,
            'slug' => $organization->slug,
            'subdomain' => $organization->subdomain,
            'email' => $organization->email,
            'status' => $organization->status,
            'trial_ends_at' => $organization->trial_ends_at?->toIso8601String(),
            'users_count' => $organization->users_count ?? $organization->users->count(),
            'owner' => $organization->owner ? [
                'id' => $organization->owner->id,
                'name' => $organization->owner->name,
                'email' => $organization->owner->email,
            ] : null,
            'plan' => $plan ? [
                'id' => $plan->id,
                'name' => $plan->name,
                'slug' => $plan->slug,
            ] : null,
            'subscription' => $subscription ? [
                'status' => $subscription->status,
                'billing_cycle' => $subscription->billing_cycle,
                'current_period_end' => $subscription->current_period_end?->toIso8601String(),
            ] : null,
            'logo_url' => $organization->logo_url,
            'branding' => $organization->branding,
            'tenant' => $this->organizationUrl->payloadFor($organization),
        ];

        if ($detailed) {
            $payload['users'] = $organization->users->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->pivot->role,
            ]);
            $payload['subscriptions'] = $organization->subscriptions->map(fn ($sub) => [
                'id' => $sub->id,
                'status' => $sub->status,
                'billing_cycle' => $sub->billing_cycle,
                'plan' => $sub->billingPlan?->name,
                'current_period_start' => $sub->current_period_start?->toIso8601String(),
                'current_period_end' => $sub->current_period_end?->toIso8601String(),
            ]);
        }

        return $payload;
    }

    /**
     * @return array<string, mixed>
     */
    protected function tenantRoutingPayload(): array
    {
        $appDomain = config('organizations.app_domain');

        return [
            'configured' => $this->organizationUrl->isConfigured(),
            'app_domain' => $appDomain,
            'central_domains' => config('organizations.central_domains', []),
            'example_host' => $appDomain ? 'your-org.'.$appDomain : null,
        ];
    }
}
