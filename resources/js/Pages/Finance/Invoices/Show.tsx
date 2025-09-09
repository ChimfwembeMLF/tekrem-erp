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
  Edit,
  Send,
  Download,
  FileText,
  User,
  Calendar,
  DollarSign,
  CreditCard,
  Receipt,
  Building,
  Mail,
  Phone,
  Shield,
  QrCode,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Eye,
  History
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import { toast } from 'sonner';
import useRoute from '@/Hooks/useRoute';

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Payment {
  id: number;
  payment_number: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
}

interface ZraSmartInvoice {
  id: number;
  zra_reference?: string;
  submission_id?: string;
  submission_status: string;
  qr_code?: string;
  qr_code_image?: string;
  verification_url?: string;
  submitted_at?: string;
  approved_at?: string;
  rejected_at?: string;
  cancelled_at?: string;
  validation_errors?: string[];
  retry_count: number;
  last_submission_attempt?: string;
  is_test_mode: boolean;
  notes?: string;
  submitted_by?: {
    id: number;
    name: string;
  };
  audit_logs?: Array<{
    id: number;
    action: string;
    description: string;
    created_at: string;
    user: {
      name: string;
    };
  }>;
}

interface Invoice {
  id: number;
  invoice_number: string;
  status: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  currency: string;
  notes: string;
  terms: string;
  is_zra_locked: boolean;
  zra_status: string;
  zra_qr_code?: string;
  billable: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
  } | null;
  items: InvoiceItem[];
  payments: Payment[];
  zra_smart_invoice?: ZraSmartInvoice;
}

interface Props {
  invoice: Invoice;
}

export default function Show({ invoice }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const handleSend = () => {
    router.post(route('finance.invoices.send', invoice.id), {}, {
      onSuccess: () => {
        toast.success(t('finance.invoice_sent', 'Invoice sent successfully'));
      },
      onError: () => {
        toast.error(t('common.error_occurred', 'An error occurred'));
      },
    });
  };

  const handleZraSubmit = () => {
    router.post(route('finance.zra.submit', invoice.id), {}, {
      onSuccess: () => {
        toast.success(t('finance.zra.submission_started', 'ZRA submission started'));
      },
      onError: () => {
        toast.error(t('common.error_occurred', 'An error occurred'));
      },
    });
  };

  const handleZraResubmit = () => {
    router.post(route('finance.zra.resubmit', invoice.id), {}, {
      onSuccess: () => {
        toast.success(t('finance.zra.resubmission_started', 'ZRA resubmission started'));
      },
      onError: () => {
        toast.error(t('common.error_occurred', 'An error occurred'));
      },
    });
  };

  const handleZraCancel = () => {
    if (confirm(t('finance.zra.confirm_cancel', 'Are you sure you want to cancel this ZRA submission?'))) {
      router.post(route('finance.zra.cancel', invoice.id), {}, {
        onSuccess: () => {
          toast.success(t('finance.zra.cancelled', 'ZRA submission cancelled'));
        },
        onError: () => {
          toast.error(t('common.error_occurred', 'An error occurred'));
        },
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return '✓';
      case 'sent':
        return '→';
      case 'overdue':
        return '!';
      case 'draft':
        return '○';
      default:
        return '○';
    }
  };

  const getZraStatusBadge = (status: string) => {
    const statusConfig = {
      not_submitted: { variant: 'secondary' as const, icon: Clock, color: 'text-gray-600' },
      pending: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      submitted: { variant: 'default' as const, icon: RefreshCw, color: 'text-blue-600' },
      approved: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      rejected: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      cancelled: { variant: 'secondary' as const, icon: XCircle, color: 'text-gray-600' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_submitted;
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

  const remainingAmount = invoice.total_amount - invoice.paid_amount;
  const paymentPercentage = (invoice.paid_amount / invoice.total_amount) * 100;

  return (
    <AppLayout
      title={`${t('finance.invoice', 'Invoice')} ${invoice.invoice_number}`}
      breadcrumbs={[
        { label: t('finance.title', 'Finance'), href: '/finance' },
        { label: t('finance.invoices', 'Invoices'), href: '/finance/invoices' },
        { label: invoice.invoice_number },
      ]}
    >
      <Head title={`${t('finance.invoice', 'Invoice')} ${invoice.invoice_number}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={route('finance.invoices.index')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.back', 'Back')}
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t('finance.invoice', 'Invoice')} {invoice.invoice_number}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(invoice.status)} variant="secondary">
                  <span className="mr-1">{getStatusIcon(invoice.status)}</span>
                  {invoice.status}
                </Badge>
                <span className="text-muted-foreground">•</span>
                {getZraStatusBadge(invoice.zra_status)}
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  {t('finance.due_date', 'Due')}: {new Date(invoice.due_date).toLocaleDateString()}
                </span>
                {invoice.is_zra_locked && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      <Shield className="h-3 w-3 mr-1" />
                      {t('finance.zra.locked', 'ZRA Locked')}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {/* ZRA Actions */}
            {invoice.zra_status === 'not_submitted' && !invoice.is_zra_locked && (
              <Button onClick={handleZraSubmit} className="bg-blue-600 hover:bg-blue-700">
                <Shield className="h-4 w-4 mr-2" />
                {t('finance.zra.submit', 'Submit to ZRA')}
              </Button>
            )}
            {(invoice.zra_status === 'rejected' || invoice.zra_status === 'cancelled') && !invoice.is_zra_locked && (
              <Button onClick={handleZraResubmit} variant="outline" className="border-blue-600 text-blue-600">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('finance.zra.resubmit', 'Resubmit to ZRA')}
              </Button>
            )}
            {(invoice.zra_status === 'pending' || invoice.zra_status === 'submitted') && (
              <Button onClick={handleZraCancel} variant="outline" className="border-red-600 text-red-600">
                <XCircle className="h-4 w-4 mr-2" />
                {t('finance.zra.cancel', 'Cancel ZRA')}
              </Button>
            )}

            {/* Regular Actions */}
            {invoice.status === 'draft' && !invoice.is_zra_locked && (
              <Button onClick={handleSend}>
                <Send className="h-4 w-4 mr-2" />
                {t('finance.send_invoice', 'Send Invoice')}
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href={route('finance.invoices.pdf', invoice.id)} target="_blank">
                <Download className="h-4 w-4 mr-2" />
                {t('finance.download_pdf', 'Download PDF')}
              </Link>
            </Button>
            {!invoice.is_zra_locked && (
              <Button variant="outline" asChild>
                <Link href={route('finance.invoices.edit', invoice.id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  {t('common.edit', 'Edit')}
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Invoice Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t('finance.client_information', 'Client Information')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {invoice.billable ? (
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{invoice.billable.name}</h3>
                    </div>
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{invoice.billable.email}</span>
                      </div>
                      {invoice.billable.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{invoice.billable.phone}</span>
                        </div>
                      )}
                      {invoice.billable.address && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{invoice.billable.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">{t('finance.no_client', 'No client assigned')}</p>
                )}
              </CardContent>
            </Card>

            {/* Invoice Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t('finance.invoice_items', 'Invoice Items')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('finance.description', 'Description')}</TableHead>
                        <TableHead className="text-center">{t('finance.quantity', 'Qty')}</TableHead>
                        <TableHead className="text-right">{t('finance.unit_price', 'Unit Price')}</TableHead>
                        <TableHead className="text-right">{t('finance.total', 'Total')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoice.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.description}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(item.total_price)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Invoice Totals */}
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between">
                    <span>{t('finance.subtotal', 'Subtotal')}:</span>
                    <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                  </div>

                  {invoice.tax_amount > 0 && (
                    <div className="flex justify-between">
                      <span>{t('finance.tax', 'Tax')}:</span>
                      <span className="font-medium">{formatCurrency(invoice.tax_amount)}</span>
                    </div>
                  )}

                  {invoice.discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span>{t('finance.discount', 'Discount')}:</span>
                      <span className="font-medium">-{formatCurrency(invoice.discount_amount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>{t('finance.total', 'Total')}:</span>
                    <span>{formatCurrency(invoice.total_amount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes and Terms */}
            {(invoice.notes || invoice.terms) && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('finance.additional_information', 'Additional Information')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {invoice.notes && (
                    <div>
                      <h4 className="font-medium mb-2">{t('finance.notes', 'Notes')}</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
                    </div>
                  )}
                  {invoice.terms && (
                    <div>
                      <h4 className="font-medium mb-2">{t('finance.terms', 'Terms & Conditions')}</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.terms}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* ZRA Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {t('finance.zra.compliance', 'ZRA Compliance')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('finance.zra.status', 'Status')}:</span>
                  {getZraStatusBadge(invoice.zra_status)}
                </div>

                {invoice.zra_smart_invoice?.zra_reference && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('finance.zra.reference', 'ZRA Reference')}:</span>
                    <span className="text-sm font-mono">{invoice.zra_smart_invoice.zra_reference}</span>
                  </div>
                )}

                {invoice.zra_smart_invoice?.submitted_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('finance.zra.submitted_at', 'Submitted')}:</span>
                    <span className="text-sm">{formatDate(invoice.zra_smart_invoice.submitted_at)}</span>
                  </div>
                )}

                {invoice.zra_smart_invoice?.approved_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('finance.zra.approved_at', 'Approved')}:</span>
                    <span className="text-sm">{formatDate(invoice.zra_smart_invoice.approved_at)}</span>
                  </div>
                )}

                {invoice.zra_smart_invoice?.rejected_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('finance.zra.rejected_at', 'Rejected')}:</span>
                    <span className="text-sm">{formatDate(invoice.zra_smart_invoice.rejected_at)}</span>
                  </div>
                )}

                {/* QR Code */}
                {invoice.zra_qr_code && (
                  <div className="pt-4 border-t">
                    <div className="text-center">
                      <div className="mb-2">
                        <QrCode className="h-5 w-5 mx-auto text-muted-foreground" />
                        <span className="text-sm font-medium">{t('finance.zra.qr_code', 'ZRA QR Code')}</span>
                      </div>
                      <div className="bg-white p-4 rounded-lg border inline-block">
                        <img
                          src={invoice.zra_qr_code}
                          alt="ZRA QR Code"
                          className="w-32 h-32 mx-auto"
                        />
                      </div>
                      {invoice.zra_smart_invoice?.verification_url && (
                        <Button variant="outline" size="sm" className="mt-2" asChild>
                          <a href={invoice.zra_smart_invoice.verification_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            {t('finance.zra.verify', 'Verify')}
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Validation Errors */}
                {invoice.zra_smart_invoice?.validation_errors && invoice.zra_smart_invoice.validation_errors.length > 0 && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-600">
                        {t('finance.zra.validation_errors', 'Validation Errors')}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {invoice.zra_smart_invoice.validation_errors.map((error, index) => (
                        <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ZRA Actions */}
                <div className="pt-4 border-t space-y-2">
                  {invoice.zra_smart_invoice && (
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={route('finance.zra.show', invoice.zra_smart_invoice.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        {t('finance.zra.view_details', 'View ZRA Details')}
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Invoice Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {t('finance.invoice_summary', 'Invoice Summary')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('finance.issue_date', 'Issue Date')}:</span>
                    <span>{new Date(invoice.issue_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('finance.due_date', 'Due Date')}:</span>
                    <span>{new Date(invoice.due_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('finance.currency', 'Currency')}:</span>
                    <span>{invoice.currency}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>{t('finance.total_amount', 'Total Amount')}:</span>
                    <span>{formatCurrency(invoice.total_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('finance.paid_amount', 'Paid Amount')}:</span>
                    <span className="text-green-600">{formatCurrency(invoice.paid_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('finance.remaining_amount', 'Remaining')}:</span>
                    <span className={remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}>
                      {formatCurrency(remainingAmount)}
                    </span>
                  </div>
                </div>

                {/* Payment Progress */}
                {invoice.paid_amount > 0 && (
                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-sm mb-2">
                      <span>{t('finance.payment_progress', 'Payment Progress')}</span>
                      <span>{Math.round(paymentPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(paymentPercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="pt-4 border-t space-y-2">
                  {remainingAmount > 0 && (
                    <Button asChild className="w-full">
                      <Link href={route('finance.payments.create', { invoice: invoice.id })}>
                        <CreditCard className="h-4 w-4 mr-2" />
                        {t('finance.record_payment', 'Record Payment')}
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" asChild className="w-full">
                    <Link href={route('finance.invoices.pdf', invoice.id)} target="_blank">
                      <Download className="h-4 w-4 mr-2" />
                      {t('finance.download_pdf', 'Download PDF')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            {invoice.payments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    {t('finance.payment_history', 'Payment History')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {invoice.payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{payment.payment_number}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(payment.payment_date).toLocaleDateString()} • {payment.payment_method}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(payment.amount)}</p>
                          <Badge
                            variant="secondary"
                            className={payment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                          >
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}