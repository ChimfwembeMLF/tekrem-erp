<?php

namespace App\Models\Finance;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class ZraConfiguration extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'environment',
        'api_base_url',
        'api_version',
        'client_id',
        'client_secret',
        'api_key',
        'taxpayer_tpin',
        'taxpayer_name',
        'taxpayer_address',
        'taxpayer_phone',
        'taxpayer_email',
        'tax_rates',
        'invoice_settings',
        'auto_submit',
        'require_approval',
        'max_retry_attempts',
        'retry_delay_minutes',
        'is_active',
        'last_token_refresh',
        'access_token',
        'token_expires_at',
        'health_check_config',
        'last_health_check',
        'health_status',
        'health_details',
        'company_id',
];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'tax_rates' => 'array',
        'invoice_settings' => 'array',
        'auto_submit' => 'boolean',
        'require_approval' => 'boolean',
        'is_active' => 'boolean',
        'last_token_refresh' => 'datetime',
        'token_expires_at' => 'datetime',
        'health_check_config' => 'array',
        'last_health_check' => 'datetime',
        'health_details' => 'array',
        'max_retry_attempts' => 'integer',
        'retry_delay_minutes' => 'integer',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'client_secret',
        'api_key',
        'access_token',
    ];

    /**
     * Get the client ID attribute (encrypted).
     */
    protected function clientId(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ? decrypt($value) : null,
            set: fn ($value) => $value ? encrypt($value) : null,
        );
    }

    /**
     * Get the client secret attribute (encrypted).
     */
    protected function clientSecret(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ? decrypt($value) : null,
            set: fn ($value) => $value ? encrypt($value) : null,
        );
    }

    /**
     * Get the API key attribute (encrypted).
     */
    protected function apiKey(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ? decrypt($value) : null,
            set: fn ($value) => $value ? encrypt($value) : null,
        );
    }

    /**
     * Get the access token attribute (encrypted).
     */
    protected function accessToken(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ? decrypt($value) : null,
            set: fn ($value) => $value ? encrypt($value) : null,
        );
    }

    /**
     * Scope a query to only include active configurations.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to filter by environment.
     */
    public function scopeEnvironment($query, string $environment)
    {
        return $query->where('environment', $environment);
    }

    /**
     * Scope a query to filter by health status.
     */
    public function scopeHealthy($query)
    {
        return $query->where('health_status', 'healthy');
    }

    /**
     * Check if the configuration is for production environment.
     */
    public function isProduction(): bool
    {
        return $this->environment === 'production';
    }

    /**
     * Check if the configuration is for sandbox environment.
     */
    public function isSandbox(): bool
    {
        return $this->environment === 'sandbox';
    }

    /**
     * Check if auto-submit is enabled.
     */
    public function isAutoSubmitEnabled(): bool
    {
        return $this->auto_submit;
    }

    /**
     * Check if approval is required.
     */
    public function isApprovalRequired(): bool
    {
        return $this->require_approval;
    }

    /**
     * Check if the access token is expired.
     */
    public function isTokenExpired(): bool
    {
        if (!$this->token_expires_at) {
            return true;
        }

        return $this->token_expires_at->subMinutes(5)->isPast();
    }

    /**
     * Check if the configuration is healthy.
     */
    public function isHealthy(): bool
    {
        return $this->health_status === 'healthy';
    }

    /**
     * Get the default tax rate.
     */
    public function getDefaultTaxRate(): float
    {
        return $this->tax_rates['default'] ?? 16.0; // Default VAT rate in Zambia
    }

    /**
     * Get tax rate for a specific category.
     */
    public function getTaxRate(string $category = 'default'): float
    {
        return $this->tax_rates[$category] ?? $this->getDefaultTaxRate();
    }

    /**
     * Get invoice setting value.
     */
    public function getInvoiceSetting(string $key, $default = null)
    {
        return $this->invoice_settings[$key] ?? $default;
    }

    /**
     * Update health status.
     */
    public function updateHealthStatus(string $status, array $details = []): void
    {
        $this->update([
            'health_status' => $status,
            'health_details' => array_merge($this->health_details ?? [], $details),
            'last_health_check' => now(),
        ]);
    }

    /**
     * Mark as healthy.
     */
    public function markAsHealthy(array $details = []): void
    {
        $this->updateHealthStatus('healthy', $details);
    }

    /**
     * Mark as unhealthy.
     */
    public function markAsUnhealthy(array $details = []): void
    {
        $this->updateHealthStatus('unhealthy', $details);
    }

    /**
     * Update access token.
     */
    public function updateAccessToken(string $token, int $expiresIn): void
    {
        $this->update([
            'access_token' => $token,
            'token_expires_at' => now()->addSeconds($expiresIn),
            'last_token_refresh' => now(),
        ]);
    }

    /**
     * Get the formatted environment name.
     */
    public function getFormattedEnvironmentAttribute(): string
    {
        return ucfirst($this->environment);
    }

    /**
     * Get the health status color for UI display.
     */
    public function getHealthStatusColorAttribute(): string
    {
        return match ($this->health_status) {
            'healthy' => 'green',
            'unhealthy' => 'red',
            'warning' => 'yellow',
            'error' => 'red',
            default => 'gray',
        };
    }

    /**
     * Get the last health check formatted.
     */
    public function getLastHealthCheckFormattedAttribute(): string
    {
        if (!$this->last_health_check) {
            return 'Never';
        }

        return $this->last_health_check->diffForHumans();
    }

    /**
     * Get the token expiry formatted.
     */
    public function getTokenExpiryFormattedAttribute(): string
    {
        if (!$this->token_expires_at) {
            return 'No token';
        }

        if ($this->isTokenExpired()) {
            return 'Expired';
        }

        return $this->token_expires_at->diffForHumans();
    }

    /**
     * Validate configuration completeness.
     */
    public function isConfigurationComplete(): bool
    {
        $requiredFields = [
            'api_base_url',
            'client_id',
            'client_secret',
            'api_key',
            'taxpayer_tpin',
            'taxpayer_name',
            'taxpayer_address',
            'taxpayer_phone',
            'taxpayer_email',
        ];

        foreach ($requiredFields as $field) {
            if (empty($this->$field)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get missing configuration fields.
     */
    public function getMissingConfigurationFields(): array
    {
        $requiredFields = [
            'api_base_url' => 'API Base URL',
            'client_id' => 'Client ID',
            'client_secret' => 'Client Secret',
            'api_key' => 'API Key',
            'taxpayer_tpin' => 'Taxpayer TPIN',
            'taxpayer_name' => 'Taxpayer Name',
            'taxpayer_address' => 'Taxpayer Address',
            'taxpayer_phone' => 'Taxpayer Phone',
            'taxpayer_email' => 'Taxpayer Email',
        ];

        $missing = [];
        foreach ($requiredFields as $field => $label) {
            if (empty($this->$field)) {
                $missing[] = $label;
            }
        }

        return $missing;
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
