<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Finance\Invoice;
use App\Models\Finance\Account;
use App\Models\Finance\Payment;
use App\Models\Finance\Quotation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;
use Inertia\Response;

class FinanceController extends Controller
{
    /**
     * Display customer's financial overview.
     */
    public function index(): Response
    {
        $user = Auth::user();
        $client = $user->client ?? $user->clients()->first();

        $billableType = $client ? get_class($client) : User::class;
        $billableId = $client ? $client->id : $user->id;

        $customerInvoices = Invoice::query()->where('billable_type', $billableType)->where('billable_id', $billableId);

        $outstandingAmount = (clone $customerInvoices)
            ->whereColumn('paid_amount', '<', 'total_amount')
            ->selectRaw('COALESCE(SUM(CASE WHEN total_amount > paid_amount THEN total_amount - paid_amount ELSE 0 END), 0) as outstanding_amount')
            ->value('outstanding_amount');

        // Get financial statistics
        $stats = [
            'total_invoices' => (clone $customerInvoices)->count(),
            'paid_invoices' => (clone $customerInvoices)->where('status', 'paid')->count(),
            'pending_invoices' => (clone $customerInvoices)->whereIn('status', ['draft', 'sent', 'pending', 'partial'])->count(),
            'overdue_invoices' => (clone $customerInvoices)->where('status', 'overdue')->count(),
            'total_amount' => (clone $customerInvoices)->sum('total_amount'),
            'paid_amount' => (clone $customerInvoices)->sum('paid_amount'),
            'outstanding_amount' => (float) $outstandingAmount,
        ];

        // Get recent invoices
        $recentInvoices = Invoice::query()->where('billable_type', $billableType)->where('billable_id', $billableId)
            ->with(['items', 'payments'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get recent payments
        $recentPayments = Payment::whereHas('invoice', function ($query) use ($billableType, $billableId) {
                $query->where('billable_type', $billableType)->where('billable_id', $billableId);
            })
            ->with(['invoice'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get recent quotations
        $recentQuotations = Quotation::query()->where('billable_type', $billableType)->where('billable_id', $billableId)
            ->with(['items'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('Customer/Finance/Index', [
            'stats' => $stats,
            'invoices' => $recentInvoices,
            'recent_payments' => $recentPayments,
            'recent_quotations' => $recentQuotations,
            'filters' => request()->only(['status', 'search', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Display customer's invoices.
     */
    public function invoices(Request $request): Response
    {

        $user = Auth::user();
        $client = $user->client ?? $user->clients()->first();
        $billableType = $client ? get_class($client) : User::class;
        $billableId = $client ? $client->id : $user->id;

        $query = Invoice::query()->where('billable_type', $billableType)->where('billable_id', $billableId)
            ->with(['items', 'payments']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('invoice_number', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('date_from')) {
            $query->where('invoice_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('invoice_date', '<=', $request->date_to);
        }

        $invoices = $query->orderBy('created_at', 'desc')->paginate(20);

        return Inertia::render('Customer/Finance/Invoices/Index', [
            'invoices' => $invoices,
            'filters' => $request->only(['status', 'search', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Display the specified invoice.
     */
    public function showInvoice(Invoice $invoice): Response
    {

        $user = Auth::user();
        $client = $user->client ?? $user->clients()->first();
        $billableType = $client ? get_class($client) : User::class;
        $billableId = $client ? $client->id : $user->id;

        // Ensure user can access this invoice
        if ($invoice->billable_type !== $billableType || $invoice->billable_id !== $billableId) {
            abort(403, 'Access denied.');
        }

        $invoice->load(['items', 'payments.account']);

        $company = config('company');
        // Fallback to /logo.png if no logo is set
        if (empty($company['logo'])) {
            $company['logo'] = '/logo.png';
        }
        // Fallback to 'Company' if no name is set
        if (empty($company['name'])) {
            $company['name'] = 'Company';
        }
        // Map payments to include account type and name
        $invoiceArr = $invoice->toArray();
        $invoiceArr['payments'] = collect($invoice->payments)->map(function($payment) {
            return array_merge($payment->toArray(), [
                'account_type' => $payment->account->type ?? null,
                'account_name' => $payment->account->name ?? null,
            ]);
        });
        // Add client info for UI
        $invoiceArr['client'] = null;
        if ($invoice->billable) {
            $invoiceArr['client'] = [
                'name' => $invoice->billable->name ?? null,
                'email' => $invoice->billable->email ?? null,
                'phone' => $invoice->billable->phone ?? null,
                'address' => $invoice->billable->address ?? null,
                'city' => $invoice->billable->city ?? null,
                'state' => $invoice->billable->state ?? null,
                'zip' => $invoice->billable->zip ?? null,
                'country' => $invoice->billable->country ?? null,
            ];
        }
        return Inertia::render('Customer/Finance/Invoices/Show', [
            'invoice' => $invoiceArr,
            'company' => $company,
        ]);
    }

    /**
     * Download invoice PDF.
     */
    public function downloadInvoice(Invoice $invoice)
    {

        $user = Auth::user();
        $client = $user->client ?? $user->clients()->first();
        $billableType = $client ? get_class($client) : User::class;
        $billableId = $client ? $client->id : $user->id;

        // Ensure user can access this invoice
        if ($invoice->billable_type !== $billableType || $invoice->billable_id !== $billableId) {
            abort(403, 'Access denied.');
        }
        // Get company info from config
        $company = config('company');
        // Generate and return PDF using barryvdh/laravel-dompdf
        $pdf = Pdf::loadView('pdf.invoice', [
            'invoice' => $invoice,
            'company' => $company,
            'client' => $client,
        ]);

        return $pdf->download('invoice-' . $invoice->invoice_number . '.pdf');
    }

    /**
     * Display invoice print view.
     */
    public function printInvoice(Invoice $invoice): Response
    {
        $user = Auth::user();
        $client = $user->client ?? $user->clients()->first();
        $billableType = $client ? get_class($client) : User::class;
        $billableId = $client ? $client->id : $user->id;

        // Ensure user can access this invoice
        if ($invoice->billable_type !== $billableType || $invoice->billable_id !== $billableId) {
            abort(403, 'Access denied.');
        }

        $invoice->load(['items', 'payments.account', 'zraSmartInvoice']);

        $company = config('company');

        // Build normalized print payload
        $payload = $this->buildInvoicePrintPayload($invoice, $client);

        return Inertia::render('Customer/Finance/Invoices/Print', ['invoice' => $payload]);
    }

    /**
     * Show customer payment form for a specific invoice.
     */
    public function payInvoice(Invoice $invoice)
    {
        $user = Auth::user();
        $client = $user->client ?? $user->clients()->first();
        $billableType = $client ? get_class($client) : User::class;
        $billableId = $client ? $client->id : $user->id;

        if ($invoice->billable_type !== $billableType || $invoice->billable_id !== $billableId) {
            abort(403, 'Access denied.');
        }

        $invoice->load('billable');

        $remainingBalance = max((float) $invoice->total_amount - (float) $invoice->paid_amount, 0);

        if ($remainingBalance <= 0) {
            return redirect()->route('customer.finance.invoices.show', $invoice)
                ->with('error', 'This invoice is already fully paid.');
        }

        $accounts = Account::query()
            ->where('user_id', $invoice->user_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'currency', 'type']);

        $defaultAccount = $accounts->firstWhere('account_code', '1110')
            ?? $accounts->firstWhere('name', 'Cash and Cash Equivalents')
            ?? $accounts->first();

        return Inertia::render('Customer/Finance/Payments/Create', [
            'invoice' => [
                'id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'currency' => $invoice->currency ?? 'ZMW',
                'total_amount' => (float) $invoice->total_amount,
                'paid_amount' => (float) $invoice->paid_amount,
                'balance_due' => $remainingBalance,
                'client_name' => $invoice->billable?->name,
            ],
            'accounts' => $accounts,
            'defaultAccountId' => $defaultAccount?->id,
            'paymentMethods' => [
                'cash' => 'Cash',
                'check' => 'Check',
                'bank_transfer' => 'Bank Transfer',
                'credit_card' => 'Credit Card',
                'paypal' => 'PayPal',
                'stripe' => 'Stripe',
                'other' => 'Other',
            ],
        ]);
    }

    /**
     * Store customer-submitted payment request for an invoice.
     */
    public function storeInvoicePayment(Request $request, Invoice $invoice)
    {
        $user = Auth::user();
        $client = $user->client ?? $user->clients()->first();
        $billableType = $client ? get_class($client) : User::class;
        $billableId = $client ? $client->id : $user->id;

        if ($invoice->billable_type !== $billableType || $invoice->billable_id !== $billableId) {
            abort(403, 'Access denied.');
        }

        $validator = Validator::make($request->all(), [
            'account_id' => 'required|exists:accounts,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'payment_method' => 'required|string|in:cash,check,bank_transfer,credit_card,paypal,stripe,other',
            'reference_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $account = Account::query()
            ->where('id', $request->account_id)
            ->where('user_id', $invoice->user_id)
            ->where('is_active', true)
            ->first();

        if (!$account) {
            return back()->with('error', 'Selected payment account is not available.')->withInput();
        }

        $remainingBalance = max((float) $invoice->total_amount - (float) $invoice->paid_amount, 0);

        if ((float) $request->amount > $remainingBalance) {
            return back()->with('error', 'Payment amount cannot exceed remaining invoice balance.')->withInput();
        }

        Payment::create([
            'payment_number' => Payment::generatePaymentNumber(),
            'invoice_id' => $invoice->id,
            'account_id' => $account->id,
            'amount' => (float) $request->amount,
            'payment_date' => $request->payment_date,
            'payment_method' => $request->payment_method,
            'reference_number' => $request->reference_number,
            'status' => 'pending',
            'notes' => $request->notes,
            'user_id' => $invoice->user_id,
        ]);

        return redirect()->route('customer.finance.payments')
            ->with('success', 'Payment request submitted successfully.');
    }

    /**
     * Build normalized invoice print payload.
     */
    private function buildInvoicePrintPayload(Invoice $invoice, $client): array
    {
        $company = config('company');
        if (empty($company['logo'])) {
            $company['logo'] = '/logo.png';
        }

        return [
            'id' => $invoice->id,
            'invoiceNumber' => $invoice->invoice_number,
            'issueDate' => $invoice->issue_date,
            'dueDate' => $invoice->due_date,
            'currency' => $invoice->currency ?? 'ZMW',
            'status' => $invoice->status,
            'notes' => $invoice->notes,
            'terms' => $invoice->terms,
            'customer' => [
                'name' => $client?->name ?? $invoice->billable?->name,
                'email' => $client?->email ?? $invoice->billable?->email,
                'phone' => $client?->phone ?? $invoice->billable?->phone,
                'address' => $client?->address ?? $invoice->billable?->address,
                'taxNumber' => $client?->tax_number ?? $invoice->billable?->tax_number,
            ],
            'company' => [
                'name' => $company['name'] ?? 'Company',
                'address' => $company['address'] ?? '',
                'city' => $company['city'] ?? '',
                'country' => $company['country'] ?? '',
                'taxNumber' => $company['tax_number'] ?? '',
                'phone' => $company['phone'] ?? '',
                'email' => $company['email'] ?? '',
                'website' => $company['website'] ?? '',
                'logoUrl' => $company['logo'],
                'bankName' => $company['bank']['name'] ?? '',
                'bankBranch' => $company['bank']['branch'] ?? '',
                'accountName' => $company['bank']['account_name'] ?? '',
                'accountNumber' => $company['bank']['account_number'] ?? '',
            ],
            'items' => collect($invoice->items)->map(fn($item) => [
                'id' => $item->id,
                'description' => $item->description,
                'quantity' => $item->quantity,
                'unitPrice' => $item->unit_price,
                'totalPrice' => $item->total_price,
            ])->toArray(),
            'payments' => collect($invoice->payments)->map(fn($payment) => [
                'id' => $payment->id,
                'amount' => $payment->amount,
                'date' => $payment->payment_date,
                'method' => $payment->payment_method,
                'reference' => $payment->reference_number,
                'account' => [
                    'name' => $payment->account?->name,
                    'type' => $payment->account?->type,
                ],
            ])->toArray(),
            'totals' => [
                'subtotal' => $invoice->subtotal,
                'taxAmount' => $invoice->tax_amount,
                'discountAmount' => $invoice->discount_amount ?? 0,
                'paidAmount' => $invoice->paid_amount,
                'balanceDue' => $invoice->total_amount - $invoice->paid_amount,
                'grandTotal' => $invoice->total_amount,
            ],
            'verifyUrl' => route('customer.finance.invoices.show', $invoice),
            'zraQrCode' => $invoice->zraSmartInvoice?->qr_code
                ? 'data:image/png;base64,' . $invoice->zraSmartInvoice->qr_code
                : null,
        ];
    }

    /**
     * Display quotation print view.
     */
    public function printQuotation(Quotation $quotation): Response
    {
        $user = Auth::user();
        $client = $user->client ?? $user->clients()->first();
        $billableType = $client ? get_class($client) : User::class;
        $billableId = $client ? $client->id : $user->id;

        // Ensure user can access this quotation
        if ($quotation->billable_type !== $billableType || $quotation->billable_id !== $billableId) {
            abort(403, 'Access denied.');
        }

        $quotation->load(['items']);

        // Build normalized print payload
        $payload = $this->buildQuotationPrintPayload($quotation, $client);

        return Inertia::render('Customer/Finance/Quotations/Print', ['quotation' => $payload]);
    }

    /**
     * Build normalized quotation print payload.
     */
    private function buildQuotationPrintPayload(Quotation $quotation, $client): array
    {
        $company = config('company');
        if (empty($company['logo'])) {
            $company['logo'] = '/logo.png';
        }

        return [
            'id' => $quotation->id,
            'quotationNumber' => $quotation->quotation_number,
            'issueDate' => $quotation->issue_date,
            'expiryDate' => $quotation->expiry_date,
            'currency' => $quotation->currency ?? 'ZMW',
            'status' => $quotation->status,
            'notes' => $quotation->notes,
            'terms' => $quotation->terms,
            'customer' => [
                'name' => $client?->name ?? $quotation->billable?->name,
                'email' => $client?->email ?? $quotation->billable?->email,
                'phone' => $client?->phone ?? $quotation->billable?->phone,
                'address' => $client?->address ?? $quotation->billable?->address,
            ],
            'company' => [
                'name' => $company['name'] ?? 'Company',
                'address' => $company['address'] ?? '',
                'city' => $company['city'] ?? '',
                'country' => $company['country'] ?? '',
                'taxNumber' => $company['tax_number'] ?? '',
                'phone' => $company['phone'] ?? '',
                'email' => $company['email'] ?? '',
                'website' => $company['website'] ?? '',
                'logoUrl' => $company['logo'],
                'bankName' => $company['bank']['name'] ?? '',
                'bankBranch' => $company['bank']['branch'] ?? '',
                'accountName' => $company['bank']['account_name'] ?? '',
                'accountNumber' => $company['bank']['account_number'] ?? '',
            ],
            'items' => collect($quotation->items)->map(fn($item) => [
                'id' => $item->id,
                'description' => $item->description,
                'quantity' => $item->quantity,
                'unitPrice' => $item->unit_price,
                'totalPrice' => $item->total_price,
            ])->toArray(),
            'totals' => [
                'subtotal' => $quotation->subtotal,
                'taxAmount' => $quotation->tax_amount,
                'discountAmount' => $quotation->discount_amount ?? 0,
                'grandTotal' => $quotation->total_amount,
            ],
            'verifyUrl' => route('customer.finance.quotations.show', $quotation),
        ];
    }

    /**
     * Display customer's payments.
     */

    public function payments(Request $request): Response
    {

        $user = Auth::user();
        $client = $user->client ?? $user->clients()->first();
        $billableType = $client ? get_class($client) : User::class;
        $billableId = $client ? $client->id : $user->id;

        $query = Payment::query()->whereHas('invoice', function ($q) use ($billableType, $billableId) {
                $q->where('billable_type', $billableType)->where('billable_id', $billableId);
            })
            ->with(['invoice', 'account']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('reference_number', 'like', '%' . $request->search . '%')
                  ->orWhereHas('invoice', function ($subQ) use ($request) {
                      $subQ->where('invoice_number', 'like', '%' . $request->search . '%');
                  });
            });
        }

        if ($request->filled('date_from')) {
            $query->where('payment_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('payment_date', '<=', $request->date_to);
        }


        $payments = $query->orderBy('created_at', 'desc')->paginate(20);

        // Map payments to include account type, name, and payment method as string
        $payments->getCollection()->transform(function ($payment) {
            return array_merge($payment->toArray(), [
                'account_type' => $payment->account->type ?? null,
                'account_name' => $payment->account->name ?? null,
                'payment_method' => $payment->payment_method,
            ]);
        });

        return Inertia::render('Customer/Finance/Payments/Index', [
            'payments' => $payments,
            'filters' => $request->only(['status', 'search', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Display the specified payment.
     */
    public function showPayment(Payment $payment): Response
    {

        $user = Auth::user();
        $client = $user->client ?? $user->clients()->first();
        $billableType = $client ? get_class($client) : User::class;
        $billableId = $client ? $client->id : $user->id;

        // Ensure user can access this payment
        if ($payment->invoice->billable_type !== $billableType || $payment->invoice->billable_id !== $billableId) {
            abort(403, 'Access denied.');
        }

        $payment->load(['invoice.billable', 'account']);

        return Inertia::render('Customer/Finance/Payments/Show', [
            'payment' => $payment,
        ]);
    }

    /**
     * Display customer's quotations.
     */
    public function quotations(Request $request): Response
    {

        $user = Auth::user();
        $client = $user->client ?? $user->clients()->first();
        $billableType = $client ? get_class($client) : User::class;
        $billableId = $client ? $client->id : $user->id;

        $query = Quotation::query()->where('billable_type', $billableType)->where('billable_id', $billableId)
            ->with(['items']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('quotation_number', 'like', '%' . $request->search . '%')
                  ->orWhere('title', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('date_from')) {
            $query->where('quotation_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('quotation_date', '<=', $request->date_to);
        }

        $quotations = $query->orderBy('created_at', 'desc')->paginate(20);

        // Map client/lead info for each quotation and ensure correct date fields for frontend
        $quotations->getCollection()->transform(function ($quotation) {
            $billable = $quotation->billable;
            $quotationArr = $quotation->toArray();
            $quotationArr['client'] = null;
            // Add valid_until and quotation_date for frontend compatibility
            $quotationArr['valid_until'] = $quotation->expiry_date ? $quotation->expiry_date->toDateString() : null;
            $quotationArr['quotation_date'] = $quotation->issue_date ? $quotation->issue_date->toDateString() : null;
            if ($billable) {
                $name = $billable->name ?? $billable->company ?? $billable->email ?? 'Client';
                $quotationArr['client'] = [
                    'name' => $name,
                    'email' => $billable->email ?? null,
                    'phone' => $billable->phone ?? null,
                    'address' => $billable->address ?? null,
                    'city' => $billable->city ?? null,
                    'state' => $billable->state ?? null,
                    'zip' => $billable->zip ?? ($billable->postal_code ?? null),
                    'country' => $billable->country ?? null,
                ];
            }
            return $quotationArr;
        });

        return Inertia::render('Customer/Finance/Quotations/Index', [
            'quotations' => $quotations,
            'filters' => $request->only(['status', 'search', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Display the specified quotation.
     */
    public function showQuotation(Quotation $quotation): Response
    {

        $user = Auth::user();
        $client = $user->client ?? $user->clients()->first();
        $billableType = $client ? get_class($client) : User::class;
        $billableId = $client ? $client->id : $user->id;

        // Ensure user can access this quotation
        if ($quotation->billable_type !== $billableType || $quotation->billable_id !== $billableId) {
            abort(403, 'Access denied.');
        }

        $quotation->load(['billable', 'items']);

        $company = [
            'name' => config('company.name'),
            'address' => config('company.address'),
            'city' => config('company.city'),
            'postal_code' => config('company.postal_code'),
            'country' => config('company.country'),
            'phone' => config('company.phone'),
            'email' => config('company.email'),
            'website' => config('company.website'),
            'tax_number' => config('company.tax_number'),
            'logo' => config('company.logo'),
        ];
        return Inertia::render('Customer/Finance/Quotations/Show', [
            'quotation' => $quotation,
            'company' => $company,
        ]);
    }

    /**
     * Accept a quotation.
     */
    public function acceptQuotation(Quotation $quotation)
    {

        $user = Auth::user();
        $client = $user->client ?? $user->clients()->first();
        $billableType = $client ? get_class($client) : User::class;
        $billableId = $client ? $client->id : $user->id;

        // Ensure user can access this quotation
        if ($quotation->billable_type !== $billableType || $quotation->billable_id !== $billableId) {
            abort(403, 'Access denied.');
        }

        if ($quotation->status !== 'sent') {
            return redirect()->back()->withErrors(['error' => 'This quotation cannot be accepted.']);
        }

        $quotation->update([
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Quotation accepted successfully!'
        ]);

        return redirect()->route('customer.finance.quotations.show', $quotation);
    }

    /**
     * Download quotation PDF.
     */
    public function downloadQuotation(Quotation $quotation)
    {

        $user = Auth::user();
        $client = $user->client ?? $user->clients()->first();
        $billableType = $client ? get_class($client) : User::class;
        $billableId = $client ? $client->id : $user->id;

        // Ensure user can access this quotation
        if ($quotation->billable_type !== $billableType || $quotation->billable_id !== $billableId) {
            abort(403, 'Access denied.');
        }
        // Prepare company info with logo fallback
        $company = config('company');
        if (empty($company['logo'])) {
            $company['logo'] = '/logo.png';
        }
        // Generate and return PDF using barryvdh/laravel-dompdf
        $pdf = Pdf::loadView('pdf.quotation', [
            'quotation' => $quotation,
            'company' => $company,
        ]);

        return $pdf->download('quotation-' . $quotation->quotation_number . '.pdf');
    }
}
