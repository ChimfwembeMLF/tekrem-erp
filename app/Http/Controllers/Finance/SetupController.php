<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SetupController extends Controller
{
    /**
     * Display the Finance module setup page.
     */
    public function index(): Response
    {
        $this->authorize('manage-finance-settings');

        return Inertia::render('Finance/Setup/Index', [
            'generalSettings' => $this->getGeneralSettings(),
            'invoiceSettings' => $this->getInvoiceSettings(),
            'paymentSettings' => $this->getPaymentSettings(),
            'taxSettings' => $this->getTaxSettings(),
            'budgetSettings' => $this->getBudgetSettings(),
            'reportingSettings' => $this->getReportingSettings(),
        ]);
    }

    /**
     * Update general finance settings.
     */
    public function updateGeneral(Request $request)
    {
        $this->authorize('manage-finance-settings');

        $validated = $request->validate([
            'default_currency' => 'required|string|max:3',
            'currency_symbol' => 'required|string|max:5',
            'decimal_places' => 'required|integer|min:0|max:4',
            'thousand_separator' => 'required|string|max:1',
            'decimal_separator' => 'required|string|max:1',
            'fiscal_year_start' => 'required|string',
            'enable_multi_currency' => 'boolean',
            'auto_currency_conversion' => 'boolean',
            'enable_financial_analytics' => 'boolean',
            'enable_budget_tracking' => 'boolean',
            'enable_expense_approval' => 'boolean',
            'enable_ai_categorization' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            Setting::setForCompany("finance.general.{$key}", $value, currentCompanyId());
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'General finance settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update invoice settings.
     */
    public function updateInvoice(Request $request)
    {
        $this->authorize('manage-finance-settings');

        $validated = $request->validate([
            'invoice_number_format' => 'required|string|max:50',
            'invoice_prefix' => 'nullable|string|max:10',
            'auto_generate_numbers' => 'boolean',
            'default_payment_terms' => 'required|string|max:100',
            'default_due_days' => 'required|integer|min:1|max:365',
            'late_fee_enabled' => 'boolean',
            'late_fee_percentage' => 'nullable|numeric|min:0|max:100',
            'late_fee_amount' => 'nullable|numeric|min:0',
            'auto_send_invoices' => 'boolean',
            'auto_send_reminders' => 'boolean',
            'reminder_days_before' => 'nullable|integer|min:1|max:90',
            'reminder_days_after' => 'nullable|integer|min:1|max:90',
            'enable_online_payments' => 'boolean',
            'enable_partial_payments' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            Setting::setForCompany("finance.invoice.{$key}", $value, currentCompanyId());
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Invoice settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update payment settings.
     */
    public function updatePayment(Request $request)
    {
        $this->authorize('manage-finance-settings');

        $validated = $request->validate([
            'enable_stripe' => 'boolean',
            'enable_paypal' => 'boolean',
            'enable_bank_transfer' => 'boolean',
            'enable_cash_payments' => 'boolean',
            'enable_check_payments' => 'boolean',
            'auto_reconcile_payments' => 'boolean',
            'payment_confirmation_required' => 'boolean',
            'enable_payment_analytics' => 'boolean',
            'default_payment_method' => 'required|string|max:50',
            'payment_processing_fee' => 'nullable|numeric|min:0|max:100',
            'minimum_payment_amount' => 'nullable|numeric|min:0',
        ]);

        foreach ($validated as $key => $value) {
            Setting::setForCompany("finance.payment.{$key}", $value, currentCompanyId());
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Payment settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update tax settings.
     */
    public function updateTax(Request $request)
    {
        $this->authorize('manage-finance-settings');

        $validated = $request->validate([
            'enable_tax_calculation' => 'boolean',
            'default_tax_rate' => 'required|numeric|min:0|max:100',
            'tax_inclusive_pricing' => 'boolean',
            'enable_multiple_tax_rates' => 'boolean',
            'enable_tax_exemptions' => 'boolean',
            'auto_calculate_tax' => 'boolean',
            'tax_rounding_method' => 'required|in:round,floor,ceil',
            'enable_tax_reporting' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            Setting::setForCompany("finance.tax.{$key}", $value, currentCompanyId());
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Tax settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update budget settings.
     */
    public function updateBudget(Request $request)
    {
        $this->authorize('manage-finance-settings');

        $validated = $request->validate([
            'enable_budget_management' => 'boolean',
            'budget_period' => 'required|in:monthly,quarterly,annually',
            'enable_budget_alerts' => 'boolean',
            'budget_alert_threshold' => 'nullable|integer|min:1|max:100',
            'enable_budget_approval' => 'boolean',
            'auto_create_budgets' => 'boolean',
            'enable_budget_forecasting' => 'boolean',
            'enable_variance_analysis' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            Setting::setForCompany("finance.budget.{$key}", $value, currentCompanyId());
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Budget settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update reporting settings.
     */
    public function updateReporting(Request $request)
    {
        $this->authorize('manage-finance-settings');

        $validated = $request->validate([
            'enable_financial_reports' => 'boolean',
            'auto_generate_reports' => 'boolean',
            'report_frequency' => 'required|in:daily,weekly,monthly,quarterly',
            'enable_profit_loss' => 'boolean',
            'enable_balance_sheet' => 'boolean',
            'enable_cash_flow' => 'boolean',
            'enable_expense_reports' => 'boolean',
            'enable_revenue_reports' => 'boolean',
            'enable_tax_reports' => 'boolean',
            'report_retention_months' => 'required|integer|min:1|max:120',
        ]);

        foreach ($validated as $key => $value) {
            Setting::setForCompany("finance.reporting.{$key}", $value, currentCompanyId());
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Reporting settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Get general settings.
     */
    private function getGeneralSettings(): array
    {
        return [
            'default_currency' => Setting::getForCompany('finance.general.default_currency', 'ZMW', currentCompanyId()),
            'currency_symbol' => Setting::getForCompany('finance.general.currency_symbol', '$', currentCompanyId()),
            'decimal_places' => Setting::getForCompany('finance.general.decimal_places', 2, currentCompanyId()),
            'thousand_separator' => Setting::getForCompany('finance.general.thousand_separator', ',', currentCompanyId()),
            'decimal_separator' => Setting::getForCompany('finance.general.decimal_separator', '.', currentCompanyId()),
            'fiscal_year_start' => Setting::getForCompany('finance.general.fiscal_year_start', '01-01', currentCompanyId()),
            'enable_multi_currency' => Setting::getForCompany('finance.general.enable_multi_currency', false, currentCompanyId()),
            'auto_currency_conversion' => Setting::getForCompany('finance.general.auto_currency_conversion', false, currentCompanyId()),
            'enable_financial_analytics' => Setting::getForCompany('finance.general.enable_financial_analytics', true, currentCompanyId()),
            'enable_budget_tracking' => Setting::getForCompany('finance.general.enable_budget_tracking', true, currentCompanyId()),
            'enable_expense_approval' => Setting::getForCompany('finance.general.enable_expense_approval', true, currentCompanyId()),
            'enable_ai_categorization' => Setting::getForCompany('finance.general.enable_ai_categorization', true, currentCompanyId()),
        ];
    }

    /**
     * Get invoice settings.
     */
    private function getInvoiceSettings(): array
    {
        return [
            'invoice_number_format' => Setting::getForCompany('finance.invoice.invoice_number_format', 'INV-{YYYY}-{####}', currentCompanyId()),
            'invoice_prefix' => Setting::getForCompany('finance.invoice.invoice_prefix', 'INV', currentCompanyId()),
            'auto_generate_numbers' => Setting::getForCompany('finance.invoice.auto_generate_numbers', true, currentCompanyId()),
            'default_payment_terms' => Setting::getForCompany('finance.invoice.default_payment_terms', 'Net 30', currentCompanyId()),
            'default_due_days' => Setting::getForCompany('finance.invoice.default_due_days', 30, currentCompanyId()),
            'late_fee_enabled' => Setting::getForCompany('finance.invoice.late_fee_enabled', false, currentCompanyId()),
            'late_fee_percentage' => Setting::getForCompany('finance.invoice.late_fee_percentage', 5, currentCompanyId()),
            'late_fee_amount' => Setting::getForCompany('finance.invoice.late_fee_amount', 0, currentCompanyId()),
            'auto_send_invoices' => Setting::getForCompany('finance.invoice.auto_send_invoices', false, currentCompanyId()),
            'auto_send_reminders' => Setting::getForCompany('finance.invoice.auto_send_reminders', true, currentCompanyId()),
            'reminder_days_before' => Setting::getForCompany('finance.invoice.reminder_days_before', 3, currentCompanyId()),
            'reminder_days_after' => Setting::getForCompany('finance.invoice.reminder_days_after', 7, currentCompanyId()),
            'enable_online_payments' => Setting::getForCompany('finance.invoice.enable_online_payments', true, currentCompanyId()),
            'enable_partial_payments' => Setting::getForCompany('finance.invoice.enable_partial_payments', true, currentCompanyId()),
        ];
    }

    /**
     * Get payment settings.
     */
    private function getPaymentSettings(): array
    {
        return [
            'enable_stripe' => Setting::getForCompany('finance.payment.enable_stripe', false, currentCompanyId()),
            'enable_paypal' => Setting::getForCompany('finance.payment.enable_paypal', false, currentCompanyId()),
            'enable_bank_transfer' => Setting::getForCompany('finance.payment.enable_bank_transfer', true, currentCompanyId()),
            'enable_cash_payments' => Setting::getForCompany('finance.payment.enable_cash_payments', true, currentCompanyId()),
            'enable_check_payments' => Setting::getForCompany('finance.payment.enable_check_payments', true, currentCompanyId()),
            'auto_reconcile_payments' => Setting::getForCompany('finance.payment.auto_reconcile_payments', false, currentCompanyId()),
            'payment_confirmation_required' => Setting::getForCompany('finance.payment.payment_confirmation_required', true, currentCompanyId()),
            'enable_payment_analytics' => Setting::getForCompany('finance.payment.enable_payment_analytics', true, currentCompanyId()),
            'default_payment_method' => Setting::getForCompany('finance.payment.default_payment_method', 'bank_transfer', currentCompanyId()),
            'payment_processing_fee' => Setting::getForCompany('finance.payment.payment_processing_fee', 0, currentCompanyId()),
            'minimum_payment_amount' => Setting::getForCompany('finance.payment.minimum_payment_amount', 1, currentCompanyId()),
        ];
    }

    /**
     * Get tax settings.
     */
    private function getTaxSettings(): array
    {
        return [
            'enable_tax_calculation' => Setting::getForCompany('finance.tax.enable_tax_calculation', true, currentCompanyId()),
            'default_tax_rate' => Setting::getForCompany('finance.tax.default_tax_rate', 10, currentCompanyId()),
            'tax_inclusive_pricing' => Setting::getForCompany('finance.tax.tax_inclusive_pricing', false, currentCompanyId()),
            'enable_multiple_tax_rates' => Setting::getForCompany('finance.tax.enable_multiple_tax_rates', false, currentCompanyId()),
            'enable_tax_exemptions' => Setting::getForCompany('finance.tax.enable_tax_exemptions', true, currentCompanyId()),
            'auto_calculate_tax' => Setting::getForCompany('finance.tax.auto_calculate_tax', true, currentCompanyId()),
            'tax_rounding_method' => Setting::getForCompany('finance.tax.tax_rounding_method', 'round', currentCompanyId()),
            'enable_tax_reporting' => Setting::getForCompany('finance.tax.enable_tax_reporting', true, currentCompanyId()),
        ];
    }

    /**
     * Get budget settings.
     */
    private function getBudgetSettings(): array
    {
        return [
            'enable_budget_management' => Setting::getForCompany('finance.budget.enable_budget_management', true, currentCompanyId()),
            'budget_period' => Setting::getForCompany('finance.budget.budget_period', 'monthly', currentCompanyId()),
            'enable_budget_alerts' => Setting::getForCompany('finance.budget.enable_budget_alerts', true, currentCompanyId()),
            'budget_alert_threshold' => Setting::getForCompany('finance.budget.budget_alert_threshold', 80, currentCompanyId()),
            'enable_budget_approval' => Setting::getForCompany('finance.budget.enable_budget_approval', true, currentCompanyId()),
            'auto_create_budgets' => Setting::getForCompany('finance.budget.auto_create_budgets', false, currentCompanyId()),
            'enable_budget_forecasting' => Setting::getForCompany('finance.budget.enable_budget_forecasting', true, currentCompanyId()),
            'enable_variance_analysis' => Setting::getForCompany('finance.budget.enable_variance_analysis', true, currentCompanyId()),
        ];
    }

    /**
     * Get reporting settings.
     */
    private function getReportingSettings(): array
    {
        return [
            'enable_financial_reports' => Setting::getForCompany('finance.reporting.enable_financial_reports', true, currentCompanyId()),
            'auto_generate_reports' => Setting::getForCompany('finance.reporting.auto_generate_reports', false, currentCompanyId()),
            'report_frequency' => Setting::getForCompany('finance.reporting.report_frequency', 'monthly', currentCompanyId()),
            'enable_profit_loss' => Setting::getForCompany('finance.reporting.enable_profit_loss', true, currentCompanyId()),
            'enable_balance_sheet' => Setting::getForCompany('finance.reporting.enable_balance_sheet', true, currentCompanyId()),
            'enable_cash_flow' => Setting::getForCompany('finance.reporting.enable_cash_flow', true, currentCompanyId()),
            'enable_expense_reports' => Setting::getForCompany('finance.reporting.enable_expense_reports', true, currentCompanyId()),
            'enable_revenue_reports' => Setting::getForCompany('finance.reporting.enable_revenue_reports', true, currentCompanyId()),
            'enable_tax_reports' => Setting::getForCompany('finance.reporting.enable_tax_reports', true, currentCompanyId()),
            'report_retention_months' => Setting::getForCompany('finance.reporting.report_retention_months', 24, currentCompanyId()),
        ];
    }
}
