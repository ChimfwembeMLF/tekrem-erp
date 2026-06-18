import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Plus } from 'lucide-react';

interface Order { id: number; order_number: string; status: string; source: string; total: string; client?: { name: string } }
interface Props { orders: { data: Order[] } }

export default function SalesOrdersIndex({ orders }: Props) {
  return (
    <AppLayout title="Sales Orders">
      <Head title="Sales Orders" />
      <div className="space-y-6">
        <div className="flex justify-between"><h1 className="text-2xl font-bold">All Orders</h1><Button asChild><Link href={route('sales.orders.create')}><Plus className="h-4 w-4 mr-2" />New Order</Link></Button></div>
        <Card><CardContent className="pt-6 space-y-3">
          {orders.data.map(o => (
            <div key={o.id} className="flex justify-between items-center border-b pb-3">
              <div><Link href={route('sales.orders.show', o.id)} className="font-medium hover:underline">{o.order_number}</Link><p className="text-sm text-muted-foreground">{o.client?.name ?? '—'} · {o.source}</p></div>
              <div className="text-right"><Badge>{o.status}</Badge><p>ZMW {Number(o.total).toFixed(2)}</p></div>
            </div>
          ))}
        </CardContent></Card>
      </div>
    </AppLayout>
  );
}
