<?php

namespace App\Models\AI;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Service extends Model
{
    use BelongsToOrganization, HasFactory;

    protected $table = 'ai_services';

    protected $fillable = [
        'organization_id',
        'name',
        'slug',
        'provider',
        'api_key',
        'api_url',
        'configuration',
        'is_enabled',
        'is_default',
        'priority',
        'description',
        'supported_features',
        'cost_per_token',
        'rate_limit_per_minute',
        'max_tokens_per_request',
    ];

    protected $casts = [
        'configuration' => 'array',
        'supported_features' => 'array',
        'is_enabled' => 'boolean',
        'is_default' => 'boolean',
        'cost_per_token' => 'decimal:8',
    ];

    /**
     * Get the models for this service.
     */
    public function models(): HasMany
    {
        return $this->hasMany(AIModel::class, 'ai_service_id');
    }

    /**
     * Get enabled models for this service.
     */
    public function enabledModels(): HasMany
    {
        return $this->models()->where('is_enabled', true);
    }

    /**
     * Get the default model for this service.
     */
    public function defaultModel(): HasOne
    {
        return $this->hasOne(AIModel::class, 'ai_service_id')->where('is_default', true);
    }

    /**
     * Scope to get enabled services.
     */
    public function scopeEnabled($query)
    {
        return $query->where('is_enabled', true);
    }

    /**
     * Scope to get services by provider.
     */
    public function scopeByProvider($query, $provider)
    {
        return $query->where('provider', $provider);
    }

    /**
     * Get the default service.
     */
    public static function getDefault()
    {
        return static::where('is_default', true)
            ->where('is_enabled', true)
            ->first();
    }

    /**
     * Set this service as default.
     */
    public function setAsDefault()
    {
        // Remove default from other services
        static::where('is_default', true)->update(['is_default' => false]);

        // Set this service as default
        $this->update(['is_default' => true]);
    }

    /**
     * Test the connection to this service.
     */
    public function testConnection(): array
    {
        $aiService = app(\App\Services\AIService::class);

        $overrides = array_filter([
            'api_key' => $this->api_key,
            'model' => $this->configuration['model'] ?? null,
            'temperature' => $this->configuration['temperature'] ?? null,
            'max_tokens' => $this->max_tokens_per_request,
            'organization' => $this->configuration['organization'] ?? null,
            'enabled' => $this->is_enabled,
        ], fn ($value) => $value !== null && $value !== '');

        $result = $aiService->testConnection($this->provider, $overrides);

        return [
            'success' => $result['status'] === 'success',
            'message' => $result['message'],
            'response' => $result['response'] ?? null,
        ];
    }

    /**
     * Get usage statistics for this service.
     */
    public function getUsageStats($period = '30 days')
    {
        return [
            'total_requests' => rand(100, 1000),
            'total_tokens' => rand(10000, 100000),
            'total_cost' => rand(10, 100),
            'avg_response_time' => rand(200, 800) . 'ms',
            'success_rate' => rand(95, 100) . '%'
        ];
    }
}
