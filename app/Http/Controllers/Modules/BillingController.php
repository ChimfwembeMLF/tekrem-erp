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
        // Only Module Billings, include invoice info
        $billingQuery = $company->moduleBillings()->with(['module', 'invoice']);
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

        $data = $billings->map(function($billing) {
            return [
                'id' => $billing->id,
                'module_name' => $billing->module ? $billing->module->name : '',
                'invoice_id' => $billing->invoice ? $billing->invoice->id : null,
                'invoice_number' => $billing->invoice ? $billing->invoice->invoice_number : null,
                'amount' => $billing->amount,
                'currency' => $billing->currency,
                'status' => $billing->status,
                'billing_date' => $billing->billing_date,
                'due_date' => $billing->due_date,
                'payment_method' => $billing->payment_method,
            ];
        })->sortByDesc('billing_date')->values();

        return Inertia::render('Modules/Billing', [
            'billings' => [
                'data' => $data,
                'total' => $data->count(),
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
        $company = app('currentCompany');
        $billing = $company->moduleBillings()
            ->with(['module', 'invoice', 'user'])
            ->findOrFail($id);

        $billingData = [
            'id' => $billing->id,
            'module_name' => $billing->module ? $billing->module->name : '',
            'module_details' => $billing->module ? [
                'description' => $billing->module->description ?? '',
                'features' => $billing->module->features ?? [],
            ] : null,
            'invoice_id' => $billing->invoice ? $billing->invoice->id : null,
            'invoice_number' => $billing->invoice ? $billing->invoice->invoice_number : null,
            'invoice_link' => $billing->invoice ? route('finance.invoices.show', $billing->invoice->id) : null,
            'amount' => $billing->amount,
            'currency' => $billing->currency,
            'status' => $billing->status,
            'billing_date' => $billing->billing_date,
            'due_date' => $billing->due_date,
            'payment_method' => $billing->payment_method,
            'notes' => $billing->notes ?? '',
            'company' => [
                'id' => $company->id,
                'name' => $company->name,
            ],
            'user' => $billing->user ? [
                'id' => $billing->user->id,
                'name' => $billing->user->name,
                'email' => $billing->user->email,
            ] : null,
            'transaction_id' => $billing->transaction_id ?? null,
            'attachments' => $billing->attachments ?? [],
            'history' => $billing->history ?? [],
            'refund_status' => $billing->refund_status ?? null,
        ];
        return Inertia::render('Modules/BillingShow', [
            'billing' => $billingData,
        ]);
    }

    public function create()
    {
        // TODO: Show create billing/payment form
        return Inertia::render('Modules/BillingCreate');
    }
}
