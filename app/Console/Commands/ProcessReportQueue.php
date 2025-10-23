<?php

namespace App\Console\Commands;

use App\Models\Finance\Report;
use App\Jobs\GenerateReportJob;
use Illuminate\Console\Command;

class ProcessReportQueue extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reports:process-queue 
                           {--sync : Process jobs synchronously instead of queuing}
                           {--report= : Process a specific report ID}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process pending report generation jobs';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if ($this->option('report')) {
            return $this->processSpecificReport();
        }

        $pendingReports = Report::where('status', 'pending')->get();

        if ($pendingReports->isEmpty()) {
            $this->info('No pending reports found.');
            return;
        }

        $this->info("Found {$pendingReports->count()} pending reports to process.");

        foreach ($pendingReports as $report) {
            $this->line("Processing report: {$report->name} (ID: {$report->id})");

            if ($this->option('sync')) {
                // Process synchronously for testing
                $job = new GenerateReportJob($report);
                $job->handle(app(\App\Services\Finance\ReportGeneratorService::class));
                $this->info("✓ Report {$report->id} processed synchronously");
            } else {
                // Queue the job
                GenerateReportJob::dispatch($report);
                $this->info("✓ Report {$report->id} queued for processing");
            }
        }

        if (!$this->option('sync')) {
            $this->info("\nTo process the queue, run: php artisan queue:work");
        }
    }

    /**
     * Process a specific report by ID.
     */
    private function processSpecificReport()
    {
        $reportId = $this->option('report');
        $report = Report::find($reportId);

        if (!$report) {
            $this->error("Report with ID {$reportId} not found.");
            return;
        }

        $this->info("Processing report: {$report->name} (ID: {$report->id})");

        if ($this->option('sync')) {
            $job = new GenerateReportJob($report);
            $job->handle(app(\App\Services\Finance\ReportGeneratorService::class));
            $this->info("✓ Report processed successfully");
        } else {
            GenerateReportJob::dispatch($report);
            $this->info("✓ Report queued for processing");
        }

        // Show updated status
        $report->refresh();
        $this->line("Report status: {$report->status}");
        if ($report->file_path) {
            $this->line("File path: {$report->file_path}");
        }
    }
}
