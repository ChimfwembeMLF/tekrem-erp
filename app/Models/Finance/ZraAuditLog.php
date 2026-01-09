<?php

namespace App\Models\Finance;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ZraAuditLog extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'zra_smart_invoice_id',
        'action',
        'status',
        'request_data',
        'response_data',
        'api_endpoint',
        'http_method',
        'http_status_code',
        'response_time_ms',
        'error_message',
        'error_details',
        'correlation_id',
        'ip_address',
        'user_agent',
        'user_id',
        'executed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'request_data' => 'array',
        'response_data' => 'array',
        'error_details' => 'array',
        'executed_at' => 'datetime',
        'response_time_ms' => 'integer',
    ];

    /**
     * Get the ZRA smart invoice that owns the audit log.
     */
    public function zraSmartInvoice(): BelongsTo
    {
        return $this->belongsTo(ZraSmartInvoice::class);
    }

    /**
     * Get the user who performed the action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    /**
     * Scope a query to only include logs for a specific action.
     */
    public function scopeAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope a query to only include logs with a specific status.
     */
    public function scopeStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include successful logs.
     */
    public function scopeSuccessful($query)
    {
        return $query->where('status', 'success');
    }

    /**
     * Scope a query to only include failed logs.
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('executed_at', [$startDate, $endDate]);
    }

    /**
     * Scope a query to filter by correlation ID.
     */
    public function scopeCorrelationId($query, string $correlationId)
    {
        return $query->where('correlation_id', $correlationId);
    }

    /**
     * Scope a query to filter by user.
     */
    public function scopeByUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Check if the log represents a successful operation.
     */
    public function isSuccessful(): bool
    {
        return $this->status === 'success';
    }

    /**
     * Check if the log represents a failed operation.
     */
    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    /**
     * Check if the log has an error.
     */
    public function hasError(): bool
    {
        return !empty($this->error_message);
    }

    /**
     * Get the formatted action name.
     */
    public function getFormattedActionAttribute(): string
    {
        return match ($this->action) {
            'submit' => 'Submit Invoice',
            'status_check' => 'Status Check',
            'cancel' => 'Cancel Invoice',
            'validate' => 'Validate Invoice',
            'health_check' => 'Health Check',
            default => ucfirst(str_replace('_', ' ', $this->action)),
        };
    }

    /**
     * Get the formatted status.
     */
    public function getFormattedStatusAttribute(): string
    {
        return match ($this->status) {
            'success' => 'Success',
            'failed' => 'Failed',
            'pending' => 'Pending',
            'error' => 'Error',
            default => ucfirst($this->status),
        };
    }

    /**
     * Get the status color for UI display.
     */
    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'success' => 'green',
            'failed' => 'red',
            'pending' => 'yellow',
            'error' => 'red',
            default => 'gray',
        };
    }

    /**
     * Get the formatted execution time.
     */
    public function getExecutedAtFormattedAttribute(): string
    {
        return $this->executed_at->format('M d, Y H:i:s');
    }

    /**
     * Get the formatted response time.
     */
    public function getResponseTimeFormattedAttribute(): string
    {
        if (!$this->response_time_ms) {
            return 'N/A';
        }

        if ($this->response_time_ms < 1000) {
            return $this->response_time_ms . 'ms';
        }

        return round($this->response_time_ms / 1000, 2) . 's';
    }

    /**
     * Get the HTTP status description.
     */
    public function getHttpStatZMWescriptionAttribute(): string
    {
        if (!$this->http_status_code) {
            return 'N/A';
        }

        return match (true) {
            $this->http_status_code >= 200 && $this->http_status_code < 300 => 'Success',
            $this->http_status_code >= 300 && $this->http_status_code < 400 => 'Redirect',
            $this->http_status_code >= 400 && $this->http_status_code < 500 => 'Client Error',
            $this->http_status_code >= 500 => 'Server Error',
            default => 'Unknown',
        };
    }

    /**
     * Get the error summary.
     */
    public function getErrorSummaryAttribute(): string
    {
        if (!$this->hasError()) {
            return 'No errors';
        }

        $summary = $this->error_message;

        if (!empty($this->error_details) && is_array($this->error_details)) {
            $details = collect($this->error_details)->take(3)->implode(', ');
            if (!empty($details)) {
                $summary .= ' (' . $details . ')';
            }
        }

        return $summary;
    }

    /**
     * Get the user name who performed the action.
     */
    public function getUserNameAttribute(): string
    {
        return $this->user?->name ?? 'System';
    }

    /**
     * Check if the log is recent (within last hour).
     */
    public function isRecent(): bool
    {
        return $this->executed_at->isAfter(now()->subHour());
    }

    /**
     * Check if the response time is slow (over 5 seconds).
     */
    public function isSlowResponse(): bool
    {
        return $this->response_time_ms && $this->response_time_ms > 5000;
    }

    /**
     * Get the performance indicator.
     */
    public function getPerformanceIndicatorAttribute(): string
    {
        if (!$this->response_time_ms) {
            return 'unknown';
        }

        return match (true) {
            $this->response_time_ms <= 1000 => 'excellent',
            $this->response_time_ms <= 3000 => 'good',
            $this->response_time_ms <= 5000 => 'fair',
            default => 'poor',
        };
    }

    /**
     * Get the performance color.
     */
    public function getPerformanceColorAttribute(): string
    {
        return match ($this->performance_indicator) {
            'excellent' => 'green',
            'good' => 'blue',
            'fair' => 'yellow',
            'poor' => 'red',
            default => 'gray',
        };
    }
}
