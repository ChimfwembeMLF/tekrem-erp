<?php

namespace App\Services\Finance;

use App\Models\Finance\Report;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Writer\Csv as CsvWriter;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FinanceReportExporter
{
    public function __construct(
        protected FinanceReportBranding $branding
    ) {
    }

    public function store(Report $report, array $data, ?string $format = null): string
    {
        $format = $this->normalizeFormat($format ?? $report->format ?? 'pdf');

        return match ($format) {
            'pdf' => $this->storePdf($report, $data),
            'excel' => $this->storeExcel($report, $data),
            'csv' => $this->storeCsv($report, $data),
            default => throw new \InvalidArgumentException("Unsupported export format: {$format}"),
        };
    }

    public function download(Report $report, array $data, string $format): StreamedResponse|\Illuminate\Http\Response
    {
        $format = $this->normalizeFormat($format);
        $filename = $this->buildFilename($report->name, $format);

        return match ($format) {
            'pdf' => $this->streamPdf($report->name, $report->type, $data, $report->description, $report->createdBy?->name, $filename),
            'excel' => $this->streamExcel($report->name, $report->type, $data, $filename),
            'csv' => $this->streamCsv($report->name, $report->type, $data, $filename),
            default => throw new \InvalidArgumentException("Unsupported export format: {$format}"),
        };
    }

    public function downloadLive(string $title, string $type, array $data, string $format): StreamedResponse|\Illuminate\Http\Response
    {
        $format = $this->normalizeFormat($format);
        $filename = $this->buildFilename($title, $format);

        return match ($format) {
            'pdf' => $this->streamPdf($title, $type, $data, null, auth()->user()?->name, $filename),
            'excel' => $this->streamExcel($title, $type, $data, $filename),
            'csv' => $this->streamCsv($title, $type, $data, $filename),
            default => throw new \InvalidArgumentException("Unsupported export format: {$format}"),
        };
    }

    public function fileSize(string $storagePath): int
    {
        return (int) Storage::size($storagePath);
    }

    protected function normalizeFormat(string $format): string
    {
        return match (strtolower($format)) {
            'xlsx', 'xls', 'excel' => 'excel',
            'pdf' => 'pdf',
            'csv' => 'csv',
            default => $format,
        };
    }

    protected function buildFilename(string $title, string $format): string
    {
        $slug = preg_replace('/[^A-Za-z0-9_-]+/', '_', $title) ?: 'report';
        $extension = match ($this->normalizeFormat($format)) {
            'excel' => 'xlsx',
            'csv' => 'csv',
            default => 'pdf',
        };

        return trim($slug, '_') . '_' . now()->format('Ymd_His') . '.' . $extension;
    }

    protected function storePdf(Report $report, array $data): string
    {
        $output = $this->renderPdfBinary($report->name, $report->type, $data, $report->description, $report->createdBy?->name);
        $filename = 'reports/' . $report->type . '_' . $report->id . '_' . now()->format('Y_m_d_H_i_s') . '.pdf';
        Storage::put($filename, $output);

        return $filename;
    }

    protected function storeExcel(Report $report, array $data): string
    {
        $spreadsheet = $this->buildSpreadsheet($report->name, $report->type, $data);
        $filename = 'reports/' . $report->type . '_' . $report->id . '_' . now()->format('Y_m_d_H_i_s') . '.xlsx';
        $temp = tempnam(sys_get_temp_dir(), 'report_xlsx_');
        (new Xlsx($spreadsheet))->save($temp);
        Storage::put($filename, file_get_contents($temp));
        @unlink($temp);

        return $filename;
    }

    protected function storeCsv(Report $report, array $data): string
    {
        $spreadsheet = $this->buildSpreadsheet($report->name, $report->type, $data);
        $filename = 'reports/' . $report->type . '_' . $report->id . '_' . now()->format('Y_m_d_H_i_s') . '.csv';
        $temp = tempnam(sys_get_temp_dir(), 'report_csv_');
        $writer = new CsvWriter($spreadsheet);
        $writer->setUseBOM(true);
        $writer->save($temp);
        Storage::put($filename, file_get_contents($temp));
        @unlink($temp);

        return $filename;
    }

    protected function streamPdf(string $title, string $type, array $data, ?string $description, ?string $createdBy, string $filename): \Illuminate\Http\Response
    {
        $binary = $this->renderPdfBinary($title, $type, $data, $description, $createdBy);

        return response($binary, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    protected function streamExcel(string $title, string $type, array $data, string $filename): StreamedResponse
    {
        $spreadsheet = $this->buildSpreadsheet($title, $type, $data);

        return new StreamedResponse(function () use ($spreadsheet) {
            (new Xlsx($spreadsheet))->save('php://output');
        }, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control' => 'max-age=0',
        ]);
    }

    protected function streamCsv(string $title, string $type, array $data, string $filename): StreamedResponse
    {
        $spreadsheet = $this->buildSpreadsheet($title, $type, $data);

        return new StreamedResponse(function () use ($spreadsheet) {
            $writer = new CsvWriter($spreadsheet);
            $writer->setUseBOM(true);
            $writer->save('php://output');
        }, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control' => 'max-age=0',
        ]);
    }

    protected function renderPdfBinary(string $title, string $type, array $data, ?string $description, ?string $createdBy): string
    {
        $viewReport = new Report([
            'name' => $title,
            'description' => $description,
            'type' => $type,
        ]);

        if ($createdBy) {
            $viewReport->setRelation('createdBy', (object) ['name' => $createdBy]);
        }

        $html = view('reports.templates.default', [
            'report' => $viewReport,
            'data' => $data,
            'company' => $this->branding->company(),
            'logoBase64' => $this->branding->logoBase64(),
            'footerLines' => $this->branding->footerLines(),
        ])->render();

        return Pdf::loadHTML($html)->setPaper('a4', 'portrait')->output();
    }

    protected function buildSpreadsheet(string $title, string $type, array $data): Spreadsheet
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle(substr(preg_replace('/[^A-Za-z0-9 ]/', '', $title) ?: 'Report', 0, 31));

        $row = 1;
        $logoPath = $this->branding->logoPath();

        if ($logoPath) {
            $drawing = new Drawing();
            $drawing->setName('Logo');
            $drawing->setPath($logoPath);
            $drawing->setHeight(48);
            $drawing->setCoordinates('A1');
            $drawing->setWorksheet($sheet);
            $row = 4;
        }

        $company = $this->branding->company();
        $sheet->setCellValue('A' . $row, $company['name']);
        $sheet->getStyle('A' . $row)->getFont()->setBold(true)->setSize(14);
        $row++;
        $sheet->setCellValue('A' . $row, $company['tagline']);
        $row++;
        $sheet->setCellValue('A' . $row, trim($company['address'] . ', ' . $company['city'] . ', ' . $company['country'], ', '));
        $row++;
        $sheet->setCellValue('A' . $row, 'Tel: ' . $company['phone'] . ' | Email: ' . $company['email'] . ' | Web: ' . $company['website']);
        $row += 2;

        $sheet->setCellValue('A' . $row, $title);
        $sheet->getStyle('A' . $row)->getFont()->setBold(true)->setSize(13)->getColor()->setRGB('0A4D8C');
        $row++;
        $sheet->setCellValue('A' . $row, 'Generated: ' . now()->format('Y-m-d H:i:s'));
        $row++;
        $sheet->setCellValue('A' . $row, 'Report Type: ' . (Report::TYPES[$type] ?? $type));
        $row += 2;

        $row = $this->appendTypeRows($sheet, $type, $data, $row);

        $sheet->getColumnDimension('A')->setAutoSize(true);
        foreach (range('B', 'J') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        return $spreadsheet;
    }

    protected function appendTypeRows($sheet, string $type, array $data, int $row): int
    {
        return match ($type) {
            'chart_of_accounts' => $this->appendChartOfAccounts($sheet, $data, $row),
            'trial_balance' => $this->appendTrialBalance($sheet, $data, $row),
            'reconciliation_summary' => $this->appendReconciliationSummary($sheet, $data, $row),
            'income_statement' => $this->appendIncomeStatement($sheet, $data, $row),
            'balance_sheet' => $this->appendBalanceSheet($sheet, $data, $row),
            'cash_flow' => $this->appendCashFlow($sheet, $data, $row),
            'expense_report' => $this->appendExpenseReport($sheet, $data, $row),
            'budget_analysis' => $this->appendBudgetAnalysis($sheet, $data, $row),
            default => $this->appendGenericData($sheet, $data, $row),
        };
    }

    protected function writeHeaderRow($sheet, int $row, array $headers): int
    {
        foreach ($headers as $index => $header) {
            $column = chr(ord('A') + $index);
            $sheet->setCellValue($column . $row, $header);
        }

        $lastColumn = chr(ord('A') + count($headers) - 1);
        $sheet->getStyle("A{$row}:{$lastColumn}{$row}")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '0A4D8C']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        return $row + 1;
    }

    protected function appendChartOfAccounts($sheet, array $data, int $row): int
    {
        $sheet->setCellValue('A' . $row, 'As of: ' . ($data['as_of_date'] ?? ''));
        $row += 2;
        $row = $this->writeHeaderRow($sheet, $row, ['Code', 'Name', 'Type', 'Category', 'Balance', 'Normal', 'Status', 'Parent', 'Level']);

        foreach ($data['accounts'] ?? [] as $account) {
            $sheet->fromArray([
                $account['account_code'],
                $account['name'],
                $account['type'],
                $account['category'],
                $account['balance'],
                $account['normal_balance'],
                !empty($account['is_active']) ? 'Active' : 'Inactive',
                $account['parent_code'] ?? '-',
                $account['level'],
            ], null, 'A' . $row);
            $row++;
        }

        return $row;
    }

    protected function appendTrialBalance($sheet, array $data, int $row): int
    {
        $sheet->setCellValue('A' . $row, 'As of: ' . ($data['as_of_date'] ?? ''));
        $row += 2;
        $row = $this->writeHeaderRow($sheet, $row, ['Code', 'Account Name', 'Debit', 'Credit']);

        foreach ($data['accounts'] ?? [] as $account) {
            $sheet->fromArray([
                $account['account_code'],
                $account['name'],
                $account['debit_balance'],
                $account['credit_balance'],
            ], null, 'A' . $row);
            $row++;
        }

        $sheet->fromArray(['Totals', '', $data['totals']['total_debits'] ?? 0, $data['totals']['total_credits'] ?? 0], null, 'A' . $row);
        $sheet->getStyle("A{$row}:D{$row}")->getFont()->setBold(true);

        return $row + 1;
    }

    protected function appendReconciliationSummary($sheet, array $data, int $row): int
    {
        $period = $data['period'] ?? [];
        $sheet->setCellValue('A' . $row, 'Period: ' . ($period['from'] ?? '') . ' to ' . ($period['to'] ?? ''));
        $row += 2;
        $row = $this->writeHeaderRow($sheet, $row, ['Number', 'Account', 'Date', 'Status', 'Difference', 'Matched', 'Unmatched Bank', 'Unmatched Book']);

        foreach ($data['reconciliations'] ?? [] as $item) {
            $sheet->fromArray([
                $item['reconciliation_number'],
                $item['account_name'],
                $item['reconciliation_date'],
                $item['status'],
                $item['difference'],
                $item['matched_transactions_count'],
                $item['unmatched_bank_transactions_count'],
                $item['unmatched_book_transactions_count'],
            ], null, 'A' . $row);
            $row++;
        }

        return $row;
    }

    protected function appendIncomeStatement($sheet, array $data, int $row): int
    {
        $sheet->setCellValue('A' . $row, 'Period: ' . ($data['period']['from'] ?? '') . ' to ' . ($data['period']['to'] ?? ''));
        $row += 2;
        $row = $this->writeHeaderRow($sheet, $row, ['Section', 'Category', 'Amount']);

        foreach ($data['revenue']['transactions'] ?? [] as $category => $amount) {
            $sheet->fromArray(['Revenue', $category, $amount], null, 'A' . $row);
            $row++;
        }
        $sheet->fromArray(['Revenue', 'Invoice Revenue', $data['revenue']['invoices'] ?? 0], null, 'A' . $row);
        $row++;
        foreach ($data['expenses']['transactions'] ?? [] as $category => $amount) {
            $sheet->fromArray(['Expense', $category, $amount], null, 'A' . $row);
            $row++;
        }
        $sheet->fromArray(['Summary', 'Net Income', $data['net_income'] ?? 0], null, 'A' . $row);

        return $row + 1;
    }

    protected function appendBalanceSheet($sheet, array $data, int $row): int
    {
        $sheet->setCellValue('A' . $row, 'As of: ' . ($data['as_of_date'] ?? ''));
        $row += 2;
        $row = $this->writeHeaderRow($sheet, $row, ['Section', 'Item', 'Amount']);
        $sheet->fromArray(['Assets', 'Total Assets', $data['assets']['total'] ?? 0], null, 'A' . $row);
        $row++;
        $sheet->fromArray(['Liabilities', 'Total Liabilities', $data['liabilities']['total'] ?? 0], null, 'A' . $row);
        $row++;
        $sheet->fromArray(['Equity', 'Total Equity', $data['equity']['total'] ?? 0], null, 'A' . $row);

        return $row + 1;
    }

    protected function appendCashFlow($sheet, array $data, int $row): int
    {
        $row = $this->writeHeaderRow($sheet, $row, ['Activity', 'Receipts', 'Payments', 'Net Cash']);
        foreach (['operating_activities' => 'Operating', 'investing_activities' => 'Investing', 'financing_activities' => 'Financing'] as $key => $label) {
            $section = $data[$key] ?? [];
            $netKey = match ($key) {
                'operating_activities' => 'net_operating_cash',
                'investing_activities' => 'net_investing_cash',
                default => 'net_financing_cash',
            };
            $sheet->fromArray([
                $label,
                $section['cash_receipts'] ?? 0,
                $section['cash_payments'] ?? 0,
                $section[$netKey] ?? 0,
            ], null, 'A' . $row);
            $row++;
        }

        return $row;
    }

    protected function appendExpenseReport($sheet, array $data, int $row): int
    {
        $row = $this->writeHeaderRow($sheet, $row, ['Category', 'Total', 'Count', 'Average']);
        foreach ($data['by_category'] ?? [] as $category => $info) {
            $sheet->fromArray([$category, $info['total'] ?? 0, $info['count'] ?? 0, $info['average'] ?? 0], null, 'A' . $row);
            $row++;
        }

        return $row;
    }

    protected function appendBudgetAnalysis($sheet, array $data, int $row): int
    {
        $row = $this->writeHeaderRow($sheet, $row, ['Metric', 'Budget', 'Actual', 'Variance', 'Variance %']);
        foreach (['revenue' => 'Revenue', 'expenses' => 'Expenses'] as $key => $label) {
            $section = $data[$key] ?? [];
            $sheet->fromArray([
                $label,
                $section['budget'] ?? 0,
                $section['actual'] ?? 0,
                $section['variance'] ?? 0,
                ($section['variance_percent'] ?? 0) . '%',
            ], null, 'A' . $row);
            $row++;
        }

        return $row;
    }

    protected function appendGenericData($sheet, array $data, int $row): int
    {
        $sheet->setCellValue('A' . $row, json_encode($data, JSON_PRETTY_PRINT));

        return $row + 1;
    }
}
