<?php

namespace App\Services\MoMo;

use App\Models\Finance\MomoTransaction;
use App\Models\Finance\MomoProvider;
use App\Models\Finance\MomoWebhook;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class MomoAuditService
{
    /**
     * Generate comprehensive audit report.
     *
     * @param array $filters
     * @return array
     */
    public function generateAuditReport(array $filters = []): array
    {
        $startDate = isset($filters['start_date']) ? Carbon::parse($filters['start_date']) : Carbon::now()->subMonth();
        $endDate = isset($filters['end_date']) ? Carbon::parse($filters['end_date']) : Carbon::now();
        $providerId = $filters['provider_id'] ?? null;

        $query = MomoTransaction::with(['provider', 'user', 'invoice'])
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($providerId) {
            $query->where('provider_id', $providerId);
        }

        $transactions = $query->orderBy('created_at', 'desc')->get();

        // Generate audit statistics
        $statistics = $this->generateAuditStatistics($transactions);

        // Identify suspicious activities
        $suspiciousActivities = $this->identifySuspiciousActivities($transactions);

        // Generate compliance report
        $complianceReport = $this->generateComplianceReport($transactions);

        // Generate reconciliation status
        $reconciliationStatus = $this->generateReconciliationStatus($transactions);

        return [
            'period' => [
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
            ],
            'statistics' => $statistics,
            'suspicious_activities' => $suspiciousActivities,
            'compliance_report' => $complianceReport,
            'reconciliation_status' => $reconciliationStatus,
            'transactions' => $transactions,
        ];
    }

    /**
     * Generate audit statistics.
     *
     * @param \Illuminate\Database\Eloquent\Collection $transactions
     * @return array
     */
    protected function generateAuditStatistics($transactions): array
    {
        $totalTransactions = $transactions->count();
        $totalAmount = $transactions->sum('amount');
        $totalFees = $transactions->sum('fee_amount');

        $statusBreakdown = $transactions->groupBy('status')->map(function ($group) {
            return [
                'count' => $group->count(),
                'amount' => $group->sum('amount'),
                'percentage' => 0, // Will be calculated below
            ];
        });

        // Calculate percentages
        foreach ($statusBreakdown as $status => $data) {
            $statusBreakdown[$status]['percentage'] = $totalTransactions > 0 
                ? round(($data['count'] / $totalTransactions) * 100, 2) 
                : 0;
        }

        $typeBreakdown = $transactions->groupBy('type')->map(function ($group) {
            return [
                'count' => $group->count(),
                'amount' => $group->sum('amount'),
            ];
        });

        $providerBreakdown = $transactions->groupBy('provider.code')->map(function ($group) {
            return [
                'count' => $group->count(),
                'amount' => $group->sum('amount'),
                'success_rate' => $group->count() > 0 
                    ? round(($group->where('status', 'completed')->count() / $group->count()) * 100, 2)
                    : 0,
            ];
        });

        return [
            'total_transactions' => $totalTransactions,
            'total_amount' => $totalAmount,
            'total_fees' => $totalFees,
            'average_transaction_amount' => $totalTransactions > 0 ? $totalAmount / $totalTransactions : 0,
            'success_rate' => $totalTransactions > 0 
                ? round(($transactions->where('status', 'completed')->count() / $totalTransactions) * 100, 2)
                : 0,
            'status_breakdown' => $statusBreakdown,
            'type_breakdown' => $typeBreakdown,
            'provider_breakdown' => $providerBreakdown,
        ];
    }

    /**
     * Identify suspicious activities.
     *
     * @param \Illuminate\Database\Eloquent\Collection $transactions
     * @return array
     */
    protected function identifySuspiciousActivities($transactions): array
    {
        $suspicious = [];

        // Check for high-frequency transactions from same phone number
        $phoneFrequency = $transactions->groupBy('phone_number');
        foreach ($phoneFrequency as $phone => $phoneTransactions) {
            if ($phoneTransactions->count() > 50) { // Configurable threshold
                $suspicious[] = [
                    'type' => 'high_frequency_phone',
                    'description' => "High frequency transactions from phone number: {$phone}",
                    'count' => $phoneTransactions->count(),
                    'total_amount' => $phoneTransactions->sum('amount'),
                    'phone_number' => $phone,
                ];
            }
        }

        // Check for large amount transactions
        $largeTransactions = $transactions->where('amount', '>', 10000); // Configurable threshold
        foreach ($largeTransactions as $transaction) {
            $suspicious[] = [
                'type' => 'large_amount',
                'description' => "Large amount transaction: {$transaction->transaction_number}",
                'transaction_id' => $transaction->id,
                'amount' => $transaction->amount,
                'phone_number' => $transaction->phone_number,
            ];
        }

        // Check for failed transactions with high retry counts
        $failedTransactions = $transactions->where('status', 'failed');
        $retryPattern = $failedTransactions->groupBy('phone_number');
        foreach ($retryPattern as $phone => $phoneFailures) {
            if ($phoneFailures->count() > 10) { // Configurable threshold
                $suspicious[] = [
                    'type' => 'high_failure_rate',
                    'description' => "High failure rate for phone number: {$phone}",
                    'failure_count' => $phoneFailures->count(),
                    'phone_number' => $phone,
                ];
            }
        }

        // Check for transactions outside business hours
        $afterHoursTransactions = $transactions->filter(function ($transaction) {
            $hour = $transaction->created_at->hour;
            return $hour < 6 || $hour > 22; // Outside 6 AM - 10 PM
        });

        if ($afterHoursTransactions->count() > 0) {
            $suspicious[] = [
                'type' => 'after_hours',
                'description' => 'Transactions processed outside business hours',
                'count' => $afterHoursTransactions->count(),
                'total_amount' => $afterHoursTransactions->sum('amount'),
            ];
        }

        return $suspicious;
    }

    /**
     * Generate compliance report.
     *
     * @param \Illuminate\Database\Eloquent\Collection $transactions
     * @return array
     */
    protected function generateComplianceReport($transactions): array
    {
        $compliance = [
            'total_transactions' => $transactions->count(),
            'compliant_transactions' => 0,
            'non_compliant_transactions' => 0,
            'compliance_issues' => [],
        ];

        foreach ($transactions as $transaction) {
            $issues = $this->checkTransactionCompliance($transaction);
            
            if (empty($issues)) {
                $compliance['compliant_transactions']++;
            } else {
                $compliance['non_compliant_transactions']++;
                $compliance['compliance_issues'] = array_merge($compliance['compliance_issues'], $issues);
            }
        }

        // Group compliance issues by type
        $issueGroups = collect($compliance['compliance_issues'])->groupBy('type')->map(function ($group) {
            return [
                'count' => $group->count(),
                'transactions' => $group->pluck('transaction_id')->toArray(),
            ];
        });

        $compliance['issue_summary'] = $issueGroups;
        $compliance['compliance_rate'] = $compliance['total_transactions'] > 0 
            ? round(($compliance['compliant_transactions'] / $compliance['total_transactions']) * 100, 2)
            : 100;

        return $compliance;
    }

    /**
     * Check individual transaction compliance.
     *
     * @param MomoTransaction $transaction
     * @return array
     */
    protected function checkTransactionCompliance(MomoTransaction $transaction): array
    {
        $issues = [];

        // Check if transaction has proper audit trail
        if (empty($transaction->provider_response)) {
            $issues[] = [
                'type' => 'missing_provider_response',
                'description' => 'Transaction missing provider response data',
                'transaction_id' => $transaction->id,
            ];
        }

        // Check if transaction has proper user attribution
        if (!$transaction->user_id) {
            $issues[] = [
                'type' => 'missing_user_attribution',
                'description' => 'Transaction missing user attribution',
                'transaction_id' => $transaction->id,
            ];
        }

        // Check if completed transactions have completion timestamp
        if ($transaction->status === 'completed' && !$transaction->completed_at) {
            $issues[] = [
                'type' => 'missing_completion_timestamp',
                'description' => 'Completed transaction missing completion timestamp',
                'transaction_id' => $transaction->id,
            ];
        }

        // Check if transaction amount matches fee calculation
        $expectedFee = $transaction->provider->calculateFee($transaction->amount);
        if (abs($transaction->fee_amount - $expectedFee) > 0.01) {
            $issues[] = [
                'type' => 'incorrect_fee_calculation',
                'description' => 'Transaction fee does not match expected calculation',
                'transaction_id' => $transaction->id,
                'expected_fee' => $expectedFee,
                'actual_fee' => $transaction->fee_amount,
            ];
        }

        return $issues;
    }

    /**
     * Generate reconciliation status report.
     *
     * @param \Illuminate\Database\Eloquent\Collection $transactions
     * @return array
     */
    protected function generateReconciliationStatus($transactions): array
    {
        $completedTransactions = $transactions->where('status', 'completed');
        $reconciledTransactions = $completedTransactions->where('is_reconciled', true);
        $unreconciledTransactions = $completedTransactions->where('is_reconciled', false);

        return [
            'total_completed' => $completedTransactions->count(),
            'reconciled_count' => $reconciledTransactions->count(),
            'unreconciled_count' => $unreconciledTransactions->count(),
            'reconciliation_rate' => $completedTransactions->count() > 0 
                ? round(($reconciledTransactions->count() / $completedTransactions->count()) * 100, 2)
                : 0,
            'unreconciled_amount' => $unreconciledTransactions->sum('amount'),
            'reconciled_amount' => $reconciledTransactions->sum('amount'),
        ];
    }

    /**
     * Generate webhook audit report.
     *
     * @param array $filters
     * @return array
     */
    public function generateWebhookAuditReport(array $filters = []): array
    {
        $startDate = isset($filters['start_date']) ? Carbon::parse($filters['start_date']) : Carbon::now()->subMonth();
        $endDate = isset($filters['end_date']) ? Carbon::parse($filters['end_date']) : Carbon::now();
        $providerCode = $filters['provider_code'] ?? null;

        $query = MomoWebhook::with('momoTransaction')
            ->whereBetween('received_at', [$startDate, $endDate]);

        if ($providerCode) {
            $query->where('provider_code', $providerCode);
        }

        $webhooks = $query->orderBy('received_at', 'desc')->get();

        $statistics = [
            'total_webhooks' => $webhooks->count(),
            'processed_webhooks' => $webhooks->where('status', 'processed')->count(),
            'failed_webhooks' => $webhooks->where('status', 'failed')->count(),
            'pending_webhooks' => $webhooks->where('status', 'pending')->count(),
            'success_rate' => $webhooks->count() > 0 
                ? round(($webhooks->where('status', 'processed')->count() / $webhooks->count()) * 100, 2)
                : 0,
        ];

        $providerBreakdown = $webhooks->groupBy('provider_code')->map(function ($group) {
            return [
                'total' => $group->count(),
                'processed' => $group->where('status', 'processed')->count(),
                'failed' => $group->where('status', 'failed')->count(),
                'success_rate' => $group->count() > 0 
                    ? round(($group->where('status', 'processed')->count() / $group->count()) * 100, 2)
                    : 0,
            ];
        });

        $failedWebhooks = $webhooks->where('status', 'failed')->map(function ($webhook) {
            return [
                'id' => $webhook->id,
                'provider_code' => $webhook->provider_code,
                'event_type' => $webhook->event_type,
                'error_message' => $webhook->error_message,
                'retry_count' => $webhook->retry_count,
                'received_at' => $webhook->received_at,
            ];
        });

        return [
            'period' => [
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
            ],
            'statistics' => $statistics,
            'provider_breakdown' => $providerBreakdown,
            'failed_webhooks' => $failedWebhooks,
            'webhooks' => $webhooks,
        ];
    }

    /**
     * Log audit event.
     *
     * @param string $event
     * @param array $data
     * @param string $level
     */
    public function logAuditEvent(string $event, array $data, string $level = 'info'): void
    {
        $auditData = [
            'event' => $event,
            'timestamp' => now()->toISOString(),
            'user_id' => auth()->id(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'data' => $data,
        ];

        Log::channel('audit')->{$level}("MoMo Audit: {$event}", $auditData);
    }

    /**
     * Export audit report to CSV.
     *
     * @param array $auditData
     * @return string
     */
    public function exportAuditReportToCsv(array $auditData): string
    {
        $filename = 'momo_audit_report_' . now()->format('Y-m-d_H-i-s') . '.csv';
        $filepath = storage_path('app/exports/' . $filename);

        // Ensure directory exists
        if (!file_exists(dirname($filepath))) {
            mkdir(dirname($filepath), 0755, true);
        }

        $file = fopen($filepath, 'w');

        // Write headers
        fputcsv($file, [
            'Transaction ID',
            'Transaction Number',
            'Provider',
            'Type',
            'Status',
            'Amount',
            'Fee Amount',
            'Phone Number',
            'Created At',
            'Completed At',
            'Is Reconciled',
            'User ID',
        ]);

        // Write transaction data
        foreach ($auditData['transactions'] as $transaction) {
            fputcsv($file, [
                $transaction->id,
                $transaction->transaction_number,
                $transaction->provider->code,
                $transaction->type,
                $transaction->status,
                $transaction->amount,
                $transaction->fee_amount,
                $transaction->phone_number,
                $transaction->created_at,
                $transaction->completed_at,
                $transaction->is_reconciled ? 'Yes' : 'No',
                $transaction->user_id,
            ]);
        }

        fclose($file);

        return $filepath;
    }
}
