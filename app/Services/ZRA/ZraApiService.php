<?php

namespace App\Services\ZRA;

use App\Models\Finance\ZraConfiguration;
use App\Models\Finance\ZraSmartInvoice;
use App\Models\Finance\ZraAuditLog;
use App\Models\Finance\Invoice;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class ZraApiService
{
    protected ?ZraConfiguration $config = null;
    protected ?string $baseUrl = null;
    protected ?array $headers = null;

    public function __construct()
    {
        // Configuration will be loaded lazily when needed
    }

    /**
     * Initialize the service configuration.
     *
     * @return void
     * @throws \Exception
     */
    protected function initializeConfig(): void
    {
        if ($this->config === null) {
            $this->config = $this->getActiveConfiguration();
            $this->baseUrl = $this->config->api_base_url;
            $this->headers = $this->buildHeaders();
        }
    }

    /**
     * Submit an invoice to ZRA Smart Invoice system.
     */
    public function submitInvoice(Invoice $invoice): array
    {
        try {
            $this->initializeConfig();
            $this->ensureValidToken();
            
            $submissionData = $this->buildInvoiceSubmissionData($invoice);
            $correlationId = $this->generateCorrelationId();
            
            $this->logAuditEntry($invoice, 'submit', 'pending', [
                'correlation_id' => $correlationId,
                'submission_data' => $submissionData,
            ]);

            $response = Http::withHeaders($this->headers)
                ->timeout(30)
                ->post("{$this->baseUrl}/invoices/submit", $submissionData);

            $responseData = $response->json();
            $statusCode = $response->status();

            if ($response->successful()) {
                $this->logAuditEntry($invoice, 'submit', 'success', [
                    'correlation_id' => $correlationId,
                    'response_data' => $responseData,
                    'status_code' => $statusCode,
                ]);

                return [
                    'success' => true,
                    'data' => $responseData,
                    'zra_reference' => $responseData['reference'] ?? null,
                    'submission_id' => $responseData['submission_id'] ?? null,
                ];
            }

            $this->logAuditEntry($invoice, 'submit', 'failed', [
                'correlation_id' => $correlationId,
                'error_response' => $responseData,
                'status_code' => $statusCode,
            ]);

            return [
                'success' => false,
                'error' => $responseData['message'] ?? 'Submission failed',
                'validation_errors' => $responseData['errors'] ?? [],
                'status_code' => $statusCode,
            ];

        } catch (\Exception $e) {
            Log::error('ZRA invoice submission failed', [
                'invoice_id' => $invoice->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $this->logAuditEntry($invoice, 'submit', 'failed', [
                'error_message' => $e->getMessage(),
                'exception_type' => get_class($e),
            ]);

            return [
                'success' => false,
                'error' => 'System error during submission: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Check the status of a submitted invoice.
     */
    public function checkInvoiceStatus(ZraSmartInvoice $zraInvoice): array
    {
        try {
            $this->initializeConfig();
            $this->ensureValidToken();
            
            if (!$zraInvoice->zra_reference) {
                return [
                    'success' => false,
                    'error' => 'No ZRA reference found for status check',
                ];
            }

            $correlationId = $this->generateCorrelationId();
            
            $response = Http::withHeaders($this->headers)
                ->timeout(30)
                ->get("{$this->baseUrl}/invoices/{$zraInvoice->zra_reference}/status");

            $responseData = $response->json();
            $statusCode = $response->status();

            if ($response->successful()) {
                $this->logAuditEntry($zraInvoice->invoice, 'status_check', 'success', [
                    'correlation_id' => $correlationId,
                    'response_data' => $responseData,
                    'status_code' => $statusCode,
                ]);

                return [
                    'success' => true,
                    'status' => $responseData['status'] ?? 'unknown',
                    'data' => $responseData,
                ];
            }

            $this->logAuditEntry($zraInvoice->invoice, 'status_check', 'failed', [
                'correlation_id' => $correlationId,
                'error_response' => $responseData,
                'status_code' => $statusCode,
            ]);

            return [
                'success' => false,
                'error' => $responseData['message'] ?? 'Status check failed',
                'status_code' => $statusCode,
            ];

        } catch (\Exception $e) {
            Log::error('ZRA status check failed', [
                'zra_invoice_id' => $zraInvoice->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'System error during status check: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Cancel a submitted invoice.
     */
    public function cancelInvoice(ZraSmartInvoice $zraInvoice, string $reason): array
    {
        try {
            $this->initializeConfig();
            $this->ensureValidToken();
            
            if (!$zraInvoice->zra_reference) {
                return [
                    'success' => false,
                    'error' => 'No ZRA reference found for cancellation',
                ];
            }

            $correlationId = $this->generateCorrelationId();
            $cancellationData = [
                'reason' => $reason,
                'cancelled_by' => auth()->user()->name ?? 'System',
                'cancellation_date' => now()->toISOString(),
            ];
            
            $response = Http::withHeaders($this->headers)
                ->timeout(30)
                ->post("{$this->baseUrl}/invoices/{$zraInvoice->zra_reference}/cancel", $cancellationData);

            $responseData = $response->json();
            $statusCode = $response->status();

            if ($response->successful()) {
                $this->logAuditEntry($zraInvoice->invoice, 'cancel', 'success', [
                    'correlation_id' => $correlationId,
                    'cancellation_data' => $cancellationData,
                    'response_data' => $responseData,
                    'status_code' => $statusCode,
                ]);

                return [
                    'success' => true,
                    'data' => $responseData,
                ];
            }

            $this->logAuditEntry($zraInvoice->invoice, 'cancel', 'failed', [
                'correlation_id' => $correlationId,
                'cancellation_data' => $cancellationData,
                'error_response' => $responseData,
                'status_code' => $statusCode,
            ]);

            return [
                'success' => false,
                'error' => $responseData['message'] ?? 'Cancellation failed',
                'status_code' => $statusCode,
            ];

        } catch (\Exception $e) {
            Log::error('ZRA invoice cancellation failed', [
                'zra_invoice_id' => $zraInvoice->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'System error during cancellation: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Validate invoice data before submission.
     */
    public function validateInvoice(Invoice $invoice): array
    {
        try {
            $this->initializeConfig();
            $this->ensureValidToken();
            
            $validationData = $this->buildInvoiceSubmissionData($invoice);
            $correlationId = $this->generateCorrelationId();
            
            $response = Http::withHeaders($this->headers)
                ->timeout(30)
                ->post("{$this->baseUrl}/invoices/validate", $validationData);

            $responseData = $response->json();
            $statusCode = $response->status();

            if ($response->successful()) {
                $this->logAuditEntry($invoice, 'validate', 'success', [
                    'correlation_id' => $correlationId,
                    'validation_data' => $validationData,
                    'response_data' => $responseData,
                    'status_code' => $statusCode,
                ]);

                return [
                    'success' => true,
                    'valid' => $responseData['valid'] ?? true,
                    'warnings' => $responseData['warnings'] ?? [],
                    'data' => $responseData,
                ];
            }

            $this->logAuditEntry($invoice, 'validate', 'failed', [
                'correlation_id' => $correlationId,
                'validation_data' => $validationData,
                'error_response' => $responseData,
                'status_code' => $statusCode,
            ]);

            return [
                'success' => false,
                'valid' => false,
                'errors' => $responseData['errors'] ?? [],
                'error' => $responseData['message'] ?? 'Validation failed',
                'status_code' => $statusCode,
            ];

        } catch (\Exception $e) {
            Log::error('ZRA invoice validation failed', [
                'invoice_id' => $invoice->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'valid' => false,
                'error' => 'System error during validation: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Get ZRA tax rates and configuration.
     */
    public function getTaxRates(): array
    {
        try {
            $this->initializeConfig();
            $this->ensureValidToken();
            
            $cacheKey = 'zra_tax_rates_' . $this->config->environment;
            
            return Cache::remember($cacheKey, 3600, function () {
                $response = Http::withHeaders($this->headers)
                    ->timeout(30)
                    ->get("{$this->baseUrl}/tax-rates");

                if ($response->successful()) {
                    return [
                        'success' => true,
                        'data' => $response->json(),
                    ];
                }

                return [
                    'success' => false,
                    'error' => 'Failed to fetch tax rates',
                ];
            });

        } catch (\Exception $e) {
            Log::error('ZRA tax rates fetch failed', [
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'System error fetching tax rates: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Ensure we have a valid access token.
     */
    protected function ensureValidToken(): void
    {
        if ($this->isTokenExpired()) {
            $this->refreshAccessToken();
        }
    }

    /**
     * Check if the current token is expired.
     */
    protected function isTokenExpired(): bool
    {
        if (!$this->config->access_token || !$this->config->token_expires_at) {
            return true;
        }

        return Carbon::parse($this->config->token_expires_at)->subMinutes(5)->isPast();
    }

    /**
     * Refresh the access token.
     */
    protected function refreshAccessToken(): void
    {
        try {
            $response = Http::timeout(30)->post("{$this->baseUrl}/oauth/token", [
                'grant_type' => 'client_credentials',
                'client_id' => decrypt($this->config->client_id),
                'client_secret' => decrypt($this->config->client_secret),
                'scope' => 'invoice_submission',
            ]);

            if ($response->successful()) {
                $tokenData = $response->json();
                
                $this->config->update([
                    'access_token' => encrypt($tokenData['access_token']),
                    'token_expires_at' => now()->addSeconds($tokenData['expires_in'] ?? 3600),
                    'last_token_refresh' => now(),
                ]);

                $this->headers = $this->buildHeaders();

                Log::info('ZRA access token refreshed successfully');
            } else {
                throw new \Exception('Token refresh failed: ' . $response->body());
            }

        } catch (\Exception $e) {
            Log::error('ZRA token refresh failed', [
                'error' => $e->getMessage(),
            ]);
            
            throw new \Exception('Failed to refresh ZRA access token: ' . $e->getMessage());
        }
    }

    /**
     * Build HTTP headers for API requests.
     */
    protected function buildHeaders(): array
    {
        $headers = [
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'X-API-Key' => decrypt($this->config->api_key),
        ];

        if ($this->config->access_token) {
            $headers['Authorization'] = 'Bearer ' . decrypt($this->config->access_token);
        }

        return $headers;
    }

    /**
     * Build invoice submission data for ZRA API.
     */
    protected function buildInvoiceSubmissionData(Invoice $invoice): array
    {
        return [
            'invoice_number' => $invoice->invoice_number,
            'invoice_date' => $invoice->invoice_date->toDateString(),
            'due_date' => $invoice->due_date?->toDateString(),
            'currency' => $invoice->currency ?? 'ZMW',
            'taxpayer' => [
                'tpin' => $this->config->taxpayer_tpin,
                'name' => $this->config->taxpayer_name,
                'address' => $this->config->taxpayer_address,
                'phone' => $this->config->taxpayer_phone,
                'email' => $this->config->taxpayer_email,
            ],
            'customer' => [
                'name' => $invoice->customer_name,
                'address' => $invoice->customer_address,
                'phone' => $invoice->customer_phone,
                'email' => $invoice->customer_email,
                'tpin' => $invoice->customer_tpin ?? null,
            ],
            'items' => $invoice->items->map(function ($item) {
                return [
                    'description' => $item->description,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'total' => $item->total,
                    'tax_rate' => $item->tax_rate ?? 0,
                    'tax_amount' => $item->tax_amount ?? 0,
                ];
            })->toArray(),
            'totals' => [
                'subtotal' => $invoice->subtotal,
                'tax_amount' => $invoice->tax_amount,
                'total' => $invoice->total,
            ],
            'metadata' => [
                'system' => 'TekRem ERP',
                'version' => '1.0',
                'submission_time' => now()->toISOString(),
                'test_mode' => $this->config->environment === 'sandbox',
            ],
        ];
    }

    /**
     * Get the active ZRA configuration.
     */
    protected function getActiveConfiguration(): ZraConfiguration
    {
        try {
            $config = ZraConfiguration::where('is_active', true)->first();

            if (!$config) {
                throw new \Exception('No active ZRA configuration found');
            }

            return $config;
        } catch (\Illuminate\Database\QueryException $e) {
            // Handle case where table doesn't exist (during migrations)
            if (str_contains($e->getMessage(), "doesn't exist")) {
                throw new \Exception('ZRA configuration table not found. Please run migrations first.');
            }
            throw $e;
        }
    }

    /**
     * Generate a correlation ID for request tracking.
     */
    protected function generateCorrelationId(): string
    {
        return 'ZRA-' . now()->format('Ymd-His') . '-' . strtoupper(substr(md5(uniqid()), 0, 8));
    }

    /**
     * Log audit entry for ZRA operations.
     */
    protected function logAuditEntry(Invoice $invoice, string $action, string $status, array $data = []): void
    {
        try {
            ZraAuditLog::create([
                'zra_smart_invoice_id' => $invoice->zraSmartInvoice?->id,
                'action' => $action,
                'status' => $status,
                'request_data' => $data['submission_data'] ?? $data['validation_data'] ?? $data['cancellation_data'] ?? null,
                'response_data' => $data['response_data'] ?? $data['error_response'] ?? null,
                'api_endpoint' => $this->baseUrl,
                'http_method' => 'POST',
                'http_status_code' => $data['status_code'] ?? null,
                'error_message' => $data['error_message'] ?? null,
                'error_details' => $data['error_details'] ?? null,
                'correlation_id' => $data['correlation_id'] ?? null,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'user_id' => auth()->id(),
                'executed_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create ZRA audit log entry', [
                'error' => $e->getMessage(),
                'action' => $action,
                'status' => $status,
            ]);
        }
    }

    /**
     * Perform health check on ZRA API.
     */
    public function healthCheck(): array
    {
        try {
            $this->initializeConfig();
            
            // If config initialization failed, return appropriate error
            if ($this->config === null) {
                return [
                    'success' => false,
                    'status' => 'error',
                    'error' => 'ZRA configuration not initialized',
                ];
            }
            
            $startTime = microtime(true);

            $response = Http::withHeaders($this->headers)
                ->timeout(10)
                ->get("{$this->baseUrl}/health");

            $responseTime = round((microtime(true) - $startTime) * 1000);

            if ($response->successful()) {
                if ($this->config !== null) {
                    $this->config->update([
                        'last_health_check' => now(),
                        'health_status' => 'healthy',
                        'health_details' => [
                            'response_time_ms' => $responseTime,
                            'status_code' => $response->status(),
                            'last_check' => now()->toISOString(),
                        ],
                    ]);
                }

                return [
                    'success' => true,
                    'status' => 'healthy',
                    'response_time' => $responseTime,
                ];
            }

            if ($this->config !== null) {
                $this->config->update([
                    'last_health_check' => now(),
                    'health_status' => 'unhealthy',
                    'health_details' => [
                        'response_time_ms' => $responseTime,
                        'status_code' => $response->status(),
                        'error' => $response->body(),
                        'last_check' => now()->toISOString(),
                    ],
                ]);
            }

            return [
                'success' => false,
                'status' => 'unhealthy',
                'error' => 'Health check failed',
                'response_time' => $responseTime,
            ];

        } catch (\Exception $e) {
            // Only update config if it exists (initializeConfig succeeded)
            if ($this->config !== null) {
                $this->config->update([
                    'last_health_check' => now(),
                    'health_status' => 'error',
                    'health_details' => [
                        'error' => $e->getMessage(),
                        'last_check' => now()->toISOString(),
                    ],
                ]);
            }

            Log::error('ZRA health check failed', [
                'error' => $e->getMessage(),
                'config_loaded' => $this->config !== null,
            ]);

            return [
                'success' => false,
                'status' => 'error',
                'error' => $e->getMessage(),
            ];
        }
    }
}
