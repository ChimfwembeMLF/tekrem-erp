import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { CreditCard, Receipt, CheckCircle, XCircle, Clock } from 'lucide-react';
import { TooltipProvider } from '@/Components/ui/tooltip';

interface BillingItem {
  id: number;
  module_name: string;
  module_details?: {
    description?: string;
    features?: string[];
  };
  invoice_id?: number | null;
  invoice_number?: string | null;
  invoice_link?: string | null;
  amount: number;
  currency: string;
  status: string;
  billing_date: string;
  due_date: string;
  payment_method: string;
  notes?: string;
  company?: {
    id: number;
    name: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
  transaction_id?: string | null;
  attachments?: any[];
  history?: any[];
  refund_status?: string | null;
}

interface Props {
  billing: BillingItem;
}

export default function BillingShow({ billing }: Props) {
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

  return (
    <TooltipProvider>
      <AppLayout title={`Billing Details - ${billing.module_name}`}>
        <Head title={`Billing Details - ${billing.module_name}`} />
        <div className="py-12">
          <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
            <Card>
              <CardHeader>
                <CardTitle>Billing Details</CardTitle>
                <CardDescription>Full details for this module billing record.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <span className="font-semibold">Module:</span> {billing.module_name}
                    {billing.module_details?.description && (
                      <div className="text-sm text-gray-500">{billing.module_details.description}</div>
                    )}
                    {billing.module_details?.features && billing.module_details.features.length > 0 && (
                      <ul className="text-xs text-gray-400 list-disc ml-4">
                        {billing.module_details.features.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold">Amount:</span> {formatCurrency(billing.amount, billing.currency)}
                  </div>
                  <div>
                    <span className="font-semibold">Status:</span> {getStatusBadge(billing.status)}
                  </div>
                  <div>
                    <span className="font-semibold">Billing Date:</span> {billing.billing_date}
                  </div>
                  <div>
                    <span className="font-semibold">Due Date:</span> {billing.due_date}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Payment Method:</span> {getMethodIcon(billing.payment_method || '')} {billing.payment_method ? billing.payment_method.replace('_', ' ') : ''}
                  </div>
                  {billing.invoice_id && (
                    <div>
                      <span className="font-semibold">Invoice:</span>{' '}
                      {billing.invoice_link ? (
                        <a href={billing.invoice_link} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                          #{billing.invoice_number}
                        </a>
                      ) : (
                        <span>#{billing.invoice_number}</span>
                      )}
                    </div>
                  )}
                  {billing.notes && (
                    <div>
                      <span className="font-semibold">Notes:</span> {billing.notes}
                    </div>
                  )}
                  {billing.company && (
                    <div>
                      <span className="font-semibold">Company:</span> {billing.company.name}
                    </div>
                  )}
                  {billing.user && (
                    <div>
                      <span className="font-semibold">Recorded By:</span> {billing.user.name} ({billing.user.email})
                    </div>
                  )}
                  {billing.transaction_id && (
                    <div>
                      <span className="font-semibold">Transaction ID:</span> {billing.transaction_id}
                    </div>
                  )}
                  {billing.refund_status && (
                    <div>
                      <span className="font-semibold">Refund Status:</span> {billing.refund_status}
                    </div>
                  )}
                  {billing.attachments && billing.attachments.length > 0 && (
                    <div>
                      <span className="font-semibold">Attachments:</span>
                      <ul className="ml-4">
                        {billing.attachments.map((file, i) => (
                          <li key={i}><a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{file.name || file.url}</a></li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {billing.history && billing.history.length > 0 && (
                    <div>
                      <span className="font-semibold">History:</span>
                      <ul className="ml-4 text-xs text-gray-500">
                        {billing.history.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    </TooltipProvider>
  );
}
