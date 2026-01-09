import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { TooltipProvider } from '@/Components/ui/tooltip';
import useRoute from '@/Hooks/useRoute';

export default function BillingCreate() {
    const route = useRoute();
  const { data, setData, post, processing, errors } = useForm({
    module_name: '',
    amount: '',
    currency: 'ZMW',
    billing_date: '',
    due_date: '',
    payment_method: 'credit_card',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('admin.modules.billing.create'));
  };

  return (
    <TooltipProvider>
      <AppLayout title="Record Module Payment">
        <Head title="Record Module Payment" />
        <div className="py-12">
          <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
            <Card>
              <CardHeader>
                <CardTitle>Record Module Payment</CardTitle>
                <CardDescription>Enter details to record a new module payment.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Module Name"
                    placeholder="Module Name"
                    value={data.module_name}
                    onChange={e => setData('module_name', e.target.value)}
                    required
                  />
                  <Input
                    label="Amount"
                    type="number"
                    placeholder="Amount"
                    value={data.amount}
                    onChange={e => setData('amount', e.target.value)}
                    required
                  />
                  <Input
                    label="Currency"
                    placeholder="Currency"
                    value={data.currency}
                    onChange={e => setData('currency', e.target.value)}
                  />
                  <Input
                    label="Billing Date"
                    type="date"
                    value={data.billing_date}
                    onChange={e => setData('billing_date', e.target.value)}
                    required
                  />
                  <Input
                    label="Due Date"
                    type="date"
                    value={data.due_date}
                    onChange={e => setData('due_date', e.target.value)}
                    required
                  />
                  <Select value={data.payment_method} onValueChange={val => setData('payment_method', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Payment Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="submit" disabled={processing}>Record Payment</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    </TooltipProvider>
  );
}
