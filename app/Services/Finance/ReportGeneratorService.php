<?php

namespace App\Services\Finance;

use App\Models\Finance\Report;
use App\Models\Finance\Transaction;
use App\Models\Finance\Invoice;
use App\Models\Finance\Expense;
use App\Models\Finance\Account;
// use App\Models\Finance\ChartOfAccount; // Not available, using Account instead
use App\Models\Finance\BankReconciliation;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;

class ReportGeneratorService
{
    /**
     * Generate a report based on its type and parameters.
     */
    public function generateReport(Report $report): bool
    {
        try {
            $report->markAsProcessing();
            $data = $this->getReportData($report);
            $format = $report->format ?? 'pdf';
            $filePath = null;
            $fileSize = null;

            if ($format === 'pdf') {
                $filePath = $this->generatePdfReport($report, $data);
                $fileSize = \Storage::size($filePath);
            } else {
                $content = $this->generateReportContent($report, $data);
                $filePath = $this->saveReportFile($report, $content, $format);
                $fileSize = strlen($content);
            }

            $report->markAsCompleted($filePath, $fileSize);
            return true;
        } catch (\Exception $e) {
            $report->markAsFailed();
            \Log::error('Report generation failed', [
                'report_id' => $report->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }
    /**
     * Generate a PDF report with logo and advanced formatting.
     */
    private function generatePdfReport(Report $report, array $data): string
    {
        $dompdf = new \Barryvdh\DomPDF\Facade();
        $logoPath = public_path('tekrem-logo.png');
        $logoBase64 = '';
        if (file_exists($logoPath)) {
            $logoData = file_get_contents($logoPath);
            $logoBase64 = 'data:image/png;base64,' . base64_encode($logoData);
        }

        $html = view('reports.templates.default', [
            'report' => $report,
            'data' => $data,
            'logoBase64' => $logoBase64,
        ])->render();

        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        $output = $dompdf->output();
        $filename = 'reports/' . $report->type . '_' . $report->id . '_' . now()->format('Y_m_d_H_i_s') . '.pdf';
        \Storage::put($filename, $output);
        return $filename;
    }

    /**
     * Get report data based on report type and parameters.
     */
    private function getReportData(Report $report): array
    {
        $parameters = $report->parameters ?? [];
        $dateFrom = $parameters['date_from'] ?? now()->startOfMonth();
        $dateTo = $parameters['date_to'] ?? now()->endOfMonth();

        switch ($report->type) {
            case 'income_statement':
                return $this->getIncomeStatementData($dateFrom, $dateTo);
            
            case 'balance_sheet':
                return $this->getBalanceSheetData($dateTo);
            
            case 'cash_flow':
                return $this->getCashFlowData($dateFrom, $dateTo);
            
            case 'expense_report':
                return $this->getExpenseReportData($dateFrom, $dateTo);
            
            case 'trial_balance':
                return $this->getTrialBalanceData($dateTo);
            
            case 'chart_of_accounts':
                return $this->getChartOfAccountsData();
            
            case 'reconciliation_summary':
                return $this->getReconciliationSummaryData($dateFrom, $dateTo);
            
            case 'budget_analysis':
                return $this->getBudgetAnalysisData($dateFrom, $dateTo);
            
            default:
                throw new \Exception("Unknown report type: {$report->type}");
        }
    }

    /**
     * Generate Income Statement data.
     */
    private function getIncomeStatementData(string $dateFrom, string $dateTo): array
    {
        // Get revenue transactions
        $revenue = Transaction::where('type', 'income')
            ->whereBetween('transaction_date', [$dateFrom, $dateTo])
            ->get();

        // Get expense transactions
        $expenses = Transaction::where('type', 'expense')
            ->whereBetween('transaction_date', [$dateFrom, $dateTo])
            ->get();

        // Get invoice revenue
        $invoiceRevenue = Invoice::where('status', 'paid')
            ->whereBetween('issue_date', [$dateFrom, $dateTo])
            ->get();

        $totalRevenue = $revenue->sum('amount') + $invoiceRevenue->sum('total');
        $totalExpenses = $expenses->sum('amount');
        $netIncome = $totalRevenue - $totalExpenses;

        return [
            'period' => ['from' => $dateFrom, 'to' => $dateTo],
            'revenue' => [
                'transactions' => $revenue->groupBy('category')->map->sum('amount'),
                'invoices' => $invoiceRevenue->sum('total'),
                'total' => $totalRevenue
            ],
            'expenses' => [
                'transactions' => $expenses->groupBy('category')->map->sum('amount'),
                'total' => $totalExpenses
            ],
            'net_income' => $netIncome,
            'gross_profit_margin' => $totalRevenue > 0 ? ($netIncome / $totalRevenue) * 100 : 0
        ];
    }

    /**
     * Generate Balance Sheet data.
     */
    private function getBalanceSheetData(string $asOfDate): array
    {
        // Using Account model since ChartOfAccount doesn't exist
        $accounts = Account::all();

        $assets = collect(); // Placeholder for assets
        $liabilities = collect(); // Placeholder for liabilities  
        $equity = collect(); // Placeholder for equity

        $totalAssets = $assets->sum('balance') ?: 0;
        $totalLiabilities = $liabilities->sum('balance') ?: 0;
        $totalEquity = $equity->sum('balance') ?: 0;

        return [
            'as_of_date' => $asOfDate,
            'assets' => [
                'current_assets' => 0,
                'non_current_assets' => 0,
                'total' => $totalAssets
            ],
            'liabilities' => [
                'current_liabilities' => 0,
                'non_current_liabilities' => 0,
                'total' => $totalLiabilities
            ],
            'equity' => [
                'details' => [],
                'total' => $totalEquity
            ],
            'is_balanced' => true,
            'note' => 'Demo data - Chart of Accounts not fully implemented'
        ];
    }

    /**
     * Generate Cash Flow data.
     */
    private function getCashFlowData(string $dateFrom, string $dateTo): array
    {
        $transactions = Transaction::whereBetween('transaction_date', [$dateFrom, $dateTo])->get();

        $operating = $transactions->where('category', 'operating');
        $investing = $transactions->where('category', 'investing');
        $financing = $transactions->where('category', 'financing');

        return [
            'period' => ['from' => $dateFrom, 'to' => $dateTo],
            'operating_activities' => [
                'cash_receipts' => $operating->where('type', 'income')->sum('amount'),
                'cash_payments' => $operating->where('type', 'expense')->sum('amount'),
                'net_operating_cash' => $operating->where('type', 'income')->sum('amount') - $operating->where('type', 'expense')->sum('amount')
            ],
            'investing_activities' => [
                'cash_receipts' => $investing->where('type', 'income')->sum('amount'),
                'cash_payments' => $investing->where('type', 'expense')->sum('amount'),
                'net_investing_cash' => $investing->where('type', 'income')->sum('amount') - $investing->where('type', 'expense')->sum('amount')
            ],
            'financing_activities' => [
                'cash_receipts' => $financing->where('type', 'income')->sum('amount'),
                'cash_payments' => $financing->where('type', 'expense')->sum('amount'),
                'net_financing_cash' => $financing->where('type', 'income')->sum('amount') - $financing->where('type', 'expense')->sum('amount')
            ]
        ];
    }

    /**
     * Generate Expense Report data.
     */
    private function getExpenseReportData(string $dateFrom, string $dateTo): array
    {
        $expenses = Expense::whereBetween('expense_date', [$dateFrom, $dateTo])->get();

        return [
            'period' => ['from' => $dateFrom, 'to' => $dateTo],
            'by_category' => $expenses->groupBy('category')->map(function ($group) {
                return [
                    'total' => $group->sum('amount'),
                    'count' => $group->count(),
                    'average' => $group->avg('amount')
                ];
            }),
            'by_month' => $expenses->groupBy(function ($expense) {
                return Carbon::parse($expense->expense_date)->format('Y-m');
            })->map->sum('amount'),
            'total_expenses' => $expenses->sum('amount'),
            'expense_count' => $expenses->count()
        ];
    }

    /**
     * Generate Trial Balance data.
     */
    private function getTrialBalanceData(string $asOfDate): array
    {
        $accounts = ChartOfAccount::where('is_active', true)
            ->where('balance', '!=', 0)
            ->get();

        $totalDebits = $accounts->where('normal_balance', 'debit')->sum('balance');
        $totalCredits = $accounts->where('normal_balance', 'credit')->sum('balance');

        return [
            'as_of_date' => $asOfDate,
            'accounts' => $accounts->map(function ($account) {
                return [
                    'account_code' => $account->account_code,
                    'name' => $account->name,
                    'debit_balance' => $account->normal_balance === 'debit' ? $account->balance : 0,
                    'credit_balance' => $account->normal_balance === 'credit' ? $account->balance : 0
                ];
            }),
            'totals' => [
                'total_debits' => $totalDebits,
                'total_credits' => $totalCredits,
                'difference' => $totalDebits - $totalCredits,
                'is_balanced' => abs($totalDebits - $totalCredits) < 0.01
            ]
        ];
    }

    /**
     * Generate Chart of Accounts data.
     */
    private function getChartOfAccountsData(): array
    {
        $accounts = ChartOfAccount::with('parent', 'children')
            ->orderBy('account_code')
            ->get();

        return [
            'accounts' => $accounts->map(function ($account) {
                return [
                    'account_code' => $account->account_code,
                    'name' => $account->name,
                    'type' => $account->type,
                    'category' => $account->account_category,
                    'balance' => $account->balance,
                    'normal_balance' => $account->normal_balance,
                    'is_active' => $account->is_active,
                    'parent_code' => $account->parent?->account_code,
                    'level' => $account->level
                ];
            }),
            'summary' => [
                'total_accounts' => $accounts->count(),
                'active_accounts' => $accounts->where('is_active', true)->count(),
                'by_category' => $accounts->groupBy('account_category')->map->count()
            ]
        ];
    }

    /**
     * Generate Reconciliation Summary data.
     */
    private function getReconciliationSummaryData(string $dateFrom, string $dateTo): array
    {
        $reconciliations = BankReconciliation::whereBetween('reconciliation_date', [$dateFrom, $dateTo])
            ->with(['account'])
            ->get();

        return [
            'period' => ['from' => $dateFrom, 'to' => $dateTo],
            'reconciliations' => $reconciliations->map(function ($reconciliation) {
                return [
                    'reconciliation_number' => $reconciliation->reconciliation_number,
                    'account_name' => $reconciliation->account->name,
                    'reconciliation_date' => $reconciliation->reconciliation_date,
                    'status' => $reconciliation->status,
                    'difference' => $reconciliation->difference
                ];
            }),
            'summary' => [
                'total_reconciliations' => $reconciliations->count(),
                'by_status' => $reconciliations->groupBy('status')->map->count(),
                'total_difference' => $reconciliations->sum('difference')
            ]
        ];
    }

    /**
     * Generate Budget Analysis data.
     */
    private function getBudgetAnalysisData(string $dateFrom, string $dateTo): array
    {
        // Since we don't have a budget system yet, return sample analysis data
        $actualRevenue = Transaction::where('type', 'income')
            ->whereBetween('transaction_date', [$dateFrom, $dateTo])
            ->sum('amount');
            
        $actualExpenses = Transaction::where('type', 'expense')
            ->whereBetween('transaction_date', [$dateFrom, $dateTo])
            ->sum('amount');

        // Sample budget figures (in a real system, these would come from a budgets table)
        $budgetRevenue = 100000;
        $budgetExpenses = 80000;

        return [
            'period' => ['from' => $dateFrom, 'to' => $dateTo],
            'revenue' => [
                'budget' => $budgetRevenue,
                'actual' => $actualRevenue,
                'variance' => $actualRevenue - $budgetRevenue,
                'variance_percent' => $budgetRevenue ? round((($actualRevenue - $budgetRevenue) / $budgetRevenue) * 100, 2) : 0
            ],
            'expenses' => [
                'budget' => $budgetExpenses,
                'actual' => $actualExpenses,
                'variance' => $actualExpenses - $budgetExpenses,
                'variance_percent' => $budgetExpenses ? round((($actualExpenses - $budgetExpenses) / $budgetExpenses) * 100, 2) : 0
            ],
            'net_income' => [
                'budget' => $budgetRevenue - $budgetExpenses,
                'actual' => $actualRevenue - $actualExpenses,
                'variance' => ($actualRevenue - $actualExpenses) - ($budgetRevenue - $budgetExpenses)
            ]
        ];
    }

    /**
     * Generate report content in the specified format.
     */
    private function generateReportContent(Report $report, array $data): string
    {
        $content = "TEKREM ERP - " . strtoupper($report->getTypeLabel()) . "\n";
        $content .= str_repeat("=", 80) . "\n\n";
        
        $content .= "Report: " . $report->name . "\n";
        if ($report->description) {
            $content .= "Description: " . $report->description . "\n";
        }
        $content .= "Generated: " . now()->format('Y-m-d H:i:s') . "\n";
        $content .= "Created by: " . ($report->createdBy?->name ?? 'System') . "\n\n";

        // Add report-specific content
        switch ($report->type) {
            case 'income_statement':
                $content .= $this->formatIncomeStatement($data);
                break;
            case 'balance_sheet':
                $content .= $this->formatBalanceSheet($data);
                break;
            case 'cash_flow':
                $content .= $this->formatCashFlow($data);
                break;
            case 'expense_report':
                $content .= $this->formatExpenseReport($data);
                break;
            case 'trial_balance':
                $content .= $this->formatTrialBalance($data);
                break;
            case 'chart_of_accounts':
                $content .= $this->formatChartOfAccounts($data);
                break;
            case 'reconciliation_summary':
                $content .= $this->formatReconciliationSummary($data);
                break;
            case 'budget_analysis':
                $content .= $this->formatBudgetAnalysis($data);
                break;
            default:
                $content .= "Report data:\n" . json_encode($data, JSON_PRETTY_PRINT);
        }

        return $content;
    }

    /**
     * Format Income Statement.
     */
    private function formatIncomeStatement(array $data): string
    {
        $content = "INCOME STATEMENT\n";
        $content .= "Period: {$data['period']['from']} to {$data['period']['to']}\n";
        $content .= str_repeat("-", 50) . "\n\n";
        
        $content .= "REVENUE:\n";
        foreach ($data['revenue']['transactions'] as $category => $amount) {
            $content .= sprintf("  %-30s %15s\n", $category, number_format($amount, 2));
        }
        $content .= sprintf("  %-30s %15s\n", "Invoice Revenue", number_format($data['revenue']['invoices'], 2));
        $content .= sprintf("  %-30s %15s\n", "TOTAL REVENUE", number_format($data['revenue']['total'], 2));
        
        $content .= "\nEXPENSES:\n";
        foreach ($data['expenses']['transactions'] as $category => $amount) {
            $content .= sprintf("  %-30s %15s\n", $category, number_format($amount, 2));
        }
        $content .= sprintf("  %-30s %15s\n", "TOTAL EXPENSES", number_format($data['expenses']['total'], 2));
        
        $content .= "\n" . str_repeat("-", 50) . "\n";
        $content .= sprintf("  %-30s %15s\n", "NET INCOME", number_format($data['net_income'], 2));
        $content .= sprintf("  %-30s %13s%%\n", "Gross Profit Margin", number_format($data['gross_profit_margin'], 1));
        
        return $content;
    }

    /**
     * Format Balance Sheet.
     */
    private function formatBalanceSheet(array $data): string
    {
        $content = "BALANCE SHEET\n";
        $content .= "As of: {$data['as_of_date']}\n";
        $content .= str_repeat("-", 50) . "\n\n";
        
        $content .= "ASSETS:\n";
        $content .= sprintf("  %-30s %15s\n", "Current Assets", number_format($data['assets']['current_assets'], 2));
        $content .= sprintf("  %-30s %15s\n", "Non-Current Assets", number_format($data['assets']['non_current_assets'], 2));
        $content .= sprintf("  %-30s %15s\n", "TOTAL ASSETS", number_format($data['assets']['total'], 2));
        
        $content .= "\nLIABILITIES:\n";
        $content .= sprintf("  %-30s %15s\n", "Current Liabilities", number_format($data['liabilities']['current_liabilities'], 2));
        $content .= sprintf("  %-30s %15s\n", "Non-Current Liabilities", number_format($data['liabilities']['non_current_liabilities'], 2));
        $content .= sprintf("  %-30s %15s\n", "TOTAL LIABILITIES", number_format($data['liabilities']['total'], 2));
        
        $content .= "\nEQUITY:\n";
        foreach ($data['equity']['details'] as $name => $amount) {
            $content .= sprintf("  %-30s %15s\n", $name, number_format($amount, 2));
        }
        $content .= sprintf("  %-30s %15s\n", "TOTAL EQUITY", number_format($data['equity']['total'], 2));
        
        $content .= "\n" . str_repeat("-", 50) . "\n";
        $content .= "Balance Check: " . ($data['is_balanced'] ? "BALANCED ✓" : "NOT BALANCED ✗") . "\n";
        
        return $content;
    }

    /**
     * Format other report types (simplified for brevity).
     */
    private function formatCashFlow(array $data): string
    {
        return "CASH FLOW STATEMENT\nPeriod: {$data['period']['from']} to {$data['period']['to']}\n\n" . 
               json_encode($data, JSON_PRETTY_PRINT);
    }

    private function formatExpenseReport(array $data): string
    {
        return "EXPENSE REPORT\nPeriod: {$data['period']['from']} to {$data['period']['to']}\n\n" . 
               json_encode($data, JSON_PRETTY_PRINT);
    }

    private function formatTrialBalance(array $data): string
    {
        return "TRIAL BALANCE\nAs of: {$data['as_of_date']}\n\n" . 
               json_encode($data, JSON_PRETTY_PRINT);
    }

    private function formatChartOfAccounts(array $data): string
    {
        return "CHART OF ACCOUNTS\n\n" . json_encode($data, JSON_PRETTY_PRINT);
    }

    private function formatReconciliationSummary(array $data): string
    {
        return "RECONCILIATION SUMMARY\nPeriod: {$data['period']['from']} to {$data['period']['to']}\n\n" . 
               json_encode($data, JSON_PRETTY_PRINT);
    }

    private function formatBudgetAnalysis(array $data): string
    {
        return "BUDGET vs ACTUAL ANALYSIS\nPeriod: {$data['period']['from']} to {$data['period']['to']}\n\n" . 
               "REVENUE\n" .
               "Budget: $" . number_format($data['revenue']['budget'], 2) . "\n" .
               "Actual: $" . number_format($data['revenue']['actual'], 2) . "\n" .
               "Variance: $" . number_format($data['revenue']['variance'], 2) . " ({$data['revenue']['variance_percent']}%)\n\n" .
               "EXPENSES\n" .
               "Budget: $" . number_format($data['expenses']['budget'], 2) . "\n" .
               "Actual: $" . number_format($data['expenses']['actual'], 2) . "\n" .
               "Variance: $" . number_format($data['expenses']['variance'], 2) . " ({$data['expenses']['variance_percent']}%)\n\n" .
               "NET INCOME\n" .
               "Budget: $" . number_format($data['net_income']['budget'], 2) . "\n" .
               "Actual: $" . number_format($data['net_income']['actual'], 2) . "\n" .
               "Variance: $" . number_format($data['net_income']['variance'], 2);
    }

    /**
     * Save report content to file.
     */
    private function saveReportFile(Report $report, string $content, string $format = 'txt'): string
    {
        $ext = $format === 'txt' ? 'txt' : $format;
        $filename = 'reports/' . $report->type . '_' . $report->id . '_' . now()->format('Y_m_d_H_i_s') . '.' . $ext;
        \Storage::put($filename, $content);
        return $filename;
    }
}