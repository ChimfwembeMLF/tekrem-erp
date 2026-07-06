<?php

namespace App\Http\Controllers;

use App\Support\Organizations\BillingPlanPresenter;
use App\Models\Organization;
use App\Models\OrganizationSubscription;
use App\Services\Organizations\OrganizationBillingService;
use App\Support\Organizations\OrganizationContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationBillingController extends Controller
{
    public function __construct(
        private OrganizationContext $organizationContext,
        private OrganizationBillingService $billingService,
    ) {}

    public function show(Request $request): Response
    {
        $organization = $this->currentOrganization($request);

        return Inertia::render('Organization/Billing', [
            'billing' => $this->billingService->summary($organization),
            'plans' => BillingPlanPresenter::publicPlans(),
        ]);
    }

    public function pay(Request $request): RedirectResponse
    {
        $organization = $this->currentOrganization($request);

        $data = $request->validate([
            'billing_plan_id' => 'nullable|exists:billing_plans,id',
            'billing_cycle' => 'nullable|in:monthly,yearly',
            'phone_number' => 'required|string|max:20',
            'correspondent' => 'nullable|string|max:40',
        ]);

        $result = $this->billingService->initiatePayment(
            $organization,
            $request->user(),
            $data,
        );

        if ($result['free_plan'] ?? false) {
            return redirect()
                ->route('organization.billing')
                ->with('success', 'Plan activated.');
        }

        return redirect()
            ->route('organization.billing')
            ->with('success', 'Check your phone to approve the PawaPay prompt.')
            ->with('billing_payment', [
                'subscription_id' => $result['subscription_id'],
                'transaction_number' => $result['transaction_number'],
            ]);
    }

    public function paymentStatus(Request $request, OrganizationSubscription $subscription): JsonResponse
    {
        $organization = $this->currentOrganization($request);

        abort_unless($subscription->organization_id === $organization->id, 404);

        return response()->json(
            $this->billingService->paymentStatus($organization, $subscription)
        );
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
}
