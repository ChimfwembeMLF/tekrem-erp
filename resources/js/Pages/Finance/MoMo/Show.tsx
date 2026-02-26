import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import {
  ArrowLeft,
  RefreshCw,
  Smartphone,
  DollarSign,
  User,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Copy,
  ExternalLink,
  Activity
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

interface MomoWebhook {
  id: number;
  event_type: string;
  status: string;
  payload: any;
  response_status: number;
  created_at: string;
}

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
  customer_name?: string;
  customer_email?: string;
  provider_transaction_id?: string;
  provider_reference?: string;
  fee_amount?: number;
  callback_url?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  processed_at?: string;
  failed_at?: string;
  error_message?: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  invoice?: {
    id: number;
    invoice_number: string;
    total_amount: number;
  };
  webhooks: MomoWebhook[];
}

interface Props {
  transaction: MomoTransaction;
}

export default function Show({ transaction }: Props) {
  const { t } = useTranslate();
  const route = useRoute();

  const handleCheckStatus = () => {
    router.post(route('finance.momo.check-status', transaction.id), {}, {
      onSuccess: () => {
        toast.success(t('finance.momo.status_checked', 'Transaction status updated'));
      },
      onError: () => {
        toast.error(t('common.error_occurred', 'An error occurred'));
      },
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('common.copied', 'Copied to clipboard'));
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
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AppLayout
      title={`${t('finance.momo.transaction', 'Transaction')} ${transaction.transaction_number}`}
      >
      <Head title={`${t('finance.momo.transaction', 'Transaction')} ${transaction.transaction_number}`} />

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
                {transaction.transaction_number}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('finance.momo.transaction_details', 'Transaction Details')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {transaction.status === 'pending' && (
              <Button onClick={handleCheckStatus}>
                <RefreshCw className="h-4 w-4" />
                {t('finance.momo.check_status', 'Check Status')}
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Transaction Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                {t('finance.momo.overview', 'Overview')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('finance.momo.status', 'Status')}
                </span>
                {getStatusBadge(transaction.status)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('finance.momo.type', 'Type')}
                </span>
                {getTypeBadge(transaction.type)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('finance.momo.provider', 'Provider')}
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-medium">
                    {transaction.provider.provider_code}
                  </div>
                  <span className="font-medium">{transaction.provider.display_name}</span>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('finance.momo.amount', 'Amount')}
                </span>
                <span className="text-lg font-semibold">
                  {formatCurrency(transaction.amount, transaction.currency)}
                </span>
              </div>

              {transaction.fee_amount && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('finance.momo.fee', 'Fee')}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(transaction.fee_amount, transaction.currency)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('finance.momo.phone_number', 'Phone Number')}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono">{transaction.phone_number}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(transaction.phone_number)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {transaction.description && (
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                    {t('finance.momo.description', 'Description')}
                  </span>
                  <p className="text-sm">{transaction.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer & Reference Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {t('finance.momo.customer_info', 'Customer & Reference')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {transaction.customer_name && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('finance.momo.customer_name', 'Customer Name')}
                  </span>
                  <span className="font-medium">{transaction.customer_name}</span>
                </div>
              )}

              {transaction.customer_email && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('finance.momo.customer_email', 'Customer Email')}
                  </span>
                  <span className="font-medium">{transaction.customer_email}</span>
                </div>
              )}

              {transaction.invoice && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('finance.momo.invoice', 'Invoice')}
                  </span>
                  <Button variant="link" className="p-0 h-auto" asChild>
                    <Link href={route('finance.invoices.show', transaction.invoice.id)}>
                      <FileText className="h-3 w-3 mr-1" />
                      {transaction.invoice.invoice_number}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              )}

              <Separator />

              {transaction.provider_transaction_id && (
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                    {t('finance.momo.provider_transaction_id', 'Provider Transaction ID')}
                  </span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {transaction.provider_transaction_id}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(transaction.provider_transaction_id!)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {transaction.provider_reference && (
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                    {t('finance.momo.provider_reference', 'Provider Reference')}
                  </span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {transaction.provider_reference}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(transaction.provider_reference!)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t('finance.momo.timeline', 'Timeline')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('finance.momo.created', 'Created')}
                </span>
                <span className="text-sm">{formatDate(transaction.created_at)}</span>
              </div>

              {transaction.processed_at && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('finance.momo.processed', 'Processed')}
                  </span>
                  <span className="text-sm">{formatDate(transaction.processed_at)}</span>
                </div>
              )}

              {transaction.failed_at && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('finance.momo.failed', 'Failed')}
                  </span>
                  <span className="text-sm">{formatDate(transaction.failed_at)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('finance.momo.last_updated', 'Last Updated')}
                </span>
                <span className="text-sm">{formatDate(transaction.updated_at)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('finance.momo.initiated_by', 'Initiated By')}
                </span>
                <span className="text-sm font-medium">{transaction.user.name}</span>
              </div>

              {transaction.error_message && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        {t('finance.momo.error', 'Error')}
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {transaction.error_message}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Webhooks */}
          {transaction.webhooks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  {t('finance.momo.webhooks', 'Webhooks')}
                </CardTitle>
                <CardDescription>
                  {t('finance.momo.webhooks_description', 'Provider webhook events for this transaction')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transaction.webhooks.map((webhook) => (
                    <div key={webhook.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{webhook.event_type}</div>
                        <div className="text-xs text-gray-500">{formatDate(webhook.created_at)}</div>
                      </div>
                      <Badge variant={webhook.status === 'processed' ? 'default' : 'secondary'}>
                        {webhook.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
