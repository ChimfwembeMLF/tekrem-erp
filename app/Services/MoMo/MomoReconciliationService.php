<?php

namespace App\Services\MoMo;

use App\Models\Finance\MomoTransaction;
use App\Models\Finance\MomoProvider;
use App\Models\Finance\BankReconciliation;
use App\Models\Finance\BankReconciliationItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class MomoReconciliationService
{
    /**
     * Perform automatic reconciliation for a provider.
     *
     * @param MomoProvider $provider
     * @param Carbon $startDate
     * @param Carbon $endDate
     * @return array
     */
    public function autoReconcile(MomoProvider $provider, Carbon $startDate, Carbon $endDate): array
    {
        try {
            DB::beginTransaction();

            Log::info("Starting MoMo auto-reconciliation", [
                'provider' => $provider->code,
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
            ]);

            // Get provider transaction history
            $providerTransactions = $this->getProviderTransactionHistory($provider, $startDate, $endDate);
            
            // Get local transactions
            $localTransactions = $this->getLocalTransactions($provider, $startDate, $endDate);

            // Create reconciliation record
            $reconciliation = $this->createReconciliation($provider, $startDate, $endDate);

            // Match transactions
            $matchResults = $this->matchTransactions($localTransactions, $providerTransactions, $reconciliation);

            // Calculate reconciliation summary
            $summary = $this->calculateReconciliationSummary($matchResults, $reconciliation);

            // Update reconciliation with summary
            $reconciliation->update([
                'status' => $summary['has_discrepancies'] ? 'discrepancies' : 'reconciled',
                'total_local_transactions' => $summary['local_count'],
                'total_provider_transactions' => $summary['provider_count'],
                'matched_transactions' => $summary['matched_count'],
                'unmatched_local' => $summary['unmatched_local_count'],
                'unmatched_provider' => $summary['unmatched_provider_count'],
                'total_local_amount' => $summary['local_amount'],
                'total_provider_amount' => $summary['provider_amount'],
                'difference_amount' => $summary['difference_amount'],
                'completed_at' => now(),
            ]);

            DB::commit();

            Log::info("MoMo auto-reconciliation completed", [
                'provider' => $provider->code,
                'reconciliation_id' => $reconciliation->id,
                'summary' => $summary,
            ]);

            return [
                'success' => true,
                'reconciliation' => $reconciliation,
                'summary' => $summary,
                'match_results' => $matchResults,
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error("MoMo auto-reconciliation failed", [
                'provider' => $provider->code,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get provider transaction history.
     *
     * @param MomoProvider $provider
     * @param Carbon $startDate
     * @param Carbon $endDate
     * @return array
     */
    protected function getProviderTransactionHistory(MomoProvider $provider, Carbon $startDate, Carbon $endDate): array
    {
        try {
            $service = MomoServiceFactory::createFromProvider($provider);
            
            $filters = [
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'limit' => 1000, // Adjust as needed
            ];

            $result = $service->getTransactionHistory($filters);

            if ($result['success']) {
                return $result['transactions'] ?? [];
            }

            Log::warning("Failed to get provider transaction history", [
                'provider' => $provider->code,
                'error' => $result['error'] ?? 'Unknown error',
            ]);

            return [];
        } catch (\Exception $e) {
            Log::error("Error getting provider transaction history", [
                'provider' => $provider->code,
                'error' => $e->getMessage(),
            ]);

            return [];
        }
    }

    /**
     * Get local transactions for reconciliation.
     *
     * @param MomoProvider $provider
     * @param Carbon $startDate
     * @param Carbon $endDate
     * @return \Illuminate\Database\Eloquent\Collection
     */
    protected function getLocalTransactions(MomoProvider $provider, Carbon $startDate, Carbon $endDate)
    {
        return MomoTransaction::where('provider_id', $provider->id)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$startDate, $endDate])
            ->orderBy('completed_at')
            ->get();
    }

    /**
     * Create reconciliation record.
     *
     * @param MomoProvider $provider
     * @param Carbon $startDate
     * @param Carbon $endDate
     * @return BankReconciliation
     */
    protected function createReconciliation(MomoProvider $provider, Carbon $startDate, Carbon $endDate): BankReconciliation
    {
        return BankReconciliation::create([
            'account_id' => $provider->cash_account_id,
            'reconciliation_date' => $endDate,
            'period_start' => $startDate,
            'period_end' => $endDate,
            'status' => 'in_progress',
            'type' => 'momo_auto',
            'reference' => "MOMO-{$provider->code}-" . $startDate->format('Ymd') . '-' . $endDate->format('Ymd'),
            'notes' => "Automatic MoMo reconciliation for {$provider->display_name}",
            'user_id' => auth()->id() ?? 1,
        ]);
    }

    /**
     * Match local and provider transactions.
     *
     * @param \Illuminate\Database\Eloquent\Collection $localTransactions
     * @param array $providerTransactions
     * @param BankReconciliation $reconciliation
     * @return array
     */
    protected function matchTransactions($localTransactions, array $providerTransactions, BankReconciliation $reconciliation): array
    {
        $matched = [];
        $unmatchedLocal = [];
        $unmatchedProvider = [];

        // Create lookup arrays for efficient matching
        $providerLookup = [];
        foreach ($providerTransactions as $providerTxn) {
            $key = $this->getTransactionKey($providerTxn);
            $providerLookup[$key] = $providerTxn;
        }

        // Match local transactions
        foreach ($localTransactions as $localTxn) {
            $key = $this->getLocalTransactionKey($localTxn);
            
            if (isset($providerLookup[$key])) {
                $providerTxn = $providerLookup[$key];
                
                // Create matched reconciliation item
                $item = $this->createReconciliationItem($reconciliation, $localTxn, $providerTxn, 'matched');
                
                $matched[] = [
                    'local' => $localTxn,
                    'provider' => $providerTxn,
                    'item' => $item,
                ];

                // Remove from provider lookup to track unmatched
                unset($providerLookup[$key]);
            } else {
                // Create unmatched local item
                $item = $this->createReconciliationItem($reconciliation, $localTxn, null, 'unmatched_local');
                
                $unmatchedLocal[] = [
                    'local' => $localTxn,
                    'item' => $item,
                ];
            }
        }

        // Remaining provider transactions are unmatched
        foreach ($providerLookup as $providerTxn) {
            $item = $this->createReconciliationItem($reconciliation, null, $providerTxn, 'unmatched_provider');
            
            $unmatchedProvider[] = [
                'provider' => $providerTxn,
                'item' => $item,
            ];
        }

        return [
            'matched' => $matched,
            'unmatched_local' => $unmatchedLocal,
            'unmatched_provider' => $unmatchedProvider,
        ];
    }

    /**
     * Get transaction key for matching.
     *
     * @param array $providerTxn
     * @return string
     */
    protected function getTransactionKey(array $providerTxn): string
    {
        // Use transaction ID and amount for matching
        $id = $providerTxn['id'] ?? $providerTxn['transaction_id'] ?? '';
        $amount = $providerTxn['amount'] ?? 0;
        
        return $id . '|' . number_format($amount, 2);
    }

    /**
     * Get local transaction key for matching.
     *
     * @param MomoTransaction $localTxn
     * @return string
     */
    protected function getLocalTransactionKey(MomoTransaction $localTxn): string
    {
        return $localTxn->provider_transaction_id . '|' . number_format($localTxn->amount, 2);
    }

    /**
     * Create reconciliation item.
     *
     * @param BankReconciliation $reconciliation
     * @param MomoTransaction|null $localTxn
     * @param array|null $providerTxn
     * @param string $status
     * @return BankReconciliationItem
     */
    protected function createReconciliationItem(
        BankReconciliation $reconciliation,
        ?MomoTransaction $localTxn,
        ?array $providerTxn,
        string $status
    ): BankReconciliationItem {
        $localAmount = $localTxn ? $localTxn->amount : 0;
        $providerAmount = $providerTxn ? ($providerTxn['amount'] ?? 0) : 0;
        $difference = $localAmount - $providerAmount;

        return BankReconciliationItem::create([
            'bank_reconciliation_id' => $reconciliation->id,
            'transaction_date' => $localTxn ? $localTxn->completed_at : ($providerTxn['date'] ?? now()),
            'description' => $this->getItemDescription($localTxn, $providerTxn),
            'reference' => $localTxn ? $localTxn->transaction_number : ($providerTxn['reference'] ?? ''),
            'local_amount' => $localAmount,
            'provider_amount' => $providerAmount,
            'difference' => $difference,
            'status' => $status,
            'local_transaction_id' => $localTxn?->id,
            'provider_transaction_id' => $providerTxn['id'] ?? null,
            'metadata' => [
                'local_transaction' => $localTxn ? [
                    'id' => $localTxn->id,
                    'transaction_number' => $localTxn->transaction_number,
                    'type' => $localTxn->type,
                    'phone_number' => $localTxn->phone_number,
                ] : null,
                'provider_transaction' => $providerTxn,
            ],
        ]);
    }

    /**
     * Get item description.
     *
     * @param MomoTransaction|null $localTxn
     * @param array|null $providerTxn
     * @return string
     */
    protected function getItemDescription(?MomoTransaction $localTxn, ?array $providerTxn): string
    {
        if ($localTxn && $providerTxn) {
            return "MoMo {$localTxn->type}: {$localTxn->transaction_number}";
        }

        if ($localTxn) {
            return "Local MoMo {$localTxn->type}: {$localTxn->transaction_number}";
        }

        if ($providerTxn) {
            $type = $providerTxn['type'] ?? 'transaction';
            $ref = $providerTxn['reference'] ?? $providerTxn['id'] ?? 'Unknown';
            return "Provider MoMo {$type}: {$ref}";
        }

        return 'Unknown transaction';
    }

    /**
     * Calculate reconciliation summary.
     *
     * @param array $matchResults
     * @param BankReconciliation $reconciliation
     * @return array
     */
    protected function calculateReconciliationSummary(array $matchResults, BankReconciliation $reconciliation): array
    {
        $localCount = count($matchResults['matched']) + count($matchResults['unmatched_local']);
        $providerCount = count($matchResults['matched']) + count($matchResults['unmatched_provider']);
        $matchedCount = count($matchResults['matched']);

        $localAmount = collect($matchResults['matched'])->sum(fn($m) => $m['local']->amount) +
                      collect($matchResults['unmatched_local'])->sum(fn($m) => $m['local']->amount);

        $providerAmount = collect($matchResults['matched'])->sum(fn($m) => $m['provider']['amount'] ?? 0) +
                         collect($matchResults['unmatched_provider'])->sum(fn($m) => $m['provider']['amount'] ?? 0);

        $differenceAmount = $localAmount - $providerAmount;
        $hasDiscrepancies = count($matchResults['unmatched_local']) > 0 || 
                           count($matchResults['unmatched_provider']) > 0 || 
                           abs($differenceAmount) > 0.01;

        return [
            'local_count' => $localCount,
            'provider_count' => $providerCount,
            'matched_count' => $matchedCount,
            'unmatched_local_count' => count($matchResults['unmatched_local']),
            'unmatched_provider_count' => count($matchResults['unmatched_provider']),
            'local_amount' => $localAmount,
            'provider_amount' => $providerAmount,
            'difference_amount' => $differenceAmount,
            'has_discrepancies' => $hasDiscrepancies,
            'reconciliation_rate' => $localCount > 0 ? ($matchedCount / $localCount) * 100 : 100,
        ];
    }

    /**
     * Manual reconciliation for specific transactions.
     *
     * @param array $transactionIds
     * @param string $action
     * @param array $options
     * @return array
     */
    public function manualReconcile(array $transactionIds, string $action, array $options = []): array
    {
        try {
            DB::beginTransaction();

            $results = [];

            foreach ($transactionIds as $transactionId) {
                $transaction = MomoTransaction::findOrFail($transactionId);
                
                switch ($action) {
                    case 'mark_reconciled':
                        $transaction->update(['is_reconciled' => true]);
                        $results[] = ['transaction_id' => $transactionId, 'action' => 'marked_reconciled'];
                        break;
                        
                    case 'mark_unreconciled':
                        $transaction->update(['is_reconciled' => false]);
                        $results[] = ['transaction_id' => $transactionId, 'action' => 'marked_unreconciled'];
                        break;
                        
                    case 'check_status':
                        $statusResult = app(MomoTransactionService::class)->checkTransactionStatus($transaction);
                        $results[] = [
                            'transaction_id' => $transactionId,
                            'action' => 'status_checked',
                            'result' => $statusResult,
                        ];
                        break;
                        
                    default:
                        $results[] = [
                            'transaction_id' => $transactionId,
                            'action' => 'unknown',
                            'error' => 'Unknown action',
                        ];
                }
            }

            DB::commit();

            return [
                'success' => true,
                'results' => $results,
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get reconciliation report.
     *
     * @param MomoProvider $provider
     * @param Carbon $startDate
     * @param Carbon $endDate
     * @return array
     */
    public function getReconciliationReport(MomoProvider $provider, Carbon $startDate, Carbon $endDate): array
    {
        $reconciliations = BankReconciliation::where('account_id', $provider->cash_account_id)
            ->where('type', 'momo_auto')
            ->whereBetween('period_start', [$startDate, $endDate])
            ->with('items')
            ->orderBy('period_start', 'desc')
            ->get();

        $summary = [
            'total_reconciliations' => $reconciliations->count(),
            'successful_reconciliations' => $reconciliations->where('status', 'reconciled')->count(),
            'reconciliations_with_discrepancies' => $reconciliations->where('status', 'discrepancies')->count(),
            'total_transactions_reconciled' => $reconciliations->sum('matched_transactions'),
            'total_amount_reconciled' => $reconciliations->sum('total_local_amount'),
            'total_discrepancy_amount' => $reconciliations->sum('difference_amount'),
        ];

        return [
            'summary' => $summary,
            'reconciliations' => $reconciliations,
        ];
    }
}
