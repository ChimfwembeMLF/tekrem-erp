import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import {
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  TrendingUp,
  FileText,
  Settings,
  RefreshCw,
  Eye,
  BarChart3,
  Activity,
  DollarSign,
  Zap
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface ZraSmartInvoice {
  id: number;
  invoice_id: number;
  zra_reference?: string;
  submission_status: string;
  submitted_at?: string;
  approved_at?: string;
  invoice: {
    id: number;
    invoice_number: string;
    total_amount: number;
    currency: string;
    issue_date: string;
    billable?: {
      name: string;
    };
  };
  submitted_by?: {
    name: string;
  };
}

interface MonthlyTrend {
  month: string;
  count: number;
}

interface ZraConfiguration {
  id: number;
  environment: string;
  is_active: boolean;
  health_status: string;
}

interface Props {
  stats: {
    total: number;
    pending: number;
    submitted: number;
    approved: number;
    rejected: number;
    submitted_today: number;
    approved_this_month: number;
    rejection_rate: number;
    avg_processing_time: number;
  };
  recentInvoices: ZraSmartInvoice[];
  monthlyTrends: MonthlyTrend[];
  apiHealth: {
    success: boolean;
    status?: string;
    error?: string;
  };
  configuration?: ZraConfiguration;
}

export default function Dashboard({ stats, recentInvoices, monthlyTrends, apiHealth, configuration }: Props) {
  const { t } = useTranslate();
  const route = useRoute();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      submitted: { variant: 'default' as const, icon: RefreshCw, color: 'text-blue-600' },
      approved: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      rejected: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {t(`finance.zra.status.${status}`, status.replace('_', ' '))}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string = 'ZMW') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getHealthStatusBadge = () => {
    if (!apiHealth.success) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          {t('finance.zra.api_offline', 'API Offline')}
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        <CheckCircle className="h-3 w-3" />
        {t('finance.zra.api_online', 'API Online')}
      </Badge>
    );
  };

  return (
    <AppLayout
      title={t('finance.zra.dashboard', 'ZRA Dashboard')}
    >
      <Head title={t('finance.zra.dashboard', 'ZRA Dashboard')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {t('finance.zra.dashboard', 'ZRA Dashboard')}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('finance.zra.dashboard_description', 'Overview of ZRA Smart Invoice submissions and performance')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={route('finance.zra.configuration')}>
                <Settings className="h-4 w-4 mr-2" />
                {t('finance.zra.configuration', 'Configuration')}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={route('finance.zra.index')}>
                <FileText className="h-4 w-4 mr-2" />
                {t('finance.zra.view_all', 'View All')}
              </Link>
            </Button>
          </div>
        </div>

        {/* API Health Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {t('finance.zra.api_status', 'ZRA API Status')}
              </CardTitle>
              {getHealthStatusBadge()}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('finance.zra.environment', 'Environment')}: 
                  <span className="ml-1 font-medium">
                    {configuration?.environment || 'Not configured'}
                  </span>
                </p>
                {!apiHealth.success && apiHealth.error && (
                  <p className="text-sm text-red-600 mt-2">
                    {t('finance.zra.error', 'Error')}: {apiHealth.error}
                  </p>
                )}
              </div>
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t('finance.zra.test_connection', 'Test Connection')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.zra.total_submissions', 'Total Submissions')}
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.submitted_today} {t('finance.zra.submitted_today', 'submitted today')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.zra.approval_rate', 'Approval Rate')}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.approved_this_month} {t('finance.zra.approved_this_month', 'approved this month')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.zra.rejection_rate', 'Rejection Rate')}
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejection_rate}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.rejected} {t('finance.zra.total_rejected', 'total rejected')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.zra.avg_processing_time', 'Avg Processing Time')}
              </CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.avg_processing_time}h
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.pending} {t('finance.zra.currently_pending', 'currently pending')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Status Breakdown */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t('finance.zra.status_breakdown', 'Status Breakdown')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">{t('finance.zra.approved', 'Approved')}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{stats.approved}</div>
                    <div className="text-xs text-muted-foreground">
                      {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">{t('finance.zra.pending', 'Pending')}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-yellow-600">{stats.pending}</div>
                    <div className="text-xs text-muted-foreground">
                      {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">{t('finance.zra.submitted', 'Submitted')}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">{stats.submitted}</div>
                    <div className="text-xs text-muted-foreground">
                      {stats.total > 0 ? Math.round((stats.submitted / stats.total) * 100) : 0}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">{t('finance.zra.rejected', 'Rejected')}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">{stats.rejected}</div>
                    <div className="text-xs text-muted-foreground">
                      {stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}%
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t('finance.zra.monthly_trends', 'Monthly Submission Trends')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {monthlyTrends.map((trend, index) => (
                  <div key={trend.month} className="flex items-center justify-between">
                    <div className="text-sm font-medium">
                      {new Date(trend.month + '-01').toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-20 overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{ 
                            width: `${Math.max(10, (trend.count / Math.max(...monthlyTrends.map(t => t.count))) * 100)}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold w-8 text-right">{trend.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('finance.zra.recent_submissions', 'Recent Submissions')}
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href={route('finance.zra.index')}>
                  {t('finance.zra.view_all', 'View All')}
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentInvoices.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('finance.invoice_number', 'Invoice Number')}</TableHead>
                      <TableHead>{t('finance.client', 'Client')}</TableHead>
                      <TableHead>{t('finance.amount', 'Amount')}</TableHead>
                      <TableHead>{t('finance.zra.status', 'Status')}</TableHead>
                      <TableHead>{t('finance.zra.submitted_at', 'Submitted')}</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentInvoices.map((zraInvoice) => (
                      <TableRow key={zraInvoice.id}>
                        <TableCell>
                          <Link
                            href={route('finance.invoices.show', zraInvoice.invoice_id)}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {zraInvoice.invoice.invoice_number}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {zraInvoice.invoice.billable?.name || (
                            <span className="text-gray-400">No client</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(zraInvoice.invoice.total_amount, zraInvoice.invoice.currency)}
                        </TableCell>
                        <TableCell>{getStatusBadge(zraInvoice.submission_status)}</TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(zraInvoice.submitted_at)}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={route('finance.zra.show', zraInvoice.id)}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {t('finance.zra.no_recent_submissions', 'No Recent Submissions')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t('finance.zra.no_recent_submissions_description', 'There are no recent ZRA submissions to display.')}
                </p>
                <Button asChild>
                  <Link href={route('finance.invoices.index')}>
                    {t('finance.zra.create_invoice', 'Create Invoice')}
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}