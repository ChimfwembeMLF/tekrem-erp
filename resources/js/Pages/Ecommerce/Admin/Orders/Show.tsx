import React from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import useRoute from '@/Hooks/useRoute';
import { formatZmw } from '@/lib/formatCurrency';

interface Props {
  order: {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    payment_method?: string | null;
    total: string;
    shipping_address?: string | null;
    metadata?: { customer_name?: string; customer_email?: string; customer_phone?: string };
    items: Array<{ description: string; quantity: string; unit_price: string; total: string }>;
    shipment?: {
      id: number;
      tracking_number: string;
      status: string;
      carrier?: string | null;
      events: Array<{ status: string; description?: string; occurred_at: string }>;
    } | null;
    shipping_method?: { name: string } | null;
  };
}

export default function OrderShow({ order }: Props) {
  const route = useRoute();

  const ship = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    router.post(route('ecommerce.orders.ship', order.id), Object.fromEntries(fd));
  };

  return (
    <AppLayout title={`Order ${order.order_number}`}>
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{order.order_number}</h1>
            <p className="text-muted-foreground">{order.metadata?.customer_name} · {order.metadata?.customer_email}</p>
          </div>
          <Button variant="outline" asChild><Link href={route('ecommerce.orders.index')}>Back</Link></Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="capitalize">{order.status}</Badge>
          <Badge variant="secondary" className="capitalize">{order.payment_status}</Badge>
          {order.payment_method && <Badge variant="outline">{order.payment_method}</Badge>}
        </div>

        <Card>
          <CardHeader><CardTitle>Items</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between border-b py-2">
                <span>{item.description} × {Number(item.quantity).toFixed(0)}</span>
                <span>{formatZmw(Number(item.total))}</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 font-semibold"><span>Total</span><span>{formatZmw(Number(order.total))}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Shipment & tracking</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {order.shipment ? (
              <>
                <p>Tracking: <strong>{order.shipment.tracking_number}</strong></p>
                <p className="capitalize text-muted-foreground">Status: {order.shipment.status.replace('_', ' ')}</p>
                {order.shipment.status !== 'delivered' && (
                  <Button onClick={() => router.post(route('ecommerce.orders.deliver', order.id))}>Mark delivered</Button>
                )}
              </>
            ) : (
              <form onSubmit={ship} className="grid gap-3 sm:grid-cols-2">
                <div><Label>Tracking number</Label><Input name="tracking_number" placeholder="Optional" /></div>
                <div><Label>Carrier</Label><Input name="carrier" placeholder="Tekrem Logistics" /></div>
                <div className="sm:col-span-2"><Button type="submit">Mark as shipped</Button></div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
