<?php

namespace Database\Factories\Finance;

use App\Models\Finance\MomoTransaction;
use App\Models\Finance\MomoProvider;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Finance\MomoTransaction>
 */
class MomoTransactionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = MomoTransaction::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = $this->faker->randomElement(['collection', 'disbursement']);
        $status = $this->faker->randomElement(['pending', 'processing', 'completed', 'failed', 'cancelled']);
        $amount = $this->faker->randomFloat(2, 10, 1000);
        $feeAmount = $amount * 0.025; // 2.5% fee

        return [
            'transaction_number' => 'MOMO-' . now()->format('Ymd') . '-' . strtoupper($this->faker->bothify('??####')),
            'type' => $type,
            'amount' => $amount,
            'currency' => 'ZMW',
            'fee_amount' => $feeAmount,
            'phone_number' => $this->generateZambianPhoneNumber(),
            'status' => $status,
            'description' => $this->faker->sentence(),
            'payer_message' => $this->faker->optional()->sentence(),
            'payee_note' => $this->faker->optional()->sentence(),
            'provider_reference' => $status !== 'pending' ? 'PROV-' . $this->faker->bothify('##########') : null,
            'external_id' => 'EXT-' . $this->faker->uuid(),
            'callback_url' => $this->faker->optional()->url(),
            'metadata' => [
                'ip_address' => $this->faker->ipv4(),
                'user_agent' => $this->faker->userAgent(),
                'initiated_via' => $this->faker->randomElement(['web', 'api', 'mobile']),
            ],
            'is_reconciled' => $this->faker->boolean(30),
            'reconciliation_id' => null,
            'reconciled_at' => null,
            'reconciled_by' => null,
            'is_posted_to_ledger' => $status === 'completed',
            'transaction_id' => null,
            'posted_at' => $status === 'completed' ? $this->faker->dateTimeBetween('-1 month', 'now') : null,
            'initiated_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'completed_at' => $status === 'completed' ? $this->faker->dateTimeBetween('-1 month', 'now') : null,
            'failed_at' => $status === 'failed' ? $this->faker->dateTimeBetween('-1 month', 'now') : null,
            'failure_reason' => $status === 'failed' ? $this->faker->sentence() : null,
            'provider_id' => MomoProvider::factory(),
            'user_id' => User::factory(),
            'invoice_id' => null,
        ];
    }

    /**
     * Indicate that the transaction is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'provider_reference' => null,
            'completed_at' => null,
            'failed_at' => null,
            'failure_reason' => null,
            'is_posted_to_ledger' => false,
            'posted_at' => null,
        ]);
    }

    /**
     * Indicate that the transaction is processing.
     */
    public function processing(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'processing',
            'provider_reference' => 'PROV-' . $this->faker->bothify('##########'),
            'completed_at' => null,
            'failed_at' => null,
            'failure_reason' => null,
            'is_posted_to_ledger' => false,
            'posted_at' => null,
        ]);
    }

    /**
     * Indicate that the transaction is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'provider_reference' => 'PROV-' . $this->faker->bothify('##########'),
            'completed_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'failed_at' => null,
            'failure_reason' => null,
            'is_posted_to_ledger' => true,
            'posted_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ]);
    }

    /**
     * Indicate that the transaction failed.
     */
    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'failed',
            'provider_reference' => $this->faker->optional()->bothify('PROV-##########'),
            'completed_at' => null,
            'failed_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'failure_reason' => $this->faker->randomElement([
                'Insufficient funds',
                'Invalid phone number',
                'Transaction timeout',
                'Provider error',
                'Network error',
                'User cancelled',
            ]),
            'is_posted_to_ledger' => false,
            'posted_at' => null,
        ]);
    }

    /**
     * Indicate that the transaction is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
            'provider_reference' => null,
            'completed_at' => null,
            'failed_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'failure_reason' => 'Transaction cancelled by user',
            'is_posted_to_ledger' => false,
            'posted_at' => null,
        ]);
    }

    /**
     * Indicate that the transaction is a collection.
     */
    public function collection(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'collection',
        ]);
    }

    /**
     * Indicate that the transaction is a disbursement.
     */
    public function disbursement(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'disbursement',
        ]);
    }

    /**
     * Indicate that the transaction is reconciled.
     */
    public function reconciled(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_reconciled' => true,
            'reconciled_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'reconciled_by' => User::factory(),
        ]);
    }

    /**
     * Indicate that the transaction has a specific amount.
     */
    public function withAmount(float $amount): static
    {
        return $this->state(fn (array $attributes) => [
            'amount' => $amount,
            'fee_amount' => $amount * 0.025, // 2.5% fee
        ]);
    }

    /**
     * Indicate that the transaction is for a specific provider.
     */
    public function forProvider(MomoProvider $provider): static
    {
        return $this->state(fn (array $attributes) => [
            'provider_id' => $provider->id,
            'phone_number' => $this->generatePhoneNumberForProvider($provider->code),
        ]);
    }

    /**
     * Indicate that the transaction is for a specific user.
     */
    public function forUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->id,
        ]);
    }

    /**
     * Generate a valid Zambian phone number.
     */
    protected function generateZambianPhoneNumber(): string
    {
        $prefixes = ['094', '095', '096', '097', '098', '099'];
        $prefix = $this->faker->randomElement($prefixes);
        $suffix = $this->faker->numerify('#######');
        
        return $prefix . $suffix;
    }

    /**
     * Generate a phone number for a specific provider.
     */
    protected function generatePhoneNumberForProvider(string $providerCode): string
    {
        $prefixes = match ($providerCode) {
            'mtn' => ['096', '097'],
            'airtel' => ['095', '098'],
            'zamtel' => ['094', '099'],
            default => ['094', '095', '096', '097', '098', '099'],
        };

        $prefix = $this->faker->randomElement($prefixes);
        $suffix = $this->faker->numerify('#######');
        
        return $prefix . $suffix;
    }
}
