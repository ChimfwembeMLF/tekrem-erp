<?php

namespace App\Services\Organizations;

use App\Models\BillingPlan;
use App\Models\Finance\MomoTransaction;
use App\Models\Organization;
use App\Models\OrganizationSubscription;
use App\Models\User;
use App\Services\Payments\PawaPayService;
use App\Services\Payments\PawaPayTransactionService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class OrganizationBillingService
{
    public function __construct(
        private PawaPayTransactionService $pawaPayTransactions,
        private PawaPayService $pawaPayService,
        private OrganizationProvisioner $provisioner,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function summary(Organization $organization): array
    {
        $organization->loadMissing(['activeSubscription.billingPlan']);

        $subscription = $organization->activeSubscription
            ?? $organization->subscriptions()->latest('id')->first()?->load('billingPlan');

        $plan = $subscription?->billingPlan;
        $cycle = $subscription?->billing_cycle ?? 'monthly';
        $amountDue = $plan ? $this->amountForPlan($plan, $cycle) : 0;

        $needsPayment = $this->needsPayment($organization, $subscription);

        return [
            'subscription' => $subscription ? $this->serializeSubscription($subscription) : null,
            'amount_due' => $amountDue,
            'currency' => $plan?->currency ?? 'ZMW',
            'needs_payment' => $needsPayment,
            'pawapay_configured' => $this->pawaPayService->isConfigured(),
            'networks' => $this->pawaPayTransactions->getNetworks(),
        ];
    }

    public function needsPayment(?Organization $organization, ?OrganizationSubscription $subscription): bool
    {
        if (! $organization || ! $subscription) {
            return false;
        }

        if ($subscription->status === 'pending_payment') {
            return true;
        }

        if ($subscription->status === 'past_due') {
            return true;
        }

        if ($subscription->status === 'trialing' && $organization->trial_ends_at?->isFuture()) {
            return false;
        }

        if ($organization->status === 'trial' && $organization->trial_ends_at?->isPast()) {
            return true;
        }

        if ($subscription->status === 'trialing' && $organization->trial_ends_at?->isPast()) {
            return true;
        }

        if ($subscription->status === 'active' && $subscription->current_period_end?->isPast()) {
            return true;
        }

        return false;
    }

    /**
     * @param  array{billing_plan_id?: int, billing_cycle?: string, phone_number: string, correspondent?: string|null}  $data
     * @return array<string, mixed>
     */
    public function initiatePayment(Organization $organization, User $user, array $data): array
    {
        if (! $this->pawaPayService->isConfigured()) {
            throw ValidationException::withMessages([
                'phone_number' => 'PawaPay is not configured. Contact platform support.',
            ]);
        }

        $this->authorizeBilling($organization, $user);

        $plan = isset($data['billing_plan_id'])
            ? BillingPlan::query()->where('is_active', true)->findOrFail($data['billing_plan_id'])
            : ($organization->activeSubscription?->billingPlan
                ?? BillingPlan::query()->where('is_active', true)->where('is_public', true)->orderBy('sort_order')->first());

        if (! $plan) {
            throw ValidationException::withMessages([
                'billing_plan_id' => 'No billing plan is available.',
            ]);
        }

        $cycle = $data['billing_cycle'] ?? $organization->activeSubscription?->billing_cycle ?? 'monthly';

        if (! in_array($cycle, ['monthly', 'yearly'], true)) {
            throw ValidationException::withMessages([
                'billing_cycle' => 'Invalid billing cycle.',
            ]);
        }

        $amount = $this->amountForPlan($plan, $cycle);

        if ($amount <= 0) {
            $subscription = $this->provisioner->startSubscription($organization, $plan, $cycle, trialing: false);
            $organization->update(['status' => 'active', 'trial_ends_at' => null]);

            return [
                'success' => true,
                'free_plan' => true,
                'subscription' => $this->serializeSubscription($subscription->load('billingPlan')),
            ];
        }

        return DB::transaction(function () use ($organization, $user, $plan, $cycle, $amount, $data) {
            $subscription = $organization->subscriptions()->create([
                'billing_plan_id' => $plan->id,
                'status' => 'pending_payment',
                'billing_cycle' => $cycle,
                'current_period_start' => null,
                'current_period_end' => null,
                'metadata' => [
                    'initiated_by' => $user->id,
                    'initiated_at' => now()->toIso8601String(),
                ],
            ]);

            $result = $this->pawaPayTransactions->initiateDeposit([
                'amount' => $amount,
                'currency' => $plan->currency,
                'phone_number' => $data['phone_number'],
                'correspondent' => $data['correspondent'] ?? null,
                'customer_name' => $user->name,
                'customer_email' => $user->email,
                'description' => "ERP subscription — {$plan->name}",
                'customer_message' => 'Tekrem ERP plan',
                'transactable_id' => $subscription->id,
                'transactable_type' => OrganizationSubscription::class,
                'user_id' => $user->id,
                'metadata' => [
                    'purpose' => 'organization_subscription',
                    'organization_id' => $organization->id,
                    'billing_plan_id' => $plan->id,
                    'billing_cycle' => $cycle,
                    'subscription_id' => $subscription->id,
                ],
            ]);

            if (! ($result['success'] ?? false)) {
                $subscription->update([
                    'status' => 'cancelled',
                    'cancelled_at' => now(),
                ]);

                throw ValidationException::withMessages([
                    'phone_number' => $result['error'] ?? 'Could not initiate mobile money payment.',
                ]);
            }

            /** @var MomoTransaction $transaction */
            $transaction = $result['transaction'];

            $subscription->update([
                'last_momo_transaction_id' => $transaction->id,
                'external_id' => $transaction->provider_transaction_id,
            ]);

            return [
                'success' => true,
                'subscription_id' => $subscription->id,
                'transaction_id' => $transaction->id,
                'transaction_number' => $transaction->transaction_number,
                'provider_status' => $result['provider_status'] ?? 'ACCEPTED',
                'amount' => $amount,
                'currency' => $plan->currency,
            ];
        });
    }

    public function applySuccessfulPayment(MomoTransaction $transaction): void
    {
        $subscription = $this->resolveSubscription($transaction);

        if (! $subscription || $subscription->status === 'active') {
            return;
        }

        $metadata = array_merge($subscription->metadata ?? [], $transaction->metadata ?? []);
        $planId = $metadata['billing_plan_id'] ?? $subscription->billing_plan_id;
        $cycle = $metadata['billing_cycle'] ?? $subscription->billing_cycle ?? 'monthly';

        $plan = BillingPlan::query()->find($planId) ?? $subscription->billingPlan;

        if (! $plan) {
            Log::warning('Organization billing payment completed but plan missing', [
                'transaction_id' => $transaction->id,
                'subscription_id' => $subscription->id,
            ]);

            return;
        }

        DB::transaction(function () use ($subscription, $transaction, $plan, $cycle) {
            $organization = $subscription->organization;

            $organization->subscriptions()
                ->where('id', '!=', $subscription->id)
                ->whereIn('status', ['trialing', 'active', 'past_due', 'pending_payment'])
                ->update([
                    'status' => 'cancelled',
                    'cancelled_at' => now(),
                ]);

            $periodStart = now();
            $periodEnd = $cycle === 'yearly'
                ? $periodStart->copy()->addYear()
                : $periodStart->copy()->addMonth();

            $subscription->update([
                'billing_plan_id' => $plan->id,
                'status' => 'active',
                'billing_cycle' => $cycle,
                'current_period_start' => $periodStart,
                'current_period_end' => $periodEnd,
                'cancelled_at' => null,
                'last_momo_transaction_id' => $transaction->id,
                'external_id' => $transaction->provider_transaction_id,
                'metadata' => array_merge($subscription->metadata ?? [], [
                    'last_payment_at' => now()->toIso8601String(),
                    'last_payment_amount' => (float) $transaction->amount,
                    'payment_method' => 'pawapay',
                ]),
            ]);

            $organization->update([
                'status' => 'active',
                'trial_ends_at' => null,
            ]);
        });

        Log::info('Organization subscription activated via PawaPay', [
            'subscription_id' => $subscription->id,
            'organization_id' => $subscription->organization_id,
            'transaction_id' => $transaction->id,
        ]);
    }

    public function applyFailedPayment(MomoTransaction $transaction): void
    {
        $subscription = $this->resolveSubscription($transaction);

        if (! $subscription || $subscription->status !== 'pending_payment') {
            return;
        }

        $subscription->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'metadata' => array_merge($subscription->metadata ?? [], [
                'last_failed_payment_at' => now()->toIso8601String(),
                'failure_reason' => $transaction->failure_reason,
            ]),
        ]);

        $organization = $subscription->organization;

        if ($organization->status === 'trial') {
            $organization->update(['status' => 'past_due']);
        } elseif (! $organization->activeSubscription()->exists()) {
            $organization->update(['status' => 'past_due']);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function paymentStatus(Organization $organization, OrganizationSubscription $subscription): array
    {
        $subscription->loadMissing('billingPlan');

        $transaction = $subscription->last_momo_transaction_id
            ? MomoTransaction::query()->find($subscription->last_momo_transaction_id)
            : null;

        return [
            'subscription_status' => $subscription->status,
            'organization_status' => $organization->status,
            'payment_status' => match ($subscription->status) {
                'active' => 'paid',
                'pending_payment' => $transaction?->status === 'failed' ? 'failed' : 'pending',
                'cancelled' => 'failed',
                default => $organization->status,
            },
            'transaction_status' => $transaction?->status,
            'current_period_end' => $subscription->current_period_end?->toIso8601String(),
        ];
    }

    public function amountForPlan(BillingPlan $plan, string $cycle): float
    {
        return $plan->priceForCycle($cycle);
    }

    protected function resolveSubscription(MomoTransaction $transaction): ?OrganizationSubscription
    {
        if ($transaction->transactable_type === OrganizationSubscription::class && $transaction->transactable_id) {
            return OrganizationSubscription::query()->find($transaction->transactable_id);
        }

        $subscriptionId = $transaction->metadata['subscription_id'] ?? null;

        return $subscriptionId
            ? OrganizationSubscription::query()->find($subscriptionId)
            : null;
    }

    protected function authorizeBilling(Organization $organization, User $user): void
    {
        if ($user->isSuperUser()) {
            return;
        }

        $role = $user->organizationRole($organization);

        if (! in_array($role, ['owner', 'admin'], true)) {
            throw ValidationException::withMessages([
                'authorization' => 'Only organization owners or admins can manage billing.',
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    protected function serializeSubscription(OrganizationSubscription $subscription): array
    {
        $subscription->loadMissing('billingPlan');
        $plan = $subscription->billingPlan;

        return [
            'id' => $subscription->id,
            'status' => $subscription->status,
            'billing_cycle' => $subscription->billing_cycle,
            'current_period_start' => $subscription->current_period_start?->toIso8601String(),
            'current_period_end' => $subscription->current_period_end?->toIso8601String(),
            'plan' => $plan ? [
                'id' => $plan->id,
                'name' => $plan->name,
                'slug' => $plan->slug,
                'price_monthly' => (string) $plan->price_monthly,
                'price_yearly' => (string) $plan->price_yearly,
                'currency' => $plan->currency,
                'features' => $plan->features ?? [],
            ] : null,
        ];
    }
}
