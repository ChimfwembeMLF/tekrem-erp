<?php

namespace Database\Factories\Finance;

use App\Models\Finance\MomoProvider;
use App\Models\Finance\Account;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Finance\MomoProvider>
 */
class MomoProviderFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = MomoProvider::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $providers = [
            'mtn' => [
                'display_name' => 'MTN MoMo',
                'api_base_url' => 'https://sandbox.momodeveloper.mtn.com',
                'phone_prefixes' => ['096', '097'],
            ],
            'airtel' => [
                'display_name' => 'Airtel Money',
                'api_base_url' => 'https://openapi.airtel.africa',
                'phone_prefixes' => ['095', '098'],
            ],
            'zamtel' => [
                'display_name' => 'Zamtel Money',
                'api_base_url' => 'https://api.zamtel.co.zm',
                'phone_prefixes' => ['094', '099'],
            ],
        ];

        $code = $this->faker->randomElement(array_keys($providers));
        $providerData = $providers[$code];

        return [
            'code' => $code,
            'display_name' => $providerData['display_name'],
            'api_base_url' => $providerData['api_base_url'],
            'api_version' => 'v1',
            'is_active' => true,
            'is_sandbox' => true,
            'phone_number_prefixes' => $providerData['phone_prefixes'],
            'supported_currencies' => ['ZMW'],
            'min_transaction_amount' => 1.00,
            'max_transaction_amount' => 10000.00,
            'daily_transaction_limit' => 50000.00,
            'monthly_transaction_limit' => 500000.00,
            'fee_structure' => [
                'collection' => [
                    'type' => 'percentage',
                    'value' => 2.5,
                    'min_fee' => 0.50,
                    'max_fee' => 25.00,
                ],
                'disbursement' => [
                    'type' => 'percentage',
                    'value' => 3.0,
                    'min_fee' => 1.00,
                    'max_fee' => 30.00,
                ],
            ],
            'webhook_config' => [
                'enabled' => true,
                'max_retries' => 3,
                'retry_delay' => 300, // 5 minutes
                'timeout' => 30,
                'verify_ssl' => true,
            ],
            'api_credentials' => [
                'client_id' => $this->faker->uuid(),
                'client_secret' => $this->faker->sha256(),
                'api_key' => $this->faker->sha256(),
                'subscription_key' => $this->faker->sha256(),
                'environment' => 'sandbox',
            ],
            'oauth_config' => [
                'token_url' => $providerData['api_base_url'] . '/oauth/token',
                'scope' => 'payments',
                'grant_type' => 'client_credentials',
            ],
            'rate_limits' => [
                'requests_per_minute' => 60,
                'requests_per_hour' => 1000,
                'requests_per_day' => 10000,
            ],
            'cash_account_id' => Account::factory(),
            'fee_account_id' => Account::factory(),
            'receivable_account_id' => Account::factory(),
            'last_health_check' => now(),
            'health_status' => 'healthy',
            'health_details' => [
                'last_successful_request' => now()->toISOString(),
                'response_time_ms' => $this->faker->numberBetween(100, 500),
                'error_rate' => 0.0,
            ],
        ];
    }

    /**
     * Indicate that the provider is MTN.
     */
    public function mtn(): static
    {
        return $this->state(fn (array $attributes) => [
            'code' => 'mtn',
            'display_name' => 'MTN MoMo',
            'api_base_url' => 'https://sandbox.momodeveloper.mtn.com',
            'phone_number_prefixes' => ['096', '097'],
        ]);
    }

    /**
     * Indicate that the provider is Airtel.
     */
    public function airtel(): static
    {
        return $this->state(fn (array $attributes) => [
            'code' => 'airtel',
            'display_name' => 'Airtel Money',
            'api_base_url' => 'https://openapi.airtel.africa',
            'phone_number_prefixes' => ['095', '098'],
        ]);
    }

    /**
     * Indicate that the provider is Zamtel.
     */
    public function zamtel(): static
    {
        return $this->state(fn (array $attributes) => [
            'code' => 'zamtel',
            'display_name' => 'Zamtel Money',
            'api_base_url' => 'https://api.zamtel.co.zm',
            'phone_number_prefixes' => ['094', '099'],
        ]);
    }

    /**
     * Indicate that the provider is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
            'health_status' => 'inactive',
        ]);
    }

    /**
     * Indicate that the provider is in production mode.
     */
    public function production(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_sandbox' => false,
            'api_credentials' => array_merge($attributes['api_credentials'] ?? [], [
                'environment' => 'production',
            ]),
        ]);
    }

    /**
     * Indicate that the provider has health issues.
     */
    public function unhealthy(): static
    {
        return $this->state(fn (array $attributes) => [
            'health_status' => 'unhealthy',
            'health_details' => [
                'last_successful_request' => now()->subHours(2)->toISOString(),
                'response_time_ms' => $this->faker->numberBetween(5000, 10000),
                'error_rate' => $this->faker->randomFloat(2, 0.1, 0.5),
                'last_error' => 'Connection timeout',
            ],
        ]);
    }

    /**
     * Indicate that the provider has specific accounts.
     */
    public function withAccounts(Account $cashAccount, Account $feeAccount, Account $receivableAccount): static
    {
        return $this->state(fn (array $attributes) => [
            'cash_account_id' => $cashAccount->id,
            'fee_account_id' => $feeAccount->id,
            'receivable_account_id' => $receivableAccount->id,
        ]);
    }

    /**
     * Indicate that the provider has custom fee structure.
     */
    public function withFeeStructure(array $feeStructure): static
    {
        return $this->state(fn (array $attributes) => [
            'fee_structure' => $feeStructure,
        ]);
    }

    /**
     * Indicate that the provider has custom transaction limits.
     */
    public function withTransactionLimits(float $min, float $max, float $daily = null, float $monthly = null): static
    {
        return $this->state(fn (array $attributes) => [
            'min_transaction_amount' => $min,
            'max_transaction_amount' => $max,
            'daily_transaction_limit' => $daily ?? $max * 50,
            'monthly_transaction_limit' => $monthly ?? $max * 500,
        ]);
    }
}
