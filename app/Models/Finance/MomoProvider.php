<?php

namespace App\Models\Finance;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Crypt;

class MomoProvider extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'code',
        'display_name',
        'currency',
        'is_active',
        'is_sandbox',
        'api_base_url',
        'sandbox_api_base_url',
        'api_key',
        'api_secret',
        'merchant_id',
        'callback_url',
        'webhook_secret',
        'provider_settings',
        'min_transaction_amount',
        'max_transaction_amount',
        'daily_transaction_limit',
        'transaction_fee_percentage',
        'fixed_transaction_fee',
        'cash_account_id',
        'fee_account_id',
        'receivable_account_id',
        
        // Newly added fields:
	    'health_status',
	    'last_health_check',
	    'supported_currencies',
	    'fee_structure',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'is_sandbox' => 'boolean',
        'provider_settings' => 'array',
        'min_transaction_amount' => 'decimal:2',
        'max_transaction_amount' => 'decimal:2',
        'daily_transaction_limit' => 'decimal:2',
        'transaction_fee_percentage' => 'decimal:4',
        'fixed_transaction_fee' => 'decimal:2',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'api_key',
        'api_secret',
        'merchant_id',
        'webhook_secret',
    ];

    /**
     * Get the cash account for this provider.
     */
    public function cashAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'cash_account_id');
    }

    /**
     * Get the fee account for this provider.
     */
    public function feeAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'fee_account_id');
    }

    /**
     * Get the receivable account for this provider.
     */
    public function receivableAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'receivable_account_id');
    }

    /**
     * Get all transactions for this provider.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(MomoTransaction::class);
    }

    /**
     * Get all webhooks for this provider.
     */
    public function webhooks(): HasMany
    {
        return $this->hasMany(MomoWebhook::class);
    }

    /**
     * Scope a query to only include active providers.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include sandbox providers.
     */
    public function scopeSandbox($query)
    {
        return $query->where('is_sandbox', true);
    }

    /**
     * Scope a query to only include production providers.
     */
    public function scopeProduction($query)
    {
        return $query->where('is_sandbox', false);
    }

    /**
     * Get the API base URL based on environment.
     */
    public function getApiUrlAttribute(): ?string
    {
        return $this->is_sandbox ? $this->sandbox_api_base_url : $this->api_base_url;
    }

    /**
     * Get the decrypted API key.
     */
    public function getDecryptedApiKeyAttribute(): ?string
    {
        return $this->api_key ? Crypt::decryptString($this->api_key) : null;
    }

    /**
     * Get the decrypted API secret.
     */
    public function getDecryptedApiSecretAttribute(): ?string
    {
        return $this->api_secret ? Crypt::decryptString($this->api_secret) : null;
    }

    /**
     * Get the decrypted merchant ID.
     */
    public function getDecryptedMerchantIdAttribute(): ?string
    {
        return $this->merchant_id ? Crypt::decryptString($this->merchant_id) : null;
    }

    /**
     * Get the decrypted webhook secret.
     */
    public function getDecryptedWebhookSecretAttribute(): ?string
    {
        return $this->webhook_secret ? Crypt::decryptString($this->webhook_secret) : null;
    }

    /**
     * Set the API key (encrypted).
     */
    public function setApiKeyAttribute(?string $value): void
    {
        $this->attributes['api_key'] = $value ? Crypt::encryptString($value) : null;
    }

    /**
     * Set the API secret (encrypted).
     */
    public function setApiSecretAttribute(?string $value): void
    {
        $this->attributes['api_secret'] = $value ? Crypt::encryptString($value) : null;
    }

    /**
     * Set the merchant ID (encrypted).
     */
    public function setMerchantIdAttribute(?string $value): void
    {
        $this->attributes['merchant_id'] = $value ? Crypt::encryptString($value) : null;
    }

    /**
     * Set the webhook secret (encrypted).
     */
    public function setWebhookSecretAttribute(?string $value): void
    {
        $this->attributes['webhook_secret'] = $value ? Crypt::encryptString($value) : null;
    }

    /**
     * Calculate transaction fee for given amount.
     */
    public function calculateFee(float $amount): float
    {
        $percentageFee = $amount * ($this->transaction_fee_percentage / 100);
        return $percentageFee + $this->fixed_transaction_fee;
    }

    /**
     * Check if amount is within transaction limits.
     */
    public function isAmountValid(float $amount): bool
    {
        return $amount >= $this->min_transaction_amount && $amount <= $this->max_transaction_amount;
    }

    /**
     * Get provider configuration for API calls.
     */
    public function getApiConfig(): array
    {
        return [
            'base_url' => $this->api_url,
            'api_key' => $this->decrypted_api_key,
            'api_secret' => $this->decrypted_api_secret,
            'merchant_id' => $this->decrypted_merchant_id,
            'webhook_secret' => $this->decrypted_webhook_secret,
            'is_sandbox' => $this->is_sandbox,
            'settings' => $this->provider_settings ?? [],
        ];
    }
}
