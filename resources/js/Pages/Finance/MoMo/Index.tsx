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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  RefreshCw,
  Smartphone,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  Settings
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

interface MomoTransaction {
  id: number;
  transaction_number: string;
  provider: {
    id: number;
    display_name: string;
    provider_code: string;
  };
  type: string;
  status: string;
  amount: number;
  currency: string;
  phone_number: string;
  description: string;
  created_at: string;
  updated_at: string;
  invoice?: {
    id: number;
    invoice_number: string;
  };
}

interface MomoProvider {
  id: number;
  display_name: string;
  provider_code: string;
  is_active: boolean;
}

interface Props {
  transactions: {
    data: MomoTransaction[];
    links: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  providers: MomoProvider[];
  filters: {
    provider_id?: string;
    status?: string;
    type?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
  };
}

export default function Index({ transactions, providers, filters }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('finance.momo.index'), {
      ...filters,
      search: searchTerm,
    });
  };

  const handleFilter = (key: string, value: string) => {
    router.get(route('finance.momo.index'), {
      ...filters,
      [key]: value === 'all' ? '' : value,
    });
  };

  const handleCheckStatus = (transactionId: number) => {
    router.post(route('finance.momo.check-status', transactionId), {}, {
      onSuccess: () => {
        toast.success(t('finance.momo.status_checked', 'Transaction status updated'));
      },
      onError: () => {
        toast.error(t('common.error_occurred', 'An error occurred'));
      },
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      processing: { variant: 'secondary' as const, icon: RefreshCw, color: 'text-blue-600' },
      completed: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      failed: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      cancelled: { variant: 'outline' as const, icon: XCircle, color: 'text-gray-600' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {t(`finance.momo.status.${status}`, status)}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      payment: { variant: 'default' as const, color: 'text-green-600' },
      payout: { variant: 'secondary' as const, color: 'text-blue-600' },
      refund: { variant: 'outline' as const, color: 'text-orange-600' },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.payment;

    return (
      <Badge variant={config.variant}>
        {t(`finance.momo.type.${type}`, type)}
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

  return (
    <AppLayout
      title={t('finance.momo.title', 'Mobile Money')}
      breadcrumbs={[
        { label: t('finance.title', 'Finance'), href: '/finance' },
        { label: t('finance.momo.title', 'Mobile Money') },
      ]}
    >
      <Head title={t('finance.momo.title', 'Mobile Money')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {t('finance.momo.title', 'Mobile Money')}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('finance.momo.description', 'Manage mobile money transactions and payouts')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={route('finance.momo.providers')}>
                <Settings className="h-4 w-4" />
                {t('finance.momo.providers', 'Providers')}
              </Link>
            </Button>
            <Button asChild>
              <Link href={route('finance.momo.create')}>
                <Plus className="h-4 w-4" />
                {t('finance.momo.new_transaction', 'New Transaction')}
              </Link>
            </Button>
          </div>
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
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
                  <SelectItem value="pending">{t('finance.momo.status.pending', 'Pending')}</SelectItem>
                  <SelectItem value="processing">{t('finance.momo.status.processing', 'Processing')}</SelectItem>
                  <SelectItem value="completed">{t('finance.momo.status.completed', 'Completed')}</SelectItem>
                  <SelectItem value="failed">{t('finance.momo.status.failed', 'Failed')}</SelectItem>
                  <SelectItem value="cancelled">{t('finance.momo.status.cancelled', 'Cancelled')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.type || 'all'} onValueChange={(value) => handleFilter('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('finance.momo.all_types', 'All Types')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('finance.momo.all_types', 'All Types')}</SelectItem>
                  <SelectItem value="payment">{t('finance.momo.type.payment', 'Payment')}</SelectItem>
                  <SelectItem value="payout">{t('finance.momo.type.payout', 'Payout')}</SelectItem>
                  <SelectItem value="refund">{t('finance.momo.type.refund', 'Refund')}</SelectItem>
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

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                {t('finance.momo.transactions', 'Transactions')}
              </CardTitle>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {transactions.from}-{transactions.to} of {transactions.total}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('finance.momo.transaction_number', 'Transaction #')}</TableHead>
                    <TableHead>{t('finance.momo.provider', 'Provider')}</TableHead>
                    <TableHead>{t('finance.momo.type', 'Type')}</TableHead>
                    <TableHead>{t('finance.momo.phone_number', 'Phone')}</TableHead>
                    <TableHead>{t('finance.momo.amount', 'Amount')}</TableHead>
                    <TableHead>{t('finance.momo.status', 'Status')}</TableHead>
                    <TableHead>{t('finance.momo.date', 'Date')}</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.data.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{transaction.transaction_number}</div>
                          {transaction.invoice && (
                            <div className="text-xs text-gray-500">
                              Invoice: {transaction.invoice.invoice_number}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-medium">
                            {transaction.provider.provider_code}
                          </div>
                          {transaction.provider.display_name}
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                      <TableCell className="font-mono text-sm">{transaction.phone_number}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(transaction.created_at)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={route('finance.momo.show', transaction.id)}>
                                <Eye className="h-4 w-4" />
                                {t('common.view', 'View')}
                              </Link>
                            </DropdownMenuItem>
                            {transaction.status === 'pending' && (
                              <DropdownMenuItem onClick={() => handleCheckStatus(transaction.id)}>
                                <RefreshCw className="h-4 w-4" />
                                {t('finance.momo.check_status', 'Check Status')}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {transactions.links && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {transactions.from} to {transactions.to} of {transactions.total} results
                </div>
                <div className="flex gap-2">
                  {transactions.links.map((link, index) => (
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
