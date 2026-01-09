<?php

namespace App\Http\Controllers\Modules;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BillingController extends Controller
{
    public function index(Request $request)
    {
        $company = app('currentCompany');
        // Module Billings
        $billingQuery = $company->moduleBillings()->with('module');
        if ($search = $request->input('search')) {
            $billingQuery->whereHas('module', function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('slug', 'like', "%$search%")
                  ->orWhere('description', 'like', "%$search%") ;
            });
        }
        if ($status = $request->input('status')) {
            $billingQuery->where('status', $status);
        }
        if ($method = $request->input('payment_method')) {
            $billingQuery->where('payment_method', $method);
        }
        if ($dateFrom = $request->input('date_from')) {
            $billingQuery->whereDate('billing_date', '>=', $dateFrom);
        }
        if ($dateTo = $request->input('date_to')) {
            $billingQuery->whereDate('billing_date', '<=', $dateTo);
        }
        $billings = $billingQuery->get();

        // Invoices
        $invoiceQuery = \App\Models\Finance\Invoice::where('billable_id', $company->id)
            ->where('billable_type', get_class($company));
        if ($search) {
            $invoiceQuery->where(function($q) use ($search) {
                $q->where('invoice_number', 'like', "%$search%")
                  ->orWhere('notes', 'like', "%$search%") ;
            });
        }
        if ($status) {
            $invoiceQuery->where('status', $status);
        }
        if ($dateFrom) {
            $invoiceQuery->whereDate('issue_date', '>=', $dateFrom);
        }
        if ($dateTo) {
            $invoiceQuery->whereDate('due_date', '<=', $dateTo);
        }
        $invoices = $invoiceQuery->get();

        // Merge and sort by date (descending)
        $merged = collect();
        foreach ($billings as $billing) {
            $merged->push([
                'id' => $billing->id,
                'type' => 'module_billing',
                'module_name' => $billing->module ? $billing->module->name : '',
                'amount' => $billing->amount,
                'currency' => $billing->currency,
                'status' => $billing->status,
                'billing_date' => $billing->billing_date,
                'due_date' => $billing->due_date,
                'payment_method' => $billing->payment_method,
            ]);
        }
        foreach ($invoices as $invoice) {
            $merged->push([
                'id' => $invoice->id,
                'type' => 'invoice',
                'invoice_number' => $invoice->invoice_number,
                'amount' => $invoice->total_amount,
                'currency' => $invoice->currency,
                'status' => $invoice->status,
                'billing_date' => $invoice->issue_date ? $invoice->issue_date->toDateString() : null,
                'due_date' => $invoice->due_date ? $invoice->due_date->toDateString() : null,
                'notes' => $invoice->notes,
                'payment_method' => null,
            ]);
        }
        $merged = $merged->sortByDesc(function($item) {
            return $item['billing_date'] ?? $item['due_date'] ?? null;
        })->values();

        return Inertia::render('Modules/Billing', [
            'billings' => [
                'data' => $merged,
                'total' => $merged->count(),
            ],
            'filters' => $request->only(['search', 'status', 'payment_method', 'date_from', 'date_to']),
            'statuses' => [
                'paid' => 'Paid',
                'pending' => 'Pending',
                'failed' => 'Failed',
                'draft' => 'Draft',
                'sent' => 'Sent',
                'overdue' => 'Overdue',
                'cancelled' => 'Cancelled',
            ],
            'paymentMethods' => [
                'credit_card' => 'Credit Card',
                'bank_transfer' => 'Bank Transfer',
            ],
        ]);
    }

    public function show($id)
    {
        // TODO: Fetch billing record by $id
        // Example stub
        $billing = [
            'id' => $id,
            'module_name' => 'CRM',
            'amount' => 100,
            'currency' => 'ZMW',
            'status' => 'paid',
            'billing_date' => '2026-01-01',
            'due_date' => '2026-01-10',
            'payment_method' => 'credit_card',
        ];
        return Inertia::render('Modules/BillingShow', [
            'billing' => $billing,
        ]);
    }

    public function create()
    {
        // TODO: Show create billing/payment form
        return Inertia::render('Modules/BillingCreate');
    }
}
