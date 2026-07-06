import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';
import { ArrowLeft, Building2, UserPlus } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { formatZmw } from '@/lib/formatCurrency';

interface Plan {
  id: number;
  name: string;
  slug: string;
  trial_days: number;
  price_monthly: number | string;
  price_yearly: number | string;
  currency: string;
}

interface Props {
  plans: Plan[];
}

export default function CreateOrganization({ plans }: Props) {
  const route = useRoute();
  const [ownerMode, setOwnerMode] = useState<'new' | 'existing'>('new');

  const form = useForm({
    organization_name: '',
    organization_email: '',
    phone: '',
    billing_plan_id: plans[0]?.id ?? '',
    billing_cycle: 'monthly' as 'monthly' | 'yearly',
    owner_mode: 'new' as 'new' | 'existing',
    owner_name: '',
    owner_email: '',
    owner_password: '',
    owner_password_confirmation: '',
  });

  const selectedPlan = plans.find((plan) => plan.id === Number(form.data.billing_plan_id));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    form.setData('owner_mode', ownerMode);
    form.post(route('admin.platform.organizations.store'));
  };

  return (
    <AppLayout title="Create organization">
      <Head title="Create organization" />

      <div className="mx-auto max-w-2xl space-y-6 py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={route('admin.platform.organizations.index')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create organization</h1>
            <p className="text-muted-foreground">Provision a new tenant with owner and billing plan.</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5" />
                Organization
              </CardTitle>
              <CardDescription>Company details and subscription plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="organization_name">Company name</Label>
                <Input
                  id="organization_name"
                  value={form.data.organization_name}
                  onChange={(e) => form.setData('organization_name', e.target.value)}
                  required
                />
                {form.errors.organization_name && (
                  <p className="text-sm text-red-600">{form.errors.organization_name}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="organization_email">Company email</Label>
                  <Input
                    id="organization_email"
                    type="email"
                    value={form.data.organization_email}
                    onChange={(e) => form.setData('organization_email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={form.data.phone}
                    onChange={(e) => form.setData('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Billing plan</Label>
                  <Select
                    value={String(form.data.billing_plan_id)}
                    onValueChange={(value) => form.setData('billing_plan_id', Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={String(plan.id)}>
                          {plan.name} ({plan.trial_days}-day trial)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Billing cycle</Label>
                  <Select
                    value={form.data.billing_cycle}
                    onValueChange={(value: 'monthly' | 'yearly') => form.setData('billing_cycle', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedPlan && (
                <p className="text-sm text-muted-foreground">
                  Trial: {selectedPlan.trial_days} days, then{' '}
                  {formatZmw(Number(form.data.billing_cycle === 'yearly' ? selectedPlan.price_yearly : selectedPlan.price_monthly))}
                  /{form.data.billing_cycle === 'yearly' ? 'year' : 'month'} via platform PawaPay.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserPlus className="h-5 w-5" />
                Owner account
              </CardTitle>
              <CardDescription>Create a new owner or assign an existing user.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={ownerMode}
                onValueChange={(value) => setOwnerMode(value as 'new' | 'existing')}
                className="grid gap-3 sm:grid-cols-2"
              >
                <div className="flex items-center space-x-2 rounded-lg border p-3">
                  <RadioGroupItem value="new" id="owner-new" />
                  <Label htmlFor="owner-new" className="cursor-pointer font-normal">New user</Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border p-3">
                  <RadioGroupItem value="existing" id="owner-existing" />
                  <Label htmlFor="owner-existing" className="cursor-pointer font-normal">Existing user</Label>
                </div>
              </RadioGroup>

              {ownerMode === 'new' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="owner_name">Owner name</Label>
                    <Input
                      id="owner_name"
                      value={form.data.owner_name}
                      onChange={(e) => form.setData('owner_name', e.target.value)}
                      required
                    />
                    {form.errors.owner_name && <p className="text-sm text-red-600">{form.errors.owner_name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="owner_email">Owner email</Label>
                    <Input
                      id="owner_email"
                      type="email"
                      value={form.data.owner_email}
                      onChange={(e) => form.setData('owner_email', e.target.value)}
                      required
                    />
                    {form.errors.owner_email && <p className="text-sm text-red-600">{form.errors.owner_email}</p>}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="owner_password">Password</Label>
                      <Input
                        id="owner_password"
                        type="password"
                        value={form.data.owner_password}
                        onChange={(e) => form.setData('owner_password', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="owner_password_confirmation">Confirm password</Label>
                      <Input
                        id="owner_password_confirmation"
                        type="password"
                        value={form.data.owner_password_confirmation}
                        onChange={(e) => form.setData('owner_password_confirmation', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  {form.errors.owner_password && <p className="text-sm text-red-600">{form.errors.owner_password}</p>}
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="existing_owner_email">Existing user email</Label>
                  <Input
                    id="existing_owner_email"
                    type="email"
                    value={form.data.owner_email}
                    onChange={(e) => form.setData('owner_email', e.target.value)}
                    required
                  />
                  {form.errors.owner_email && <p className="text-sm text-red-600">{form.errors.owner_email}</p>}
                </div>
              )}
            </CardContent>
          </Card>

          <Button type="submit" disabled={form.processing}>
            {form.processing ? 'Creating…' : 'Create organization'}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
