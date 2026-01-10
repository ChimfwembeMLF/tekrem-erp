<?php

namespace App\Models\Finance;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class Report extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'type',
        'status',
        'parameters',
        'generated_at',
        'file_path',
        'file_size',
        'created_by',
        'company_id',
];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'parameters' => 'array',
        'generated_at' => 'datetime',
        'file_size' => 'integer',
    ];

    /**
     * Available report types.
     */
    public const TYPES = [
        'income_statement' => 'Income Statement',
        'cash_flow' => 'Cash Flow',
        'balance_sheet' => 'Balance Sheet',
        'expense_report' => 'Expense Report',
        'budget_analysis' => 'Budget Analysis',
        'tax_report' => 'Tax Report',
        'chart_of_accounts' => 'Chart of Accounts',
        'trial_balance' => 'Trial Balance',
        'account_activity' => 'Account Activity Report',
        'bank_reconciliation' => 'Bank Reconciliation Report',
        'reconciliation_summary' => 'Reconciliation Summary',
        'unreconciled_transactions' => 'Unreconciled Transactions',
    ];

    /**
     * Available report statuses.
     */
    public const STATUSES = [
        'pending' => 'Pending',
        'processing' => 'Processing',
        'completed' => 'Completed',
        'available' => 'Available',
        'failed' => 'Failed',
    ];

    /**
     * Get the user who created the report.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope a query to only include reports of a specific type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope a query to only include reports with a specific status.
     */
    public function scopeWithStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include available reports.
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    /**
     * Scope a query to only include completed reports.
     */
    public function scopeCompleted($query)
    {
        return $query->whereIn('status', ['completed', 'available']);
    }

    /**
     * Check if the report is available for download.
     */
    public function isAvailable(): bool
    {
        return in_array($this->status, ['completed', 'available']);
    }

    /**
     * Check if the report is being processed.
     */
    public function isProcessing(): bool
    {
        return in_array($this->status, ['pending', 'processing']);
    }

    /**
     * Check if the report has failed.
     */
    public function hasFailed(): bool
    {
        return $this->status === 'failed';
    }

    /**
     * Get the formatted file size.
     */
    public function getFormattedFileSizeAttribute(): string
    {
        if (!$this->file_size) {
            return '-';
        }

        $sizes = ['Bytes', 'KB', 'MB', 'GB'];
        $i = floor(log($this->file_size) / log(1024));
        
        return round($this->file_size / pow(1024, $i), 2) . ' ' . $sizes[$i];
    }

    /**
     * Get the report type label.
     */
    public function getTypeLabel(): string
    {
        return self::TYPES[$this->type] ?? $this->type;
    }

    /**
     * Get the status label.
     */
    public function getStatusLabel(): string
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }

    /**
     * Mark the report as completed.
     */
    public function markAsCompleted(string $filePath = null, int $fileSize = null): void
    {
        $this->update([
            'status' => 'available',
            'file_path' => $filePath,
            'file_size' => $fileSize,
            'generated_at' => now(),
        ]);
    }

    /**
     * Mark the report as failed.
     */
    public function markAsFailed(): void
    {
        $this->update([
            'status' => 'failed',
        ]);
    }

    /**
     * Mark the report as processing.
     */
    public function markAsProcessing(): void
    {
        $this->update([
            'status' => 'processing',
        ]);
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
