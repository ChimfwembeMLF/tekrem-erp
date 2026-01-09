<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Module;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;

class ModuleController extends Controller
{
    /**
     * List all available modules (marketplace).
     */
    public function index()
    {
        $modules = Module::where('is_active', true)->with(['addons' => function($q) {
            $q->where('is_active', true);
        }])->get();
        return Inertia::render('Modules/Marketplace',[
            'modules' => $modules
        ]);
    }

    /**
     * List modules purchased/activated by the current company.
     */
    public function companyModules()
    {
        $company = app('currentCompany');
        if (!$company) {
            abort(403, 'No company selected.');
        }
        $modules = $company->modules()->get();
        return Inertia::render('Modules/MyModules',[
            'modules' => $modules
        ]);
    }

    /**
     * Activate/purchase a module for the current company.
     */
    public function activate(Request $request, $moduleId)
    {
        $company = app('currentCompany');
        if (!$company) {
            abort(403, 'No company selected.');
        }
        $module = Module::findOrFail($moduleId);
        $company->modules()->syncWithoutDetaching([
            $module->id => [
                'activated_at' => now(),
                'status' => 'active',
            ]
        ]);

        return redirect()
            ->back()
            ->with('success', [
                'message' => 'Module activated for company.',
            ]);
    }

    /**
     * Deactivate a module for the current company.
     */
    public function deactivate(Request $request, $moduleId)
    {
        $company = app('currentCompany');
        if (!$company) {
            abort(403, 'No company selected.');
        }
        $company->modules()->updateExistingPivot($moduleId, [
            'status' => 'inactive',
            'expires_at' => now(),
        ]);
    
        return redirect()
            ->back()
            ->with('success', [
                'message' => 'Module deactivated for company.',
            ]);

    }

        /**
     * Show checkout page for a module (with add-ons selection).
     */
    public function checkout($moduleId)
    {
        $module = Module::where('is_active', true)
            ->with(['addons' => function($q) { $q->where('is_active', true); }])
            ->findOrFail($moduleId);

        // Fetch real billing accounts for the current user
        $user = Auth::user();
        $accounts = [];
        if ($user) {
            $accounts = \App\Models\Finance\Account::where('user_id', $user->id)
                ->where('is_active', true)
                ->get(['id', 'name', 'account_number', 'bank_name'])
                ->map(function($acc) {
                    return [
                        'id' => (string)$acc->id,
                        'name' => $acc->name,
                        'account_number' => $acc->account_number,
                        'bank_name' => $acc->bank_name,
                    ];
                });
        }

        return Inertia::render('Modules/Checkout', [
            'module' => $module,
            'addons' => $module->addons,
            'accounts' => $accounts,
        ]);
    }

        /**
     * Show details for a single module (with add-ons).
     */
    public function show($moduleId)
    {
        $module = Module::where('is_active', true)
            ->with(['addons' => function($q) { $q->where('is_active', true); }])
            ->findOrFail($moduleId);
        return Inertia::render('Modules/Details', [
            'module' => $module,
            'addons' => $module->addons,
        ]);
    }

    /**
     * Purchase a module for the current company (creates invoice and payment link).
     */
    public function purchase(Request $request, $moduleId)
    {
        $company = app('currentCompany');
        if (!$company) {
            abort(403, 'No company selected.');
        }
        $module = Module::findOrFail($moduleId);
        // Check if module is active
        if (!$module->is_active) {
            return redirect()->back()->with('error', [
                'message' => 'This module is inactive and cannot be purchased.',
            ]);
        }
        // Check if module is expired (if applicable)
        if (isset($module->expires_at) && $module->expires_at && $module->expires_at < now()) {
            return redirect()->back()->with('error', [
                'message' => 'This module is expired and cannot be purchased.',
            ]);
        }
        $addonIds = $request->input('addons', []);
        $addons = $module->addons()->whereIn('id', $addonIds)->get();

        // Check for active or unexpired module of the same type
        $activeModule = $company->modules()
            ->where('modules.id', $moduleId)
            ->where(function($q) {
                $q->where('company_modules.status', 'active')
                  ->orWhere(function($q2) {
                      $q2->where('company_modules.expires_at', '>', now());
                  });
            })
            ->first();
        if ($activeModule) {
            return redirect()->back()->with('error', [
                'message' => 'You already have an active or unexpired module of this type. Purchase is not allowed.',
            ]);
        }

        // Prevent multiple draft invoices for the same module
        $existingDraftInvoice = \App\Models\Finance\Invoice::where('billable_id', $company->id)
            ->where('billable_type', get_class($company))
            ->where('status', 'draft')
            ->where('notes', 'like', '%Module purchase: ' . $module->name . '%')
            ->first();
        if ($existingDraftInvoice) {
            return redirect()->back()->with('error', [
                'message' => 'A draft invoice for this module already exists. Please complete or delete the existing draft before creating a new one.',
            ]);
        }

        // Calculate totals
        $subtotal = $module->price + $addons->sum('price');

        // Create invoice for this module purchase
        $invoice = new \App\Models\Finance\Invoice([
            'invoice_number' => \App\Models\Finance\Invoice::generateInvoiceNumber(),
            'status' => 'draft',
            'issue_date' => now(),
            'due_date' => now()->addDays(7),
            'subtotal' => $subtotal,
            'tax_amount' => 0,
            'discount_amount' => 0,
            'total_amount' => $subtotal,
            'paid_amount' => 0,
            'currency' => 'ZMW',
            'notes' => 'Module purchase: ' . $module->name,
            'terms' => 'Due on receipt',
            'billable_id' => $company->id,
            'billable_type' => get_class($company),
            'user_id' => Auth::id(),
            'billing_account_id' => $request->input('billing_account_id'),
        ]);
        $invoice->save();

        // Add invoice item for module
        $invoice->items()->create([
            'module_id' => $module->id,
            'description' => $module->name . ' module',
            'quantity' => 1,
            'unit_price' => $module->price,
            'total_price' => $module->price,
            'tax_rate' => 0,
            'discount_rate' => 0,
        ]);
        // Add invoice items for add-ons
        foreach ($addons as $addon) {
            $invoice->items()->create([
                'addon_id' => $addon->id,
                'description' => $addon->name . ' add-on',
                'quantity' => 1,
                'unit_price' => $addon->price,
                'total_price' => $addon->price,
                'tax_rate' => 0,
                'discount_rate' => 0,
            ]);
        }

        // Create module billing record for billing module
        \App\Models\ModuleBilling::create([
            'company_id' => $company->id,
            'module_id' => $module->id,
            'amount' => $module->price,
            'currency' => 'ZMW',
            'status' => 'pending',
            'billing_date' => now()->toDateString(),
            'due_date' => now()->addDays(7)->toDateString(),
            'payment_method' => null,
        ]);

        // Optionally: trigger payment link generation here
        // $paymentLink = ...

        return redirect()
            ->back()
            ->with('success', [
                'message' => 'Invoice created for module purchase.',
                'invoice_id' => $invoice->id,
                // 'payment_link' => $paymentLink,
            ]);
    }
}
