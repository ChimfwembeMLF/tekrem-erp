import React, { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import ShopLayout from '@/Layouts/ShopLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Printer,
  Smartphone,
  Truck,
  XCircle,
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { formatZmw } from '@/lib/formatCurrency';
import { ShopTotals } from '@/lib/shopTotals';

interface Item {
  description: string;
  quantity: string;
  total: string;
  product?: { image_urls?: string[] };
}

interface Order {
  id: number;
  order_number: string;
  total: string;
  payment_method?: string | null;
  payment_status?: string;
  shipping_address?: string;
  metadata?: { customer_name?: string };
  items: Item[];
  shipment?: { tracking_number: string } | null;
}

interface Props {
  order: Order;
  totals: ShopTotals;
  awaitingMomoPayment?: boolean;
}

export default function ShopConfirmation({ order, totals, awaitingMomoPayment = false }: Props) {
  const route = useRoute();
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status ?? 'pending');
  const [polling, setPolling] = useState(awaitingMomoPayment);

  useEffect(() => {
    if (!awaitingMomoPayment) return;

    const interval = window.setInterval(async () => {
      try {
        const { data } = await axios.get(route('shop.order.payment-status', order.id), {
          params: { token: new URLSearchParams(window.location.search).get('token') },
        });
        setPaymentStatus(data.payment_status);
        if (data.payment_status !== 'pending') {
          setPolling(false);
          window.clearInterval(interval);
        }
      } catch {
        setPolling(false);
        window.clearInterval(interval);
      }
    }, 4000);

    return () => window.clearInterval(interval);
  }, [awaitingMomoPayment, order.id, route]);

  const printReceipt = () => {
    window.open(route('shop.order.receipt', order.id), '_blank');
  };

  const paymentBadge = () => {
    if (order.payment_method === 'cod') {
      return <Badge variant="secondary">Pay on delivery</Badge>;
    }
    if (paymentStatus === 'paid') {
      return <Badge className="bg-green-600">Payment confirmed</Badge>;
    }
    if (paymentStatus === 'failed') {
      return <Badge variant="destructive">Payment failed</Badge>;
    }
    return <Badge variant="outline">Awaiting MoMo payment</Badge>;
  };

  return (
    <ShopLayout title="Order Confirmed">
      <Head title="Order Confirmed" />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-8">
        {paymentStatus === 'paid' || order.payment_method === 'cod' ? (
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
        ) : paymentStatus === 'failed' ? (
          <XCircle className="h-16 w-16 text-destructive mx-auto" />
        ) : (
          <Loader2 className="h-16 w-16 text-primary mx-auto animate-spin" />
        )}

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Order confirmed</h1>
          <p className="text-muted-foreground">
            Thank you{order.metadata?.customer_name ? `, ${order.metadata.customer_name}` : ''}.
            Your order <strong>{order.order_number}</strong> has been placed.
          </p>
          <div className="flex justify-center gap-2 pt-1">{paymentBadge()}</div>
        </div>

        {awaitingMomoPayment && paymentStatus === 'pending' && (
          <Card className="border-primary/30 bg-primary/5 text-left">
            <CardContent className="flex gap-3 pt-6">
              <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="space-y-1 text-sm">
                <p className="font-medium">Complete payment on your phone</p>
                <p className="text-muted-foreground">
                  Approve the PawaPay prompt on your mobile money device. This page updates automatically{polling ? '…' : '.'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {paymentStatus === 'failed' && (
          <Card className="border-destructive/40 bg-destructive/5 text-left">
            <CardContent className="flex gap-3 pt-6 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>Mobile money payment was not completed. Contact support or place a new order.</p>
            </CardContent>
          </Card>
        )}

        <Card className="text-left">
          <CardHeader><CardTitle>Order summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-muted/30">
                  {item.product?.image_urls?.[0] ? (
                    <img src={item.product.image_urls[0]} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{item.description}</p>
                  <p className="text-xs text-muted-foreground">Qty {Number(item.quantity).toFixed(0)}</p>
                </div>
                <p className="text-sm font-medium">{formatZmw(Number(item.total))}</p>
              </div>
            ))}

            <div className="space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatZmw(totals.subtotal)}</span></div>
              {(totals.discount_amount ?? 0) > 0 && (
                <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatZmw(totals.discount_amount ?? 0)}</span></div>
              )}
              {(totals.shipping_cost ?? 0) > 0 && (
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{formatZmw(totals.shipping_cost ?? 0)}</span></div>
              )}
              <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatZmw(totals.tax_amount)}</span></div>
              <div className="flex justify-between font-semibold"><span>Total</span><span>{formatZmw(totals.total)}</span></div>
            </div>

            {order.shipping_address && (
              <div className="border-t pt-4 text-sm">
                <p className="font-medium mb-1">Shipping to</p>
                <p className="text-muted-foreground whitespace-pre-line">{order.shipping_address}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" variant="secondary">
            <Link href={route('shop.orders.show', order.id)}>View order details</Link>
          </Button>
          {order.shipment?.tracking_number && (
            <Button asChild size="lg" variant="outline">
              <Link href={route('shop.tracking.show', order.shipment.tracking_number)}>
                <Truck className="h-4 w-4 mr-2" />
                Track shipment
              </Link>
            </Button>
          )}
          <Button variant="outline" size="lg" onClick={printReceipt}>
            <Printer className="h-4 w-4 mr-2" />
            Print Receipt
          </Button>
          <Button asChild size="lg"><Link href={route('shop.index')}>Continue shopping</Link></Button>
        </div>
      </div>
    </ShopLayout>
  );
}
