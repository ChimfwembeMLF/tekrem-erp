import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
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
  DollarSign,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Send
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

interface MomoProvider {
  id: number;
  display_name: string;
  provider_code: string;
  is_active: boolean;
  supported_currencies: string[];
  fee_structure: {
    fixed_fee?: number;
    percentage_fee?: number;
    minimum_fee?: number;
    maximum_fee?: number;
  };
}

interface Invoice {
  id: number;
  invoice_number: string;
  total_amount: number;
  currency: string;
  billable: {
    name: string;
    email: string;
  };
}

interface Props {
  providers: MomoProvider[];
  invoice?: Invoice;
}

export default function Create({ providers, invoice }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [selectedProvider, setSelectedProvider] = useState<MomoProvider | null>(null);
  const [estimatedFee, setEstimatedFee] = useState<number>(0);

  const { data, setData, post, processing, errors } = useForm({
    provider_id: '',
    type: 'payment',
    phone_number: '',
    amount: invoice?.total_amount?.toString() || '',
    currency: invoice?.currency || 'ZMW',
    description: invoice ? `Payment for Invoice ${invoice.invoice_number}` : '',
    invoice_id: invoice?.id?.toString() || '',
    customer_name: invoice?.billable?.name || '',
    customer_email: invoice?.billable?.email || '',
    callback_url: '',
    metadata: {},
  });

  useEffect(() => {
    if (data.provider_id) {
      const provider = providers.find(p => p.id.toString() === data.provider_id);
      setSelectedProvider(provider || null);
    }
  }, [data.provider_id, providers]);

  useEffect(() => {
    if (selectedProvider && data.amount) {
      calculateEstimatedFee();
    }
  }, [selectedProvider, data.amount]);

  const calculateEstimatedFee = () => {
    if (!selectedProvider || !data.amount) {
      setEstimatedFee(0);
      return;
    }

    const amount = parseFloat(data.amount);
    const feeStructure = selectedProvider.fee_structure;
    let fee = 0;

    if (feeStructure.fixed_fee) {
      fee += feeStructure.fixed_fee;
    }

    if (feeStructure.percentage_fee) {
      fee += (amount * feeStructure.percentage_fee) / 100;
    }

    if (feeStructure.minimum_fee && fee < feeStructure.minimum_fee) {
      fee = feeStructure.minimum_fee;
    }

    if (feeStructure.maximum_fee && fee > feeStructure.maximum_fee) {
      fee = feeStructure.maximum_fee;
    }

    setEstimatedFee(fee);
  };

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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatPhoneNumber = (phone: string) => {
    // Format Zambian phone numbers
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('260')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('0')) {
      return `+260${cleaned.substring(1)}`;
    } else if (cleaned.length === 9) {
      return `+260${cleaned}`;
    }
    return phone;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setData('phone_number', formatted);
  };

  return (
    <AppLayout
      title={t('finance.momo.new_transaction', 'New Mobile Money Transaction')}
      breadcrumbs={[
        { label: t('finance.title', 'Finance'), href: '/finance' },
        { label: t('finance.momo.title', 'Mobile Money'), href: '/finance/momo' },
        { label: t('finance.momo.new_transaction', 'New Transaction') },
      ]}
    >
      <Head title={t('finance.momo.new_transaction', 'New Mobile Money Transaction')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={route('finance.momo.index')}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {t('finance.momo.new_transaction', 'New Mobile Money Transaction')}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('finance.momo.create_description', 'Initiate a mobile money payment or payout')}
            </p>
          </div>
        </div>

        {/* Invoice Info */}
        {invoice && (
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              {t('finance.momo.invoice_payment', 'Processing payment for Invoice')} <strong>{invoice.invoice_number}</strong> - {formatCurrency(invoice.total_amount, invoice.currency)}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Transaction Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  {t('finance.momo.transaction_details', 'Transaction Details')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="provider_id">
                    {t('finance.momo.provider', 'Provider')} *
                  </Label>
                  <Select value={data.provider_id} onValueChange={(value) => setData('provider_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('finance.momo.select_provider', 'Select provider')} />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id.toString()}>
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-medium">
                              {provider.provider_code}
                            </div>
                            {provider.display_name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.provider_id && (
                    <p className="text-sm text-red-600">{errors.provider_id}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">
                    {t('finance.momo.transaction_type', 'Transaction Type')} *
                  </Label>
                  <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payment">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          {t('finance.momo.type.payment', 'Payment')}
                        </div>
                      </SelectItem>
                      <SelectItem value="payout">
                        <div className="flex items-center gap-2">
                          <Send className="h-4 w-4" />
                          {t('finance.momo.type.payout', 'Payout')}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-red-600">{errors.type}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">
                    {t('finance.momo.phone_number', 'Phone Number')} *
                  </Label>
                  <Input
                    id="phone_number"
                    type="tel"
                    placeholder="+260 97 123 4567"
                    value={data.phone_number}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className={errors.phone_number ? 'border-red-500' : ''}
                  />
                  {errors.phone_number && (
                    <p className="text-sm text-red-600">{errors.phone_number}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {t('finance.momo.phone_format', 'Format: +260XXXXXXXXX')}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="amount">
                      {t('finance.momo.amount', 'Amount')} *
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={data.amount}
                      onChange={(e) => setData('amount', e.target.value)}
                      className={errors.amount ? 'border-red-500' : ''}
                    />
                    {errors.amount && (
                      <p className="text-sm text-red-600">{errors.amount}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">
                      {t('finance.momo.currency', 'Currency')} *
                    </Label>
                    <Select value={data.currency} onValueChange={(value) => setData('currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedProvider?.supported_currencies?.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        )) || (
                          <SelectItem value="ZMW">ZMW</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.currency && (
                      <p className="text-sm text-red-600">{errors.currency}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    {t('finance.momo.description', 'Description')}
                  </Label>
                  <Textarea
                    id="description"
                    placeholder={t('finance.momo.description_placeholder', 'Transaction description...')}
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    rows={3}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Customer Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t('finance.momo.customer_details', 'Customer Details')}
                </CardTitle>
                <CardDescription>
                  {t('finance.momo.customer_description', 'Optional customer information for record keeping')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">
                    {t('finance.momo.customer_name', 'Customer Name')}
                  </Label>
                  <Input
                    id="customer_name"
                    placeholder={t('finance.momo.customer_name_placeholder', 'Customer name')}
                    value={data.customer_name}
                    onChange={(e) => setData('customer_name', e.target.value)}
                  />
                  {errors.customer_name && (
                    <p className="text-sm text-red-600">{errors.customer_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer_email">
                    {t('finance.momo.customer_email', 'Customer Email')}
                  </Label>
                  <Input
                    id="customer_email"
                    type="email"
                    placeholder={t('finance.momo.customer_email_placeholder', 'customer@example.com')}
                    value={data.customer_email}
                    onChange={(e) => setData('customer_email', e.target.value)}
                  />
                  {errors.customer_email && (
                    <p className="text-sm text-red-600">{errors.customer_email}</p>
                  )}
                </div>

                {/* Fee Estimation */}
                {selectedProvider && data.amount && (
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-2">
                      {t('finance.momo.fee_estimation', 'Fee Estimation')}
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>{t('finance.momo.transaction_amount', 'Transaction Amount')}:</span>
                        <span className="font-medium">{formatCurrency(parseFloat(data.amount || '0'), data.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('finance.momo.estimated_fee', 'Estimated Fee')}:</span>
                        <span className="font-medium">{formatCurrency(estimatedFee, data.currency)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-1 font-medium">
                        <span>{t('finance.momo.total_amount', 'Total Amount')}:</span>
                        <span>{formatCurrency(parseFloat(data.amount || '0') + estimatedFee, data.currency)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href={route('finance.momo.index')}>
                {t('common.cancel', 'Cancel')}
              </Link>
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('finance.momo.processing', 'Processing...')}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {t('finance.momo.initiate_transaction', 'Initiate Transaction')}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
