<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Finance\Report;
use App\Jobs\GenerateReportJob;

class GenerateAllReports extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reports:generate-all';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Queue generation for all reports in the system';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $reports = Report::all();
        $count = 0;
        foreach ($reports as $report) {
            if (!$report->file_path || !file_exists(storage_path('app/' . $report->file_path))) {
                $report->markAsProcessing();
                GenerateReportJob::dispatch($report);
                $count++;
                $this->info("Queued report #{$report->id} ({$report->name}) for generation.");
            }
        }
        $this->info("Queued $count reports for generation.");
    }
}
