import React from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { CheckCircle, Printer } from 'lucide-react';
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
  shipping_address?: string;
  metadata?: { customer_name?: string; customer_email?: string; customer_phone?: string };
  items: Item[];
}
interface Props { order: Order; totals: ShopTotals }

export default function ShopConfirmation({ order, totals }: Props) {
  const route = useRoute();

  const printReceipt = () => {
    window.open(route('shop.order.receipt', order.id), '_blank');
  };

  return (
    <GuestLayout title="Order Confirmed">
      <Head title="Order Confirmed" />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-8">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Order confirmed</h1>
          <p className="text-muted-foreground">
            Thank you{order.metadata?.customer_name ? `, ${order.metadata.customer_name}` : ''}.
            Your order <strong>{order.order_number}</strong> has been placed.
          </p>
        </div>

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
          <Button variant="outline" size="lg" onClick={printReceipt}>
            <Printer className="h-4 w-4 mr-2" />
            Print Receipt
          </Button>
          <Button asChild size="lg"><Link href={route('shop.index')}>Continue shopping</Link></Button>
        </div>
      </div>
    </GuestLayout>
  );
}
