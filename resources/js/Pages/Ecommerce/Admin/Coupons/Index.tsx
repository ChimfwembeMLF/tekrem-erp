import React from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import useRoute from '@/Hooks/useRoute';

interface Coupon {
  id: number;
  code: string;
  type: string;
  value: string;
  used_count: number;
  max_uses?: number | null;
  is_active: boolean;
}

export default function CouponsIndex({ coupons }: { coupons: Coupon[] }) {
  const route = useRoute();

  return (
    <AppLayout title="Coupons">
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <h1 className="text-2xl font-bold">Shop coupons</h1>

        <Card>
          <CardHeader><CardTitle>Create coupon</CardTitle></CardHeader>
          <CardContent>
            <form
              className="grid gap-3 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                router.post(route('ecommerce.coupons.store'), Object.fromEntries(new FormData(e.currentTarget)));
              }}
            >
              <div><Label>Code</Label><Input name="code" required /></div>
              <div><Label>Type</Label><Input name="type" defaultValue="percent" placeholder="percent or fixed" required /></div>
              <div><Label>Value</Label><Input name="value" type="number" step="0.01" required /></div>
              <div><Label>Min order</Label><Input name="min_order_amount" type="number" step="0.01" /></div>
              <div><Label>Max uses</Label><Input name="max_uses" type="number" /></div>
              <div className="sm:col-span-2"><Button type="submit">Create coupon</Button></div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-2">
          {coupons.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-mono font-semibold">{c.code}</p>
                  <p className="text-sm text-muted-foreground">{c.type === 'percent' ? `${c.value}% off` : `K ${c.value} off`}</p>
                  <p className="text-xs text-muted-foreground">Used {c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={c.is_active ? 'default' : 'secondary'}>{c.is_active ? 'Active' : 'Inactive'}</Badge>
                  <Button size="sm" variant="destructive" onClick={() => router.delete(route('ecommerce.coupons.destroy', c.id))}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
