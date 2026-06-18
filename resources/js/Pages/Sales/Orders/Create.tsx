import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';

interface Props {
  clients: Array<{ id: number; name: string }>;
  products: Array<{ id: number; name: string; sale_price: string; tax_rate: string }>;
  warehouses: Array<{ id: number; name: string }>;
}

export default function SalesOrdersCreate({ clients, products, warehouses }: Props) {
  const [clientId, setClientId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [items, setItems] = useState([{ product_id: '', description: '', quantity: '1', unit_price: '', tax_rate: '0', discount_rate: '0' }]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.post(route('sales.orders.store'), {
      client_id: clientId || null, warehouse_id: warehouseId || null,
      order_date: new Date().toISOString().slice(0, 10), items,
    });
  };

  return (
    <AppLayout title="New Sales Order">
      <Head title="New Sales Order" />
      <form onSubmit={submit} className="max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold">New Sales Order</h1>
        <Card><CardContent className="grid gap-4 md:grid-cols-2 pt-6">
          <div><Select value={clientId} onValueChange={setClientId}><SelectTrigger><SelectValue placeholder="Client (optional)" /></SelectTrigger><SelectContent>{clients.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent></Select></div>
          <div><Select value={warehouseId} onValueChange={setWarehouseId}><SelectTrigger><SelectValue placeholder="Warehouse" /></SelectTrigger><SelectContent>{warehouses.map(w => <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>)}</SelectContent></Select></div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Items</CardTitle></CardHeader><CardContent className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="grid gap-2 md:grid-cols-3">
              <Select value={item.product_id} onValueChange={v => { const p = products.find(x => String(x.id) === v); const n = [...items]; n[idx] = { ...n[idx], product_id: v, description: p?.name ?? '', unit_price: p?.sale_price ?? '', tax_rate: p?.tax_rate ?? '0' }; setItems(n); }}>
                <SelectTrigger><SelectValue placeholder="Product" /></SelectTrigger><SelectContent>{products.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
              <Input type="number" value={item.quantity} onChange={e => { const n = [...items]; n[idx].quantity = e.target.value; setItems(n); }} placeholder="Qty" />
              <Input type="number" value={item.unit_price} onChange={e => { const n = [...items]; n[idx].unit_price = e.target.value; setItems(n); }} placeholder="Price" />
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => setItems([...items, { product_id: '', description: '', quantity: '1', unit_price: '', tax_rate: '0', discount_rate: '0' }])}>Add Line</Button>
        </CardContent></Card>
        <Button type="submit">Create Order</Button>
      </form>
    </AppLayout>
  );
}
