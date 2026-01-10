<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Finance\Invoice;
use App\Models\Finance\ZraSmartInvoice;
use App\Models\Finance\ZraConfiguration;
use App\Models\Finance\ZraAuditLog;
use App\Services\ZRA\ZraSmartInvoiceService;
use App\Services\ZRA\ZraApiService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ZraController extends Controller
{
    protected ZraSmartInvoiceService $zraService;
    protected ZraApiService $apiService;

    public function __construct(ZraSmartInvoiceService $zraService, ZraApiService $apiService)
    {
        $this->zraService = $zraService;
        $this->apiService = $apiService;
    }

    /**
     * Display ZRA dashboard with overview statistics.
     */
    public function dashboard(Request $request)
    {
        // Get recent ZRA invoices
        $recentInvoices = ZraSmartInvoice::with(['invoice', 'submittedBy'])
            ->where('company_id', currentCompanyId())
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get comprehensive statistics
        $stats = [
            'total' => ZraSmartInvoice::where('company_id', currentCompanyId())->count(),
            'pending' => ZraSmartInvoice::where('company_id', currentCompanyId())->pending()->count(),
            'submitted' => ZraSmartInvoice::where('company_id', currentCompanyId())->submitted()->count(),
            'approved' => ZraSmartInvoice::where('company_id', currentCompanyId())->approved()->count(),
            'rejected' => ZraSmartInvoice::where('company_id', currentCompanyId())->rejected()->count(),
            'submitted_today' => ZraSmartInvoice::where('company_id', currentCompanyId())->whereDate('submitted_at', today())->count(),
            'approved_this_month' => ZraSmartInvoice::where('company_id', currentCompanyId())->approved()
                ->whereMonth('approved_at', now()->month)
                ->count(),
            'rejection_rate' => $this->calculateRejectionRate(),
            'avg_processing_time' => $this->calculateAverageProcessingTime(),
        ];

        // Get monthly submission trends
        $monthlyTrends = ZraSmartInvoice::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count')
            ->where('company_id', currentCompanyId())
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->limit(6)
            ->get();

        // Check ZRA API health
        $apiHealth = $this->apiService->healthCheck();

        return Inertia::render('Finance/ZRA/Dashboard', [
            'stats' => $stats,
            'recentInvoices' => $recentInvoices,
            'monthlyTrends' => $monthlyTrends,
            'apiHealth' => $apiHealth,
            'configuration' => ZraConfiguration::active()->where('company_id', currentCompanyId())->first(),
        ]);
    }

    /**
     * Display ZRA Smart Invoice dashboard.
     */
    public function index(Request $request)
    {
        $query = ZraSmartInvoice::with(['invoice', 'submittedBy'])
            ->where('company_id', currentCompanyId())
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('status')) {
            $query->where('submission_status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('invoice', function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $zraInvoices = $query->paginate(15)->withQueryString();

        // Get statistics
        $stats = [
            'total' => ZraSmartInvoice::where('company_id', currentCompanyId())->count(),
            'pending' => ZraSmartInvoice::where('company_id', currentCompanyId())->pending()->count(),
            'submitted' => ZraSmartInvoice::where('company_id', currentCompanyId())->submitted()->count(),
            'approved' => ZraSmartInvoice::where('company_id', currentCompanyId())->approved()->count(),
            'rejected' => ZraSmartInvoice::where('company_id', currentCompanyId())->rejected()->count(),
        ];

        return Inertia::render('Finance/ZRA/Index', [
            'zraInvoices' => $zraInvoices,
            'stats' => $stats,
            'filters' => $request->only(['status', 'search', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Show ZRA Smart Invoice details.
     */
    public function show(ZraSmartInvoice $zraInvoice)
    {
        if ($zraInvoice->company_id !== currentCompanyId()) {
            abort(403);
        }
        $zraInvoice->load(['invoice.items', 'submittedBy', 'auditLogs.user']);

        return Inertia::render('Finance/ZRA/Show', [
            'zraInvoice' => $zraInvoice,
        ]);
    }

    /**
     * Submit an invoice to ZRA.
     */
    public function submit(Request $request, Invoice $invoice)
    {
        if ($invoice->company_id !== currentCompanyId()) {
            abort(403);
        }
        $request->validate([
            'auto_approve' => 'boolean',
        ]);

        $result = $this->zraService->submitInvoice($invoice, $request->boolean('auto_approve'));

        if ($result['success']) {
            return redirect()->route('finance.zra.show', $result['zra_invoice'])
                ->with('success', $result['message']);
        }

        return back()->withErrors([
            'submission' => $result['error'],
            'validation_errors' => $result['validation_errors'] ?? [],
        ]);
    }

    /**
     * Check invoice status with ZRA.
     */
    public function checkStatus(ZraSmartInvoice $zraInvoice)
    {
        if ($zraInvoice->company_id !== currentCompanyId()) {
            abort(403);
        }
        $result = $this->zraService->checkInvoiceStatus($zraInvoice);

        if ($result['success']) {
            return back()->with('success', 'Status updated successfully');
        }

        return back()->withErrors(['status_check' => $result['error']]);
    }

    /**
     * Cancel a submitted invoice.
     */
    public function cancel(Request $request, ZraSmartInvoice $zraInvoice)
    {
        if ($zraInvoice->company_id !== currentCompanyId()) {
            abort(403);
        }
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $result = $this->zraService->cancelInvoice($zraInvoice, $request->reason);

        if ($result['success']) {
            return back()->with('success', $result['message']);
        }

        return back()->withErrors(['cancellation' => $result['error']]);
    }

    /**
     * Retry submission for failed invoices.
     */
    public function retry(ZraSmartInvoice $zraInvoice)
    {
        if ($zraInvoice->company_id !== currentCompanyId()) {
            abort(403);
        }
        $result = $this->zraService->retrySubmission($zraInvoice);

        if ($result['success']) {
            return back()->with('success', $result['message']);
        }

        return back()->withErrors(['retry' => $result['error']]);
    }

    /**
     * Download QR code for approved invoice.
     */
    public function downloadQrCode(ZraSmartInvoice $zraInvoice)
    {
        if ($zraInvoice->company_id !== currentCompanyId()) {
            abort(403, 'QR code not available');
        }
        if (!$zraInvoice->isApproved() || !$zraInvoice->qr_code) {
            abort(404, 'QR code not available');
        }

        $qrCodeData = base64_decode($zraInvoice->qr_code);
        $filename = "zra-qr-{$zraInvoice->invoice->invoice_number}.png";

        return response($qrCodeData)
            ->header('Content-Type', 'image/png')
            ->header('Content-Disposition', "attachment; filename=\"{$filename}\"");
    }

    /**
     * Display ZRA configuration settings.
     */
    public function configuration()
    {
        $config = ZraConfiguration::active()->where('company_id', currentCompanyId())->first();

        return Inertia::render('Finance/ZRA/Configuration', [
            'configuration' => $config,
        ]);
    }

    /**
     * Update ZRA configuration.
     */
    public function updateConfiguration(Request $request)
    {
        $request->validate([
            'environment' => 'required|in:sandbox,production',
            'api_base_url' => 'required|url',
            'api_version' => 'required|string',
            'client_id' => 'required|string',
            'client_secret' => 'required|string',
            'api_key' => 'required|string',
            'taxpayer_tpin' => 'required|string|size:10',
            'taxpayer_name' => 'required|string|max:255',
            'taxpayer_address' => 'required|string|max:500',
            'taxpayer_phone' => 'required|string|max:20',
            'taxpayer_email' => 'required|email|max:255',
            'auto_submit' => 'boolean',
            'require_approval' => 'boolean',
            'max_retry_attempts' => 'required|integer|min:1|max:10',
            'retry_delay_minutes' => 'required|integer|min:1|max:60',
            'tax_rates' => 'array',
            'invoice_settings' => 'array',
        ]);

        DB::beginTransaction();

        try {
            // Deactivate existing configurations
            ZraConfiguration::where('company_id', currentCompanyId())->where('is_active', true)->update(['is_active' => false]);

            // Create or update configuration
            $config = ZraConfiguration::create(array_merge($request->validated(), [
                'company_id' => currentCompanyId(),
                'is_active' => true,
                'health_status' => 'unknown',
            ]));

            // Test the configuration
            $healthCheck = $this->apiService->healthCheck();
            if (!$healthCheck['success']) {
                DB::rollBack();
                return back()->withErrors([
                    'configuration' => 'Configuration saved but health check failed: ' . $healthCheck['error']
                ]);
            }

            DB::commit();

            return back()->with('success', 'ZRA configuration updated successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors([
                'configuration' => 'Failed to update configuration: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Test ZRA API connection.
     */
    public function testConnection()
    {
        $result = $this->apiService->healthCheck();

        if ($result['success']) {
            return back()->with('success', 'ZRA API connection successful');
        }

        return back()->withErrors(['connection' => $result['error']]);
    }

    /**
     * Display audit logs.
     */
    public function auditLogs(Request $request)
    {
        $query = ZraAuditLog::with(['zraSmartInvoice.invoice', 'user'])
            ->where('company_id', currentCompanyId())
            ->orderBy('executed_at', 'desc');

        // Apply filters
        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('executed_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('executed_at', '<=', $request->date_to);
        }

        $auditLogs = $query->paginate(20)->withQueryString();

        return Inertia::render('Finance/ZRA/AuditLogs', [
            'auditLogs' => $auditLogs,
            'filters' => $request->only(['action', 'status', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Export audit logs to CSV.
     */
    public function exportAuditLogs(Request $request)
    {
        $query = ZraAuditLog::with(['zraSmartInvoice.invoice', 'user'])
            ->where('company_id', currentCompanyId())
            ->orderBy('executed_at', 'desc');

        // Apply same filters as audit logs index
        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('executed_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('executed_at', '<=', $request->date_to);
        }

        $auditLogs = $query->get();

        $filename = 'zra-audit-logs-' . now()->format('Y-m-d-H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($auditLogs) {
            $file = fopen('php://output', 'w');
            
            // CSV headers
            fputcsv($file, [
                'ID',
                'Invoice Number',
                'Action',
                'Status',
                'User',
                'Executed At',
                'HTTP Status',
                'Error Message',
                'Correlation ID',
            ]);

            // CSV data
            foreach ($auditLogs as $log) {
                fputcsv($file, [
                    $log->id,
                    $log->zraSmartInvoice?->invoice?->invoice_number ?? 'N/A',
                    $log->action,
                    $log->status,
                    $log->user?->name ?? 'System',
                    $log->executed_at->format('Y-m-d H:i:s'),
                    $log->http_status_code ?? 'N/A',
                    $log->error_message ?? '',
                    $log->correlation_id ?? '',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Get ZRA statistics for dashboard.
     */
    public function statistics()
    {
        $stats = [
            'total_invoices' => ZraSmartInvoice::where('company_id', currentCompanyId())->count(),
            'pending_submissions' => ZraSmartInvoice::where('company_id', currentCompanyId())->pending()->count(),
            'submitted_today' => ZraSmartInvoice::where('company_id', currentCompanyId())->whereDate('submitted_at', today())->count(),
            'approved_this_month' => ZraSmartInvoice::where('company_id', currentCompanyId())->approved()
                ->whereMonth('approved_at', now()->month)
                ->count(),
            'rejection_rate' => $this->calculateRejectionRate(),
            'avg_processing_time' => $this->calculateAverageProcessingTime(),
        ];

        return response()->json($stats);
    }

    /**
     * Calculate rejection rate percentage.
     */
    protected function calculateRejectionRate(): float
    {
        $total = ZraSmartInvoice::where('company_id', currentCompanyId())
            ->whereIn('submission_status', ['approved', 'rejected'])->count();
        
        if ($total === 0) {
            return 0;
        }

        $rejected = ZraSmartInvoice::where('company_id', currentCompanyId())->rejected()->count();
        
        return round(($rejected / $total) * 100, 2);
    }

    /**
     * Calculate average processing time in hours.
     */
    protected function calculateAverageProcessingTime(): float
    {
        $approvedInvoices = ZraSmartInvoice::where('company_id', currentCompanyId())
            ->approved()
            ->whereNotNull('submitted_at')
            ->whereNotNull('approved_at')
            ->get();

        if ($approvedInvoices->isEmpty()) {
            return 0;
        }

        $totalHours = $approvedInvoices->sum(function ($invoice) {
            return $invoice->submitted_at->diffInHours($invoice->approved_at);
        });

        return round($totalHours / $approvedInvoices->count(), 2);
    }
}
