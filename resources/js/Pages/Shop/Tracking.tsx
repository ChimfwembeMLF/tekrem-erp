import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ShopLayout from '@/Layouts/ShopLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Package, Search, Truck } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { formatZmw } from '@/lib/formatCurrency';

interface ShipmentEvent {
  id: number;
  status: string;
  location?: string | null;
  description?: string | null;
  occurred_at: string;
}

interface Shipment {
  id: number;
  tracking_number: string;
  carrier?: string | null;
  status: string;
  shipping_cost: string;
  shipped_at?: string | null;
  delivered_at?: string | null;
  events: ShipmentEvent[];
  shipping_method?: { name: string } | null;
  sales_order?: {
    order_number: string;
    total: string;
    metadata?: { customer_name?: string };
    items?: Array<{ description: string; quantity: string }>;
  };
}

interface Props {
  trackingNumber?: string | null;
  shipment?: Shipment | null;
  cartCount: number;
}

export default function Tracking({ trackingNumber, shipment, cartCount }: Props) {
  const route = useRoute();
  const [query, setQuery] = useState(trackingNumber ?? '');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('shop.tracking.show', query.trim()));
  };

  return (
    <ShopLayout title="Track shipment" cartCount={cartCount}>
      <Head title="Track shipment" />

      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8 text-center">
          <Truck className="mx-auto mb-3 h-10 w-10 text-primary" />
          <h1 className="text-2xl font-bold">Track your shipment</h1>
          <p className="mt-2 text-muted-foreground">Enter your tracking number to see delivery status</p>
        </div>

        <form onSubmit={submit} className="mb-8 flex gap-2">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="TRK-XXXXXXXXXX" required />
          <Button type="submit"><Search className="mr-2 h-4 w-4" />Track</Button>
        </form>

        {!shipment && trackingNumber && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No shipment found for <strong>{trackingNumber}</strong>
            </CardContent>
          </Card>
        )}

        {shipment && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <span>{shipment.tracking_number}</span>
                  <Badge variant="outline" className="capitalize">{shipment.status.replace('_', ' ')}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {shipment.sales_order && (
                  <>
                    <p><span className="text-muted-foreground">Order:</span> {shipment.sales_order.order_number}</p>
                    <p><span className="text-muted-foreground">Total:</span> {formatZmw(Number(shipment.sales_order.total))}</p>
                  </>
                )}
                {shipment.carrier && <p><span className="text-muted-foreground">Carrier:</span> {shipment.carrier}</p>}
                {shipment.shipping_method && <p><span className="text-muted-foreground">Method:</span> {shipment.shipping_method.name}</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Tracking history</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {shipment.events.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tracking events yet.</p>
                ) : (
                  shipment.events.map((event) => (
                    <div key={event.id} className="flex gap-3 border-l-2 border-primary/30 pl-4">
                      <Package className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div>
                        <p className="font-medium capitalize">{event.status.replace('_', ' ')}</p>
                        {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
                        {event.location && <p className="text-xs text-muted-foreground">{event.location}</p>}
                        <p className="text-xs text-muted-foreground">{new Date(event.occurred_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Button variant="outline" asChild className="w-full">
              <Link href={route('shop.index')}>Continue shopping</Link>
            </Button>
          </div>
        )}
      </div>
    </ShopLayout>
  );
}
