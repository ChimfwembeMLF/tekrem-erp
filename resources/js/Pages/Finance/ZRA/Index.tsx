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
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  RefreshCw,
  XCircle,
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Download,
  Calendar
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

interface ZraSmartInvoice {
  id: number;
  invoice_id: number;
  zra_reference?: string;
  submission_status: string;
  submitted_at?: string;
  approved_at?: string;
  rejected_at?: string;
  retry_count: number;
  is_test_mode: boolean;
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

interface Props {
  zraInvoices: {
    data: ZraSmartInvoice[];
    links: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  stats: {
    total: number;
    pending: number;
    submitted: number;
    approved: number;
    rejected: number;
  };
  filters: {
    status?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
  };
}

export default function Index({ zraInvoices, stats, filters }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('finance.zra.index'), {
      ...filters,
      search: searchTerm,
    });
  };

  const handleFilter = (key: string, value: string) => {
    router.get(route('finance.zra.index'), {
      ...filters,
      [key]: value === 'all' ? '' : value,
    });
  };

  const handleResubmit = (invoiceId: number) => {
    router.post(route('finance.zra.resubmit', invoiceId), {}, {
      onSuccess: () => {
        toast.success(t('finance.zra.resubmission_started', 'ZRA resubmission started'));
      },
      onError: () => {
        toast.error(t('common.error_occurred', 'An error occurred'));
      },
    });
  };

  const handleCancel = (invoiceId: number) => {
    if (confirm(t('finance.zra.confirm_cancel', 'Are you sure you want to cancel this ZRA submission?'))) {
      router.post(route('finance.zra.cancel', invoiceId), {}, {
        onSuccess: () => {
          toast.success(t('finance.zra.cancelled', 'ZRA submission cancelled'));
        },
        onError: () => {
          toast.error(t('common.error_occurred', 'An error occurred'));
        },
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      submitted: { variant: 'default' as const, icon: RefreshCw, color: 'text-blue-600' },
      approved: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      rejected: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      cancelled: { variant: 'secondary' as const, icon: XCircle, color: 'text-gray-600' },
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

  return (
    <AppLayout
      title={t('finance.zra.title', 'ZRA Smart Invoices')}
      breadcrumbs={[
        { label: t('finance.title', 'Finance'), href: '/finance' },
        { label: t('finance.zra.title', 'ZRA Smart Invoices') },
      ]}
    >
      <Head title={t('finance.zra.title', 'ZRA Smart Invoices')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {t('finance.zra.title', 'ZRA Smart Invoices')}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('finance.zra.description', 'Manage ZRA Smart Invoice submissions and compliance')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('common.refresh', 'Refresh')}
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.zra.total_submissions', 'Total Submissions')}
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.zra.pending', 'Pending')}
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.zra.submitted', 'Submitted')}
              </CardTitle>
              <RefreshCw className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.submitted}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.zra.approved', 'Approved')}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.zra.rejected', 'Rejected')}
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <form onSubmit={handleSearch} className="lg:col-span-2">
                <div className="flex gap-2">
                  <Input
                    placeholder={t('finance.zra.search_placeholder', 'Search invoices, references...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </form>

              <Select value={filters.status || 'all'} onValueChange={(value) => handleFilter('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('finance.zra.all_statuses', 'All Statuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('finance.zra.all_statuses', 'All Statuses')}</SelectItem>
                  <SelectItem value="pending">{t('finance.zra.status.pending', 'Pending')}</SelectItem>
                  <SelectItem value="submitted">{t('finance.zra.status.submitted', 'Submitted')}</SelectItem>
                  <SelectItem value="approved">{t('finance.zra.status.approved', 'Approved')}</SelectItem>
                  <SelectItem value="rejected">{t('finance.zra.status.rejected', 'Rejected')}</SelectItem>
                  <SelectItem value="cancelled">{t('finance.zra.status.cancelled', 'Cancelled')}</SelectItem>
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

        {/* ZRA Invoices Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {t('finance.zra.smart_invoices', 'ZRA Smart Invoices')}
              </CardTitle>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {zraInvoices.from}-{zraInvoices.to} of {zraInvoices.total}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('finance.invoice_number', 'Invoice Number')}</TableHead>
                    <TableHead>{t('finance.zra.reference', 'ZRA Reference')}</TableHead>
                    <TableHead>{t('finance.client', 'Client')}</TableHead>
                    <TableHead>{t('finance.amount', 'Amount')}</TableHead>
                    <TableHead>{t('finance.zra.status', 'Status')}</TableHead>
                    <TableHead>{t('finance.zra.submitted_at', 'Submitted')}</TableHead>
                    <TableHead>{t('finance.zra.retry_count', 'Retries')}</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {zraInvoices.data.map((zraInvoice) => (
                    <TableRow key={zraInvoice.id}>
                      <TableCell>
                        <div>
                          <Link
                            href={route('finance.invoices.show', zraInvoice.invoice_id)}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {zraInvoice.invoice.invoice_number}
                          </Link>
                          {zraInvoice.is_test_mode && (
                            <Badge variant="outline" className="ml-2 text-xs text-orange-600 border-orange-600">
                              Test
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {zraInvoice.zra_reference ? (
                          <span className="font-mono text-sm">{zraInvoice.zra_reference}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
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
                        <div>
                          <div>{formatDate(zraInvoice.submitted_at)}</div>
                          {zraInvoice.submitted_by && (
                            <div className="text-xs text-gray-500">by {zraInvoice.submitted_by.name}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {zraInvoice.retry_count > 0 ? (
                          <Badge variant="outline" className="text-orange-600 border-orange-600">
                            {zraInvoice.retry_count}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={route('finance.zra.show', zraInvoice.id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                {t('finance.zra.view_details', 'View Details')}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={route('finance.invoices.show', zraInvoice.invoice_id)}>
                                <FileText className="h-4 w-4 mr-2" />
                                {t('finance.view_invoice', 'View Invoice')}
                              </Link>
                            </DropdownMenuItem>
                            {(zraInvoice.submission_status === 'rejected' || zraInvoice.submission_status === 'cancelled') && (
                              <DropdownMenuItem onClick={() => handleResubmit(zraInvoice.invoice_id)}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                {t('finance.zra.resubmit', 'Resubmit')}
                              </DropdownMenuItem>
                            )}
                            {(zraInvoice.submission_status === 'pending' || zraInvoice.submission_status === 'submitted') && (
                              <DropdownMenuItem 
                                onClick={() => handleCancel(zraInvoice.invoice_id)}
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                {t('finance.zra.cancel', 'Cancel')}
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
            {zraInvoices.links && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {zraInvoices.from} to {zraInvoices.to} of {zraInvoices.total} results
                </div>
                <div className="flex gap-2">
                  {zraInvoices.links.map((link, index) => (
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
