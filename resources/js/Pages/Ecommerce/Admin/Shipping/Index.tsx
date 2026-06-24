import React from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import useRoute from '@/Hooks/useRoute';
import { formatZmw } from '@/lib/formatCurrency';

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

  return (
    <AppLayout title="Shipping methods">
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <h1 className="text-2xl font-bold">Shipping methods</h1>

        <Card>
          <CardHeader><CardTitle>Add method</CardTitle></CardHeader>
          <CardContent>
            <form
              className="grid gap-3 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                router.post(route('ecommerce.shipping.store'), Object.fromEntries(new FormData(e.currentTarget)));
              }}
            >
              <div><Label>Name</Label><Input name="name" required /></div>
              <div><Label>Code</Label><Input name="code" required /></div>
              <div className="sm:col-span-2"><Label>Description</Label><Input name="description" /></div>
              <div><Label>Base cost (ZMW)</Label><Input name="base_cost" type="number" step="0.01" required /></div>
              <div><Label>Est. days min</Label><Input name="estimated_days_min" type="number" defaultValue={1} required /></div>
              <div><Label>Est. days max</Label><Input name="estimated_days_max" type="number" defaultValue={5} required /></div>
              <div className="sm:col-span-2"><Button type="submit">Create</Button></div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {methods.map((m) => (
            <Card key={m.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{m.name}</p>
                  <p className="text-sm text-muted-foreground">{m.description}</p>
                  <p className="text-sm">{formatZmw(Number(m.base_cost))} · {m.estimated_days_min}-{m.estimated_days_max} days</p>
                </div>
                <span className="text-xs uppercase text-muted-foreground">{m.is_active ? 'Active' : 'Inactive'}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
