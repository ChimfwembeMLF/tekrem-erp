import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';

interface Item { id: number; description: string; quantity: string; quantity_received: string; unit_cost: string; total: string; product?: { name: string } }
interface Order { id: number; po_number: string; status: string; total: string; supplier: { name: string }; warehouse: { name: string }; items: Item[] }
interface Props { order: Order }

export default function PurchaseOrdersShow({ order }: Props) {
  const receiveAll = () => {
    router.post(route('procurement.purchase-orders.receive', order.id), {
      items: order.items.map(i => ({ purchase_order_item_id: i.id, quantity_received: String(Number(i.quantity) - Number(i.quantity_received || 0)) })),
    });
  };

  return (
    <AppLayout title={order.po_number}>
      <Head title={order.po_number} />
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div><h1 className="text-2xl font-bold">{order.po_number}</h1><p className="text-muted-foreground">{order.supplier.name} → {order.warehouse.name}</p></div>
          <div className="flex gap-2">
            {order.status === 'draft' && <Button onClick={() => router.post(route('procurement.purchase-orders.approve', order.id))}>Approve</Button>}
            {['approved', 'partially_received'].includes(order.status) && <Button onClick={receiveAll}>Receive All</Button>}
            <Badge>{order.status}</Badge>
          </div>
        </div>
        <Card><CardHeader><CardTitle>Items</CardTitle></CardHeader><CardContent className="space-y-2">
          {order.items.map(i => (
            <div key={i.id} className="flex justify-between border-b pb-2">
              <span>{i.description}</span>
              <span>{Number(i.quantity_received).toFixed(0)} / {Number(i.quantity).toFixed(0)} · ZMW {Number(i.total).toFixed(2)}</span>
            </div>
          ))}
          <p className="font-bold pt-2">Total: ZMW {Number(order.total).toFixed(2)}</p>
        </CardContent></Card>
      </div>
    </AppLayout>
  );
}
