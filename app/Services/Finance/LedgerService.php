<?php

namespace App\Services\Finance;

use App\Models\Finance\Transaction;
use App\Models\Finance\Account;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LedgerService
{
    /**
     * Create a ledger entry (transaction).
     *
     * @param array $data
     * @return Transaction
     */
    public function createEntry(array $data): Transaction
    {
        return DB::transaction(function () use ($data) {
            // Validate required fields
            $this->validateEntryData($data);

            // Get the account
            $account = Account::findOrFail($data['account_id']);

            // Determine transaction type and amount based on debit/credit
            $debitAmount = $data['debit'] ?? 0;
            $creditAmount = $data['credit'] ?? 0;
            
            if ($debitAmount > 0 && $creditAmount > 0) {
                throw new \InvalidArgumentException('Cannot have both debit and credit amounts');
            }

            if ($debitAmount == 0 && $creditAmount == 0) {
                throw new \InvalidArgumentException('Must have either debit or credit amount');
            }

            // Determine transaction type based on account normal balance and debit/credit
            $type = $this->determineTransactionType($account, $debitAmount, $creditAmount);
            $amount = max($debitAmount, $creditAmount);

            // Create the transaction
            $transaction = Transaction::create([
                'type' => $type,
                'amount' => $amount,
                'description' => $data['description'],
                'transaction_date' => $data['transaction_date'] ?? now(),
                'reference_number' => $data['reference_number'] ?? $this->generateReferenceNumber(),
                'status' => 'completed',
                'account_id' => $data['account_id'],
                'category_id' => $data['category_id'] ?? null,
                'user_id' => $data['user_id'] ?? auth()->id(),
                'metadata' => array_merge($data['metadata'] ?? [], [
                    'debit_amount' => $debitAmount,
                    'credit_amount' => $creditAmount,
                    'reference_type' => $data['reference_type'] ?? null,
                    'reference_id' => $data['reference_id'] ?? null,
                    'ledger_entry' => true,
                ]),
                'debit_account_code' => $debitAmount > 0 ? $account->account_code : null,
                'credit_account_code' => $creditAmount > 0 ? $account->account_code : null,
            ]);

            // Update account balance
            $account->updateBalance();

            Log::info("Ledger entry created", [
                'transaction_id' => $transaction->id,
                'account_id' => $account->id,
                'account_code' => $account->account_code,
                'debit' => $debitAmount,
                'credit' => $creditAmount,
                'description' => $data['description'],
            ]);

            return $transaction;
        });
    }

    /**
     * Create a double-entry transaction.
     *
     * @param array $debitEntry
     * @param array $creditEntry
     * @param array $commonData
     * @return array
     */
    public function createDoubleEntry(array $debitEntry, array $creditEntry, array $commonData = []): array
    {
        return DB::transaction(function () use ($debitEntry, $creditEntry, $commonData) {
            $referenceNumber = $commonData['reference_number'] ?? $this->generateReferenceNumber();
            $transactionDate = $commonData['transaction_date'] ?? now();
            $description = $commonData['description'] ?? 'Double entry transaction';

            // Create debit entry
            $debitTransaction = $this->createEntry(array_merge($debitEntry, [
                'reference_number' => $referenceNumber,
                'transaction_date' => $transactionDate,
                'description' => $description . ' (Debit)',
                'metadata' => array_merge($debitEntry['metadata'] ?? [], $commonData['metadata'] ?? []),
            ]));

            // Create credit entry
            $creditTransaction = $this->createEntry(array_merge($creditEntry, [
                'reference_number' => $referenceNumber,
                'transaction_date' => $transactionDate,
                'description' => $description . ' (Credit)',
                'metadata' => array_merge($creditEntry['metadata'] ?? [], $commonData['metadata'] ?? []),
            ]));

            return [
                'debit_transaction' => $debitTransaction,
                'credit_transaction' => $creditTransaction,
                'reference_number' => $referenceNumber,
            ];
        });
    }

    /**
     * Create journal entry with multiple debits and credits.
     *
     * @param array $entries
     * @param array $commonData
     * @return array
     */
    public function createJournalEntry(array $entries, array $commonData = []): array
    {
        return DB::transaction(function () use ($entries, $commonData) {
            $referenceNumber = $commonData['reference_number'] ?? $this->generateReferenceNumber();
            $transactionDate = $commonData['transaction_date'] ?? now();
            $description = $commonData['description'] ?? 'Journal entry';

            $totalDebits = 0;
            $totalCredits = 0;
            $transactions = [];

            // Validate that debits equal credits
            foreach ($entries as $entry) {
                $totalDebits += $entry['debit'] ?? 0;
                $totalCredits += $entry['credit'] ?? 0;
            }

            if (abs($totalDebits - $totalCredits) > 0.01) {
                throw new \InvalidArgumentException('Total debits must equal total credits');
            }

            // Create each entry
            foreach ($entries as $entry) {
                $transaction = $this->createEntry(array_merge($entry, [
                    'reference_number' => $referenceNumber,
                    'transaction_date' => $transactionDate,
                    'description' => $entry['description'] ?? $description,
                    'metadata' => array_merge($entry['metadata'] ?? [], $commonData['metadata'] ?? []),
                ]));

                $transactions[] = $transaction;
            }

            return [
                'transactions' => $transactions,
                'reference_number' => $referenceNumber,
                'total_debits' => $totalDebits,
                'total_credits' => $totalCredits,
            ];
        });
    }

    /**
     * Reverse a transaction.
     *
     * @param Transaction $originalTransaction
     * @param string $reason
     * @return Transaction
     */
    public function reverseTransaction(Transaction $originalTransaction, string $reason): Transaction
    {
        return DB::transaction(function () use ($originalTransaction, $reason) {
            $metadata = $originalTransaction->metadata ?? [];
            $originalDebit = $metadata['debit_amount'] ?? 0;
            $originalCredit = $metadata['credit_amount'] ?? 0;

            // Create reversal entry with opposite amounts
            $reversalData = [
                'account_id' => $originalTransaction->account_id,
                'debit' => $originalCredit, // Reverse: credit becomes debit
                'credit' => $originalDebit, // Reverse: debit becomes credit
                'description' => "Reversal: {$originalTransaction->description} - {$reason}",
                'reference_number' => "REV-{$originalTransaction->reference_number}",
                'metadata' => [
                    'reversal_of_transaction_id' => $originalTransaction->id,
                    'reversal_reason' => $reason,
                    'original_reference' => $originalTransaction->reference_number,
                ],
            ];

            $reversalTransaction = $this->createEntry($reversalData);

            // Mark original transaction as reversed
            $originalTransaction->update([
                'metadata' => array_merge($metadata, [
                    'reversed' => true,
                    'reversed_by_transaction_id' => $reversalTransaction->id,
                    'reversal_reason' => $reason,
                    'reversed_at' => now()->toISOString(),
                ]),
            ]);

            return $reversalTransaction;
        });
    }

    /**
     * Validate entry data.
     *
     * @param array $data
     * @throws \InvalidArgumentException
     */
    protected function validateEntryData(array $data): void
    {
        $required = ['account_id', 'description'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                throw new \InvalidArgumentException("Required field '{$field}' is missing");
            }
        }

        if (!isset($data['debit']) && !isset($data['credit'])) {
            throw new \InvalidArgumentException("Either 'debit' or 'credit' amount is required");
        }
    }

    /**
     * Determine transaction type based on account and debit/credit.
     *
     * @param Account $account
     * @param float $debitAmount
     * @param float $creditAmount
     * @return string
     */
    protected function determineTransactionType(Account $account, float $debitAmount, float $creditAmount): string
    {
        $normalBalance = $account->normal_balance;

        if ($debitAmount > 0) {
            // Debit entry
            return ($normalBalance === 'debit') ? 'income' : 'expense';
        } else {
            // Credit entry
            return ($normalBalance === 'credit') ? 'income' : 'expense';
        }
    }

    /**
     * Generate a unique reference number.
     *
     * @return string
     */
    protected function generateReferenceNumber(): string
    {
        return 'TXN-' . now()->format('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
    }

    /**
     * Get account balance.
     *
     * @param int $accountId
     * @return float
     */
    public function getAccountBalance(int $accountId): float
    {
        $account = Account::findOrFail($accountId);
        return $account->balance;
    }

    /**
     * Get trial balance.
     *
     * @param \Carbon\Carbon|null $asOfDate
     * @return array
     */
    public function getTrialBalance(\Carbon\Carbon $asOfDate = null): array
    {
        $asOfDate = $asOfDate ?? now();

        $accounts = Account::where('is_active', true)
            ->with(['transactions' => function ($query) use ($asOfDate) {
                $query->where('status', 'completed')
                      ->where('transaction_date', '<=', $asOfDate);
            }])
            ->orderBy('account_code')
            ->get();

        $trialBalance = [];
        $totalDebits = 0;
        $totalCredits = 0;

        foreach ($accounts as $account) {
            $debitTotal = 0;
            $creditTotal = 0;

            foreach ($account->transactions as $transaction) {
                $metadata = $transaction->metadata ?? [];
                $debitTotal += $metadata['debit_amount'] ?? 0;
                $creditTotal += $metadata['credit_amount'] ?? 0;
            }

            if ($debitTotal > 0 || $creditTotal > 0) {
                $trialBalance[] = [
                    'account_id' => $account->id,
                    'account_code' => $account->account_code,
                    'account_name' => $account->name,
                    'debit_balance' => $debitTotal,
                    'credit_balance' => $creditTotal,
                ];

                $totalDebits += $debitTotal;
                $totalCredits += $creditTotal;
            }
        }

        return [
            'accounts' => $trialBalance,
            'total_debits' => $totalDebits,
            'total_credits' => $totalCredits,
            'is_balanced' => abs($totalDebits - $totalCredits) < 0.01,
            'as_of_date' => $asOfDate->toDateString(),
        ];
    }
}
