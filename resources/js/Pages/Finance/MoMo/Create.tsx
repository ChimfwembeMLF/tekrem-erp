import React, { useEffect } from 'react';
import {  Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
  ArrowLeft,
  Smartphone,
  User,
  FileText,
  CreditCard,
  Send,
  RotateCcw,
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { FinanceFormShell } from '@/Components/Module/moduleFormWrappers';
import { toast } from 'sonner';

interface Network {
  code: string;
  label: string;
}

interface RefundableDeposit {
  id: number;
  transaction_number: string;
  provider_transaction_id: string;
  amount: number;
  currency: string;
  customer_phone?: string;
  created_at: string;
}

interface Invoice {
  id: number;
  invoice_number: string;
  total_amount: number;
  balance_due?: number;
  currency: string;
  billable: {
    name: string;
    email: string;
  };
}

interface Props {
  networks: Network[];
  pawapay: {
    configured: boolean;
    env: string;
  };
  refundableDeposits: RefundableDeposit[];
  invoice?: Invoice;
}

export default function Create({ networks, pawapay, refundableDeposits, invoice }: Props) {
  const { t } = useTranslate();
  const route = useRoute();

  const { data, setData, post, processing, errors } = useForm({
    type: 'payment',
    correspondent: '',
    phone_number: '',
    amount: invoice?.balance_due?.toString() || invoice?.total_amount?.toString() || '',
    currency: invoice?.currency || 'ZMW',
    description: invoice ? `Payment for Invoice ${invoice.invoice_number}` : '',
    invoice_id: invoice?.id?.toString() || '',
    customer_name: invoice?.billable?.name || '',
    customer_email: invoice?.billable?.email || '',
    customer_message: '',
    deposit_id: '',
  });

  const isRefund = data.type === 'refund';
  const needsPhone = !isRefund;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    if (type && ['payment', 'payout', 'refund'].includes(type)) {
      setData('type', type);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    post(route('finance.momo.store'), {
      onSuccess: () => {
        toast.success(t('finance.momo.transaction_initiated', 'Transaction initiated successfully'));
      },
      onError: () => {
        toast.error(t('common.error_occurred', 'An error occurred'));
      },
    });
  };

  const formatCurrency = (amount: number, currency: string = 'ZMW') => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const typeLabel = {
    payment: t('finance.momo.type.deposit', 'Deposit (collect)'),
    payout: t('finance.momo.type.payout', 'Payout'),
    refund: t('finance.momo.type.refund', 'Refund'),
  }[data.type] ?? data.type;

  return (
    <FinanceFormShell
      title={"New PawaPay Transaction"}
      backHref={route('finance.momo.index')}
      backLabel="Back"
      onSubmit={handleSubmit}
      processing={processing}
      submitLabel="Save"
      maxWidth="4xl"
    >

<div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={route('finance.momo.index')}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {t('finance.momo.new_transaction', 'New PawaPay Transaction')}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Deposits, payouts, and refunds via PawaPay ({pawapay.env})
            </p>
          </div>
        </div>

        {!pawapay.configured && (
          <Alert variant="destructive">
            <AlertDescription>
              PawaPay is not configured. Save your API token in{' '}
              <Link href={route('settings.finance.payments.pawapay')} className="underline">
                Finance Settings
              </Link>
              .
            </AlertDescription>
          </Alert>
        )}

        {invoice && (
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              {t('finance.momo.invoice_payment', 'Processing payment for Invoice')}{' '}
              <strong>{invoice.invoice_number}</strong> - {formatCurrency(invoice.total_amount, invoice.currency)}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  {t('finance.momo.transaction_details', 'Transaction Details')}
                </CardTitle>
                <CardDescription>{typeLabel}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('finance.momo.transaction_type', 'Operation')} *</Label>
                  <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payment">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          {t('finance.momo.type.deposit', 'Deposit')}
                        </div>
                      </SelectItem>
                      <SelectItem value="payout">
                        <div className="flex items-center gap-2">
                          <Send className="h-4 w-4" />
                          {t('finance.momo.type.payout', 'Payout')}
                        </div>
                      </SelectItem>
                      <SelectItem value="refund">
                        <div className="flex items-center gap-2">
                          <RotateCcw className="h-4 w-4" />
                          {t('finance.momo.type.refund', 'Refund')}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-sm text-red-600">{errors.type}</p>}
                </div>

                {isRefund ? (
                  <div className="space-y-2">
                    <Label htmlFor="deposit_id">{t('finance.momo.original_deposit', 'Original deposit')} *</Label>
                    {refundableDeposits.length > 0 ? (
                      <Select value={data.deposit_id} onValueChange={(value) => setData('deposit_id', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a completed deposit" />
                        </SelectTrigger>
                        <SelectContent>
                          {refundableDeposits.map((deposit) => (
                            <SelectItem key={deposit.id} value={deposit.provider_transaction_id}>
                              {deposit.transaction_number} · {formatCurrency(deposit.amount, deposit.currency)}
                              {deposit.customer_phone ? ` · ${deposit.customer_phone}` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="deposit_id"
                        value={data.deposit_id}
                        onChange={(e) => setData('deposit_id', e.target.value)}
                        placeholder="PawaPay deposit UUID"
                      />
                    )}
                    {errors.deposit_id && <p className="text-sm text-red-600">{errors.deposit_id}</p>}
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>{t('finance.momo.network', 'Network')}</Label>
                      <Select value={data.correspondent} onValueChange={(value) => setData('correspondent', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Auto-detect from phone number" />
                        </SelectTrigger>
                        <SelectContent>
                          {networks.map((network) => (
                            <SelectItem key={network.code} value={network.code}>
                              {network.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.correspondent && <p className="text-sm text-red-600">{errors.correspondent}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone_number">{t('finance.momo.phone_number', 'Phone Number')} *</Label>
                      <Input
                        id="phone_number"
                        type="tel"
                        placeholder="076274499, 077274499, or 26076274499"
                        value={data.phone_number}
                        onChange={(e) => setData('phone_number', e.target.value)}
                      />
                      {errors.phone_number && <p className="text-sm text-red-600">{errors.phone_number}</p>}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="amount">{t('finance.momo.amount', 'Amount')} *</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          min="1"
                          value={data.amount}
                          onChange={(e) => setData('amount', e.target.value)}
                        />
                        {errors.amount && <p className="text-sm text-red-600">{errors.amount}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>{t('finance.momo.currency', 'Currency')}</Label>
                        <Select value={data.currency} onValueChange={(value) => setData('currency', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ZMW">ZMW</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customer_message">{t('finance.momo.customer_message', 'Customer message')}</Label>
                      <Input
                        id="customer_message"
                        maxLength={22}
                        value={data.customer_message}
                        onChange={(e) => setData('customer_message', e.target.value)}
                        placeholder="4-22 chars shown on SMS"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description">{t('finance.momo.description', 'Description')}</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    rows={3}
                  />
                </div>

                {errors.error && <p className="text-sm text-red-600">{errors.error}</p>}
              </CardContent>
            </Card>

            {needsPhone && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t('finance.momo.customer_details', 'Customer Details')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer_name">{t('finance.momo.customer_name', 'Customer Name')}</Label>
                    <Input
                      id="customer_name"
                      value={data.customer_name}
                      onChange={(e) => setData('customer_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer_email">{t('finance.momo.customer_email', 'Customer Email')}</Label>
                    <Input
                      id="customer_email"
                      type="email"
                      value={data.customer_email}
                      onChange={(e) => setData('customer_email', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href={route('finance.momo.index')}>{t('common.cancel', 'Cancel')}</Link>
            </Button>
            <Button type="submit" disabled={processing || !pawapay.configured}>
              {processing ? t('finance.momo.processing', 'Processing...') : typeLabel}
            </Button>
          </div>
        
</FinanceFormShell>
  );
}
