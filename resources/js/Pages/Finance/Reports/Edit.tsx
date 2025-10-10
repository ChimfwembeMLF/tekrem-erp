import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { FileText, ArrowLeft } from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Report {
  id: number;
  name: string;
  description?: string;
  type: string;
  status: string;
}

interface Props {
  report: Report;
  types: Record<string, string>;
}

export default function Edit({ report, types }: Props) {
  const { t } = useTranslate();
  const route = useRoute();

  const { data, setData, put, processing, errors } = useForm({
    name: report.name || '',
    description: report.description || '',
    type: report.type || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('finance.reports.update', report.id));
  };

  return (
    <AppLayout title={t('finance.edit_report', 'Edit Report')}>
      <Head title={t('finance.edit_report', 'Edit Report')} />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link href={route('finance.reports.index')}>
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.back_to_reports', 'Back to Reports')}
              </Button>
            </Link>
          </div>

          <Card>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="h-6 w-6 text-blue-600" />
                <div>
                  <h1 className="text-xl font-semibold">{t('finance.edit_report', 'Edit Report')}</h1>
                  <p className="text-gray-600">
                    {t('finance.edit_report_description', 'Update report details')}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Report Name */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      {t('finance.report_name', 'Report Name')} *
                    </label>
                    <Input
                      id="name"
                      type="text"
                      value={data.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)}
                      placeholder={t('finance.enter_report_name', 'Enter report name')}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Report Type */}
                  <div className="space-y-2">
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                      {t('finance.report_type', 'Report Type')} *
                    </label>
                    <select
                      id="type"
                      value={data.type}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setData('type', e.target.value)}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.type ? 'border-red-500' : ''}`}
                    >
                      <option value="">{t('finance.select_report_type', 'Select report type')}</option>
                      {Object.entries(types).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    {errors.type && (
                      <p className="text-sm text-red-600">{errors.type}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    {t('common.description', 'Description')}
                  </label>
                  <textarea
                    id="description"
                    value={data.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                    placeholder={t('finance.enter_report_description', 'Enter report description (optional)')}
                    rows={3}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-500' : ''}`}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                {/* Current Status */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {t('finance.current_status', 'Current Status')}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      report.status === 'available' ? 'bg-green-100 text-green-800' :
                      report.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      report.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {report.status}
                    </span>
                    <span className="text-sm text-gray-600">
                      Report ID: #{report.id}
                    </span>
                  </div>
                </div>

                {/* Report Type Info */}
                {data.type && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">
                      {types[data.type]}
                    </h4>
                    <p className="text-sm text-blue-700">
                      {data.type === 'income_statement' && 
                        'Shows revenue, expenses, and profit/loss for the selected period.'}
                      {data.type === 'cash_flow' && 
                        'Displays cash inflows and outflows from operating, investing, and financing activities.'}
                      {data.type === 'balance_sheet' && 
                        'Presents assets, liabilities, and equity at the end date.'}
                      {data.type === 'expense_report' && 
                        'Detailed breakdown of expenses by category and account.'}
                      {data.type === 'budget_analysis' && 
                        'Compares actual vs budgeted amounts for the period.'}
                      {data.type === 'tax_report' && 
                        'Summary of tax-related transactions and calculations.'}
                      {data.type === 'chart_of_accounts' && 
                        'Complete listing of all accounts with balances.'}
                      {data.type === 'trial_balance' && 
                        'Lists all account balances to verify debits equal credits.'}
                      {data.type === 'account_activity' && 
                        'Detailed transaction history for selected accounts.'}
                      {data.type === 'bank_reconciliation' && 
                        'Shows differences between bank statements and book records.'}
                      {data.type === 'reconciliation_summary' && 
                        'Overview of all reconciliation activities and status.'}
                      {data.type === 'unreconciled_transactions' && 
                        'Lists transactions that need reconciliation attention.'}
                    </p>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <Link href={route('finance.reports.index')}>
                    <Button variant="outline">
                      {t('common.cancel', 'Cancel')}
                    </Button>
                  </Link>
                  <Button type="submit" disabled={processing}>
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('finance.updating_report', 'Updating...')}
                      </>
                    ) : (
                      t('finance.update_report', 'Update Report')
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}