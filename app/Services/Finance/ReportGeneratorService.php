<?php

namespace App\Services\Finance;

use App\Models\Finance\Report;

class ReportGeneratorService
{
    public function __construct(
        protected FinanceReportDataService $dataService,
        protected FinanceReportExporter $exporter
    ) {
    }

    public function generateReport(Report $report): bool
    {
        try {
            $report->markAsProcessing();
            $data = $this->dataService->forReport($report);
            $format = $report->format ?? 'pdf';
            $filePath = $this->exporter->store($report, $data, $format);
            $fileSize = $this->exporter->fileSize($filePath);

            $report->markAsCompleted($filePath, $fileSize);

            return true;
        } catch (\Throwable $e) {
            $report->markAsFailed();

            \Log::error('Report generation failed', [
                'report_id' => $report->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return false;
        }
    }
}
