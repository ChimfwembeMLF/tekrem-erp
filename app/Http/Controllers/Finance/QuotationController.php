<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Finance\Quotation;
use App\Models\Lead;
use App\Models\Client;
use App\Services\PdfService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class QuotationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Quotation::with(['billable', 'user'])
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('quotation_number', 'like', "%{$search}%")
                  ->orWhereHas('billable', function ($billableQuery) use ($search) {
                      $billableQuery->where('name', 'like', "%{$search}%");
                      if (method_exists($billableQuery->getModel(), 'company')) {
                          $billableQuery->orWhere('company', 'like', "%{$search}%");
                      }
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('billable_id')) {
            $query->where('billable_id', $request->billable_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('issue_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('issue_date', '<=', $request->date_to);
        }

        // Check for expired quotations and update status
        Quotation::where('expiry_date', '<', now())
            ->whereIn('status', ['draft', 'sent'])
            ->update(['status' => 'expired']);

        $quotations = $query->paginate(15)->withQueryString();

        $clients = Client::where('user_id', auth()->id())->orderBy('name')->get(['id', 'name']);
        $leads = Lead::where('user_id', auth()->id())->orderBy('name')->get(['id', 'name', 'company']);

        $statuses = [
            'draft' => 'Draft',
            'sent' => 'Sent',
            'accepted' => 'Accepted',
            'rejected' => 'Rejected',
            'expired' => 'Expired'
        ];

        return Inertia::render('Finance/Quotations/Index', [
            'quotations' => $quotations,
            'clients' => $clients,
            'leads' => $leads,
            'statuses' => $statuses,
            'filters' => $request->only(['search', 'status', 'billable_id', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        // Get all active clients for selection
        // $clients = Client::where('user_id', auth()->id())
        $clients = Client::where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        // $leads = Lead::where('user_id', auth()->id())
        $leads = Lead::where('converted_to_client', false)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'company']);

        $currencies = [
            'USD' => 'US Dollar',
            'EUR' => 'Euro',
            'GBP' => 'British Pound',
            'CAD' => 'Canadian Dollar',
            'AUD' => 'Australian Dollar',
            'JPY' => 'Japanese Yen',
            'ZMW' => 'Zambian Kwacha',
        ];

        $statuses = [
            'draft' => 'Draft',
            'sent' => 'Sent'
        ];

        // Pre-select lead if provided
        $selectedLead = null;
        if ($request->filled('lead')) {
            $selectedLead = Lead::where('user_id', auth()->id())
                ->where('id', $request->lead)
                ->first();
        }

        return Inertia::render('Finance/Quotations/Create', [
            'clients' => $clients,
            'leads' => $leads,
            'currencies' => $currencies,
            'statuses' => $statuses,
            'selectedLead' => $selectedLead,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'billable_type' => 'required|string|in:client,lead',
            'billable_id' => 'required|integer',
            'issue_date' => 'required|date',
            'expiry_date' => 'required|date|after:issue_date',
            'currency' => 'required|string|max:3',
            'status' => 'required|in:draft,sent',
            'notes' => 'nullable|string',
            'terms' => 'nullable|string',
            'tax_rate' => 'required|numeric|min:0|max:100',
            'discount_amount' => 'required|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Verify billable entity ownership


        if ($request->billable_type === 'client') {
            $billable = Client::where('id', $request->billable_id)->first();
            $billableClass = Client::class;
        } else {
            $billable = Lead::where('id', $request->billable_id)
                ->where('user_id', auth()->id())
                ->first();
            $billableClass = Lead::class;
        }

        if (!$billable) {
            return back()->withErrors(['billable_id' => 'Invalid billable entity selected.'])->withInput();
        }

        DB::transaction(function () use ($request, $billableClass) {
            // Calculate totals
            $subtotal = 0;
            foreach ($request->items as $item) {
                $subtotal += $item['quantity'] * $item['unit_price'];
            }

            $taxAmount = ($subtotal * $request->tax_rate) / 100;
            $totalAmount = $subtotal + $taxAmount - $request->discount_amount;

            // Create quotation
            $quotation = Quotation::create([
                'status' => $request->status,
                'issue_date' => $request->issue_date,
                'expiry_date' => $request->expiry_date,
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'discount_amount' => $request->discount_amount,
                'total_amount' => $totalAmount,
                'currency' => $request->currency,
                'notes' => $request->notes,
                'terms' => $request->terms,
                'billable_id' => $request->billable_id,
                'billable_type' => $billableClass,
                'user_id' => auth()->id(),
            ]);

            // Create quotation items
            foreach ($request->items as $item) {
                $quotation->items()->create([
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['quantity'] * $item['unit_price'],
                ]);
            }
        });

        return redirect()->route('finance.quotations.index')
            ->with('success', 'Quotation created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Quotation $quotation)
    {
        // Ensure user can only view their own quotations
        if ($quotation->user_id !== auth()->id()) {
            abort(403);
        }

        $quotation->load(['billable', 'items', 'convertedToInvoice']);

        // Check if quotation is expired and update status
        $quotation->checkAndUpdateExpiry();

        return Inertia::render('Finance/Quotations/Show', [
            'quotation' => $quotation,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Quotation $quotation)
    {
        // Ensure user can only edit their own quotations
        if ($quotation->user_id !== auth()->id()) {
            abort(403);
        }

        // Only allow editing of draft and sent quotations
        if (!in_array($quotation->status, ['draft', 'sent'])) {
            return redirect()->route('finance.quotations.show', $quotation)
                ->with('error', 'Only draft and sent quotations can be edited.');
        }

        $quotation->load(['billable', 'items']);

        // Get leads that are not converted to clients yet
        $clients = Client::where('user_id', auth()->id())
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        $leads = Lead::where('user_id', auth()->id())
            ->where('converted_to_client', false)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'company']);

        $currencies = [
            'USD' => 'US Dollar',
            'EUR' => 'Euro',
            'GBP' => 'British Pound',
            'CAD' => 'Canadian Dollar',
            'AUD' => 'Australian Dollar',
            'JPY' => 'Japanese Yen',
            'ZMW' => 'Zambian Kwacha',
        ];

        $statuses = [
            'draft' => 'Draft',
            'sent' => 'Sent'
        ];

        return Inertia::render('Finance/Quotations/Edit', [
            'quotation' => $quotation,
            'leads' => $leads,
            'currencies' => $currencies,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Quotation $quotation)
    {
        // Ensure user can only update their own quotations
        if ($quotation->user_id !== auth()->id()) {
            abort(403);
        }

        // Only allow updating of draft and sent quotations
        if (!in_array($quotation->status, ['draft', 'sent'])) {
            return back()->with('error', 'Only draft and sent quotations can be updated.');
        }

        $validator = Validator::make($request->all(), [
            'billable_type' => 'required|string|in:client,lead',
            'billable_id' => 'required|integer',
            'issue_date' => 'required|date',
            'expiry_date' => 'required|date|after:issue_date',
            'currency' => 'required|string|max:3',
            'status' => 'required|in:draft,sent',
            'notes' => 'nullable|string',
            'terms' => 'nullable|string',
            'tax_rate' => 'required|numeric|min:0|max:100',
            'discount_amount' => 'required|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Verify billable entity ownership
        $billableClass = $request->billable_type === 'client' ? Client::class : Lead::class;
        $billable = $billableClass::where('id', $request->billable_id)
            ->where('user_id', auth()->id())
            ->first();

        if (!$billable) {
            return back()->withErrors(['billable_id' => 'Invalid billable entity selected.'])->withInput();
        }

        DB::transaction(function () use ($request, $quotation, $billableClass) {
            // Calculate totals
            $subtotal = 0;
            foreach ($request->items as $item) {
                $subtotal += $item['quantity'] * $item['unit_price'];
            }

            $taxAmount = ($subtotal * $request->tax_rate) / 100;
            $totalAmount = $subtotal + $taxAmount - $request->discount_amount;

            // Update quotation
            $quotation->update([
                'status' => $request->status,
                'issue_date' => $request->issue_date,
                'expiry_date' => $request->expiry_date,
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'discount_amount' => $request->discount_amount,
                'total_amount' => $totalAmount,
                'currency' => $request->currency,
                'notes' => $request->notes,
                'terms' => $request->terms,
                'billable_id' => $request->billable_id,
                'billable_type' => $billableClass,
            ]);

            // Delete existing items and create new ones
            $quotation->items()->delete();
            foreach ($request->items as $item) {
                $quotation->items()->create([
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['quantity'] * $item['unit_price'],
                ]);
            }
        });

        return redirect()->route('finance.quotations.show', $quotation)
            ->with('success', 'Quotation updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Quotation $quotation)
    {
        // Ensure user can only delete their own quotations
        if ($quotation->user_id !== auth()->id()) {
            abort(403);
        }

        // Only allow deletion of draft quotations
        if ($quotation->status !== 'draft') {
            return back()->with('error', 'Only draft quotations can be deleted.');
        }

        $quotation->delete();

        return redirect()->route('finance.quotations.index')
            ->with('success', 'Quotation deleted successfully.');
    }

    /**
     * Send the quotation to the lead.
     */
    public function send(Quotation $quotation)
    {
        // Ensure user can only send their own quotations
        if ($quotation->user_id !== auth()->id()) {
            abort(403);
        }

        // Only allow sending of draft quotations
        if ($quotation->status !== 'draft') {
            return back()->with('error', 'Only draft quotations can be sent.');
        }

        $quotation->update(['status' => 'sent']);

        // TODO: Implement email sending logic here
        // Mail::to($quotation->lead->email)->send(new QuotationSent($quotation));

        return back()->with('success', 'Quotation sent successfully.');
    }

    /**
     * Accept the quotation.
     */
    public function accept(Quotation $quotation)
    {
        // Ensure user can only accept their own quotations
        if ($quotation->user_id !== auth()->id()) {
            abort(403);
        }

        // Only allow accepting of sent quotations
        if ($quotation->status !== 'sent') {
            return back()->with('error', 'Only sent quotations can be accepted.');
        }

        $quotation->update(['status' => 'accepted']);

        return back()->with('success', 'Quotation accepted successfully.');
    }

    /**
     * Reject the quotation.
     */
    public function reject(Quotation $quotation)
    {
        // Ensure user can only reject their own quotations
        if ($quotation->user_id !== auth()->id()) {
            abort(403);
        }

        // Only allow rejecting of sent quotations
        if ($quotation->status !== 'sent') {
            return back()->with('error', 'Only sent quotations can be rejected.');
        }

        $quotation->update(['status' => 'rejected']);

        return back()->with('success', 'Quotation rejected.');
    }

    /**
     * Convert quotation to invoice.
     */
    public function convertToInvoice(Request $request, Quotation $quotation)
    {
        // Ensure user can only convert their own quotations
        if ($quotation->user_id !== auth()->id()) {
            abort(403);
        }

        if (!$quotation->can_convert_to_invoice) {
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Quotation cannot be converted to invoice.',
                ], 422);
            }

            return back()->with('error', 'Quotation cannot be converted to invoice.');
        }

        try {
            $invoice = $quotation->convertToInvoice();

            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Quotation converted to invoice successfully.',
                    'redirect_url' => route('finance.invoices.show', $invoice),
                    'invoice_id' => $invoice->id,
                ]);
            }

            return redirect()->route('finance.invoices.show', $invoice)
                ->with('success', 'Quotation converted to invoice successfully.');
        } catch (\Exception $e) {
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage(),
                ], 422);
            }

            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Display quotation print view.
     */
    public function print(Quotation $quotation)
    {
        // Ensure user can only view their own quotations
        if ($quotation->user_id !== auth()->id()) {
            abort(403);
        }

        $quotation->load(['billable', 'items']);
        $company = config('company');
        if (empty($company['logo'])) {
            $company['logo'] = '/logo.png';
        }

        // Build normalized print payload
        $payload = $this->buildQuotationPrintPayload($quotation);

        return Inertia::render('Finance/Quotations/Print', ['quotation' => $payload]);
    }

    /**
     * Build normalized quotation print payload.
     */
    private function buildQuotationPrintPayload(Quotation $quotation): array
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
                'name' => $quotation->billable?->name,
                'email' => $quotation->billable?->email,
                'phone' => $quotation->billable?->phone,
                'address' => $quotation->billable?->address,
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
        ];
    }

    /**
     * Generate PDF for the quotation.
     */
    public function pdf(Quotation $quotation, PdfService $pdfService)
    {
        // Ensure user can only view their own quotations
        if ($quotation->user_id !== auth()->id()) {
            abort(403);
        }

        return $pdfService->generateQuotationPdf($quotation, request()->has('download'));
    }
}
