<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Finance\MomoTransaction;
use App\Models\Finance\MomoProvider;
use App\Models\Finance\Invoice;
use App\Services\MoMo\MomoTransactionService;
use App\Services\MoMo\MomoReconciliationService;
use App\Services\MoMo\MomoAuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Carbon\Carbon;

class MomoController extends Controller
{
    protected MomoTransactionService $transactionService;
    protected MomoReconciliationService $reconciliationService;
    protected MomoAuditService $auditService;

    public function __construct(
        MomoTransactionService $transactionService,
        MomoReconciliationService $reconciliationService,
        MomoAuditService $auditService
    ) {
        $this->transactionService = $transactionService;
        $this->reconciliationService = $reconciliationService;
        $this->auditService = $auditService;
    }

    /**
     * Display MoMo dashboard with overview statistics.
     */
    public function dashboard(Request $request)
    {
        $today = Carbon::today();
        $thisWeek = Carbon::now()->startOfWeek();
        $thisMonth = Carbon::now()->startOfMonth();

        // Get basic statistics
        $companyId = currentCompanyId();
        $stats = [
            'today' => [
                'transactions' => MomoTransaction::where('company_id', $companyId)->whereDate('created_at', $today)->count(),
                'amount' => MomoTransaction::where('company_id', $companyId)->whereDate('created_at', $today)->sum('amount'),
                'successful' => MomoTransaction::where('company_id', $companyId)->whereDate('created_at', $today)->where('status', 'completed')->count(),
            ],
            'this_week' => [
                'transactions' => MomoTransaction::where('company_id', $companyId)->where('created_at', '>=', $thisWeek)->count(),
                'amount' => MomoTransaction::where('company_id', $companyId)->where('created_at', '>=', $thisWeek)->sum('amount'),
                'successful' => MomoTransaction::where('company_id', $companyId)->where('created_at', '>=', $thisWeek)->where('status', 'completed')->count(),
            ],
            'this_month' => [
                'transactions' => MomoTransaction::where('company_id', $companyId)->where('created_at', '>=', $thisMonth)->count(),
                'amount' => MomoTransaction::where('company_id', $companyId)->where('created_at', '>=', $thisMonth)->sum('amount'),
                'successful' => MomoTransaction::where('company_id', $companyId)->where('created_at', '>=', $thisMonth)->where('status', 'completed')->count(),
            ],
        ];

        // Get recent transactions
        $recentTransactions = MomoTransaction::with(['provider', 'user'])
            ->where('company_id', $companyId)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Get provider statistics
        $providerStats = MomoTransaction::with('provider')
            ->where('company_id', $companyId)
            ->where('created_at', '>=', $thisMonth)
            ->get()
            ->groupBy('provider.code')
            ->map(function ($group) {
                return [
                    'name' => $group->first()->provider->display_name,
                    'count' => $group->count(),
                    'amount' => $group->sum('amount'),
                    'success_rate' => $group->count() > 0 
                        ? round(($group->where('status', 'completed')->count() / $group->count()) * 100, 2)
                        : 0,
                ];
            });

        // Get pending transactions that need attention
        $pendingTransactions = MomoTransaction::with(['provider', 'user'])
            ->where('company_id', $companyId)
            ->whereIn('status', ['pending', 'processing'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('Finance/MoMo/Dashboard', [
            'stats' => $stats,
            'recentTransactions' => $recentTransactions,
            'providerStats' => $providerStats,
            'pendingTransactions' => $pendingTransactions,
        ]);
    }

    /**
     * Display MoMo transactions index.
     */
    public function index(Request $request)
    {
        $companyId = currentCompanyId();
        $query = MomoTransaction::with(['provider', 'user', 'invoice'])
            ->where('company_id', $companyId)
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('provider_id')) {
            $query->where('provider_id', $request->provider_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('transaction_number', 'like', "%{$search}%")
                  ->orWhere('phone_number', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $transactions = $query->paginate(20)->withQueryString();

        $providers = MomoProvider::where('company_id', $companyId)->where('is_active', true)->get();

        return Inertia::render('Finance/MoMo/Index', [
            'transactions' => $transactions,
            'providers' => $providers,
            'filters' => $request->only(['provider_id', 'status', 'type', 'date_from', 'date_to', 'search']),
        ]);
    }

    /**
     * Show MoMo transaction details.
     */
    public function show(MomoTransaction $transaction)
    {
        if ($transaction->company_id !== currentCompanyId()) {
            abort(404);
        }
        $transaction->load(['provider', 'user', 'invoice', 'webhooks']);

        return Inertia::render('Finance/MoMo/Show', [
            'transaction' => $transaction,
        ]);
    }

    /**
     * Show payment initiation form.
     */
    public function create(Request $request)
    {
        $companyId = currentCompanyId();
        $providers = MomoProvider::where('company_id', $companyId)->where('is_active', true)->get();
        $invoice = null;

        if ($request->filled('invoice_id')) {
            $invoice = Invoice::where('company_id', $companyId)->findOrFail($request->invoice_id);
        }

        return Inertia::render('Finance/MoMo/Create', [
            'providers' => $providers,
            'invoice' => $invoice,
        ]);
    }

    /**
     * Initiate MoMo payment.
     */
    public function store(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'phone_number' => 'required|string|regex:/^(09[4-9])\d{7}$/',
            'provider_code' => 'nullable|string|exists:momo_providers,code',
            'type' => 'required|in:collection,disbursement',
            'description' => 'nullable|string|max:255',
            'invoice_id' => 'nullable|exists:invoices,id',
            'payer_message' => 'nullable|string|max:160',
            'payee_note' => 'nullable|string|max:160',
        ]);

        $data = $request->only([
            'amount', 'phone_number', 'provider_code', 'type', 
            'description', 'invoice_id', 'payer_message', 'payee_note'
        ]);

        $data['user_id'] = auth()->id();
        $data['company_id'] = currentCompanyId();

        $result = $this->transactionService->initiatePayment($data);

        if ($result['success']) {
            return Redirect::route('finance.momo.show', $result['transaction'])
                ->with('success', 'MoMo payment initiated successfully');
        }

        return Redirect::back()
            ->withErrors(['error' => $result['error']])
            ->withInput();
    }

    /**
     * Process MoMo payout.
     */
    public function payout(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'phone_number' => 'required|string|regex:/^(09[4-9])\d{7}$/',
            'provider_code' => 'nullable|string|exists:momo_providers,code',
            'description' => 'nullable|string|max:255',
            'payer_message' => 'nullable|string|max:160',
            'payee_note' => 'nullable|string|max:160',
        ]);

        $data = $request->only([
            'amount', 'phone_number', 'provider_code', 
            'description', 'payer_message', 'payee_note'
        ]);

        $data['user_id'] = auth()->id();
        $data['company_id'] = currentCompanyId();

        $result = $this->transactionService->processPayout($data);

        if ($result['success']) {
            return Redirect::route('finance.momo.show', $result['transaction'])
                ->with('success', 'MoMo payout processed successfully');
        }

        return Redirect::back()
            ->withErrors(['error' => $result['error']])
            ->withInput();
    }

    /**
     * Check transaction status.
     */
    public function checkStatus(MomoTransaction $transaction)
    {
        if ($transaction->company_id !== currentCompanyId()) {
            abort(404);
        }
        $result = $this->transactionService->checkTransactionStatus($transaction);

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'status' => $result['status'],
                'transaction' => $result['transaction'],
            ]);
        }

        return response()->json([
            'success' => false,
            'error' => $result['error'],
        ], 422);
    }

    /**
     * Show reconciliation dashboard.
     */
    public function reconciliation(Request $request)
    {
        $companyId = currentCompanyId();
        $providers = MomoProvider::where('company_id', $companyId)->where('is_active', true)->get();
        $selectedProvider = null;
        $reconciliationData = null;

        if ($request->filled('provider_id')) {
            $selectedProvider = MomoProvider::findOrFail($request->provider_id);
            
            $startDate = $request->filled('start_date') 
                ? Carbon::parse($request->start_date) 
                : Carbon::now()->subDays(30);
                
            $endDate = $request->filled('end_date') 
                ? Carbon::parse($request->end_date) 
                : Carbon::now();

            $reconciliationData = $this->reconciliationService->getReconciliationReport(
                $selectedProvider, 
                $startDate, 
                $endDate
            );
        }

        return Inertia::render('Finance/MoMo/Reconciliation', [
            'providers' => $providers,
            'selectedProvider' => $selectedProvider,
            'reconciliationData' => $reconciliationData,
            'filters' => $request->only(['provider_id', 'start_date', 'end_date']),
        ]);
    }

    /**
     * Perform auto reconciliation.
     */
    public function autoReconcile(Request $request)
    {
        $request->validate([
            'provider_id' => 'required|exists:momo_providers,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $provider = MomoProvider::where('company_id', currentCompanyId())->findOrFail($request->provider_id);
        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);

        $result = $this->reconciliationService->autoReconcile($provider, $startDate, $endDate);

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'message' => 'Auto reconciliation completed successfully',
                'reconciliation' => $result['reconciliation'],
                'summary' => $result['summary'],
            ]);
        }

        return response()->json([
            'success' => false,
            'error' => $result['error'],
        ], 422);
    }

    /**
     * Manual reconciliation actions.
     */
    public function manualReconcile(Request $request)
    {
        $request->validate([
            'transaction_ids' => 'required|array',
            'transaction_ids.*' => 'exists:momo_transactions,id',
            'action' => 'required|in:mark_reconciled,mark_unreconciled,check_status',
        ]);

        $companyId = currentCompanyId();
        $transactionIds = MomoTransaction::where('company_id', $companyId)
            ->whereIn('id', $request->transaction_ids)
            ->pluck('id')
            ->toArray();
        $result = $this->reconciliationService->manualReconcile(
            $transactionIds,
            $request->action
        );

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'message' => 'Manual reconciliation completed successfully',
                'results' => $result['results'],
            ]);
        }

        return response()->json([
            'success' => false,
            'error' => $result['error'],
        ], 422);
    }

    /**
     * Show audit dashboard.
     */
    public function audit(Request $request)
    {
        $filters = $request->only(['start_date', 'end_date', 'provider_id']);
        
        $auditReport = $this->auditService->generateAuditReport($filters);
        $webhookReport = $this->auditService->generateWebhookAuditReport($filters);

        $companyId = currentCompanyId();
        $providers = MomoProvider::where('company_id', $companyId)->where('is_active', true)->get();

        return Inertia::render('Finance/MoMo/Audit', [
            'auditReport' => $auditReport,
            'webhookReport' => $webhookReport,
            'providers' => $providers,
            'filters' => $filters,
        ]);
    }

    /**
     * Export audit report.
     */
    public function exportAudit(Request $request)
    {
        $filters = $request->only(['start_date', 'end_date', 'provider_id']);
        $auditReport = $this->auditService->generateAuditReport($filters);
        
        $filepath = $this->auditService->exportAuditReportToCsv($auditReport);
        
        return response()->download($filepath)->deleteFileAfterSend();
    }

    /**
     * Show provider configuration.
     */
    public function providers()
    {
        $companyId = currentCompanyId();
        $providers = MomoProvider::with('cashAccount', 'feeAccount', 'receivableAccount')
            ->where('company_id', $companyId)
            ->orderBy('display_name')
            ->get();

        return Inertia::render('Finance/MoMo/Providers', [
            'providers' => $providers,
        ]);
    }

    /**
     * Show provider statistics.
     */
    public function statistics(Request $request)
    {
        $startDate = $request->filled('start_date') 
            ? Carbon::parse($request->start_date) 
            : Carbon::now()->subDays(30);
            
        $endDate = $request->filled('end_date') 
            ? Carbon::parse($request->end_date) 
            : Carbon::now();

        $companyId = currentCompanyId();
        $query = MomoTransaction::with('provider')
            ->where('company_id', $companyId)
            ->whereBetween('created_at', [$startDate, $endDate]);

        $transactions = $query->get();

        $statistics = [
            'total_transactions' => $transactions->count(),
            'total_amount' => $transactions->sum('amount'),
            'total_fees' => $transactions->sum('fee_amount'),
            'success_rate' => $transactions->count() > 0 
                ? round(($transactions->where('status', 'completed')->count() / $transactions->count()) * 100, 2)
                : 0,
            'provider_breakdown' => $transactions->groupBy('provider.code')->map(function ($group) {
                return [
                    'name' => $group->first()->provider->display_name,
                    'count' => $group->count(),
                    'amount' => $group->sum('amount'),
                    'success_rate' => $group->count() > 0 
                        ? round(($group->where('status', 'completed')->count() / $group->count()) * 100, 2)
                        : 0,
                ];
            }),
            'daily_breakdown' => $transactions->groupBy(function ($transaction) {
                return $transaction->created_at->format('Y-m-d');
            })->map(function ($group) {
                return [
                    'count' => $group->count(),
                    'amount' => $group->sum('amount'),
                ];
            }),
        ];

        return Inertia::render('Finance/MoMo/Statistics', [
            'statistics' => $statistics,
            'filters' => $request->only(['start_date', 'end_date']),
        ]);
    }
}
