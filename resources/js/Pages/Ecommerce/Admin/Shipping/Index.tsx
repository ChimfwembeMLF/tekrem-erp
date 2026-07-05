import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import { Switch } from '@/Components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { Clock, Loader2, Pencil, Plus, Truck } from 'lucide-react';
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

interface Method {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  base_cost: string;
  estimated_days_min: number;
  estimated_days_max: number;
  is_active: boolean;
}

export default function ShippingIndex({ methods }: { methods: Method[] }) {
  const route = useRoute();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Method>>({});
  const startEdit = (method: Method) => {
    setEditingId(method.id);
    setEditForm(method);
  };

  const saveEdit = () => {
    if (!editingId) return;
    router.put(route('ecommerce.shipping.update', editingId), editForm, {
      preserveScroll: true,
      onSuccess: () => {
        setEditingId(null);
        setEditForm({});
      },
    });
  };

  const toggleActive = (method: Method) => {
    router.put(route('ecommerce.shipping.update', method.id), {
      ...method,
      is_active: !method.is_active,
    }, { preserveScroll: true });
  };

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    code: '',
    description: '',
    base_cost: '',
    estimated_days_min: '1',
    estimated_days_max: '5',
    is_active: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('ecommerce.shipping.store'), {
      preserveScroll: true,
      onSuccess: () => reset(),
    });
  };

  return (
    <ModuleDashboardShell
      title="Shipping methods"
      description="Configure delivery options shown at checkout"
      workspaceLabel="Ecommerce workspace"
      heroAccent="from-emerald-500/15 via-emerald-500/5 to-secondary/10"
      moduleNav={<EcommerceModuleNav />}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
        <ModuleFormSection
          title="New shipping method"
          description="Define a delivery option customers can choose during checkout."
          icon={<Plus className="h-5 w-5" />}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <ModuleFormGrid>
              <ModuleFormField label="Display name" htmlFor="name" error={errors.name} required hint="Shown to customers at checkout.">
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="Standard delivery"
                />
              </ModuleFormField>
              <ModuleFormField label="Internal code" htmlFor="code" error={errors.code} required hint="Unique slug, e.g. standard or express.">
                <Input
                  id="code"
                  value={data.code}
                  onChange={(e) => setData('code', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  placeholder="standard"
                />
              </ModuleFormField>
            </ModuleFormGrid>

            <ModuleFormField label="Description" htmlFor="description" error={errors.description} hint="Brief note about coverage or timing.">
              <Textarea
                id="description"
                rows={3}
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="Delivery within Lusaka and surrounding areas"
              />
            </ModuleFormField>

            <ModuleFormGrid columns={3}>
              <ModuleFormField label="Base cost (ZMW)" htmlFor="base_cost" error={errors.base_cost} required>
                <Input
                  id="base_cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.base_cost}
                  onChange={(e) => setData('base_cost', e.target.value)}
                  placeholder="50.00"
                />
              </ModuleFormField>
              <ModuleFormField label="Min days" htmlFor="estimated_days_min" error={errors.estimated_days_min} required>
                <Input
                  id="estimated_days_min"
                  type="number"
                  min="0"
                  value={data.estimated_days_min}
                  onChange={(e) => setData('estimated_days_min', e.target.value)}
                />
              </ModuleFormField>
              <ModuleFormField label="Max days" htmlFor="estimated_days_max" error={errors.estimated_days_max} required>
                <Input
                  id="estimated_days_max"
                  type="number"
                  min="0"
                  value={data.estimated_days_max}
                  onChange={(e) => setData('estimated_days_max', e.target.value)}
                />
              </ModuleFormField>
            </ModuleFormGrid>

            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Active at checkout</p>
                <p className="text-xs text-muted-foreground">Inactive methods are hidden from customers.</p>
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
                    Add method
                  </>
                )}
              </Button>
            </div>
          </form>
        </ModuleFormSection>

        <ModuleFormSection
          title="Configured methods"
          description={`${methods.length} method${methods.length === 1 ? '' : 's'} available to shoppers.`}
          icon={<Truck className="h-5 w-5" />}
        >
          {methods.length === 0 ? (
            <div className="py-12 text-center">
              <Truck className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm font-medium text-foreground">No shipping methods yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Add your first method using the form, or seed defaults:</p>
              <p className="mt-3 font-mono text-xs text-muted-foreground">php artisan db:seed --class=ShopShippingSeeder</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead>Method</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {methods.map((method) => (
                    <TableRow key={method.id}>
                      <TableCell>
                        {editingId === method.id ? (
                          <div className="space-y-2">
                            <Input value={editForm.name ?? ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                            <Textarea
                              rows={2}
                              value={editForm.description ?? ''}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              placeholder="Description"
                            />
                          </div>
                        ) : (
                          <>
                            <p className="font-medium">{method.name}</p>
                            {method.description && (
                              <p className="mt-0.5 max-w-xs text-xs text-muted-foreground line-clamp-2">{method.description}</p>
                            )}
                          </>
                        )}
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{method.code}</code>
                      </TableCell>
                      <TableCell className="font-medium">
                        {editingId === method.id ? (
                          <Input type="number" step="0.01" value={editForm.base_cost ?? ''} onChange={(e) => setEditForm({ ...editForm, base_cost: e.target.value })} />
                        ) : (
                          formatZmw(Number(method.base_cost))
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === method.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              min="0"
                              className="w-16"
                              value={editForm.estimated_days_min ?? ''}
                              onChange={(e) => setEditForm({ ...editForm, estimated_days_min: Number(e.target.value) })}
                            />
                            <span className="text-muted-foreground">–</span>
                            <Input
                              type="number"
                              min="0"
                              className="w-16"
                              value={editForm.estimated_days_max ?? ''}
                              onChange={(e) => setEditForm({ ...editForm, estimated_days_max: Number(e.target.value) })}
                            />
                            <span className="text-xs text-muted-foreground">days</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {method.estimated_days_min}–{method.estimated_days_max} days
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch checked={method.is_active} onCheckedChange={() => toggleActive(method)} />
                          <Badge variant={method.is_active ? 'default' : 'secondary'}>
                            {method.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {editingId === method.id ? (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" onClick={saveEdit}>Save</Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => startEdit(method)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="mt-4">
            <ModuleFormHint>
              Shipping costs are added to the order total when a customer selects a method at checkout.
            </ModuleFormHint>
          </div>
        </ModuleFormSection>
      </div>
    </ModuleDashboardShell>
  );
}
