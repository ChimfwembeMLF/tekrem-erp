import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';

interface Item { id: number; description: string; quantity: string; unit_price: string; total: string }
interface Order { id: number; order_number: string; status: string; source: string; total: string; client?: { name: string }; items: Item[] }
interface Props { order: Order }

export default function SalesOrdersShow({ order }: Props) {
  return (
    <AppLayout title={order.order_number}>
      <Head title={order.order_number} />
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div><h1 className="text-2xl font-bold">{order.order_number}</h1><p className="text-muted-foreground">{order.client?.name ?? 'No client'} · {order.source}</p></div>
          <div className="flex gap-2">
            {order.status === 'draft' && <Button onClick={() => router.post(route('sales.orders.confirm', order.id))}>Confirm</Button>}
            {order.status === 'confirmed' && <Button onClick={() => router.post(route('sales.orders.fulfill', order.id))}>Fulfill</Button>}
            <Badge>{order.status}</Badge>
          </div>
        </div>
        <Card><CardHeader><CardTitle>Items</CardTitle></CardHeader><CardContent className="space-y-2">
          {order.items.map(i => <div key={i.id} className="flex justify-between border-b pb-2"><span>{i.description} × {Number(i.quantity).toFixed(0)}</span><span>ZMW {Number(i.total).toFixed(2)}</span></div>)}
          <p className="font-bold pt-2">Total: ZMW {Number(order.total).toFixed(2)}</p>
        </CardContent></Card>
      </div>
    </AppLayout>
  );
}
