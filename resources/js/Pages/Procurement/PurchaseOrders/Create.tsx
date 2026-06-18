import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';

interface Props {
  suppliers: Array<{ id: number; name: string; code: string }>;
  warehouses: Array<{ id: number; name: string }>;
  products: Array<{ id: number; name: string; sku: string; cost_price: string }>;
}

export default function PurchaseOrdersCreate({ suppliers, warehouses, products }: Props) {
  const [supplierId, setSupplierId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [items, setItems] = useState([{ product_id: '', description: '', quantity: '1', unit_cost: '', tax_rate: '0' }]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.post(route('procurement.purchase-orders.store'), {
      supplier_id: supplierId, warehouse_id: warehouseId, order_date: new Date().toISOString().slice(0, 10), items,
    });
  };

  return (
    <AppLayout title="New Purchase Order">
      <Head title="New Purchase Order" />
      <form onSubmit={submit} className="max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold">New Purchase Order</h1>
        <Card><CardContent className="grid gap-4 md:grid-cols-2 pt-6">
          <div><Label>Supplier</Label><Select value={supplierId} onValueChange={setSupplierId}><SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger><SelectContent>{suppliers.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Warehouse</Label><Select value={warehouseId} onValueChange={setWarehouseId}><SelectTrigger><SelectValue placeholder="Receive into" /></SelectTrigger><SelectContent>{warehouses.map(w => <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>)}</SelectContent></Select></div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Line Items</CardTitle></CardHeader><CardContent className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="grid gap-2 md:grid-cols-4">
              <Select value={item.product_id} onValueChange={v => { const p = products.find(x => String(x.id) === v); const n = [...items]; n[idx] = { ...n[idx], product_id: v, description: p?.name ?? '', unit_cost: p?.cost_price ?? '' }; setItems(n); }}>
                <SelectTrigger><SelectValue placeholder="Product" /></SelectTrigger><SelectContent>{products.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="Qty" type="number" value={item.quantity} onChange={e => { const n = [...items]; n[idx].quantity = e.target.value; setItems(n); }} />
              <Input placeholder="Unit cost" type="number" value={item.unit_cost} onChange={e => { const n = [...items]; n[idx].unit_cost = e.target.value; setItems(n); }} />
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => setItems([...items, { product_id: '', description: '', quantity: '1', unit_cost: '', tax_rate: '0' }])}>Add Line</Button>
        </CardContent></Card>
        <Button type="submit">Create PO</Button>
      </form>
    </AppLayout>
  );
}
