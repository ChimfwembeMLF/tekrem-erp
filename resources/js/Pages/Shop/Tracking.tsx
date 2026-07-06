import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ShopLayout from '@/Layouts/ShopLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Search, Truck } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { formatZmw } from '@/lib/formatCurrency';
import { shipmentStatusLabel } from '@/lib/shipmentStatuses';
import ShipmentTrackingTimeline from '@/Components/Shop/ShipmentTrackingTimeline';
import DocumentCodeStrip from '@/Components/Codes/DocumentCodeStrip';

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
          <p className="mt-2 text-muted-foreground">Enter your tracking number to see delivery progress</p>
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
                  <span className="font-mono text-base">{shipment.tracking_number}</span>
                  <Badge variant="outline">{shipmentStatusLabel(shipment.status)}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <DocumentCodeStrip
                  label="Tracking number"
                  value={shipment.tracking_number}
                  qrValue={route('shop.tracking.show', shipment.tracking_number)}
                  layout="row"
                  className="mb-2"
                  barcodeHeight={36}
                  qrSize={72}
                />
                {shipment.sales_order && (
                  <>
                    <p><span className="text-muted-foreground">Order:</span> {shipment.sales_order.order_number}</p>
                    <p><span className="text-muted-foreground">Total:</span> {formatZmw(Number(shipment.sales_order.total))}</p>
                  </>
                )}
                {shipment.carrier && <p><span className="text-muted-foreground">Carrier:</span> {shipment.carrier}</p>}
                {shipment.shipping_method && <p><span className="text-muted-foreground">Method:</span> {shipment.shipping_method.name}</p>}
                {shipment.shipped_at && (
                  <p><span className="text-muted-foreground">Shipped:</span> {new Date(shipment.shipped_at).toLocaleString()}</p>
                )}
                {shipment.delivered_at && (
                  <p><span className="text-muted-foreground">Delivered:</span> {new Date(shipment.delivered_at).toLocaleString()}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Delivery progress</CardTitle></CardHeader>
              <CardContent>
                <ShipmentTrackingTimeline
                  currentStatus={shipment.status}
                  events={shipment.events}
                />
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
