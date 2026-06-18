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
use App\Services\Finance\FinanceReportDataService;
use App\Services\Finance\FinanceReportExporter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function __construct(
        protected FinanceReportDataService $reportDataService,
        protected FinanceReportExporter $reportExporter,
    ) {
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Report::with('createdBy');

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
                'format' => $report->format ?? 'pdf',
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
            'format' => 'required|string|in:pdf,excel,csv',
            'description' => 'nullable|string|max:1000',
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
        ]);

        $report = Report::create([
            'name' => $request->name,
            'description' => $request->description,
            'type' => $request->type,
            'format' => $request->format,
            'status' => 'pending',
            'parameters' => [
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
            ],
            'created_by' => auth()->id(),
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
        $report->load('createdBy');

        return Inertia::render('Finance/Reports/Show', [
            'report' => [
                'id' => $report->id,
                'name' => $report->name,
                'description' => $report->description,
                'type' => $report->type,
                'format' => $report->format ?? 'pdf',
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
        return Inertia::render('Finance/Reports/Edit', [
            'report' => [
                'id' => $report->id,
                'name' => $report->name,
                'description' => $report->description,
                'type' => $report->type,
                'format' => $report->format ?? 'pdf',
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
        if ($report->isAvailable() && $report->file_path && Storage::disk('local')->exists($report->file_path)) {
            $extension = pathinfo($report->file_path, PATHINFO_EXTENSION) ?: ($report->format ?? 'pdf');

            return response()->download(
                storage_path('app/' . $report->file_path),
                $this->safeFilename($report->name, $extension)
            );
        }

        if ($report->status !== 'processing' && $report->status !== 'pending') {
            $report->markAsProcessing();
            \App\Jobs\GenerateReportJob::dispatch($report);
        }

        return redirect()->back()->with('info', 'Report is being generated. You will be notified once it is ready for download.');
    }

    public function export(Report $report, string $format)
    {
        abort_unless(in_array($format, ['pdf', 'excel', 'csv'], true), 404);

        $data = $this->reportDataService->forReport($report);

        return $this->reportExporter->download($report, $data, $format);
    }

    protected function safeFilename(string $name, string $extension): string
    {
        $slug = preg_replace('/[^A-Za-z0-9_-]+/', '_', $name) ?: 'report';

        return trim($slug, '_') . '.' . ltrim($extension, '.');
    }

    protected function maybeExport(Request $request, string $type, string $title, array $data)
    {
        $format = $request->query('format');

        if (!$format) {
            return null;
        }

        abort_unless(in_array($format, ['pdf', 'excel', 'csv'], true), 422);

        return $this->reportExporter->downloadLive($title, $type, $data, $format);
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

        $reportData = $this->reportDataService->chartOfAccounts([
            'as_of_date' => $request->as_of_date ?? now()->toDateString(),
            'include_inactive' => $request->boolean('include_inactive'),
            'category' => $request->category,
        ]);

        if ($response = $this->maybeExport($request, 'chart_of_accounts', $reportData['title'], $reportData)) {
            return $response;
        }

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

        $reportData = $this->reportDataService->trialBalance([
            'as_of_date' => $request->as_of_date ?? now()->toDateString(),
            'include_zero_balances' => $request->boolean('include_zero_balances'),
        ]);

        if ($response = $this->maybeExport($request, 'trial_balance', $reportData['title'], $reportData)) {
            return $response;
        }

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
            'account_id' => 'nullable|exists:accounts,id',
            'status' => 'nullable|in:pending,in_progress,completed,approved',
            'format' => 'nullable|in:pdf,excel,csv',
        ]);

        $reportData = $this->reportDataService->reconciliationSummary([
            'date_from' => $request->date_from,
            'date_to' => $request->date_to,
            'account_id' => $request->account_id,
            'status' => $request->status,
        ]);

        if ($response = $this->maybeExport($request, 'reconciliation_summary', $reportData['title'], $reportData)) {
            return $response;
        }

        return Inertia::render('Finance/Reports/ReconciliationSummary', [
            'reportData' => $reportData,
        ]);
    }
}
