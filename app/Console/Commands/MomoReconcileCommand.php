<?php

namespace App\Console\Commands;

use App\Models\Finance\MomoProvider;
use App\Services\MoMo\MomoReconciliationService;
use Illuminate\Console\Command;
use Carbon\Carbon;

class MomoReconcileCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'momo:reconcile 
                            {--provider= : Provider code to reconcile (optional, reconciles all if not specified)}
                            {--start-date= : Start date for reconciliation (YYYY-MM-DD)}
                            {--end-date= : End date for reconciliation (YYYY-MM-DD)}
                            {--days=1 : Number of days to reconcile (used if dates not specified)}
                            {--force : Force reconciliation even if already reconciled}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reconcile MoMo transactions with provider records';

    protected MomoReconciliationService $reconciliationService;

    public function __construct(MomoReconciliationService $reconciliationService)
    {
        parent::__construct();
        $this->reconciliationService = $reconciliationService;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting MoMo reconciliation...');

        // Determine date range
        $dateRange = $this->getDateRange();
        $startDate = $dateRange['start'];
        $endDate = $dateRange['end'];

        $this->info("Reconciling transactions from {$startDate->toDateString()} to {$endDate->toDateString()}");

        // Get providers to reconcile
        $providers = $this->getProvidersToReconcile();

        if ($providers->isEmpty()) {
            $this->error('No active MoMo providers found.');
            return Command::FAILURE;
        }

        $this->info("Found {$providers->count()} provider(s) to reconcile.");

        $totalReconciled = 0;
        $totalErrors = 0;

        foreach ($providers as $provider) {
            $this->info("Reconciling provider: {$provider->display_name} ({$provider->code})");

            try {
                $result = $this->reconciliationService->autoReconcile($provider, $startDate, $endDate);

                if ($result['success']) {
                    $summary = $result['summary'];
                    
                    $this->info("✓ Reconciliation completed for {$provider->display_name}");
                    $this->line("  - Local transactions: {$summary['local_count']}");
                    $this->line("  - Provider transactions: {$summary['provider_count']}");
                    $this->line("  - Matched: {$summary['matched_count']}");
                    $this->line("  - Unmatched local: {$summary['unmatched_local_count']}");
                    $this->line("  - Unmatched provider: {$summary['unmatched_provider_count']}");
                    $this->line("  - Reconciliation rate: {$summary['reconciliation_rate']}%");
                    
                    if ($summary['has_discrepancies']) {
                        $this->warn("  ⚠ Discrepancies found - manual review required");
                    }

                    $totalReconciled++;
                } else {
                    $this->error("✗ Reconciliation failed for {$provider->display_name}: {$result['error']}");
                    $totalErrors++;
                }
            } catch (\Exception $e) {
                $this->error("✗ Exception during reconciliation for {$provider->display_name}: {$e->getMessage()}");
                $totalErrors++;
            }

            $this->newLine();
        }

        // Summary
        $this->info('Reconciliation Summary:');
        $this->line("  - Providers processed: {$providers->count()}");
        $this->line("  - Successful reconciliations: {$totalReconciled}");
        $this->line("  - Failed reconciliations: {$totalErrors}");

        if ($totalErrors > 0) {
            $this->warn('Some reconciliations failed. Check the logs for details.');
            return Command::FAILURE;
        }

        $this->info('All reconciliations completed successfully!');
        return Command::SUCCESS;
    }

    /**
     * Get the date range for reconciliation.
     *
     * @return array
     */
    protected function getDateRange(): array
    {
        $startDate = $this->option('start-date');
        $endDate = $this->option('end-date');
        $days = (int) $this->option('days');

        if ($startDate && $endDate) {
            return [
                'start' => Carbon::parse($startDate),
                'end' => Carbon::parse($endDate),
            ];
        }

        if ($startDate) {
            $start = Carbon::parse($startDate);
            return [
                'start' => $start,
                'end' => $start->copy()->addDays($days - 1),
            ];
        }

        if ($endDate) {
            $end = Carbon::parse($endDate);
            return [
                'start' => $end->copy()->subDays($days - 1),
                'end' => $end,
            ];
        }

        // Default: reconcile previous day(s)
        $end = Carbon::yesterday();
        $start = $end->copy()->subDays($days - 1);

        return [
            'start' => $start,
            'end' => $end,
        ];
    }

    /**
     * Get providers to reconcile.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    protected function getProvidersToReconcile()
    {
        $providerCode = $this->option('provider');

        $query = MomoProvider::where('is_active', true);

        if ($providerCode) {
            $query->where('code', $providerCode);
        }

        return $query->orderBy('display_name')->get();
    }

    /**
     * Ask for confirmation if needed.
     *
     * @param string $message
     * @return bool
     */
    protected function confirmAction(string $message): bool
    {
        if ($this->option('force')) {
            return true;
        }

        return $this->confirm($message);
    }
}
