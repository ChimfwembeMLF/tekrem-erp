import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Plus } from 'lucide-react';

interface Order { id: number; po_number: string; status: string; total: string; order_date: string; supplier: { name: string }; warehouse: { name: string } }
interface Props { orders: { data: Order[] } }

export default function PurchaseOrdersIndex({ orders }: Props) {
  return (
    <AppLayout title="Purchase Orders">
      <Head title="Purchase Orders" />
      <div className="space-y-6">
        <div className="flex justify-between"><h1 className="text-2xl font-bold">Purchase Orders</h1><Button asChild><Link href={route('procurement.purchase-orders.create')}><Plus className="h-4 w-4 mr-2" />New PO</Link></Button></div>
        <Card><CardContent className="pt-6 space-y-3">
          {orders.data.map(o => (
            <div key={o.id} className="flex justify-between items-center border-b pb-3">
              <div><Link href={route('procurement.purchase-orders.show', o.id)} className="font-medium hover:underline">{o.po_number}</Link><p className="text-sm text-muted-foreground">{o.supplier.name} · {o.warehouse.name}</p></div>
              <div className="text-right"><Badge>{o.status}</Badge><p>ZMW {Number(o.total).toFixed(2)}</p></div>
            </div>
          ))}
        </CardContent></Card>
      </div>
    </AppLayout>
  );
}
