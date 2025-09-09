<?php

namespace App\Console\Commands;

use App\Models\Finance\MomoTransaction;
use App\Services\MoMo\MomoTransactionService;
use Illuminate\Console\Command;
use Carbon\Carbon;

class MomoCheckStatusCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'momo:check-status 
                            {--pending-only : Only check pending transactions}
                            {--hours=24 : Check transactions from last N hours}
                            {--transaction= : Check specific transaction by ID}
                            {--provider= : Check transactions for specific provider}
                            {--limit=100 : Maximum number of transactions to check}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check status of MoMo transactions with providers';

    protected MomoTransactionService $transactionService;

    public function __construct(MomoTransactionService $transactionService)
    {
        parent::__construct();
        $this->transactionService = $transactionService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Checking MoMo transaction statuses...');

        $transactions = $this->getTransactionsToCheck();

        if ($transactions->isEmpty()) {
            $this->info('No transactions found to check.');
            return Command::SUCCESS;
        }

        $this->info("Found {$transactions->count()} transaction(s) to check.");

        $statusCounts = [
            'checked' => 0,
            'updated' => 0,
            'failed' => 0,
            'completed' => 0,
            'pending' => 0,
            'cancelled' => 0,
        ];

        $progressBar = $this->output->createProgressBar($transactions->count());
        $progressBar->start();

        foreach ($transactions as $transaction) {
            try {
                $result = $this->transactionService->checkTransactionStatus($transaction);
                
                if ($result['success']) {
                    $statusCounts['checked']++;
                    
                    $oldStatus = $transaction->status;
                    $newStatus = $result['status'];
                    
                    if ($oldStatus !== $newStatus) {
                        $statusCounts['updated']++;
                        $this->newLine();
                        $this->info("Transaction {$transaction->transaction_number}: {$oldStatus} → {$newStatus}");
                    }
                    
                    // Count by final status
                    $statusCounts[$newStatus] = ($statusCounts[$newStatus] ?? 0) + 1;
                } else {
                    $statusCounts['failed']++;
                    $this->newLine();
                    $this->error("Failed to check transaction {$transaction->transaction_number}: {$result['error']}");
                }
            } catch (\Exception $e) {
                $statusCounts['failed']++;
                $this->newLine();
                $this->error("Exception checking transaction {$transaction->transaction_number}: {$e->getMessage()}");
            }

            $progressBar->advance();
            
            // Small delay to avoid overwhelming provider APIs
            usleep(100000); // 0.1 second
        }

        $progressBar->finish();
        $this->newLine(2);

        // Display summary
        $this->info('Status Check Summary:');
        $this->table(
            ['Metric', 'Count'],
            [
                ['Transactions Checked', $statusCounts['checked']],
                ['Status Updates', $statusCounts['updated']],
                ['Check Failures', $statusCounts['failed']],
                ['Completed', $statusCounts['completed']],
                ['Pending', $statusCounts['pending']],
                ['Cancelled', $statusCounts['cancelled']],
            ]
        );

        if ($statusCounts['failed'] > 0) {
            $this->warn('Some status checks failed. Check the logs for details.');
        }

        if ($statusCounts['updated'] > 0) {
            $this->info("{$statusCounts['updated']} transaction(s) had status updates.");
        }

        return Command::SUCCESS;
    }

    /**
     * Get transactions to check status for.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    protected function getTransactionsToCheck()
    {
        $transactionId = $this->option('transaction');
        
        if ($transactionId) {
            return MomoTransaction::where('id', $transactionId)->get();
        }

        $query = MomoTransaction::with('provider');

        // Filter by pending only
        if ($this->option('pending-only')) {
            $query->whereIn('status', ['pending', 'processing']);
        } else {
            // Exclude already completed/cancelled transactions unless specifically requested
            $query->whereNotIn('status', ['completed', 'failed', 'cancelled']);
        }

        // Filter by time range
        $hours = (int) $this->option('hours');
        if ($hours > 0) {
            $query->where('created_at', '>=', Carbon::now()->subHours($hours));
        }

        // Filter by provider
        $providerCode = $this->option('provider');
        if ($providerCode) {
            $query->whereHas('provider', function ($q) use ($providerCode) {
                $q->where('code', $providerCode);
            });
        }

        // Limit results
        $limit = (int) $this->option('limit');
        if ($limit > 0) {
            $query->limit($limit);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }
}
