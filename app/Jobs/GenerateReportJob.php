<?php

namespace App\Jobs;

use App\Models\Finance\Report;
use App\Services\Finance\ReportGeneratorService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class GenerateReportJob implements ShouldQueue
{
    use Queueable, InteractsWithQueue, SerializesModels;

    public $timeout = 300; // 5 minutes timeout
    public $tries = 3; // Retry up to 3 times

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Report $report
    ) {
        // Set queue name based on report complexity
        $this->onQueue($this->getQueueForReportType($report->type));
    }

    /**
     * Execute the job.
     */
    public function handle(ReportGeneratorService $reportGenerator): void
    {
        try {
            Log::info('Starting report generation', ['report_id' => $this->report->id]);
            
            $success = $reportGenerator->generateReport($this->report);
            
            if ($success) {
                Log::info('Report generation completed successfully', ['report_id' => $this->report->id]);
            } else {
                Log::error('Report generation failed', ['report_id' => $this->report->id]);
                $this->fail();
            }
        } catch (\Exception $e) {
            Log::error('Report generation job failed', [
                'report_id' => $this->report->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            $this->report->markAsFailed();
            throw $e;
        }
    }

    /**
     * Handle job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Report generation job failed permanently', [
            'report_id' => $this->report->id,
            'error' => $exception->getMessage()
        ]);
        
        $this->report->markAsFailed();
    }

    /**
     * Get appropriate queue for report type.
     */
    private function getQueueForReportType(string $type): string
    {
        // Complex reports go to slower queue
        $complexReports = ['balance_sheet', 'income_statement', 'cash_flow'];
        
        return in_array($type, $complexReports) ? 'reports-heavy' : 'reports-light';
    }
}
