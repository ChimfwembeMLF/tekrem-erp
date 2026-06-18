<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Finance\MomoTransaction;
use App\Models\Finance\MomoProvider;
use App\Models\Finance\Invoice;
use App\Services\MoMo\MomoTransactionService;
use App\Services\MoMo\MomoReconciliationService;
use App\Services\MoMo\MomoAuditService;
use App\Services\Payments\PawaPayApiClient;
use App\Services\Payments\PawaPayService;
use App\Services\Payments\PawaPayTransactionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Carbon\Carbon;

class MomoController extends Controller
{
    protected MomoTransactionService $transactionService;
    protected MomoReconciliationService $reconciliationService;
    protected MomoAuditService $auditService;
    protected PawaPayService $pawaPayService;
    protected PawaPayTransactionService $pawaPayTransactionService;
    protected PawaPayApiClient $pawaPayApiClient;

    public function __construct(
        MomoTransactionService $transactionService,
        MomoReconciliationService $reconciliationService,
        MomoAuditService $auditService,
        PawaPayService $pawaPayService,
        PawaPayTransactionService $pawaPayTransactionService,
        PawaPayApiClient $pawaPayApiClient
    ) {
        $this->transactionService = $transactionService;
        $this->reconciliationService = $reconciliationService;
        $this->auditService = $auditService;
        $this->pawaPayService = $pawaPayService;
        $this->pawaPayTransactionService = $pawaPayTransactionService;
        $this->pawaPayApiClient = $pawaPayApiClient;
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
        $stats = [
            'today' => [
                'transactions' => MomoTransaction::whereDate('created_at', $today)->count(),
                'amount' => MomoTransaction::whereDate('created_at', $today)->sum('amount'),
                'successful' => MomoTransaction::whereDate('created_at', $today)->where('status', 'completed')->count(),
            ],
            'this_week' => [
                'transactions' => MomoTransaction::where('created_at', '>=', $thisWeek)->count(),
                'amount' => MomoTransaction::where('created_at', '>=', $thisWeek)->sum('amount'),
                'successful' => MomoTransaction::where('created_at', '>=', $thisWeek)->where('status', 'completed')->count(),
            ],
            'this_month' => [
                'transactions' => MomoTransaction::where('created_at', '>=', $thisMonth)->count(),
                'amount' => MomoTransaction::where('created_at', '>=', $thisMonth)->sum('amount'),
                'successful' => MomoTransaction::where('created_at', '>=', $thisMonth)->where('status', 'completed')->count(),
            ],
        ];

        // Get recent transactions
        $recentTransactions = MomoTransaction::with(['provider', 'user'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Get network statistics (PawaPay correspondents)
        $networkStats = MomoTransaction::query()
            ->where('created_at', '>=', $thisMonth)
            ->get()
            ->groupBy(fn ($transaction) => $transaction->correspondent ?? 'pawapay')
            ->map(function ($group, $code) {
                $label = $group->first()->correspondent_label ?? 'PawaPay';

                return [
                    'name' => $label,
                    'code' => $code,
                    'count' => $group->count(),
                    'amount' => $group->sum('amount'),
                    'success_rate' => $group->count() > 0
                        ? round(($group->where('status', 'completed')->count() / $group->count()) * 100, 2)
                        : 0,
                ];
            });

        // Get pending transactions that need attention
        $pendingTransactions = MomoTransaction::with(['provider', 'user'])
            ->whereIn('status', ['pending', 'processing'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('Finance/MoMo/Dashboard', [
            'stats' => $stats,
            'recentTransactions' => $recentTransactions,
            'providerStats' => $networkStats,
            'pendingTransactions' => $pendingTransactions,
            'pawapay' => $this->pawaPayService->getPublicConfiguration(),
        ]);
    }

    /**
     * Display MoMo transactions index.
     */
    public function index(Request $request)
    {
        $query = MomoTransaction::with(['provider', 'user', 'invoice'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('correspondent')) {
            $query->where('metadata->correspondent', $request->correspondent);
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
                  ->orWhere('customer_phone', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $transactions = $query->paginate(20)->withQueryString();

        return Inertia::render('Finance/MoMo/Index', [
            'transactions' => $transactions,
            'networks' => $this->pawaPayTransactionService->getNetworks(),
            'pawapay' => $this->pawaPayService->getPublicConfiguration(),
            'filters' => $request->only(['correspondent', 'status', 'type', 'date_from', 'date_to', 'search']),
        ]);
    }

    /**
     * Show MoMo transaction details.
     */
    public function show(MomoTransaction $transaction)
    {
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
        $invoice = null;

        if ($request->filled('invoice_id')) {
            $invoice = Invoice::findOrFail($request->invoice_id);
            $invoice->setAttribute('balance_due', max(0, (float) $invoice->total_amount - (float) $invoice->paid_amount));
        }

        $refundableDeposits = MomoTransaction::query()
            ->where('type', 'payment')
            ->where('status', 'completed')
            ->whereNotNull('provider_transaction_id')
            ->latest()
            ->limit(50)
            ->get(['id', 'transaction_number', 'provider_transaction_id', 'amount', 'currency', 'customer_phone', 'created_at']);

        return Inertia::render('Finance/MoMo/Create', [
            'networks' => $this->pawaPayTransactionService->getNetworks(),
            'pawapay' => $this->pawaPayService->getPublicConfiguration(),
            'refundableDeposits' => $refundableDeposits,
            'invoice' => $invoice,
        ]);
    }

    /**
     * Initiate a PawaPay deposit, payout, or refund.
     */
    public function store(Request $request)
    {
        $request->validate([
            'amount' => 'required_unless:type,refund|nullable|numeric|min:1',
            'phone_number' => 'required_unless:type,refund|nullable|string',
            'correspondent' => 'nullable|string|in:MTN_MOMO_ZMB,AIRTEL_OAPI_ZMB,ZAMTEL_ZMB',
            'type' => 'required|in:payment,payout,refund',
            'description' => 'nullable|string|max:255',
            'invoice_id' => 'nullable|exists:invoices,id',
            'customer_name' => 'nullable|string|max:255',
            'customer_email' => 'nullable|email|max:255',
            'customer_message' => 'nullable|string|max:22',
            'deposit_id' => 'required_if:type,refund|nullable|uuid',
        ]);

        if (!$this->pawaPayService->isConfigured()) {
            return Redirect::back()
                ->withErrors(['error' => 'Configure PawaPay in Finance Settings before initiating transactions.'])
                ->withInput();
        }

        if (
            $request->input('type') !== 'refund'
            && !$this->pawaPayApiClient->isValidZambianMsisdn((string) $request->input('phone_number', ''))
        ) {
            return Redirect::back()
                ->withErrors([
                    'phone_number' => 'Enter a valid Zambian mobile number (e.g. 076274499, 077274499, or 26076274499).',
                ])
                ->withInput();
        }

        $data = $request->only([
            'amount', 'phone_number', 'correspondent', 'type',
            'description', 'invoice_id', 'customer_name', 'customer_email',
            'customer_message', 'deposit_id',
        ]);
        $data['user_id'] = auth()->id();

        $result = match ($request->input('type')) {
            'payment' => $this->pawaPayTransactionService->initiateDeposit($data),
            'payout' => $this->pawaPayTransactionService->initiatePayout($data),
            'refund' => $this->pawaPayTransactionService->initiateRefund($data),
            default => ['success' => false, 'error' => 'Unsupported transaction type'],
        };

        if ($result['success']) {
            return Redirect::route('finance.momo.show', $result['transaction'])
                ->with('success', 'PawaPay transaction initiated successfully');
        }

        return Redirect::back()
            ->withErrors(['error' => $result['error']])
            ->withInput();
    }

    /**
     * @deprecated Use store() with type=payout
     */
    public function payout(Request $request)
    {
        $request->merge(['type' => 'payout']);

        return $this->store($request);
    }

    /**
     * Check transaction status.
     */
    public function checkStatus(MomoTransaction $transaction)
    {
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
        $providers = MomoProvider::where('code', 'pawapay')->get();
        $selectedProvider = $providers->first();
        $reconciliationData = null;

        if ($selectedProvider) {
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
            'filters' => $request->only(['start_date', 'end_date']),
        ]);
    }

    /**
     * Perform auto reconciliation.
     */
    public function autoReconcile(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $provider = MomoProvider::where('code', 'pawapay')->firstOrFail();
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

        $result = $this->reconciliationService->manualReconcile(
            $request->transaction_ids,
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

        $providers = MomoProvider::where('is_active', true)->get();

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

        $query = MomoTransaction::with('provider')
            ->whereBetween('created_at', [$startDate, $endDate]);

        $transactions = $query->get();

        $statistics = [
            'total_transactions' => $transactions->count(),
            'total_amount' => $transactions->sum('amount'),
            'total_fees' => $transactions->sum('fee_amount'),
            'success_rate' => $transactions->count() > 0 
                ? round(($transactions->where('status', 'completed')->count() / $transactions->count()) * 100, 2)
                : 0,
            'network_breakdown' => $transactions->groupBy(fn ($transaction) => $transaction->correspondent ?? 'pawapay')->map(function ($group, $code) {
                return [
                    'name' => $group->first()->correspondent_label ?? 'PawaPay',
                    'code' => $code,
                    'count' => $group->count(),
                    'amount' => $group->sum('amount'),
                    'success_rate' => $group->count() > 0
                        ? round(($group->where('status', 'completed')->count() / $group->count()) * 100, 2)
                        : 0,
                ];
            }),
            'provider_breakdown' => $transactions->groupBy(fn ($transaction) => $transaction->correspondent ?? 'pawapay')->map(function ($group, $code) {
                return [
                    'name' => $group->first()->correspondent_label ?? 'PawaPay',
                    'code' => $code,
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
