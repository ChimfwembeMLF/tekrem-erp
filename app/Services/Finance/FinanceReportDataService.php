<?php

namespace App\Services\Finance;

use App\Models\Finance\Account;
use App\Models\Finance\BankReconciliation;
use App\Models\Finance\Expense;
use App\Models\Finance\Invoice;
use App\Models\Finance\Transaction;
use Carbon\Carbon;

class FinanceReportDataService
{
    public function forReport(\App\Models\Finance\Report $report): array
    {
        $parameters = $report->parameters ?? [];
        $dateFrom = $parameters['date_from'] ?? now()->startOfMonth()->toDateString();
        $dateTo = $parameters['date_to'] ?? now()->endOfMonth()->toDateString();

        return match ($report->type) {
            'income_statement' => $this->incomeStatement($dateFrom, $dateTo),
            'balance_sheet' => $this->balanceSheet($dateTo),
            'cash_flow' => $this->cashFlow($dateFrom, $dateTo),
            'expense_report' => $this->expenseReport($dateFrom, $dateTo),
            'trial_balance' => $this->trialBalance(['as_of_date' => $dateTo]),
            'chart_of_accounts' => $this->chartOfAccounts($parameters),
            'reconciliation_summary' => $this->reconciliationSummary([
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'account_id' => $parameters['account_id'] ?? null,
                'status' => $parameters['status'] ?? null,
            ]),
            'budget_analysis' => $this->budgetAnalysis($dateFrom, $dateTo),
            default => throw new \InvalidArgumentException("Unsupported report type: {$report->type}"),
        };
    }

    public function chartOfAccounts(array $params = []): array
    {
        $accounts = Account::query()
            ->when(empty($params['include_inactive']), fn ($q) => $q->where('is_active', true))
            ->when(!empty($params['category']), fn ($q) => $q->where('account_category', $params['category']))
            ->with('parent')
            ->orderBy('account_code')
            ->get();

        return [
            'title' => 'Chart of Accounts Report',
            'generated_at' => now()->toIso8601String(),
            'as_of_date' => $params['as_of_date'] ?? now()->toDateString(),
            'parameters' => $params,
            'accounts' => $accounts->map(fn (Account $account) => [
                'account_code' => $account->account_code,
                'name' => $account->name,
                'type' => $account->type,
                'category' => $account->account_category,
                'subcategory' => $account->account_subcategory,
                'parent_code' => $account->parent?->account_code,
                'level' => $account->level,
                'balance' => (float) $account->balance,
                'normal_balance' => $account->normal_balance,
                'is_active' => $account->is_active,
                'is_system_account' => $account->is_system_account,
            ])->values()->all(),
            'summary' => [
                'total_accounts' => $accounts->count(),
                'active_accounts' => $accounts->where('is_active', true)->count(),
                'by_category' => $accounts->groupBy('account_category')->map->count()->all(),
                'total_balance' => (float) $accounts->sum('balance'),
            ],
        ];
    }

    public function trialBalance(array $params = []): array
    {
        $asOfDate = $params['as_of_date'] ?? now()->toDateString();

        $accounts = Account::query()
            ->where('is_active', true)
            ->when(empty($params['include_zero_balances']), fn ($q) => $q->where('balance', '!=', 0))
            ->orderBy('account_code')
            ->get();

        $totalDebits = (float) $accounts->where('normal_balance', 'debit')->sum('balance');
        $totalCredits = (float) $accounts->where('normal_balance', 'credit')->sum('balance');

        return [
            'title' => 'Trial Balance Report',
            'generated_at' => now()->toIso8601String(),
            'as_of_date' => $asOfDate,
            'parameters' => $params,
            'accounts' => $accounts->map(fn (Account $account) => [
                'account_code' => $account->account_code,
                'name' => $account->name,
                'debit_balance' => $account->normal_balance === 'debit' ? (float) $account->balance : 0,
                'credit_balance' => $account->normal_balance === 'credit' ? (float) $account->balance : 0,
            ])->values()->all(),
            'totals' => [
                'total_debits' => $totalDebits,
                'total_credits' => $totalCredits,
                'difference' => $totalDebits - $totalCredits,
                'is_balanced' => abs($totalDebits - $totalCredits) < 0.01,
            ],
        ];
    }

    public function reconciliationSummary(array $params = []): array
    {
        $query = BankReconciliation::query()
            ->with(['account', 'reconciledBy', 'approvedBy'])
            ->when(!empty($params['date_from']), fn ($q) => $q->where('reconciliation_date', '>=', $params['date_from']))
            ->when(!empty($params['date_to']), fn ($q) => $q->where('reconciliation_date', '<=', $params['date_to']))
            ->when(!empty($params['account_id']), fn ($q) => $q->where('account_id', $params['account_id']))
            ->when(!empty($params['status']), fn ($q) => $q->where('status', $params['status']))
            ->orderByDesc('reconciliation_date');

        $reconciliations = $query->get();

        return [
            'title' => 'Bank Reconciliation Summary Report',
            'generated_at' => now()->toIso8601String(),
            'period' => [
                'from' => $params['date_from'] ?? optional($reconciliations->min('reconciliation_date'))->format('Y-m-d'),
                'to' => $params['date_to'] ?? optional($reconciliations->max('reconciliation_date'))->format('Y-m-d'),
            ],
            'parameters' => $params,
            'reconciliations' => $reconciliations->map(fn (BankReconciliation $reconciliation) => [
                'id' => $reconciliation->id,
                'reconciliation_number' => $reconciliation->reconciliation_number,
                'account_name' => $reconciliation->account?->name,
                'reconciliation_date' => optional($reconciliation->reconciliation_date)->format('Y-m-d'),
                'period_start' => optional($reconciliation->period_start)->format('Y-m-d'),
                'period_end' => optional($reconciliation->period_end)->format('Y-m-d'),
                'statement_opening_balance' => (float) $reconciliation->statement_opening_balance,
                'statement_closing_balance' => (float) $reconciliation->statement_closing_balance,
                'book_opening_balance' => (float) $reconciliation->book_opening_balance,
                'book_closing_balance' => (float) $reconciliation->book_closing_balance,
                'difference' => (float) $reconciliation->difference,
                'status' => $reconciliation->status,
                'matched_transactions_count' => (int) $reconciliation->matched_transactions_count,
                'unmatched_bank_transactions_count' => (int) $reconciliation->unmatched_bank_transactions_count,
                'unmatched_book_transactions_count' => (int) $reconciliation->unmatched_book_transactions_count,
                'reconciled_by' => $reconciliation->reconciledBy?->name,
                'reconciled_at' => optional($reconciliation->reconciled_at)->format('Y-m-d H:i'),
                'approved_by' => $reconciliation->approvedBy?->name,
                'approved_at' => optional($reconciliation->approved_at)->format('Y-m-d H:i'),
            ])->values()->all(),
            'summary' => [
                'total_reconciliations' => $reconciliations->count(),
                'by_status' => $reconciliations->groupBy('status')->map->count()->all(),
                'total_difference' => (float) $reconciliations->sum('difference'),
                'avg_difference' => (float) $reconciliations->avg('difference'),
                'total_matched_transactions' => (int) $reconciliations->sum('matched_transactions_count'),
                'total_unmatched_bank' => (int) $reconciliations->sum('unmatched_bank_transactions_count'),
                'total_unmatched_book' => (int) $reconciliations->sum('unmatched_book_transactions_count'),
            ],
        ];
    }

    public function incomeStatement(string $dateFrom, string $dateTo): array
    {
        $revenue = Transaction::where('type', 'income')->whereBetween('transaction_date', [$dateFrom, $dateTo])->get();
        $expenses = Transaction::where('type', 'expense')->whereBetween('transaction_date', [$dateFrom, $dateTo])->get();
        $invoiceRevenue = Invoice::where('status', 'paid')->whereBetween('issue_date', [$dateFrom, $dateTo])->get();

        $totalRevenue = (float) $revenue->sum('amount') + (float) $invoiceRevenue->sum('total');
        $totalExpenses = (float) $expenses->sum('amount');

        return [
            'title' => 'Income Statement',
            'period' => ['from' => $dateFrom, 'to' => $dateTo],
            'revenue' => [
                'transactions' => $revenue->groupBy('category')->map->sum('amount')->all(),
                'invoices' => (float) $invoiceRevenue->sum('total'),
                'total' => $totalRevenue,
            ],
            'expenses' => [
                'transactions' => $expenses->groupBy('category')->map->sum('amount')->all(),
                'total' => $totalExpenses,
            ],
            'net_income' => $totalRevenue - $totalExpenses,
            'gross_profit_margin' => $totalRevenue > 0 ? (($totalRevenue - $totalExpenses) / $totalRevenue) * 100 : 0,
        ];
    }

    public function balanceSheet(string $asOfDate): array
    {
        $accounts = Account::where('is_active', true)->get();

        $assets = $accounts->where('account_category', 'assets');
        $liabilities = $accounts->where('account_category', 'liabilities');
        $equity = $accounts->where('account_category', 'equity');

        $totalAssets = (float) $assets->sum('balance');
        $totalLiabilities = (float) $liabilities->sum('balance');
        $totalEquity = (float) $equity->sum('balance');

        return [
            'title' => 'Balance Sheet',
            'as_of_date' => $asOfDate,
            'assets' => [
                'current_assets' => (float) $assets->where('account_subcategory', 'current')->sum('balance'),
                'non_current_assets' => (float) $assets->where('account_subcategory', '!=', 'current')->sum('balance'),
                'total' => $totalAssets,
            ],
            'liabilities' => [
                'current_liabilities' => (float) $liabilities->where('account_subcategory', 'current')->sum('balance'),
                'non_current_liabilities' => (float) $liabilities->where('account_subcategory', '!=', 'current')->sum('balance'),
                'total' => $totalLiabilities,
            ],
            'equity' => [
                'details' => $equity->mapWithKeys(fn ($a) => [$a->name => (float) $a->balance])->all(),
                'total' => $totalEquity,
            ],
            'is_balanced' => abs($totalAssets - ($totalLiabilities + $totalEquity)) < 0.01,
        ];
    }

    public function cashFlow(string $dateFrom, string $dateTo): array
    {
        $transactions = Transaction::whereBetween('transaction_date', [$dateFrom, $dateTo])->get();
        $operating = $transactions->where('category', 'operating');
        $investing = $transactions->where('category', 'investing');
        $financing = $transactions->where('category', 'financing');

        return [
            'title' => 'Cash Flow Statement',
            'period' => ['from' => $dateFrom, 'to' => $dateTo],
            'operating_activities' => [
                'cash_receipts' => (float) $operating->where('type', 'income')->sum('amount'),
                'cash_payments' => (float) $operating->where('type', 'expense')->sum('amount'),
                'net_operating_cash' => (float) $operating->where('type', 'income')->sum('amount') - (float) $operating->where('type', 'expense')->sum('amount'),
            ],
            'investing_activities' => [
                'cash_receipts' => (float) $investing->where('type', 'income')->sum('amount'),
                'cash_payments' => (float) $investing->where('type', 'expense')->sum('amount'),
                'net_investing_cash' => (float) $investing->where('type', 'income')->sum('amount') - (float) $investing->where('type', 'expense')->sum('amount'),
            ],
            'financing_activities' => [
                'cash_receipts' => (float) $financing->where('type', 'income')->sum('amount'),
                'cash_payments' => (float) $financing->where('type', 'expense')->sum('amount'),
                'net_financing_cash' => (float) $financing->where('type', 'income')->sum('amount') - (float) $financing->where('type', 'expense')->sum('amount'),
            ],
        ];
    }

    public function expenseReport(string $dateFrom, string $dateTo): array
    {
        $expenses = Expense::whereBetween('expense_date', [$dateFrom, $dateTo])->get();

        return [
            'title' => 'Expense Report',
            'period' => ['from' => $dateFrom, 'to' => $dateTo],
            'by_category' => $expenses->groupBy('category')->map(fn ($group) => [
                'total' => (float) $group->sum('amount'),
                'count' => $group->count(),
                'average' => (float) $group->avg('amount'),
            ])->all(),
            'by_month' => $expenses->groupBy(fn ($expense) => Carbon::parse($expense->expense_date)->format('Y-m'))->map->sum('amount')->all(),
            'total_expenses' => (float) $expenses->sum('amount'),
            'expense_count' => $expenses->count(),
        ];
    }

    public function budgetAnalysis(string $dateFrom, string $dateTo): array
    {
        $actualRevenue = (float) Transaction::where('type', 'income')->whereBetween('transaction_date', [$dateFrom, $dateTo])->sum('amount');
        $actualExpenses = (float) Transaction::where('type', 'expense')->whereBetween('transaction_date', [$dateFrom, $dateTo])->sum('amount');
        $budgetRevenue = 100000;
        $budgetExpenses = 80000;

        return [
            'title' => 'Budget vs Actual Analysis',
            'period' => ['from' => $dateFrom, 'to' => $dateTo],
            'revenue' => [
                'budget' => $budgetRevenue,
                'actual' => $actualRevenue,
                'variance' => $actualRevenue - $budgetRevenue,
                'variance_percent' => $budgetRevenue ? round((($actualRevenue - $budgetRevenue) / $budgetRevenue) * 100, 2) : 0,
            ],
            'expenses' => [
                'budget' => $budgetExpenses,
                'actual' => $actualExpenses,
                'variance' => $actualExpenses - $budgetExpenses,
                'variance_percent' => $budgetExpenses ? round((($actualExpenses - $budgetExpenses) / $budgetExpenses) * 100, 2) : 0,
            ],
            'net_income' => [
                'budget' => $budgetRevenue - $budgetExpenses,
                'actual' => $actualRevenue - $actualExpenses,
                'variance' => ($actualRevenue - $actualExpenses) - ($budgetRevenue - $budgetExpenses),
            ],
        ];
    }
}
