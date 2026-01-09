import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
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
  FileText,
  Calendar,
  CreditCard,
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';
import { TooltipProvider } from '@/Components/ui/tooltip';

interface ModuleBillingItem {
  id: number;
  module_name?: string;
  invoice_id?: number;
  invoice_number?: string;
  amount: number;
  currency: string;
  status: string;
  billing_date: string;
  due_date: string;
  payment_method?: string | null;
  notes?: string;
}

interface Props {
  billings: {
    data: ModuleBillingItem[];
    total: number;
  };
  filters: {
    search?: string;
    status?: string;
    payment_method?: string;
    date_from?: string;
    date_to?: string;
  };
  statuses: Record<string, string>;
  paymentMethods: Record<string, string>;
}

export default function Billing({ billings, filters, statuses, paymentMethods }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [search, setSearch] = useState(filters.search || '');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
  const [selectedMethod, setSelectedMethod] = useState(filters.payment_method || 'all');
  const [dateFrom, setDateFrom] = useState(filters.date_from || '');
  const [dateTo, setDateTo] = useState(filters.date_to || '');

  const handleSearch = () => {
    router.get(route('modules.billing'), {
      search,
      status: selectedStatus === 'all' ? '' : selectedStatus,
      payment_method: selectedMethod === 'all' ? '' : selectedMethod,
      date_from: dateFrom,
      date_to: dateTo,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleReset = () => {
    setSearch('');
    setSelectedStatus('all');
    setSelectedMethod('all');
    setDateFrom('');
    setDateTo('');
    router.get(route('modules.billing'), {}, {
      preserveState: true,
      replace: true,
    });
  };

  const formatCurrency = (amount: number, currency: string = 'ZMW') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    if (!status) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1 text-gray-400">
          <XCircle className="h-3 w-3" />
          Unknown
        </Badge>
      );
    }
    const statusConfig = {
      paid: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      pending: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      failed: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.color}`}>
        <Icon className="h-3 w-3" />
        {typeof status === 'string' ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
      </Badge>
    );
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard className="h-4 w-4" />;
      case 'bank_transfer':
        return <Receipt className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    if (type === 'invoice') return 'Invoice';
    if (type === 'module_billing') return 'Module Billing';
    return 'Other';
  };

  return (
    <TooltipProvider>
      <AppLayout title={t('modules.billing', 'Billing')}>
        <Head title={t('modules.billing', 'Billing')} />
        <div className="py-12">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
                <div>
                  <CardTitle>{t('modules.billing', 'Billing')}</CardTitle>
                  <CardDescription>
                    {t('modules.billing_description', 'View and manage your module billing and payments')}
                  </CardDescription>
                </div>
                <Link href={route('admin.modules.billing.create')}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('modules.record_payment', 'Record Payment')}
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
                  <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-2 flex-1">
                    <Input
                      type="text"
                      placeholder={t('modules.billing_search', 'Search billing...')}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" variant="outline">
                      <Search className="h-4 w-4" />
                    </Button>
                  </form>
                  <Button variant="ghost" onClick={handleReset}>
                    <Filter className="h-4 w-4 mr-2" />
                    {t('common.reset', 'Reset')}
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('modules.billing_status', 'Status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('modules.billing_method', 'Payment Method')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    placeholder={t('common.date_from', 'Date From')}
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                  <Input
                    type="date"
                    placeholder={t('common.date_to', 'Date To')}
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Module/Invoice</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Billing Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(billings.data) ? billings.data : []).map((item) => (
                        <tr key={item.id} className="">
                          <td className="px-4 py-2 font-medium">{item.module_name}</td>
                          <td className="px-4 py-2 font-medium">
                            {item.invoice_id ? (
                              <Link href={route('finance.invoices.show', item.invoice_id)} className="text-blue-600 hover:underline">
                                #{item.invoice_number}
                              </Link>
                            ) : (
                              <span className="text-xs text-gray-400">No Invoice</span>
                            )}
                          </td>
                          <td className="px-4 py-2">{formatCurrency(item.amount, item.currency)}</td>
                          <td className="px-4 py-2">{getStatusBadge(item.status)}</td>
                          <td className="px-4 py-2">{item.billing_date}</td>
                          <td className="px-4 py-2">{item.due_date}</td>
                          <td className="px-4 py-2 flex items-center gap-2">
                            {getMethodIcon(item.payment_method || '')}
                            {item.payment_method ? item.payment_method.replace('_', ' ') : ''}
                          </td>
                          <td className="px-4 py-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={route('admin.modules.billing.show', item.id)}>
                                    <Eye className="h-4 w-4 mr-2" /> View Details
                                  </Link>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  Showing {billings.data.length} of {billings.total} results
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    </TooltipProvider>
  );
}
