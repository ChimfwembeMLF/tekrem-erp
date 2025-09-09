<?php

namespace Database\Factories\Finance;

use App\Models\Finance\ZraAuditLog;
use App\Models\Finance\ZraSmartInvoice;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Finance\ZraAuditLog>
 */
class ZraAuditLogFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = ZraAuditLog::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $action = $this->faker->randomElement(['submit', 'status_check', 'cancel', 'validate', 'health_check']);
        $status = $this->faker->randomElement(['success', 'failed', 'pending', 'error']);
        
        return [
            'zra_smart_invoice_id' => ZraSmartInvoice::factory(),
            'action' => $action,
            'status' => $status,
            'request_data' => $this->generateRequestData($action),
            'response_data' => $this->generateResponseData($action, $status),
            'api_endpoint' => $this->generateApiEndpoint($action),
            'http_method' => $this->getHttpMethod($action),
            'http_status_code' => $this->getHttpStatusCode($status),
            'response_time_ms' => $this->faker->numberBetween(100, 5000),
            'error_message' => $status === 'failed' ? $this->generateErrorMessage() : null,
            'error_details' => $status === 'failed' ? $this->generateErrorDetails() : null,
            'correlation_id' => $this->faker->uuid(),
            'ip_address' => $this->faker->ipv4(),
            'user_agent' => $this->faker->userAgent(),
            'user_id' => User::factory(),
            'executed_at' => $this->faker->dateTimeBetween('-30 days'),
        ];
    }

    /**
     * Generate request data based on action.
     */
    private function generateRequestData(string $action): array
    {
        return match ($action) {
            'submit' => [
                'invoice_number' => $this->faker->regexify('INV-[0-9]{6}'),
                'total' => $this->faker->randomFloat(2, 100, 10000),
                'currency' => 'ZMW',
                'customer' => [
                    'name' => $this->faker->company(),
                    'tax_number' => $this->faker->regexify('[0-9]{10}'),
                ],
                'items' => [
                    [
                        'description' => $this->faker->words(3, true),
                        'amount' => $this->faker->randomFloat(2, 50, 1000),
                    ],
                ],
            ],
            'status_check' => [
                'reference' => $this->faker->regexify('[A-Z]{3}[0-9]{10}'),
                'submission_id' => $this->faker->uuid(),
            ],
            'cancel' => [
                'reference' => $this->faker->regexify('[A-Z]{3}[0-9]{10}'),
                'reason' => $this->faker->sentence(),
            ],
            'validate' => [
                'invoice_data' => [
                    'number' => $this->faker->regexify('INV-[0-9]{6}'),
                    'amount' => $this->faker->randomFloat(2, 100, 5000),
                ],
            ],
            'health_check' => [
                'timestamp' => $this->faker->iso8601(),
                'version' => '1.0',
            ],
            default => [],
        };
    }

    /**
     * Generate response data based on action and status.
     */
    private function generateResponseData(string $action, string $status): array
    {
        if ($status === 'failed') {
            return [
                'error' => $this->generateErrorMessage(),
                'timestamp' => $this->faker->iso8601(),
            ];
        }

        return match ($action) {
            'submit' => [
                'status' => 'submitted',
                'reference' => $this->faker->regexify('[A-Z]{3}[0-9]{10}'),
                'submission_id' => $this->faker->uuid(),
                'message' => 'Invoice submitted successfully',
                'timestamp' => $this->faker->iso8601(),
            ],
            'status_check' => [
                'status' => $this->faker->randomElement(['pending', 'approved', 'rejected']),
                'reference' => $this->faker->regexify('[A-Z]{3}[0-9]{10}'),
                'last_updated' => $this->faker->iso8601(),
            ],
            'cancel' => [
                'status' => 'cancelled',
                'reference' => $this->faker->regexify('[A-Z]{3}[0-9]{10}'),
                'message' => 'Invoice cancelled successfully',
                'timestamp' => $this->faker->iso8601(),
            ],
            'validate' => [
                'valid' => $this->faker->boolean(80),
                'errors' => $this->faker->boolean(20) ? $this->generateValidationErrors() : [],
                'timestamp' => $this->faker->iso8601(),
            ],
            'health_check' => [
                'status' => 'healthy',
                'response_time' => $this->faker->numberBetween(50, 200),
                'timestamp' => $this->faker->iso8601(),
            ],
            default => [
                'timestamp' => $this->faker->iso8601(),
            ],
        };
    }

    /**
     * Generate API endpoint based on action.
     */
    private function generateApiEndpoint(string $action): string
    {
        return match ($action) {
            'submit' => '/api/v1/invoices/submit',
            'status_check' => '/api/v1/invoices/status',
            'cancel' => '/api/v1/invoices/cancel',
            'validate' => '/api/v1/invoices/validate',
            'health_check' => '/api/v1/health',
            default => '/api/v1/unknown',
        };
    }

    /**
     * Get HTTP method based on action.
     */
    private function getHttpMethod(string $action): string
    {
        return match ($action) {
            'submit', 'cancel', 'validate' => 'POST',
            'status_check', 'health_check' => 'GET',
            default => 'POST',
        };
    }

    /**
     * Get HTTP status code based on status.
     */
    private function getHttpStatusCode(string $status): int
    {
        return match ($status) {
            'success' => $this->faker->randomElement([200, 201]),
            'failed' => $this->faker->randomElement([400, 401, 403, 422, 500]),
            'error' => $this->faker->randomElement([500, 502, 503, 504]),
            'pending' => 202,
            default => 200,
        };
    }

    /**
     * Generate error message.
     */
    private function generateErrorMessage(): string
    {
        return $this->faker->randomElement([
            'Invalid authentication credentials',
            'Request timeout',
            'Invalid invoice data format',
            'Customer tax number not found',
            'Duplicate invoice number',
            'Service temporarily unavailable',
            'Rate limit exceeded',
            'Invalid API endpoint',
        ]);
    }

    /**
     * Generate error details.
     */
    private function generateErrorDetails(): array
    {
        return $this->faker->randomElements([
            'Field "customer.tax_number" is required',
            'Field "total" must be greater than 0',
            'Field "currency" must be ZMW',
            'Field "invoice_date" cannot be in the future',
            'Authentication token has expired',
            'API rate limit of 100 requests per minute exceeded',
        ], $this->faker->numberBetween(1, 3));
    }

    /**
     * Generate validation errors.
     */
    private function generateValidationErrors(): array
    {
        return $this->faker->randomElements([
            'Invoice number format is invalid',
            'Customer information is incomplete',
            'Tax calculation mismatch',
            'Item descriptions are too long',
            'Currency code not supported',
        ], $this->faker->numberBetween(1, 2));
    }

    /**
     * Indicate that the log is successful.
     */
    public function successful(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'success',
            'http_status_code' => $this->faker->randomElement([200, 201]),
            'error_message' => null,
            'error_details' => null,
            'response_time_ms' => $this->faker->numberBetween(100, 2000),
        ]);
    }

    /**
     * Indicate that the log is failed.
     */
    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'failed',
            'http_status_code' => $this->faker->randomElement([400, 401, 403, 422, 500]),
            'error_message' => $this->generateErrorMessage(),
            'error_details' => $this->generateErrorDetails(),
            'response_time_ms' => $this->faker->numberBetween(1000, 10000),
        ]);
    }

    /**
     * Indicate that the log is for a submit action.
     */
    public function submitAction(): static
    {
        return $this->state(fn (array $attributes) => [
            'action' => 'submit',
            'api_endpoint' => '/api/v1/invoices/submit',
            'http_method' => 'POST',
            'request_data' => $this->generateRequestData('submit'),
            'response_data' => $this->generateResponseData('submit', $attributes['status'] ?? 'success'),
        ]);
    }

    /**
     * Indicate that the log is for a status check action.
     */
    public function statusCheckAction(): static
    {
        return $this->state(fn (array $attributes) => [
            'action' => 'status_check',
            'api_endpoint' => '/api/v1/invoices/status',
            'http_method' => 'GET',
            'request_data' => $this->generateRequestData('status_check'),
            'response_data' => $this->generateResponseData('status_check', $attributes['status'] ?? 'success'),
        ]);
    }

    /**
     * Indicate that the log is for a health check action.
     */
    public function healthCheckAction(): static
    {
        return $this->state(fn (array $attributes) => [
            'action' => 'health_check',
            'api_endpoint' => '/api/v1/health',
            'http_method' => 'GET',
            'request_data' => $this->generateRequestData('health_check'),
            'response_data' => $this->generateResponseData('health_check', $attributes['status'] ?? 'success'),
        ]);
    }

    /**
     * Indicate that the log has slow response time.
     */
    public function slowResponse(): static
    {
        return $this->state(fn (array $attributes) => [
            'response_time_ms' => $this->faker->numberBetween(5000, 15000),
        ]);
    }

    /**
     * Indicate that the log is recent.
     */
    public function recent(): static
    {
        return $this->state(fn (array $attributes) => [
            'executed_at' => $this->faker->dateTimeBetween('-1 hour'),
        ]);
    }
}
