import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { Checkbox } from '@/Components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';
import { CreditCard, Building2, Pencil, Plus } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { formatZmw } from '@/lib/formatCurrency';

interface Plan {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price_monthly: string;
  price_yearly: string;
  currency: string;
  trial_days: number;
  max_users: number | null;
  max_products: number | null;
  max_orders_per_month: number | null;
  enabled_modules: string[];
  features: string[];
  is_active: boolean;
  is_public: boolean;
  sort_order: number;
  subscriber_count: number;
}

interface Props {
  plans: Plan[];
  modules: Record<string, string>;
}

const emptyPlan = {
  name: '',
  slug: '',
  description: '',
  price_monthly: '0',
  price_yearly: '0',
  currency: 'ZMW',
  trial_days: 14,
  max_users: '',
  max_products: '',
  max_orders_per_month: '',
  enabled_modules: [] as string[],
  features: [''],
  is_active: true,
  is_public: true,
  sort_order: 0,
};

export default function PlansIndex({ plans, modules }: Props) {
  const route = useRoute();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);

  const { data, setData, post, put, processing, reset, errors } = useForm({ ...emptyPlan }).transform((payload) => ({
    ...payload,
    max_users: payload.max_users === '' ? null : Number(payload.max_users),
    max_products: payload.max_products === '' ? null : Number(payload.max_products),
    max_orders_per_month: payload.max_orders_per_month === '' ? null : Number(payload.max_orders_per_month),
    features: payload.features.filter(Boolean),
  }));

  const openCreate = () => {
    setEditing(null);
    reset();
    setData({ ...emptyPlan, features: [''] });
    setDialogOpen(true);
  };

  const openEdit = (plan: Plan) => {
    setEditing(plan);
    setData({
      name: plan.name,
      slug: plan.slug,
      description: plan.description ?? '',
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly,
      currency: plan.currency,
      trial_days: plan.trial_days,
      max_users: plan.max_users?.toString() ?? '',
      max_products: plan.max_products?.toString() ?? '',
      max_orders_per_month: plan.max_orders_per_month?.toString() ?? '',
      enabled_modules: plan.enabled_modules,
      features: plan.features.length ? plan.features : [''],
      is_active: plan.is_active,
      is_public: plan.is_public,
      sort_order: plan.sort_order,
    });
    setDialogOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const options = { onSuccess: () => setDialogOpen(false) };

    if (editing) {
      put(route('admin.platform.plans.update', editing.id), options);
    } else {
      post(route('admin.platform.plans.store'), options);
    }
  };

  const toggleModule = (key: string) => {
    setData(
      'enabled_modules',
      data.enabled_modules.includes(key)
        ? data.enabled_modules.filter((m) => m !== key)
        : [...data.enabled_modules, key],
    );
  };

  return (
    <AppLayout title="Billing plans">
      <Head title="Billing plans" />

      <div className="mx-auto max-w-6xl space-y-6 py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Billing plans</h1>
            <p className="text-muted-foreground">Package modules and limits for tenant subscriptions.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={route('admin.platform.organizations.index')}>
                <Building2 className="mr-2 h-4 w-4" />
                Organizations
              </Link>
            </Button>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New plan
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5" />
              Plans ({plans.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Monthly</TableHead>
                  <TableHead>Yearly</TableHead>
                  <TableHead>Modules</TableHead>
                  <TableHead>Subscribers</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <p className="font-medium">{plan.name}</p>
                      <p className="text-xs text-muted-foreground">{plan.slug}</p>
                    </TableCell>
                    <TableCell>{formatZmw(Number(plan.price_monthly))}</TableCell>
                    <TableCell>{formatZmw(Number(plan.price_yearly))}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {plan.enabled_modules.slice(0, 4).map((m) => (
                          <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>
                        ))}
                        {plan.enabled_modules.length > 4 && (
                          <Badge variant="outline" className="text-xs">+{plan.enabled_modules.length - 4}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{plan.subscriber_count}</TableCell>
                    <TableCell>
                      <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                        {plan.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(plan)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${editing.name}` : 'Create billing plan'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" value={data.slug} onChange={(e) => setData('slug', e.target.value)} />
                {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={2} value={data.description} onChange={(e) => setData('description', e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price_monthly">Monthly (ZMW)</Label>
                <Input id="price_monthly" type="number" min="0" step="0.01" value={data.price_monthly} onChange={(e) => setData('price_monthly', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_yearly">Yearly (ZMW)</Label>
                <Input id="price_yearly" type="number" min="0" step="0.01" value={data.price_yearly} onChange={(e) => setData('price_yearly', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trial_days">Trial days</Label>
                <Input id="trial_days" type="number" min="0" value={data.trial_days} onChange={(e) => setData('trial_days', Number(e.target.value))} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="max_users">Max users</Label>
                <Input id="max_users" placeholder="Unlimited" value={data.max_users} onChange={(e) => setData('max_users', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_products">Max products</Label>
                <Input id="max_products" placeholder="Unlimited" value={data.max_products} onChange={(e) => setData('max_products', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_orders">Max orders / mo</Label>
                <Input id="max_orders_per_month" placeholder="Unlimited" value={data.max_orders_per_month} onChange={(e) => setData('max_orders_per_month', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Enabled modules</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(modules).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={data.enabled_modules.includes(key)} onCheckedChange={() => toggleModule(key)} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={data.is_active} onCheckedChange={(v) => setData('is_active', v === true)} />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={data.is_public} onCheckedChange={(v) => setData('is_public', v === true)} />
                Public (signup)
              </label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={processing}>{editing ? 'Save changes' : 'Create plan'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
