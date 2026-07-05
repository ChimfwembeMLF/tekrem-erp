import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Switch } from '@/Components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/Components/ui/alert-dialog';
import { Loader2, Pencil, Percent, Plus, Tag, Trash2 } from 'lucide-react';
import { Switch } from '@/Components/ui/switch';
import useRoute from '@/Hooks/useRoute';
import { formatZmw } from '@/lib/formatCurrency';
import ModuleDashboardShell from '@/Components/Dashboard/ModuleDashboardShell';
import EcommerceModuleNav from '@/Components/Ecommerce/EcommerceModuleNav';
import {
  ModuleFormSection,
  ModuleFormGrid,
  ModuleFormField,
  ModuleFormHint,
} from '@/Components/Module/moduleFormWrappers';

interface Coupon {
  id: number;
  code: string;
  type: string;
  value: string;
  min_order_amount?: string | null;
  used_count: number;
  max_uses?: number | null;
  starts_at?: string | null;
  expires_at?: string | null;
  is_active: boolean;
}

export default function CouponsIndex({ coupons }: { coupons: Coupon[] }) {
  const route = useRoute();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Coupon>>({});
  const toggleActive = (coupon: Coupon) => {
    router.put(route('ecommerce.coupons.update', coupon.id), {
      ...coupon,
      is_active: !coupon.is_active,
    }, { preserveScroll: true });
  };

  const saveEdit = () => {
    if (!editingId) return;
    router.put(route('ecommerce.coupons.update', editingId), editForm, {
      preserveScroll: true,
      onSuccess: () => setEditingId(null),
    });
  };

  const { data, setData, post, processing, errors, reset } = useForm({
    code: '',
    type: 'percent' as 'percent' | 'fixed',
    value: '',
    min_order_amount: '',
    max_uses: '',
    starts_at: '',
    expires_at: '',
    is_active: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('ecommerce.coupons.store'), {
      preserveScroll: true,
      onSuccess: () => reset(),
    });
  };

  const formatDiscount = (coupon: Coupon) =>
    coupon.type === 'percent' ? `${Number(coupon.value)}% off` : `${formatZmw(Number(coupon.value))} off`;

  const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <ModuleDashboardShell
      title="Shop coupons"
      description="Discount codes customers can apply at checkout"
      workspaceLabel="Ecommerce workspace"
      heroAccent="from-emerald-500/15 via-emerald-500/5 to-secondary/10"
      moduleNav={<EcommerceModuleNav />}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
        <ModuleFormSection
          title="Create coupon"
          description="Set up a promotional code with optional limits and validity dates."
          icon={<Plus className="h-5 w-5" />}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <ModuleFormGrid>
              <ModuleFormField label="Coupon code" htmlFor="code" error={errors.code} required hint="Customers enter this at checkout.">
                <Input
                  id="code"
                  value={data.code}
                  onChange={(e) => setData('code', e.target.value.toUpperCase().replace(/\s+/g, ''))}
                  placeholder="WELCOME10"
                  className="font-mono uppercase"
                />
              </ModuleFormField>
              <ModuleFormField label="Discount type" error={errors.type} required>
                <Select value={data.type} onValueChange={(value: 'percent' | 'fixed') => setData('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percentage off</SelectItem>
                    <SelectItem value="fixed">Fixed amount off (ZMW)</SelectItem>
                  </SelectContent>
                </Select>
              </ModuleFormField>
            </ModuleFormGrid>

            <ModuleFormGrid columns={3}>
              <ModuleFormField
                label={data.type === 'percent' ? 'Discount (%)' : 'Amount (ZMW)'}
                htmlFor="value"
                error={errors.value}
                required
              >
                <Input
                  id="value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.value}
                  onChange={(e) => setData('value', e.target.value)}
                  placeholder={data.type === 'percent' ? '10' : '50'}
                />
              </ModuleFormField>
              <ModuleFormField label="Min order (ZMW)" htmlFor="min_order_amount" error={errors.min_order_amount} hint="Optional minimum cart value.">
                <Input
                  id="min_order_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.min_order_amount}
                  onChange={(e) => setData('min_order_amount', e.target.value)}
                  placeholder="100"
                />
              </ModuleFormField>
              <ModuleFormField label="Max uses" htmlFor="max_uses" error={errors.max_uses} hint="Leave blank for unlimited.">
                <Input
                  id="max_uses"
                  type="number"
                  min="1"
                  value={data.max_uses}
                  onChange={(e) => setData('max_uses', e.target.value)}
                  placeholder="1000"
                />
              </ModuleFormField>
            </ModuleFormGrid>

            <ModuleFormGrid>
              <ModuleFormField label="Valid from" htmlFor="starts_at" error={errors.starts_at}>
                <Input
                  id="starts_at"
                  type="date"
                  value={data.starts_at}
                  onChange={(e) => setData('starts_at', e.target.value)}
                />
              </ModuleFormField>
              <ModuleFormField label="Expires on" htmlFor="expires_at" error={errors.expires_at}>
                <Input
                  id="expires_at"
                  type="date"
                  value={data.expires_at}
                  onChange={(e) => setData('expires_at', e.target.value)}
                />
              </ModuleFormField>
            </ModuleFormGrid>

            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Inactive codes cannot be redeemed.</p>
              </div>
              <Switch checked={data.is_active} onCheckedChange={(checked) => setData('is_active', checked)} />
            </div>

            <div className="flex justify-end border-t border-border/60 pt-4">
              <Button type="submit" disabled={processing} className="min-w-[140px]">
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create coupon
                  </>
                )}
              </Button>
            </div>
          </form>
        </ModuleFormSection>

        <ModuleFormSection
          title="Active coupons"
          description={`${coupons.length} coupon${coupons.length === 1 ? '' : 's'} configured.`}
          icon={<Tag className="h-5 w-5" />}
        >
          {coupons.length === 0 ? (
            <div className="py-12 text-center">
              <Tag className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm font-medium text-foreground">No coupons yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Create a code above or seed the sample WELCOME10 coupon:</p>
              <p className="mt-3 font-mono text-xs text-muted-foreground">php artisan db:seed --class=ShopShippingSeeder</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Validity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell>
                        <code className="rounded bg-muted px-2 py-1 text-sm font-semibold">{coupon.code}</code>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-sm">
                          {coupon.type === 'percent' ? (
                            <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                          {formatDiscount(coupon)}
                        </span>
                        {coupon.min_order_amount && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Min order {formatZmw(Number(coupon.min_order_amount))}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {coupon.used_count}
                        {coupon.max_uses ? ` / ${coupon.max_uses}` : ' uses'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <p>{formatDate(coupon.starts_at)} → {formatDate(coupon.expires_at)}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch checked={coupon.is_active} onCheckedChange={() => toggleActive(coupon)} />
                          <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                            {coupon.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {editingId === coupon.id ? (
                            <>
                              <Button size="sm" onClick={saveEdit}>Save</Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => { setEditingId(coupon.id); setEditForm(coupon); }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete coupon?</AlertDialogTitle>
                              <AlertDialogDescription>
                                <strong>{coupon.code}</strong> will be permanently removed. Customers will no longer be able to use it.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => router.delete(route('ecommerce.coupons.destroy', coupon.id))}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                            </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="mt-4">
            <ModuleFormHint>
              Coupons are validated at checkout. Percent discounts apply to the cart subtotal before shipping.
            </ModuleFormHint>
          </div>
        </ModuleFormSection>
      </div>
    </ModuleDashboardShell>
  );
}
