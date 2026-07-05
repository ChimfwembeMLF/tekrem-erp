import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ShopLayout from '@/Layouts/ShopLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
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
import { ArrowLeft, Printer, Receipt, Truck, XCircle } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { formatZmw } from '@/lib/formatCurrency';
import { ShopTotals } from '@/lib/shopTotals';
import ShipmentTrackingTimeline from '@/Components/Shop/ShipmentTrackingTimeline';
import { shipmentStatusLabel } from '@/lib/shipmentStatuses';

interface Props {
  order: {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    payment_method?: string | null;
    shipping_address?: string | null;
    created_at: string;
    metadata?: { customer_name?: string; customer_email?: string };
    items: Array<{ description: string; quantity: string; total: string; product?: { image_urls?: string[] } }>;
    shipment?: {
      tracking_number: string;
      status: string;
      carrier?: string | null;
      events: Array<{ id: number; status: string; description?: string; location?: string; occurred_at: string }>;
    } | null;
    shipping_method?: { name: string } | null;
  };
  totals: ShopTotals;
  canCancel: boolean;
  cartCount: number;
}

export default function OrderShow({ order, totals, canCancel, cartCount }: Props) {
  const route = useRoute();
  const [reason, setReason] = useState('');

  const cancelOrder = () => {
    router.post(route('shop.orders.cancel', order.id), { reason }, { preserveScroll: true });
  };

  return (
    <ShopLayout title={`Order ${order.order_number}`} cartCount={cartCount}>
      <Head title={`Order ${order.order_number}`} />

      <div className="mx-auto max-w-3xl px-4 py-12 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
              <Link href={route('shop.orders')}><ArrowLeft className="mr-2 h-4 w-4" />Back to orders</Link>
            </Button>
            <h1 className="text-2xl font-bold">{order.order_number}</h1>
            <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="capitalize">{order.status}</Badge>
            <Badge variant="secondary" className="capitalize">{order.payment_status}</Badge>
            {order.payment_method && <Badge variant="outline">{order.payment_method}</Badge>}
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle>Items</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 border-b pb-3 last:border-0 last:pb-0">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-muted/30">
                  {item.product?.image_urls?.[0] ? (
                    <img src={item.product.image_urls[0]} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.description}</p>
                  <p className="text-sm text-muted-foreground">Qty {Number(item.quantity).toFixed(0)}</p>
                </div>
                <p className="font-medium">{formatZmw(Number(item.total))}</p>
              </div>
            ))}
            <div className="space-y-1 border-t pt-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatZmw(totals.subtotal)}</span></div>
              {(totals.discount_amount ?? 0) > 0 && (
                <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatZmw(totals.discount_amount ?? 0)}</span></div>
              )}
              {(totals.shipping_cost ?? 0) > 0 && (
                <div className="flex justify-between"><span>Shipping</span><span>{formatZmw(totals.shipping_cost ?? 0)}</span></div>
              )}
              <div className="flex justify-between font-semibold"><span>Total</span><span>{formatZmw(totals.total)}</span></div>
            </div>
          </CardContent>
        </Card>

        {order.shipping_address && (
          <Card>
            <CardHeader><CardTitle>Delivery</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-1">
              {order.shipping_method && <p><span className="text-muted-foreground">Method:</span> {order.shipping_method.name}</p>}
              <p className="whitespace-pre-line">{order.shipping_address}</p>
            </CardContent>
          </Card>
        )}

        {order.shipment && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <span>Shipment</span>
                <Badge variant="outline">{shipmentStatusLabel(order.shipment.status)}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-mono text-sm">{order.shipment.tracking_number}</p>
              <ShipmentTrackingTimeline currentStatus={order.shipment.status} events={order.shipment.events} />
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <a href={route('shop.order.receipt', order.id)} target="_blank" rel="noopener noreferrer">
              <Receipt className="mr-2 h-4 w-4" />Receipt
            </a>
          </Button>
          <Button variant="outline" onClick={() => window.open(route('shop.order.receipt', order.id), '_blank')}>
            <Printer className="mr-2 h-4 w-4" />Print
          </Button>
          {order.shipment?.tracking_number && (
            <Button asChild>
              <Link href={route('shop.tracking.show', order.shipment.tracking_number)}>
                <Truck className="mr-2 h-4 w-4" />Track
              </Link>
            </Button>
          )}
          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive"><XCircle className="mr-2 h-4 w-4" />Cancel order</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This only works before your package ships. Stock will be released and you will receive a confirmation email.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="cancel-reason">Reason (optional)</Label>
                  <Textarea id="cancel-reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep order</AlertDialogCancel>
                  <AlertDialogAction onClick={cancelOrder} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Cancel order
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </ShopLayout>
  );
}
