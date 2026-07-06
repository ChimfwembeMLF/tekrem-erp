<?php

namespace App\Http\Controllers;

use App\Http\Requests\OrganizationSignupRequest;
use App\Models\Organization;
use App\Services\Organizations\OrganizationBillingService;
use App\Services\Organizations\OrganizationOnboardingChecklistService;
use App\Services\Organizations\OrganizationOnboardingService;
use App\Support\Organizations\BillingPlanPresenter;
use App\Support\Organizations\OrganizationContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationOnboardingController extends Controller
{
    public function __construct(
        private OrganizationOnboardingService $onboardingService,
        private OrganizationBillingService $billingService,
        private OrganizationOnboardingChecklistService $checklistService,
        private OrganizationContext $organizationContext,
    ) {}

    public function plans(): Response
    {
        abort_unless(config('organizations.self_serve_signup', true), 404);

        return Inertia::render('Organization/Plans', [
            'plans' => BillingPlanPresenter::publicPlans(),
            'modules' => config('organizations.modules', []),
        ]);
    }

    public function create(Request $request): Response|RedirectResponse
    {
        abort_unless(config('organizations.self_serve_signup', true), 404);

        if ($request->user()) {
            return redirect()->route('dashboard');
        }

        $plans = BillingPlanPresenter::publicPlans();

        if ($plans->isEmpty()) {
            abort(503, 'No billing plans are available for signup.');
        }

        $selectedSlug = $request->query('plan');
        $selectedPlan = $selectedSlug
            ? $plans->firstWhere('slug', $selectedSlug)
            : null;

        return Inertia::render('Organization/Signup', [
            'plans' => $plans,
            'selectedPlanId' => $selectedPlan['id'] ?? $plans->first()['id'],
            'billingCycle' => $request->query('cycle', 'monthly'),
        ]);
    }

    public function store(OrganizationSignupRequest $request): RedirectResponse
    {
        abort_unless(config('organizations.self_serve_signup', true), 404);

        $result = $this->onboardingService->signup($request->validated());

        Auth::login($result['user']);

        $request->session()->regenerate();

        return redirect()
            ->route('organization.onboarding.checklist')
            ->with('success', 'Welcome! Complete your company profile to get started.');
    }

    public function welcome(Request $request): RedirectResponse
    {
        return redirect()->route('organization.onboarding.checklist');
    }

    public function checklist(Request $request): Response|RedirectResponse
    {
        $organization = $this->currentOrganization($request);

        if ($organization->hasCompletedOnboarding()) {
            return redirect()->route('dashboard');
        }

        $this->checklistService->initializeChecklist($organization);
        $organization->refresh();

        $subscription = $organization->activeSubscription;
        $plan = $subscription?->billingPlan;

        return Inertia::render('Organization/Onboarding', [
            'onboarding' => $this->checklistService->payload($organization),
            'options' => [
                'industries' => config('organizations.onboarding.industries', []),
                'countries' => config('organizations.onboarding.countries', []),
            ],
            'plan' => $plan ? BillingPlanPresenter::forPublic($plan) : null,
            'billing' => $this->billingService->summary($organization),
        ]);
    }

    public function updateStep(Request $request): RedirectResponse
    {
        $organization = $this->currentOrganization($request);
        $this->assertCanManage($request, $organization);

        $data = $request->validate([
            'step' => 'required|in:company_profile,contact_location,tax_compliance,branding',
        ]);

        $this->checklistService->saveStep($organization, $data['step'], $request->all());

        return redirect()
            ->route('organization.onboarding.checklist')
            ->with('success', 'Step saved.');
    }

    public function submit(Request $request): RedirectResponse
    {
        $organization = $this->currentOrganization($request);
        $this->assertCanManage($request, $organization);

        $data = $request->validate([
            'confirmed' => 'accepted',
        ]);

        $this->checklistService->submit($organization, (bool) $data['confirmed']);

        return redirect()
            ->route('dashboard')
            ->with('success', 'Company profile submitted. Your organization is ready to use.');
    }

    protected function currentOrganization(Request $request): Organization
    {
        if ($this->organizationContext->check()) {
            return $this->organizationContext->get();
        }

        $organization = $request->user()?->currentOrganization;

        abort_unless($organization, 404, 'No organization context.');

        return $organization;
    }

    protected function assertCanManage(Request $request, Organization $organization): void
    {
        $user = $request->user();
        abort_unless($user, 403);

        if ($user->isSuperUser()) {
            return;
        }

        $role = $user->organizationRole($organization);
        abort_unless(in_array($role, ['owner', 'admin'], true), 403, 'Only organization owners can complete onboarding.');
    }
}
