import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { 
  FileText, 
  ArrowLeft, 
  Download, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  FileCheck,
  Clock
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Report {
  id: number;
  name: string;
  description?: string;
  type: string;
  status: string;
  parameters?: any;
  generated_at?: string;
  file_path?: string;
  file_size?: number;
  created_by?: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

interface Props {
  report: Report;
}

export default function Show({ report }: Props) {
  const { t } = useTranslate();
  const route = useRoute();

  const handleDelete = () => {
    if (confirm(t('common.confirm_delete', 'Are you sure you want to delete this item?'))) {
      router.delete(route('finance.reports.destroy', report.id));
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReportTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'income_statement': 'Income Statement',
      'cash_flow': 'Cash Flow',
      'balance_sheet': 'Balance Sheet',
      'expense_report': 'Expense Report',
      'budget_analysis': 'Budget Analysis',
      'tax_report': 'Tax Report',
      'chart_of_accounts': 'Chart of Accounts',
      'trial_balance': 'Trial Balance',
      'account_activity': 'Account Activity Report',
      'bank_reconciliation': 'Bank Reconciliation Report',
      'reconciliation_summary': 'Reconciliation Summary',
      'unreconciled_transactions': 'Unreconciled Transactions',
    };
    return types[type] || type;
  };

  return (
    <AppLayout title={report.name}>
      <Head title={report.name} />

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

          <div className="space-y-6">
            {/* Report Header */}
            <Card>
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <FileText className="h-8 w-8 text-blue-600 mt-1" />
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{report.name}</h1>
                      {report.description && (
                        <p className="text-gray-600 mt-1">{report.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                        <Badge variant="secondary">
                          {getReportTypeLabel(report.type)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {report.file_path && report.status === 'available' && (
                      <Link href={route('finance.reports.download', report.id)}>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          {t('finance.download', 'Download')}
                        </Button>
                      </Link>
                    )}
                    <Link href={route('finance.reports.edit', report.id)}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        {t('common.edit', 'Edit')}
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-800">
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('common.delete', 'Delete')}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Report Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Report Information */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">{t('finance.report_information', 'Report Information')}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <FileCheck className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">{t('finance.report_type', 'Report Type')}</p>
                        <p className="font-medium">{getReportTypeLabel(report.type)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">{t('finance.status', 'Status')}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </div>
                    </div>

                    {report.file_size && (
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">{t('finance.file_size', 'File Size')}</p>
                          <p className="font-medium">{formatFileSize(report.file_size)}</p>
                        </div>
                      </div>
                    )}

                    {report.generated_at && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">{t('finance.generated_at', 'Generated At')}</p>
                          <p className="font-medium">{new Date(report.generated_at).toLocaleString()}</p>
                        </div>
                      </div>
                    )}

                    {report.created_by && (
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">{t('finance.created_by', 'Created By')}</p>
                          <p className="font-medium">{report.created_by.name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Timeline */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">{t('finance.timeline', 'Timeline')}</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        <div className="w-px h-8 bg-gray-300"></div>
                      </div>
                      <div>
                        <p className="font-medium">{t('finance.report_created', 'Report Created')}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(report.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {report.generated_at && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                          <div className="w-px h-8 bg-gray-300"></div>
                        </div>
                        <div>
                          <p className="font-medium">{t('finance.report_generated', 'Report Generated')}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(report.generated_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      </div>
                      <div>
                        <p className="font-medium">{t('finance.last_updated', 'Last Updated')}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(report.updated_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Report Parameters (if any) */}
            {report.parameters && Object.keys(report.parameters).length > 0 && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">{t('finance.report_parameters', 'Report Parameters')}</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(report.parameters, null, 2)}
                    </pre>
                  </div>
                </div>
              </Card>
            )}

            {/* Report Type Description */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">{t('finance.about_this_report', 'About This Report')}</h3>
                <div className="text-gray-700">
                  {report.type === 'income_statement' && (
                    <p>This Income Statement shows the company's revenue, expenses, and profit/loss for a specific period. It provides insights into the operational performance and profitability of the business.</p>
                  )}
                  {report.type === 'cash_flow' && (
                    <p>This Cash Flow Statement displays cash inflows and outflows from operating, investing, and financing activities. It helps track the actual movement of cash in and out of the business.</p>
                  )}
                  {report.type === 'balance_sheet' && (
                    <p>This Balance Sheet presents the company's assets, liabilities, and equity at a specific point in time. It provides a snapshot of the company's financial position.</p>
                  )}
                  {report.type === 'expense_report' && (
                    <p>This Expense Report provides a detailed breakdown of all expenses by category and account. It helps analyze spending patterns and identify cost-saving opportunities.</p>
                  )}
                  {report.type === 'budget_analysis' && (
                    <p>This Budget Analysis compares actual financial performance against budgeted amounts, showing variances and helping with future planning and decision-making.</p>
                  )}
                  {report.type === 'tax_report' && (
                    <p>This Tax Report summarizes all tax-related transactions and calculations, helping with tax preparation and compliance requirements.</p>
                  )}
                  {report.type === 'chart_of_accounts' && (
                    <p>This Chart of Accounts report provides a complete listing of all accounts with their current balances and hierarchical structure.</p>
                  )}
                  {report.type === 'trial_balance' && (
                    <p>This Trial Balance lists all account balances to verify that debits equal credits, ensuring the books are in balance.</p>
                  )}
                  {report.type === 'reconciliation_summary' && (
                    <p>This Reconciliation Summary provides an overview of all reconciliation activities, their status, and any discrepancies that need attention.</p>
                  )}
                  {report.type === 'unreconciled_transactions' && (
                    <p>This report lists all transactions that require reconciliation attention, helping maintain accurate financial records.</p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}