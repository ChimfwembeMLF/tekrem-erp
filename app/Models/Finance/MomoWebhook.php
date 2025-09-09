<?php

namespace App\Models\Finance;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MomoWebhook extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'momo_provider_id',
        'momo_transaction_id',
        'webhook_id',
        'event_type',
        'status',
        'headers',
        'payload',
        'signature',
        'ip_address',
        'processing_notes',
        'error_message',
        'retry_count',
        'processed_at',
        'last_retry_at',
        'signature_verified',
        'is_duplicate',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'headers' => 'array',
        'payload' => 'array',
        'processed_at' => 'datetime',
        'last_retry_at' => 'datetime',
        'signature_verified' => 'boolean',
        'is_duplicate' => 'boolean',
        'retry_count' => 'integer',
    ];

    /**
     * Get the MoMo provider for this webhook.
     */
    public function momoProvider(): BelongsTo
    {
        return $this->belongsTo(MomoProvider::class);
    }

    /**
     * Get the related MoMo transaction.
     */
    public function momoTransaction(): BelongsTo
    {
        return $this->belongsTo(MomoTransaction::class);
    }

    /**
     * Scope a query to only include webhooks with a specific status.
     */
    public function scopeWithStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include processed webhooks.
     */
    public function scopeProcessed($query)
    {
        return $query->where('status', 'processed');
    }

    /**
     * Scope a query to only include pending webhooks.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include failed webhooks.
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Scope a query to only include verified webhooks.
     */
    public function scopeVerified($query)
    {
        return $query->where('signature_verified', true);
    }

    /**
     * Scope a query to exclude duplicate webhooks.
     */
    public function scopeNotDuplicate($query)
    {
        return $query->where('is_duplicate', false);
    }

    /**
     * Mark the webhook as processed.
     */
    public function markAsProcessed(?string $notes = null): void
    {
        $this->update([
            'status' => 'processed',
            'processed_at' => now(),
            'processing_notes' => $notes,
        ]);
    }

    /**
     * Mark the webhook as failed.
     */
    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
            'last_retry_at' => now(),
            'retry_count' => $this->retry_count + 1,
        ]);
    }

    /**
     * Mark the webhook as duplicate.
     */
    public function markAsDuplicate(): void
    {
        $this->update([
            'is_duplicate' => true,
            'status' => 'ignored',
        ]);
    }

    /**
     * Verify the webhook signature.
     */
    public function verifySignature(): bool
    {
        if (!$this->signature || !$this->momoProvider->decrypted_webhook_secret) {
            return false;
        }

        $expectedSignature = hash_hmac(
            'sha256',
            json_encode($this->payload),
            $this->momoProvider->decrypted_webhook_secret
        );

        $isValid = hash_equals($expectedSignature, $this->signature);

        $this->update(['signature_verified' => $isValid]);

        return $isValid;
    }

    /**
     * Check if this webhook can be retried.
     */
    public function canRetry(): bool
    {
        return $this->status === 'failed' && $this->retry_count < 3;
    }

    /**
     * Get the status badge color.
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'processed' => 'green',
            'failed' => 'red',
            'pending' => 'yellow',
            'ignored' => 'gray',
            default => 'blue',
        };
    }

    /**
     * Get the raw payload as string.
     */
    public function getRawPayloadAttribute(): string
    {
        return json_encode($this->payload, JSON_PRETTY_PRINT);
    }
}
