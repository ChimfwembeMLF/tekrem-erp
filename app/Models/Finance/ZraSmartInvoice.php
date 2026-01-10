<?php

namespace App\Models\Finance;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ZraSmartInvoice extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'invoice_id',
        'zra_reference',
        'submission_id',
        'submission_status',
        'submission_data',
        'response_data',
        'validation_errors',
        'qr_code',
        'verification_url',
        'submitted_at',
        'approved_at',
        'rejected_at',
        'cancelled_at',
        'submitted_by',
        'retry_count',
        'last_submission_attempt',
        'is_test_mode',
        'notes',
        'company_id',
];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'submission_data' => 'array',
        'response_data' => 'array',
        'validation_errors' => 'array',
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'last_submission_attempt' => 'datetime',
        'is_test_mode' => 'boolean',
    ];

    /**
     * Get the invoice that owns the ZRA smart invoice.
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Get the user who submitted the invoice.
     */
    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'submitted_by');
    }

    /**
     * Get the audit logs for this ZRA invoice.
     */
    public function auditLogs(): HasMany
    {
        return $this->hasMany(ZraAuditLog::class);
    }

    /**
     * Scope a query to only include pending invoices.
     */
    public function scopePending($query)
    {
        return $query->where('submission_status', 'pending');
    }

    /**
     * Scope a query to only include submitted invoices.
     */
    public function scopeSubmitted($query)
    {
        return $query->where('submission_status', 'submitted');
    }

    /**
     * Scope a query to only include approved invoices.
     */
    public function scopeApproved($query)
    {
        return $query->where('submission_status', 'approved');
    }

    /**
     * Scope a query to only include rejected invoices.
     */
    public function scopeRejected($query)
    {
        return $query->where('submission_status', 'rejected');
    }

    /**
     * Scope a query to only include cancelled invoices.
     */
    public function scopeCancelled($query)
    {
        return $query->where('submission_status', 'cancelled');
    }

    /**
     * Scope a query to filter by test mode.
     */
    public function scopeTestMode($query, bool $isTestMode = true)
    {
        return $query->where('is_test_mode', $isTestMode);
    }

    /**
     * Check if the invoice is pending submission.
     */
    public function isPending(): bool
    {
        return $this->submission_status === 'pending';
    }

    /**
     * Check if the invoice has been submitted.
     */
    public function isSubmitted(): bool
    {
        return $this->submission_status === 'submitted';
    }

    /**
     * Check if the invoice has been approved.
     */
    public function isApproved(): bool
    {
        return $this->submission_status === 'approved';
    }

    /**
     * Check if the invoice has been rejected.
     */
    public function isRejected(): bool
    {
        return $this->submission_status === 'rejected';
    }

    /**
     * Check if the invoice has been cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->submission_status === 'cancelled';
    }

    /**
     * Check if the invoice can be resubmitted.
     */
    public function canResubmit(): bool
    {
        return in_array($this->submission_status, ['pending', 'rejected']);
    }

    /**
     * Check if the invoice has exceeded maximum retry attempts.
     */
    public function hasExceededMaxRetries(int $maxRetries): bool
    {
        return $this->retry_count >= $maxRetries;
    }

    /**
     * Check if the invoice is ready for retry (delay period has passed).
     */
    public function isReadyForRetry(int $delayMinutes): bool
    {
        if (!$this->last_submission_attempt) {
            return true;
        }

        return $this->last_submission_attempt->addMinutes($delayMinutes)->isPast();
    }

    /**
     * Mark the invoice as submitted.
     */
    public function markAsSubmitted(array $responseData, ?int $submittedBy = null): void
    {
        $this->update([
            'submission_status' => 'submitted',
            'response_data' => $responseData,
            'zra_reference' => $responseData['reference'] ?? $responseData['zra_reference'] ?? null,
            'submission_id' => $responseData['submission_id'] ?? null,
            'submitted_at' => now(),
            'submitted_by' => $submittedBy,
            'last_submission_attempt' => now(),
            'retry_count' => $this->retry_count + 1,
        ]);
    }

    /**
     * Mark the invoice as approved.
     */
    public function markAsApproved(array $responseData): void
    {
        $this->update([
            'submission_status' => 'approved',
            'response_data' => array_merge($this->response_data ?? [], $responseData),
            'verification_url' => $responseData['verification_url'] ?? null,
            'approved_at' => now(),
        ]);
    }

    /**
     * Mark the invoice as rejected.
     */
    public function markAsRejected(string $reason, array $validationErrors = [], array $responseData = []): void
    {
        $this->update([
            'submission_status' => 'rejected',
            'validation_errors' => $validationErrors,
            'response_data' => array_merge($this->response_data ?? [], $responseData, [
                'rejection_reason' => $reason,
            ]),
            'rejected_at' => now(),
        ]);
    }

    /**
     * Mark the invoice as cancelled.
     */
    public function markAsCancelled(string $reason, ?int $cancelledBy = null): void
    {
        $this->update([
            'submission_status' => 'cancelled',
            'response_data' => array_merge($this->response_data ?? [], [
                'cancellation_reason' => $reason,
                'cancelled_by' => $cancelledBy,
            ]),
            'cancelled_at' => now(),
        ]);
    }

    /**
     * Get the formatted submission status.
     */
    public function getFormattedStatusAttribute(): string
    {
        return match ($this->submission_status) {
            'pending' => 'Pending',
            'submitted' => 'Submitted',
            'approved' => 'Approved',
            'rejected' => 'Rejected',
            'cancelled' => 'Cancelled',
            default => 'Unknown',
        };
    }

    /**
     * Get the status color for UI display.
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->submission_status) {
            'pending' => 'yellow',
            'submitted' => 'blue',
            'approved' => 'green',
            'rejected' => 'red',
            'cancelled' => 'gray',
            default => 'gray',
        };
    }

    /**
     * Get the submission date formatted.
     */
    public function getSubmittedAtFormattedAttribute(): string
    {
        return $this->submitted_at?->format('M d, Y H:i') ?? 'Not submitted';
    }

    /**
     * Get the approval date formatted.
     */
    public function getApprovedAtFormattedAttribute(): string
    {
        return $this->approved_at?->format('M d, Y H:i') ?? 'Not approved';
    }

    /**
     * Get the rejection reason.
     */
    public function getRejectionReasonAttribute(): ?string
    {
        return $this->response_data['rejection_reason'] ?? null;
    }

    /**
     * Get the cancellation reason.
     */
    public function getCancellationReasonAttribute(): ?string
    {
        return $this->response_data['cancellation_reason'] ?? null;
    }

    /**
     * Get the processing time in hours.
     */
    public function getProcessingTimeAttribute(): ?float
    {
        if (!$this->submitted_at || !$this->approved_at) {
            return null;
        }

        return $this->submitted_at->diffInHours($this->approved_at);
    }

    /**
     * Get the QR code as base64 data URL.
     */
    public function getQrCodeDataUrlAttribute(): ?string
    {
        if (!$this->qr_code) {
            return null;
        }

        return 'data:image/png;base64,' . $this->qr_code;
    }

    /**
     * Check if QR code is available.
     */
    public function hasQrCode(): bool
    {
        return !empty($this->qr_code);
    }

    /**
     * Get validation error summary.
     */
    public function getValidationErrorSummaryAttribute(): string
    {
        if (empty($this->validation_errors)) {
            return 'No validation errors';
        }

        if (is_array($this->validation_errors)) {
            return implode('; ', $this->validation_errors);
        }

        return (string) $this->validation_errors;
    }

    /**
     * Get the next retry time.
     */
    public function getNextRetryTimeAttribute(): ?\Carbon\Carbon
    {
        if (!$this->last_submission_attempt) {
            return null;
        }

        $config = ZraConfiguration::active()->first();
        $delayMinutes = $config?->retry_delay_minutes ?? 5;

        return $this->last_submission_attempt->addMinutes($delayMinutes);
    }

    /**
     * Check if the invoice is in test mode.
     */
    public function isTestMode(): bool
    {
        return $this->is_test_mode;
    }


    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function scopeForCompany($query, $companyId)
    {
        return $query->where('company_id', $companyId);
    }
}
