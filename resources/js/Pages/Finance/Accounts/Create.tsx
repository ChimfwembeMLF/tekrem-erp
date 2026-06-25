import React from 'react';
import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { Save, Wallet } from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import { FinanceFormShell } from '@/Components/Module/moduleFormWrappers';
import { toast } from 'sonner';

interface Props {
  accountTypes?: Record<string, string>;
  currencies?: Record<string, string>;
}

export default function Create({ accountTypes = {}, currencies = {} }: Props) {
  const { t } = useTranslate();

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    type: '',
    account_number: '',
    bank_name: '',
    initial_balance: '',
    currency: 'ZMW',
    description: '',
    is_active: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    post(route('finance.accounts.store'), {
      onSuccess: () => {
        toast.success(t('finance.account_created', 'Account created successfully'));
        reset();
      },
      onError: () => {
        toast.error(t('finance.create_error', 'Error creating account'));
      },
    });
  };

  return (
    <FinanceFormShell
      title="Create Account"
      backHref={route('finance.accounts.index')}
      backLabel="Back"
      onSubmit={handleSubmit}
      processing={processing}
      submitLabel="Save"
      maxWidth="4xl"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            {t('finance.account_details', 'Account Details')}
          </CardTitle>
          <CardDescription>
            {t('finance.account_details_description', 'Enter the details for your new account')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* Grid fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="space-y-2">
              <Label>Account Name *</Label>
              <Input
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label>Account Type *</Label>
              <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(accountTypes || {}).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-red-600">{errors.type}</p>}
            </div>

            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input
                value={data.account_number}
                onChange={(e) => setData('account_number', e.target.value)}
              />
              {errors.account_number && <p className="text-sm text-red-600">{errors.account_number}</p>}
            </div>

            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Input
                value={data.bank_name}
                onChange={(e) => setData('bank_name', e.target.value)}
              />
              {errors.bank_name && <p className="text-sm text-red-600">{errors.bank_name}</p>}
            </div>

            <div className="space-y-2">
              <Label>Initial Balance *</Label>
              <Input
                type="number"
                step="0.01"
                value={data.initial_balance}
                onChange={(e) => setData('initial_balance', e.target.value)}
              />
              {errors.initial_balance && <p className="text-sm text-red-600">{errors.initial_balance}</p>}
            </div>

            <div className="space-y-2">
              <Label>Currency *</Label>
              <Select value={data.currency} onValueChange={(v) => setData('currency', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(currencies || {}).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {value} - {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.currency && <p className="text-sm text-red-600">{errors.currency}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              rows={3}
            />
            {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Active toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              checked={data.is_active}
              onCheckedChange={(v) => setData('is_active', v)}
            />
            <Label>Account is active</Label>
          </div>
        </CardContent>
      </Card>
    </FinanceFormShell>
  );
}