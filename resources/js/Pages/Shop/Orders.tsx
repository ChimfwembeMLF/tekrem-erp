import React from 'react';
import { Head, Link } from '@inertiajs/react';
import ShopLayout from '@/Layouts/ShopLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import useRoute from '@/Hooks/useRoute';
import { formatZmw } from '@/lib/formatCurrency';
import { Receipt } from 'lucide-react';

interface Props {
  orders: {
    data: Array<{
      id: number;
      order_number: string;
      status: string;
      total: string;
      created_at: string;
      access_token?: string;
      shipment?: { tracking_number: string; status: string } | null;
      items: Array<{ description: string; quantity: string }>;
    }>;
    links: Array<{ url: string | null; label: string; active: boolean }>;
  };
  cartCount: number;
}

export default function Orders({ orders, cartCount }: Props) {
  const route = useRoute();

  return (
    <ShopLayout title="My orders" cartCount={cartCount}>
      <Head title="My orders" />

      <div className="mx-auto max-w-3xl px-4 py-12 space-y-4">
        <h1 className="text-2xl font-bold">My orders</h1>

        {orders.data.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">No orders yet.</CardContent></Card>
        ) : (
          orders.data.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{order.order_number}</CardTitle>
                <Badge variant="outline" className="capitalize">{order.status}</Badge>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                <p className="font-semibold">{formatZmw(Number(order.total))}</p>
                {order.shipment?.tracking_number && (
                  <p>Tracking: <Link href={route('shop.tracking.show', order.shipment.tracking_number)} className="text-primary hover:underline">{order.shipment.tracking_number}</Link></p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={route('shop.order.confirmation', { order: order.id, token: order.access_token })}>View order</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <a href={route('shop.order.receipt', order.id)} target="_blank" rel="noopener noreferrer">
                      <Receipt className="mr-2 h-4 w-4" />
                      Receipt
                    </a>
                  </Button>
                  {order.shipment?.tracking_number && (
                    <Button size="sm" asChild>
                      <Link href={route('shop.tracking.show', order.shipment.tracking_number)}>Track shipment</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </ShopLayout>
  );
}
