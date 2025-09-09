<?php

namespace App\Console\Commands;

use App\Models\Finance\ZraSmartInvoice;
use App\Services\ZRA\ZraSmartInvoiceService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ZraCheckStatusCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'zra:check-status
                            {--days=7 : Number of days to look back for submitted invoices}
                            {--limit=100 : Maximum number of invoices to check}
                            {--force : Force check even for recently checked invoices}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check status of submitted ZRA invoices and update their status';

    protected ZraSmartInvoiceService $zraService;

    /**
     * Create a new command instance.
     */
    public function __construct(ZraSmartInvoiceService $zraService)
    {
        parent::__construct();
        $this->zraService = $zraService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting ZRA invoice status check...');

        $days = $this->option('days');
        $limit = $this->option('limit');
        $force = $this->option('force');

        // Get submitted invoices that need status checking
        $query = ZraSmartInvoice::submitted()
            ->where('submitted_at', '>=', now()->subDays($days))
            ->orderBy('submitted_at', 'desc')
            ->limit($limit);

        // If not forcing, exclude recently checked invoices
        if (!$force) {
            $query->where(function ($q) {
                $q->whereNull('updated_at')
                  ->orWhere('updated_at', '<', now()->subHours(1));
            });
        }

        $invoices = $query->get();

        if ($invoices->isEmpty()) {
            $this->info('No invoices found that need status checking.');
            return self::SUCCESS;
        }

        $this->info("Found {$invoices->count()} invoices to check.");

        $progressBar = $this->output->createProgressBar($invoices->count());
        $progressBar->start();

        $stats = [
            'checked' => 0,
            'updated' => 0,
            'approved' => 0,
            'rejected' => 0,
            'errors' => 0,
        ];

        foreach ($invoices as $zraInvoice) {
            try {
                $result = $this->zraService->checkInvoiceStatus($zraInvoice);
                $stats['checked']++;

                if ($result['success']) {
                    $oldStatus = $zraInvoice->submission_status;
                    $newStatus = $zraInvoice->fresh()->submission_status;

                    if ($oldStatus !== $newStatus) {
                        $stats['updated']++;
                        
                        if ($newStatus === 'approved') {
                            $stats['approved']++;
                        } elseif ($newStatus === 'rejected') {
                            $stats['rejected']++;
                        }

                        $this->line("\n✓ Invoice {$zraInvoice->invoice->invoice_number}: {$oldStatus} → {$newStatus}");
                    }
                } else {
                    $stats['errors']++;
                    $this->line("\n✗ Error checking invoice {$zraInvoice->invoice->invoice_number}: {$result['error']}");
                    
                    Log::warning('ZRA status check failed', [
                        'zra_invoice_id' => $zraInvoice->id,
                        'invoice_number' => $zraInvoice->invoice->invoice_number,
                        'error' => $result['error'],
                    ]);
                }

                // Small delay to avoid rate limiting
                usleep(500000); // 0.5 seconds

            } catch (\Exception $e) {
                $stats['errors']++;
                $this->line("\n✗ Exception checking invoice {$zraInvoice->invoice->invoice_number}: {$e->getMessage()}");
                
                Log::error('ZRA status check exception', [
                    'zra_invoice_id' => $zraInvoice->id,
                    'invoice_number' => $zraInvoice->invoice->invoice_number,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }

            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        // Display summary
        $this->info('ZRA Status Check Summary:');
        $this->table(
            ['Metric', 'Count'],
            [
                ['Invoices Checked', $stats['checked']],
                ['Status Updates', $stats['updated']],
                ['Newly Approved', $stats['approved']],
                ['Newly Rejected', $stats['rejected']],
                ['Errors', $stats['errors']],
            ]
        );

        if ($stats['errors'] > 0) {
            $this->warn("Completed with {$stats['errors']} errors. Check logs for details.");
            return self::FAILURE;
        }

        $this->info('ZRA status check completed successfully!');
        return self::SUCCESS;
    }
}
