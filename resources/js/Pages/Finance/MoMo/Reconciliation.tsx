import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/Components/ui/tabs';
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Upload,
  Search,
  Filter,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

interface ReconciliationItem {
  id: number;
  transaction_id?: number;
  provider_transaction_id: string;
  provider_reference?: string;
  amount: number;
  currency: string;
  status: 'matched' | 'unmatched' | 'disputed';
  discrepancy_type?: 'amount_mismatch' | 'status_mismatch' | 'missing_transaction' | 'duplicate';
  discrepancy_amount?: number;
  provider_status: string;
  internal_status: string;
  transaction_date: string;
  reconciled_at?: string;
  notes?: string;
  transaction?: {
    id: number;
    transaction_number: string;
    phone_number: string;
    description: string;
  };
}

interface ReconciliationSummary {
  total_transactions: number;
  matched_transactions: number;
  unmatched_transactions: number;
  disputed_transactions: number;
  total_amount: number;
  matched_amount: number;
  discrepancy_amount: number;
  reconciliation_rate: number;
}

interface Props {
  reconciliation_items: {
    data: ReconciliationItem[];
    links: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  summary: ReconciliationSummary;
  providers: Array<{
    id: number;
    display_name: string;
    provider_code: string;
  }>;
  filters: {
    provider_id?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
  };
}

export default function Reconciliation({ reconciliation_items, summary, providers, filters }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('finance.momo.reconciliation'), {
      ...filters,
      search: searchTerm,
    });
  };

  const handleFilter = (key: string, value: string) => {
    router.get(route('finance.momo.reconciliation'), {
      ...filters,
      [key]: value === 'all' ? '' : value,
    });
  };

  const handleRunReconciliation = () => {
    router.post(route('finance.momo.reconciliation.run'), {}, {
      onSuccess: () => {
        toast.success(t('finance.momo.reconciliation_started', 'Reconciliation process started'));
      },
      onError: () => {
        toast.error(t('common.error_occurred', 'An error occurred'));
      },
    });
  };

  const handleResolveDiscrepancy = (itemId: number) => {
    router.post(route('finance.momo.reconciliation.resolve', itemId), {}, {
      onSuccess: () => {
        toast.success(t('finance.momo.discrepancy_resolved', 'Discrepancy resolved'));
      },
      onError: () => {
        toast.error(t('common.error_occurred', 'An error occurred'));
      },
    });
  };

  const handleExportReport = () => {
    window.open(route('finance.momo.reconciliation.export', filters), '_blank');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      matched: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      unmatched: { variant: 'secondary' as const, icon: Minus, color: 'text-gray-600' },
      disputed: { variant: 'destructive' as const, icon: AlertTriangle, color: 'text-red-600' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unmatched;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {t(`finance.momo.reconciliation.${status}`, status)}
      </Badge>
    );
  };

  const getDiscrepancyBadge = (type?: string) => {
    if (!type) return null;

    const typeConfig = {
      amount_mismatch: { variant: 'destructive' as const, color: 'text-red-600' },
      status_mismatch: { variant: 'secondary' as const, color: 'text-yellow-600' },
      missing_transaction: { variant: 'outline' as const, color: 'text-gray-600' },
      duplicate: { variant: 'secondary' as const, color: 'text-blue-600' },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.missing_transaction;

    return (
      <Badge variant={config.variant} className="text-xs">
        {t(`finance.momo.discrepancy.${type}`, type.replace('_', ' '))}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string = 'ZMW') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <AppLayout
      title={t('finance.momo.reconciliation', 'Mobile Money Reconciliation')}
      breadcrumbs={[
        { label: t('finance.title', 'Finance'), href: '/finance' },
        { label: t('finance.momo.title', 'Mobile Money'), href: '/finance/momo' },
        { label: t('finance.momo.reconciliation', 'Reconciliation') },
      ]}
    >
      <Head title={t('finance.momo.reconciliation', 'Mobile Money Reconciliation')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href={route('finance.momo.index')}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {t('finance.momo.reconciliation', 'Mobile Money Reconciliation')}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('finance.momo.reconciliation_description', 'Reconcile transactions with provider records')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportReport}>
              <Download className="h-4 w-4" />
              {t('finance.momo.export_report', 'Export Report')}
            </Button>
            <Button onClick={handleRunReconciliation}>
              <RefreshCw className="h-4 w-4" />
              {t('finance.momo.run_reconciliation', 'Run Reconciliation')}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.momo.total_transactions', 'Total Transactions')}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_transactions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(summary.total_amount)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.momo.matched_transactions', 'Matched')}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.matched_transactions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(summary.matched_amount)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.momo.unmatched_transactions', 'Unmatched')}
              </CardTitle>
              <Minus className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{summary.unmatched_transactions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage((summary.unmatched_transactions / summary.total_transactions) * 100)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.momo.reconciliation_rate', 'Reconciliation Rate')}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatPercentage(summary.reconciliation_rate)}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.discrepancy_amount > 0 && (
                  <span className="text-red-600">
                    {formatCurrency(summary.discrepancy_amount)} discrepancy
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {t('common.filters', 'Filters')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <form onSubmit={handleSearch} className="lg:col-span-2">
                <div className="flex gap-2">
                  <Input
                    placeholder={t('finance.momo.search_placeholder', 'Search transactions...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </form>

              <Select value={filters.provider_id || 'all'} onValueChange={(value) => handleFilter('provider_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('finance.momo.all_providers', 'All Providers')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('finance.momo.all_providers', 'All Providers')}</SelectItem>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id.toString()}>
                      {provider.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.status || 'all'} onValueChange={(value) => handleFilter('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('finance.momo.all_statuses', 'All Statuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('finance.momo.all_statuses', 'All Statuses')}</SelectItem>
                  <SelectItem value="matched">{t('finance.momo.reconciliation.matched', 'Matched')}</SelectItem>
                  <SelectItem value="unmatched">{t('finance.momo.reconciliation.unmatched', 'Unmatched')}</SelectItem>
                  <SelectItem value="disputed">{t('finance.momo.reconciliation.disputed', 'Disputed')}</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                placeholder={t('common.date_from', 'Date From')}
                value={filters.date_from || ''}
                onChange={(e) => handleFilter('date_from', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Reconciliation Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                {t('finance.momo.reconciliation_items', 'Reconciliation Items')}
              </CardTitle>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {reconciliation_items.from}-{reconciliation_items.to} of {reconciliation_items.total}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('finance.momo.provider_reference', 'Provider Ref')}</TableHead>
                    <TableHead>{t('finance.momo.internal_transaction', 'Internal Transaction')}</TableHead>
                    <TableHead>{t('finance.momo.amount', 'Amount')}</TableHead>
                    <TableHead>{t('finance.momo.status_comparison', 'Status Comparison')}</TableHead>
                    <TableHead>{t('finance.momo.reconciliation_status', 'Reconciliation')}</TableHead>
                    <TableHead>{t('finance.momo.discrepancy', 'Discrepancy')}</TableHead>
                    <TableHead>{t('finance.momo.date', 'Date')}</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reconciliation_items.data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-mono text-sm">{item.provider_transaction_id}</div>
                          {item.provider_reference && (
                            <div className="text-xs text-gray-500">{item.provider_reference}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.transaction ? (
                          <div>
                            <Link
                              href={route('finance.momo.show', item.transaction.id)}
                              className="font-medium text-blue-600 hover:underline"
                            >
                              {item.transaction.transaction_number}
                            </Link>
                            <div className="text-xs text-gray-500">{item.transaction.phone_number}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No match</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatCurrency(item.amount, item.currency)}</div>
                          {item.discrepancy_amount && item.discrepancy_amount !== 0 && (
                            <div className="text-xs text-red-600">
                              Δ {formatCurrency(item.discrepancy_amount, item.currency)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-xs">
                            <span className="text-gray-500">Provider:</span> {item.provider_status}
                          </div>
                          <div className="text-xs">
                            <span className="text-gray-500">Internal:</span> {item.internal_status}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        {getDiscrepancyBadge(item.discrepancy_type)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(item.transaction_date)}
                      </TableCell>
                      <TableCell>
                        {item.status === 'disputed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResolveDiscrepancy(item.id)}
                          >
                            {t('finance.momo.resolve', 'Resolve')}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {reconciliation_items.links && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {reconciliation_items.from} to {reconciliation_items.to} of {reconciliation_items.total} results
                </div>
                <div className="flex gap-2">
                  {reconciliation_items.links.map((link, index) => (
                    <Button
                      key={index}
                      variant={link.active ? 'default' : 'outline'}
                      size="sm"
                      disabled={!link.url}
                      onClick={() => link.url && router.get(link.url)}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
