<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Finance\Report;
use App\Models\Finance\Account;
use App\Models\Finance\Transaction;
use App\Models\Finance\Expense;
use App\Models\Finance\Invoice;
use App\Models\Finance\Payment;
use App\Models\Finance\Budget;
use App\Models\Finance\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Report::with('createdBy')
            ->where('company_id', currentCompanyId());

        // Apply filters
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $reports = $query->orderBy('created_at', 'desc')->paginate(15);

        // Transform the data to match the expected format
        $reports->getCollection()->transform(function ($report) {
            return [
                'id' => $report->id,
                'name' => $report->name,
                'description' => $report->description,
                'type' => $report->type,
                'status' => $report->status,
                'parameters' => $report->parameters,
                'generated_at' => $report->generated_at?->toISOString(),
                'file_path' => $report->file_path,
                'file_size' => $report->file_size,
                'created_by' => $report->createdBy ? [
                    'id' => $report->createdBy->id,
                    'name' => $report->createdBy->name,
                ] : null,
                'created_at' => $report->created_at->toISOString(),
                'updated_at' => $report->updated_at->toISOString(),
            ];
        });

        return Inertia::render('Finance/Reports/Index', [
            'reports' => $reports,
            'types' => Report::TYPES,
            'statuses' => Report::STATUSES,
            'filters' => $request->only(['search', 'type', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Finance/Reports/Create', [
            'types' => Report::TYPES,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:' . implode(',', array_keys(Report::TYPES)),
            'description' => 'nullable|string|max:1000',
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
        ]);

        $report = Report::create([
            'name' => $request->name,
            'description' => $request->description,
            'type' => $request->type,
            'status' => 'pending',
            'parameters' => [
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
            ],
            'created_by' => auth()->id(),
            'company_id' => currentCompanyId(),
        ]);

        // Queue the report generation job
        \App\Jobs\GenerateReportJob::dispatch($report);

        return redirect()->route('finance.reports.index')
            ->with('success', 'Report generation has been queued. You will be notified when it\'s ready.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Report $report)
    {
        if ($report->company_id !== currentCompanyId()) {
            abort(403);
        }
        $report->load('createdBy');

        return Inertia::render('Finance/Reports/Show', [
            'report' => [
                'id' => $report->id,
                'name' => $report->name,
                'description' => $report->description,
                'type' => $report->type,
                'status' => $report->status,
                'parameters' => $report->parameters,
                'generated_at' => $report->generated_at?->toISOString(),
                'file_path' => $report->file_path,
                'file_size' => $report->file_size,
                'created_by' => $report->createdBy ? [
                    'id' => $report->createdBy->id,
                    'name' => $report->createdBy->name,
                ] : null,
                'created_at' => $report->created_at->toISOString(),
                'updated_at' => $report->updated_at->toISOString(),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Report $report)
    {
        if ($report->company_id !== currentCompanyId()) {
            abort(403);
        }
        return Inertia::render('Finance/Reports/Edit', [
            'report' => [
                'id' => $report->id,
                'name' => $report->name,
                'description' => $report->description,
                'type' => $report->type,
                'status' => $report->status,
            ],
            'types' => Report::TYPES,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Report $report)
    {
        if ($report->company_id !== currentCompanyId()) {
            abort(403);
        }
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:' . implode(',', array_keys(Report::TYPES)),
            'description' => 'nullable|string|max:1000',
        ]);

        $report->update([
            'name' => $request->name,
            'type' => $request->type,
            'description' => $request->description,
        ]);

        return redirect()->route('finance.reports.index')
            ->with('success', 'Report updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Report $report)
    {
        if ($report->company_id !== currentCompanyId()) {
            abort(403);
        }
        // Delete the file if it exists
        if ($report->file_path && file_exists(storage_path('app/' . $report->file_path))) {
            unlink(storage_path('app/' . $report->file_path));
        }

        $report->delete();

        return redirect()->route('finance.reports.index')
            ->with('success', 'Report deleted successfully.');
    }

    /**
     * Download the specified report.
     */
    public function download(Report $report)
    {
        if ($report->company_id !== currentCompanyId()) {
            abort(403);
        }
        if (!$report->isAvailable() || empty($report->file_path) || !file_exists(storage_path('app/' . $report->file_path))) {
            // If not available or file missing, queue generation and notify user
            if ($report->status !== 'processing' && $report->status !== 'pending') {
                $report->markAsProcessing();
                // Queue the report generation job
                \App\Jobs\GenerateReportJob::dispatch($report);
            }
            // Optionally, you can use a notification system here
            // For now, just inform the user via session flash
            return redirect()->back()->with('info', 'Report is being generated. You will be notified once it is ready for download.');
        }

        $filePath = storage_path('app/' . $report->file_path);
        $extension = pathinfo($report->file_path, PATHINFO_EXTENSION) ?: 'pdf';
        $filename = $report->name . '.' . $extension;
        return response()->download($filePath, $filename);
    }



    /**
     * Generate Chart of Accounts report.
     */
    public function chartOfAccounts(Request $request)
    {
        $request->validate([
            'as_of_date' => 'nullable|date',
            'include_inactive' => 'boolean',
            'category' => 'nullable|string',
            'format' => 'nullable|in:pdf,excel,csv',
        ]);

        // Get Chart of Accounts data
        $accounts = \App\Models\Finance\ChartOfAccount::query()
            ->where('company_id', currentCompanyId())
            ->when(!$request->boolean('include_inactive'), function ($query) {
                $query->where('is_active', true);
            })
            ->when($request->filled('category'), function ($query) use ($request) {
                $query->where('account_category', $request->category);
            })
            ->with('parent', 'children')
            ->orderBy('account_code')
            ->get();

        $reportData = [
            'title' => 'Chart of Accounts Report',
            'generated_at' => now(),
            'as_of_date' => $request->as_of_date ?? now()->toDateString(),
            'parameters' => $request->only(['include_inactive', 'category']),
            'accounts' => $accounts->map(function ($account) {
                return [
                    'account_code' => $account->account_code,
                    'name' => $account->name,
                    'type' => $account->type,
                    'category' => $account->account_category,
                    'subcategory' => $account->account_subcategory,
                    'parent_code' => $account->parent?->account_code,
                    'level' => $account->level,
                    'balance' => $account->balance,
                    'normal_balance' => $account->normal_balance,
                    'is_active' => $account->is_active,
                    'is_system_account' => $account->is_system_account,
                ];
            }),
            'summary' => [
                'total_accounts' => $accounts->count(),
                'active_accounts' => $accounts->where('is_active', true)->count(),
                'by_category' => $accounts->groupBy('account_category')->map->count(),
                'total_balance' => $accounts->sum('balance'),
            ],
        ];

        return Inertia::render('Finance/Reports/ChartOfAccounts', [
            'reportData' => $reportData,
        ]);
    }

    /**
     * Generate Trial Balance report.
     */
    public function trialBalance(Request $request)
    {
        $request->validate([
            'as_of_date' => 'nullable|date',
            'include_zero_balances' => 'boolean',
            'format' => 'nullable|in:pdf,excel,csv',
        ]);

        $asOfDate = $request->as_of_date ?? now()->toDateString();

        // Get accounts with balances
        $accounts = \App\Models\Finance\ChartOfAccount::query()
            ->where('company_id', currentCompanyId())
            ->where('is_active', true)
            ->when(!$request->boolean('include_zero_balances'), function ($query) {
                $query->where('balance', '!=', 0);
            })
            ->orderBy('account_code')
            ->get();

        $totalDebits = $accounts->where('normal_balance', 'debit')->sum('balance');
        $totalCredits = $accounts->where('normal_balance', 'credit')->sum('balance');

        $reportData = [
            'title' => 'Trial Balance Report',
            'generated_at' => now(),
            'as_of_date' => $asOfDate,
            'parameters' => $request->only(['include_zero_balances']),
            'accounts' => $accounts->map(function ($account) {
                return [
                    'account_code' => $account->account_code,
                    'name' => $account->name,
                    'debit_balance' => $account->normal_balance === 'debit' ? $account->balance : 0,
                    'credit_balance' => $account->normal_balance === 'credit' ? $account->balance : 0,
                ];
            }),
            'totals' => [
                'total_debits' => $totalDebits,
                'total_credits' => $totalCredits,
                'difference' => $totalDebits - $totalCredits,
                'is_balanced' => abs($totalDebits - $totalCredits) < 0.01,
            ],
        ];

        return Inertia::render('Finance/Reports/TrialBalance', [
            'reportData' => $reportData,
        ]);
    }

    /**
     * Generate Bank Reconciliation Summary report.
     */
    public function reconciliationSummary(Request $request)
    {
        $request->validate([
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'account_id' => 'nullable|exists:chart_of_accounts,id',
            'status' => 'nullable|in:pending,in_progress,completed,approved',
            'format' => 'nullable|in:pdf,excel,csv',
        ]);

        $query = \App\Models\Finance\BankReconciliation::query()
            ->where('company_id', currentCompanyId())
            ->with(['account', 'bankStatement', 'reconciledBy', 'approvedBy'])
            ->when($request->filled('date_from'), function ($query) use ($request) {
                $query->where('reconciliation_date', '>=', $request->date_from);
            })
            ->when($request->filled('date_to'), function ($query) use ($request) {
                $query->where('reconciliation_date', '<=', $request->date_to);
            })
            ->when($request->filled('account_id'), function ($query) use ($request) {
                $query->where('account_id', $request->account_id);
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            ->orderBy('reconciliation_date', 'desc');

        $reconciliations = $query->get();

        $reportData = [
            'title' => 'Bank Reconciliation Summary Report',
            'generated_at' => now(),
            'period' => [
                'from' => $request->date_from ?? $reconciliations->min('reconciliation_date'),
                'to' => $request->date_to ?? $reconciliations->max('reconciliation_date'),
            ],
            'parameters' => $request->only(['account_id', 'status']),
            'reconciliations' => $reconciliations->map(function ($reconciliation) {
                return [
                    'id' => $reconciliation->id,
                    'reconciliation_number' => $reconciliation->reconciliation_number,
                    'account_name' => $reconciliation->account->name,
                    'reconciliation_date' => $reconciliation->reconciliation_date,
                    'period_start' => $reconciliation->period_start,
                    'period_end' => $reconciliation->period_end,
                    'statement_opening_balance' => $reconciliation->statement_opening_balance,
                    'statement_closing_balance' => $reconciliation->statement_closing_balance,
                    'book_opening_balance' => $reconciliation->book_opening_balance,
                    'book_closing_balance' => $reconciliation->book_closing_balance,
                    'difference' => $reconciliation->difference,
                    'status' => $reconciliation->status,
                    'matched_transactions_count' => $reconciliation->matched_transactions_count,
                    'unmatched_bank_transactions_count' => $reconciliation->unmatched_bank_transactions_count,
                    'unmatched_book_transactions_count' => $reconciliation->unmatched_book_transactions_count,
                    'reconciled_by' => $reconciliation->reconciledBy?->name,
                    'reconciled_at' => $reconciliation->reconciled_at,
                    'approved_by' => $reconciliation->approvedBy?->name,
                    'approved_at' => $reconciliation->approved_at,
                ];
            }),
            'summary' => [
                'total_reconciliations' => $reconciliations->count(),
                'by_status' => $reconciliations->groupBy('status')->map->count(),
                'total_difference' => $reconciliations->sum('difference'),
                'avg_difference' => $reconciliations->avg('difference'),
                'total_matched_transactions' => $reconciliations->sum('matched_transactions_count'),
                'total_unmatched_bank' => $reconciliations->sum('unmatched_bank_transactions_count'),
                'total_unmatched_book' => $reconciliations->sum('unmatched_book_transactions_count'),
            ],
        ];

        return Inertia::render('Finance/Reports/ReconciliationSummary', [
            'reportData' => $reportData,
        ]);
    }
}
