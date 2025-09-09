<?php

namespace Database\Factories\Finance;

use App\Models\Finance\Invoice;
use App\Models\Finance\ZraSmartInvoice;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Finance\ZraSmartInvoice>
 */
class ZraSmartInvoiceFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = ZraSmartInvoice::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = $this->faker->randomElement(['pending', 'submitted', 'approved', 'rejected', 'cancelled']);
        
        return [
            'invoice_id' => Invoice::factory(),
            'zra_reference' => $this->faker->optional()->regexify('[A-Z]{3}[0-9]{10}'),
            'submission_id' => $this->faker->optional()->uuid(),
            'submission_status' => $status,
            'submission_data' => $this->generateSubmissionData(),
            'response_data' => $this->generateResponseData($status),
            'validation_errors' => $status === 'rejected' ? $this->generateValidationErrors() : null,
            'qr_code' => $status === 'approved' ? $this->faker->optional()->sha256() : null,
            'verification_url' => $status === 'approved' ? $this->faker->optional()->url() : null,
            'submitted_at' => in_array($status, ['submitted', 'approved', 'rejected', 'cancelled']) ? $this->faker->dateTimeBetween('-30 days') : null,
            'approved_at' => $status === 'approved' ? $this->faker->dateTimeBetween('-30 days') : null,
            'rejected_at' => $status === 'rejected' ? $this->faker->dateTimeBetween('-30 days') : null,
            'cancelled_at' => $status === 'cancelled' ? $this->faker->dateTimeBetween('-30 days') : null,
            'submitted_by' => User::factory(),
            'retry_count' => $this->faker->numberBetween(0, 3),
            'last_submission_attempt' => in_array($status, ['submitted', 'approved', 'rejected']) ? $this->faker->dateTimeBetween('-7 days') : null,
            'is_test_mode' => $this->faker->boolean(20), // 20% chance of test mode
            'notes' => $this->faker->optional()->sentence(),
        ];
    }

    /**
     * Generate submission data.
     */
    private function generateSubmissionData(): array
    {
        return [
            'invoice_number' => $this->faker->regexify('INV-[0-9]{6}'),
            'invoice_date' => $this->faker->date(),
            'due_date' => $this->faker->date(),
            'currency' => 'ZMW',
            'total_amount' => $this->faker->randomFloat(2, 100, 10000),
            'tax_amount' => $this->faker->randomFloat(2, 16, 1600),
            'customer' => [
                'name' => $this->faker->company(),
                'tax_number' => $this->faker->optional()->regexify('[0-9]{10}'),
                'address' => $this->faker->address(),
                'phone' => $this->faker->phoneNumber(),
                'email' => $this->faker->email(),
            ],
            'items' => [
                [
                    'description' => $this->faker->words(3, true),
                    'quantity' => $this->faker->numberBetween(1, 10),
                    'unit_price' => $this->faker->randomFloat(2, 10, 500),
                    'tax_rate' => 16.0,
                ],
            ],
            'payment_terms' => $this->faker->randomElement(['Net 30', 'Net 15', 'Due on Receipt']),
            'notes' => $this->faker->optional()->sentence(),
        ];
    }

    /**
     * Generate response data based on status.
     */
    private function generateResponseData(string $status): array
    {
        $baseData = [
            'timestamp' => $this->faker->iso8601(),
            'api_version' => '1.0',
        ];

        return match ($status) {
            'submitted' => array_merge($baseData, [
                'status' => 'submitted',
                'message' => 'Invoice submitted successfully',
                'reference' => $this->faker->regexify('[A-Z]{3}[0-9]{10}'),
                'submission_id' => $this->faker->uuid(),
            ]),
            'approved' => array_merge($baseData, [
                'status' => 'approved',
                'message' => 'Invoice approved by ZRA',
                'reference' => $this->faker->regexify('[A-Z]{3}[0-9]{10}'),
                'verification_url' => $this->faker->url(),
                'qr_code_data' => $this->faker->sha256(),
                'approval_date' => $this->faker->iso8601(),
            ]),
            'rejected' => array_merge($baseData, [
                'status' => 'rejected',
                'message' => 'Invoice rejected by ZRA',
                'rejection_reason' => $this->faker->randomElement([
                    'Invalid tax calculation',
                    'Missing customer information',
                    'Incorrect invoice format',
                    'Duplicate invoice number',
                ]),
                'errors' => $this->generateValidationErrors(),
            ]),
            'cancelled' => array_merge($baseData, [
                'status' => 'cancelled',
                'message' => 'Invoice submission cancelled',
                'cancellation_reason' => $this->faker->randomElement([
                    'User requested cancellation',
                    'Invoice updated after submission',
                    'System error during processing',
                ]),
            ]),
            default => $baseData,
        };
    }

    /**
     * Generate validation errors.
     */
    private function generateValidationErrors(): array
    {
        return $this->faker->randomElements([
            'Invoice number is required',
            'Customer tax number is invalid',
            'Tax calculation does not match',
            'Invoice date cannot be in the future',
            'Total amount must be greater than zero',
            'Customer address is required',
            'Item description is too long',
            'Invalid currency code',
        ], $this->faker->numberBetween(1, 3));
    }

    /**
     * Indicate that the invoice is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'submission_status' => 'pending',
            'submitted_at' => null,
            'approved_at' => null,
            'rejected_at' => null,
            'cancelled_at' => null,
            'response_data' => [],
            'validation_errors' => null,
            'qr_code' => null,
            'verification_url' => null,
        ]);
    }

    /**
     * Indicate that the invoice is submitted.
     */
    public function submitted(): static
    {
        return $this->state(fn (array $attributes) => [
            'submission_status' => 'submitted',
            'submitted_at' => $this->faker->dateTimeBetween('-7 days'),
            'approved_at' => null,
            'rejected_at' => null,
            'cancelled_at' => null,
            'response_data' => $this->generateResponseData('submitted'),
            'validation_errors' => null,
            'qr_code' => null,
            'verification_url' => null,
        ]);
    }

    /**
     * Indicate that the invoice is approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'submission_status' => 'approved',
            'submitted_at' => $this->faker->dateTimeBetween('-30 days', '-7 days'),
            'approved_at' => $this->faker->dateTimeBetween('-7 days'),
            'rejected_at' => null,
            'cancelled_at' => null,
            'response_data' => $this->generateResponseData('approved'),
            'validation_errors' => null,
            'qr_code' => $this->faker->sha256(),
            'verification_url' => $this->faker->url(),
        ]);
    }

    /**
     * Indicate that the invoice is rejected.
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'submission_status' => 'rejected',
            'submitted_at' => $this->faker->dateTimeBetween('-30 days', '-7 days'),
            'approved_at' => null,
            'rejected_at' => $this->faker->dateTimeBetween('-7 days'),
            'cancelled_at' => null,
            'response_data' => $this->generateResponseData('rejected'),
            'validation_errors' => $this->generateValidationErrors(),
            'qr_code' => null,
            'verification_url' => null,
        ]);
    }

    /**
     * Indicate that the invoice is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'submission_status' => 'cancelled',
            'submitted_at' => $this->faker->dateTimeBetween('-30 days', '-7 days'),
            'approved_at' => null,
            'rejected_at' => null,
            'cancelled_at' => $this->faker->dateTimeBetween('-7 days'),
            'response_data' => $this->generateResponseData('cancelled'),
            'validation_errors' => null,
            'qr_code' => null,
            'verification_url' => null,
        ]);
    }

    /**
     * Indicate that the invoice is in test mode.
     */
    public function testMode(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_test_mode' => true,
        ]);
    }

    /**
     * Indicate that the invoice has retry attempts.
     */
    public function withRetries(int $count = 2): static
    {
        return $this->state(fn (array $attributes) => [
            'retry_count' => $count,
            'last_submission_attempt' => $this->faker->dateTimeBetween('-1 day'),
        ]);
    }
}
