<?php

namespace App\Services\ZRA;

use App\Models\Finance\Invoice;
use App\Models\Finance\ZraSmartInvoice;
use App\Models\Finance\ZraConfiguration;
use App\Services\ZRA\ZraApiService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class ZraSmartInvoiceService
{
    protected ZraApiService $apiService;

    public function __construct(ZraApiService $apiService)
    {
        $this->apiService = $apiService;
    }

    /**
     * Submit an invoice to ZRA Smart Invoice system.
     */
    public function submitInvoice(Invoice $invoice, bool $autoApprove = false): array
    {
        try {
            DB::beginTransaction();

            // Create or get existing ZRA smart invoice record
            $zraInvoice = $this->getOrCreateZraInvoice($invoice);

            // Check if already submitted and approved
            if ($zraInvoice->isApproved()) {
                return [
                    'success' => false,
                    'error' => 'Invoice has already been approved by ZRA',
                    'zra_invoice' => $zraInvoice,
                ];
            }

            // Validate invoice before submission
            $validationResult = $this->validateInvoiceForSubmission($invoice);
            if (!$validationResult['valid']) {
                return [
                    'success' => false,
                    'error' => 'Invoice validation failed',
                    'validation_errors' => $validationResult['errors'],
                ];
            }

            // Submit to ZRA API
            $submissionResult = $this->apiService->submitInvoice($invoice);

            if ($submissionResult['success']) {
                // Mark as submitted
                $zraInvoice->markAsSubmitted($submissionResult['data'], auth()->id());

                // If auto-approve is enabled and ZRA immediately approves
                if ($autoApprove && isset($submissionResult['data']['status']) && $submissionResult['data']['status'] === 'approved') {
                    $this->processApproval($zraInvoice, $submissionResult['data']);
                }

                DB::commit();

                return [
                    'success' => true,
                    'message' => 'Invoice submitted to ZRA successfully',
                    'zra_invoice' => $zraInvoice->fresh(),
                    'zra_reference' => $submissionResult['zra_reference'],
                ];
            }

            // Handle submission failure
            $zraInvoice->markAsRejected(
                $submissionResult['error'],
                $submissionResult['validation_errors'] ?? [],
                $submissionResult
            );

            DB::commit();

            return [
                'success' => false,
                'error' => $submissionResult['error'],
                'validation_errors' => $submissionResult['validation_errors'] ?? [],
                'zra_invoice' => $zraInvoice->fresh(),
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('ZRA invoice submission failed', [
                'invoice_id' => $invoice->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'error' => 'System error during submission: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Check and update the status of a submitted invoice.
     */
    public function checkInvoiceStatus(ZraSmartInvoice $zraInvoice): array
    {
        try {
            if (!$zraInvoice->isSubmitted()) {
                return [
                    'success' => false,
                    'error' => 'Invoice has not been submitted to ZRA',
                ];
            }

            $statusResult = $this->apiService->checkInvoiceStatus($zraInvoice);

            if ($statusResult['success']) {
                $this->updateInvoiceStatus($zraInvoice, $statusResult['data']);

                return [
                    'success' => true,
                    'status' => $statusResult['status'],
                    'zra_invoice' => $zraInvoice->fresh(),
                ];
            }

            return [
                'success' => false,
                'error' => $statusResult['error'],
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
            if ($zraInvoice->isApproved()) {
                return [
                    'success' => false,
                    'error' => 'Cannot cancel an approved invoice',
                ];
            }

            if ($zraInvoice->isCancelled()) {
                return [
                    'success' => false,
                    'error' => 'Invoice is already cancelled',
                ];
            }

            $cancellationResult = $this->apiService->cancelInvoice($zraInvoice, $reason);

            if ($cancellationResult['success']) {
                $zraInvoice->markAsCancelled($reason, auth()->id());

                return [
                    'success' => true,
                    'message' => 'Invoice cancelled successfully',
                    'zra_invoice' => $zraInvoice->fresh(),
                ];
            }

            return [
                'success' => false,
                'error' => $cancellationResult['error'],
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
     * Validate an invoice for ZRA submission.
     */
    public function validateInvoiceForSubmission(Invoice $invoice): array
    {
        $errors = [];

        // Basic validation
        if (!$invoice->invoice_number) {
            $errors[] = 'Invoice number is required';
        }

        if (!$invoice->invoice_date) {
            $errors[] = 'Invoice date is required';
        }

        if (!$invoice->customer_name) {
            $errors[] = 'Customer name is required';
        }

        if ($invoice->total <= 0) {
            $errors[] = 'Invoice total must be greater than zero';
        }

        if ($invoice->items->isEmpty()) {
            $errors[] = 'Invoice must have at least one item';
        }

        // Validate items
        foreach ($invoice->items as $index => $item) {
            if (!$item->description) {
                $errors[] = "Item " . ($index + 1) . ": Description is required";
            }

            if ($item->quantity <= 0) {
                $errors[] = "Item " . ($index + 1) . ": Quantity must be greater than zero";
            }

            if ($item->unit_price < 0) {
                $errors[] = "Item " . ($index + 1) . ": Unit price cannot be negative";
            }
        }

        // Check ZRA configuration
        $config = ZraConfiguration::where('is_active', true)->first();
        if (!$config) {
            $errors[] = 'ZRA configuration is not set up';
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
        ];
    }

    /**
     * Generate QR code for an approved invoice.
     */
    public function generateQrCode(ZraSmartInvoice $zraInvoice): string
    {
        if (!$zraInvoice->isApproved() || !$zraInvoice->verification_url) {
            throw new \Exception('Cannot generate QR code for non-approved invoice');
        }

        return QrCode::format('png')
            ->size(200)
            ->margin(1)
            ->generate($zraInvoice->verification_url);
    }

    /**
     * Retry submission for failed invoices.
     */
    public function retrySubmission(ZraSmartInvoice $zraInvoice): array
    {
        if (!$zraInvoice->canResubmit()) {
            return [
                'success' => false,
                'error' => 'Invoice cannot be resubmitted in current status',
            ];
        }

        $config = ZraConfiguration::where('is_active', true)->first();
        if ($zraInvoice->hasExceededMaxRetries($config->max_retry_attempts ?? 3)) {
            return [
                'success' => false,
                'error' => 'Maximum retry attempts exceeded',
            ];
        }

        if (!$zraInvoice->isReadyForRetry($config->retry_delay_minutes ?? 5)) {
            $nextRetry = $zraInvoice->last_submission_attempt
                ->addMinutes($config->retry_delay_minutes ?? 5);
            
            return [
                'success' => false,
                'error' => "Please wait until {$nextRetry->format('Y-m-d H:i:s')} before retrying",
            ];
        }

        return $this->submitInvoice($zraInvoice->invoice);
    }

    /**
     * Get or create ZRA smart invoice record.
     */
    protected function getOrCreateZraInvoice(Invoice $invoice): ZraSmartInvoice
    {
        return ZraSmartInvoice::firstOrCreate(
            ['invoice_id' => $invoice->id],
            [
                'submission_status' => 'pending',
                'is_test_mode' => app()->environment() !== 'production',
            ]
        );
    }

    /**
     * Update invoice status based on ZRA response.
     */
    protected function updateInvoiceStatus(ZraSmartInvoice $zraInvoice, array $zraData): void
    {
        $status = $zraData['status'] ?? 'unknown';

        switch ($status) {
            case 'approved':
                $this->processApproval($zraInvoice, $zraData);
                break;
            
            case 'rejected':
                $zraInvoice->markAsRejected(
                    $zraData['rejection_reason'] ?? 'Rejected by ZRA',
                    $zraData['validation_errors'] ?? [],
                    $zraData
                );
                break;
            
            case 'cancelled':
                $zraInvoice->markAsCancelled(
                    $zraData['cancellation_reason'] ?? 'Cancelled by ZRA'
                );
                break;
        }
    }

    /**
     * Process invoice approval.
     */
    protected function processApproval(ZraSmartInvoice $zraInvoice, array $zraData): void
    {
        $zraInvoice->markAsApproved($zraData);

        // Generate QR code if verification URL is provided
        if (isset($zraData['verification_url'])) {
            try {
                $qrCode = $this->generateQrCode($zraInvoice);
                $zraInvoice->update(['qr_code' => base64_encode($qrCode)]);
            } catch (\Exception $e) {
                Log::warning('Failed to generate QR code for approved invoice', [
                    'zra_invoice_id' => $zraInvoice->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
}
