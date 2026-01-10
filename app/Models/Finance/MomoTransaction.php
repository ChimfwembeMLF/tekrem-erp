<?php

namespace App\Models\Finance;

use App\Models\User;
use App\Models\Client;
use App\Models\Lead;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MomoTransaction extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'transaction_number',
        'momo_provider_id',
        'type',
        'status',
        'amount',
        'currency',
        'fee_amount',
        'net_amount',
        'customer_phone',
        'customer_name',
        'customer_email',
        'provider_transaction_id',
        'provider_reference',
        'provider_response',
        'provider_timestamp',
        'internal_reference',
        'description',
        'notes',
        'invoice_id',
        'payment_id',
        'transactable_id',
        'transactable_type',
        'transaction_id',
        'is_posted_to_ledger',
        'posted_at',
        'is_reconciled',
        'reconciliation_id',
        'reconciled_at',
        'reconciled_by',
        'initiated_by',
        'approved_by',
        'initiated_at',
        'approved_at',
        'completed_at',
        'failed_at',
        'retry_count',
        'last_retry_at',
        'failure_reason',
        'metadata',
        'ip_address',
        'user_agent',
        'company_id',
];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'fee_amount' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'provider_response' => 'array',
        'provider_timestamp' => 'datetime',
        'posted_at' => 'datetime',
        'is_posted_to_ledger' => 'boolean',
        'is_reconciled' => 'boolean',
        'reconciled_at' => 'datetime',
        'initiated_at' => 'datetime',
        'approved_at' => 'datetime',
        'completed_at' => 'datetime',
        'failed_at' => 'datetime',
        'last_retry_at' => 'datetime',
        'metadata' => 'array',
        'retry_count' => 'integer',
    ];

    /**
     * Get the MoMo provider for this transaction.
     */
    public function momoProvider(): BelongsTo
    {
        return $this->belongsTo(MomoProvider::class);
    }

    /**
     * Get the related invoice.
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Get the related payment.
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    /**
     * Get the related finance transaction.
     */
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    /**
     * Get the transactable entity (Client, Lead, etc.).
     */
    public function transactable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the user who initiated the transaction.
     */
    public function initiatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'initiated_by');
    }

    /**
     * Get the user who approved the transaction.
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the user who reconciled the transaction.
     */
    public function reconciledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reconciled_by');
    }

    /**
     * Get all webhooks related to this transaction.
     */
    public function webhooks(): HasMany
    {
        return $this->hasMany(MomoWebhook::class);
    }

    /**
     * Scope a query to only include transactions with a specific status.
     */
    public function scopeWithStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include transactions of a specific type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope a query to only include completed transactions.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope a query to only include failed transactions.
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Scope a query to only include pending transactions.
     */
    public function scopePending($query)
    {
        return $query->whereIn('status', ['pending', 'processing']);
    }

    /**
     * Scope a query to only include unreconciled transactions.
     */
    public function scopeUnreconciled($query)
    {
        return $query->where('is_reconciled', false);
    }

    /**
     * Scope a query to only include transactions not posted to ledger.
     */
    public function scopeNotPostedToLedger($query)
    {
        return $query->where('is_posted_to_ledger', false);
    }

    /**
     * Generate a unique transaction number.
     */
    public static function generateTransactionNumber(): string
    {
        $year = date('Y');
        $month = date('m');
        $lastTransaction = static::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastTransaction ? (int) substr($lastTransaction->transaction_number, -6) + 1 : 1;

        return 'MOMO-' . $year . $month . '-' . str_pad($sequence, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Check if the transaction is in a final state.
     */
    public function isFinal(): bool
    {
        return in_array($this->status, ['completed', 'failed', 'cancelled', 'expired']);
    }

    /**
     * Check if the transaction can be retried.
     */
    public function canRetry(): bool
    {
        return in_array($this->status, ['failed', 'expired']) && $this->retry_count < 3;
    }

    /**
     * Mark the transaction as completed.
     */
    public function markAsCompleted(array $providerResponse = []): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
            'provider_response' => array_merge($this->provider_response ?? [], $providerResponse),
        ]);
    }

    /**
     * Mark the transaction as failed.
     */
    public function markAsFailed(string $reason, array $providerResponse = []): void
    {
        $this->update([
            'status' => 'failed',
            'failed_at' => now(),
            'failure_reason' => $reason,
            'provider_response' => array_merge($this->provider_response ?? [], $providerResponse),
        ]);
    }

    /**
     * Mark the transaction as reconciled.
     */
    public function markAsReconciled(int $reconciliationId, ?int $userId = null): void
    {
        $this->update([
            'is_reconciled' => true,
            'reconciliation_id' => $reconciliationId,
            'reconciled_at' => now(),
            'reconciled_by' => $userId ?? auth()->id(),
        ]);
    }

    /**
     * Mark the transaction as posted to ledger.
     */
    public function markAsPostedToLedger(int $transactionId): void
    {
        $this->update([
            'is_posted_to_ledger' => true,
            'transaction_id' => $transactionId,
            'posted_at' => now(),
        ]);
    }

    /**
     * Get the formatted amount with currency.
     */
    public function getFormattedAmountAttribute(): string
    {
        return number_format($this->amount, 2) . ' ' . $this->currency;
    }

    /**
     * Get the formatted net amount with currency.
     */
    public function getFormattedNetAmountAttribute(): string
    {
        return number_format($this->net_amount, 2) . ' ' . $this->currency;
    }

    /**
     * Get the status badge color.
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'completed' => 'green',
            'failed', 'cancelled' => 'red',
            'pending', 'processing' => 'yellow',
            'expired' => 'gray',
            default => 'blue',
        };
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
