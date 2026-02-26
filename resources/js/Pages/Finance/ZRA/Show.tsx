import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
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
  ArrowLeft,
  Shield,
  QrCode,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  FileText,
  User,
  Calendar,
  History,
  Download,
  Copy
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

interface ZraAuditLog {
  id: number;
  action: string;
  description: string;
  created_at: string;
  user: {
    id: number;
    name: string;
  };
}

interface ZraSmartInvoice {
  id: number;
  invoice_id: number;
  zra_reference?: string;
  submission_id?: string;
  submission_status: string;
  submission_data?: any;
  response_data?: any;
  validation_errors?: string[];
  qr_code?: string;
  qr_code_image?: string;
  verification_url?: string;
  submitted_at?: string;
  approved_at?: string;
  rejected_at?: string;
  cancelled_at?: string;
  submitted_by?: {
    id: number;
    name: string;
  };
  retry_count: number;
  last_submission_attempt?: string;
  is_test_mode: boolean;
  notes?: string;
  invoice: {
    id: number;
    invoice_number: string;
    total_amount: number;
    currency: string;
    issue_date: string;
    billable?: {
      name: string;
      email: string;
    };
  };
  audit_logs: ZraAuditLog[];
}

interface Props {
  zraInvoice: ZraSmartInvoice;
}

export default function Show({ zraInvoice }: Props) {
  const { t } = useTranslate();
  const route = useRoute();

  const handleResubmit = () => {
    router.post(route('finance.zra.resubmit', zraInvoice.invoice_id), {}, {
      onSuccess: () => {
        toast.success(t('finance.zra.resubmission_started', 'ZRA resubmission started'));
      },
      onError: () => {
        toast.error(t('common.error_occurred', 'An error occurred'));
      },
    });
  };

  const handleCancel = () => {
    if (confirm(t('finance.zra.confirm_cancel', 'Are you sure you want to cancel this ZRA submission?'))) {
      router.post(route('finance.zra.cancel', zraInvoice.invoice_id), {}, {
        onSuccess: () => {
          toast.success(t('finance.zra.cancelled', 'ZRA submission cancelled'));
        },
        onError: () => {
          toast.error(t('common.error_occurred', 'An error occurred'));
        },
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(t('common.copied_to_clipboard', `${label} copied to clipboard`));
    });
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'ZMW') => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <AppLayout
      title={t('finance.zra.smart_invoice_details', 'ZRA Smart Invoice Details')}
      >
      <Head title={t('finance.zra.smart_invoice_details', 'ZRA Smart Invoice Details')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href={route('finance.zra.index')}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {t('finance.zra.smart_invoice', 'ZRA Smart Invoice')}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-600 dark:text-gray-400">
                  {t('finance.invoice', 'Invoice')}: {zraInvoice.invoice.invoice_number}
                </span>
                <span className="text-muted-foreground">•</span>
                {getStatusBadge(zraInvoice.submission_status)}
                {zraInvoice.is_test_mode && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      {t('finance.zra.test_mode', 'Test Mode')}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {(zraInvoice.submission_status === 'rejected' || zraInvoice.submission_status === 'cancelled') && (
              <Button onClick={handleResubmit} variant="outline" className="border-blue-600 text-blue-600">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('finance.zra.resubmit', 'Resubmit')}
              </Button>
            )}
            {(zraInvoice.submission_status === 'pending' || zraInvoice.submission_status === 'submitted') && (
              <Button onClick={handleCancel} variant="outline" className="border-red-600 text-red-600">
                <XCircle className="h-4 w-4 mr-2" />
                {t('finance.zra.cancel', 'Cancel')}
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href={route('finance.invoices.show', zraInvoice.invoice_id)}>
                <FileText className="h-4 w-4 mr-2" />
                {t('finance.view_invoice', 'View Invoice')}
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t('finance.invoice_information', 'Invoice Information')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('finance.invoice_number', 'Invoice Number')}
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{zraInvoice.invoice.invoice_number}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(zraInvoice.invoice.invoice_number, 'Invoice number')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('finance.total_amount', 'Total Amount')}
                    </label>
                    <p className="font-medium">
                      {formatCurrency(zraInvoice.invoice.total_amount, zraInvoice.invoice.currency)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('finance.issue_date', 'Issue Date')}
                    </label>
                    <p>{new Date(zraInvoice.invoice.issue_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('finance.client', 'Client')}
                    </label>
                    <p>{zraInvoice.invoice.billable?.name || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ZRA Submission Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {t('finance.zra.submission_details', 'ZRA Submission Details')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {zraInvoice.zra_reference && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {t('finance.zra.reference', 'ZRA Reference')}
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{zraInvoice.zra_reference}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(zraInvoice.zra_reference!, 'ZRA reference')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {zraInvoice.submission_id && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {t('finance.zra.submission_id', 'Submission ID')}
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{zraInvoice.submission_id}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(zraInvoice.submission_id!, 'Submission ID')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('finance.zra.status', 'Status')}
                    </label>
                    <div className="mt-1">
                      {getStatusBadge(zraInvoice.submission_status)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('finance.zra.retry_count', 'Retry Count')}
                    </label>
                    <p>{zraInvoice.retry_count}</p>
                  </div>
                  {zraInvoice.submitted_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {t('finance.zra.submitted_at', 'Submitted At')}
                      </label>
                      <p>{formatDate(zraInvoice.submitted_at)}</p>
                    </div>
                  )}
                  {zraInvoice.submitted_by && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {t('finance.zra.submitted_by', 'Submitted By')}
                      </label>
                      <p>{zraInvoice.submitted_by.name}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Validation Errors */}
            {zraInvoice.validation_errors && zraInvoice.validation_errors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    {t('finance.zra.validation_errors', 'Validation Errors')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {zraInvoice.validation_errors.map((error, index) => (
                      <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">{error}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* QR Code */}
            {zraInvoice.qr_code_image && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    {t('finance.zra.qr_code', 'ZRA QR Code')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-lg border inline-block">
                      <img 
                        src={zraInvoice.qr_code_image} 
                        alt="ZRA QR Code" 
                        className="w-48 h-48 mx-auto"
                      />
                    </div>
                    {zraInvoice.verification_url && (
                      <Button variant="outline" className="mt-4 w-full" asChild>
                        <a href={zraInvoice.verification_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {t('finance.zra.verify_online', 'Verify Online')}
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  {t('finance.zra.timeline', 'Timeline')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {zraInvoice.approved_at && (
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-600">{t('finance.zra.approved', 'Approved')}</p>
                        <p className="text-sm text-gray-600">{formatDate(zraInvoice.approved_at)}</p>
                      </div>
                    </div>
                  )}
                  {zraInvoice.rejected_at && (
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-600">{t('finance.zra.rejected', 'Rejected')}</p>
                        <p className="text-sm text-gray-600">{formatDate(zraInvoice.rejected_at)}</p>
                      </div>
                    </div>
                  )}
                  {zraInvoice.cancelled_at && (
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-gray-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-600">{t('finance.zra.cancelled', 'Cancelled')}</p>
                        <p className="text-sm text-gray-600">{formatDate(zraInvoice.cancelled_at)}</p>
                      </div>
                    </div>
                  )}
                  {zraInvoice.submitted_at && (
                    <div className="flex items-start gap-3">
                      <RefreshCw className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-600">{t('finance.zra.submitted', 'Submitted')}</p>
                        <p className="text-sm text-gray-600">{formatDate(zraInvoice.submitted_at)}</p>
                        {zraInvoice.submitted_by && (
                          <p className="text-xs text-gray-500">by {zraInvoice.submitted_by.name}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Audit Log */}
        {zraInvoice.audit_logs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-4 w-4" />
                {t('finance.zra.audit_log', 'Audit Log')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('finance.zra.action', 'Action')}</TableHead>
                      <TableHead>{t('finance.zra.description', 'Description')}</TableHead>
                      <TableHead>{t('finance.zra.user', 'User')}</TableHead>
                      <TableHead>{t('finance.zra.timestamp', 'Timestamp')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {zraInvoice.audit_logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.action}</TableCell>
                        <TableCell>{log.description}</TableCell>
                        <TableCell>{log.user.name}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(log.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
