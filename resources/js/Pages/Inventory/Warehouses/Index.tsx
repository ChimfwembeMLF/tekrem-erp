import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';

interface Warehouse { id: number; code: string; name: string; address?: string; is_default: boolean; is_active: boolean; stock_levels_count: number }
interface Props { warehouses: { data: Warehouse[] } }

export default function WarehousesIndex({ warehouses }: Props) {
  const [form, setForm] = useState({ code: '', name: '', address: '', is_default: false });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.post(route('inventory.warehouses.store'), form, { onSuccess: () => setForm({ code: '', name: '', address: '', is_default: false }) });
  };

  return (
    <AppLayout title="Warehouses">
      <Head title="Warehouses" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Add Warehouse</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-3">
              <div><Label>Code</Label><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required /></div>
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div><Label>Address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
              <Button type="submit">Create Warehouse</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Warehouses</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>SKUs</TableHead></TableRow></TableHeader>
              <TableBody>
                {warehouses.data.map(w => (
                  <TableRow key={w.id}>
                    <TableCell>{w.code}</TableCell>
                    <TableCell>{w.name}{w.is_default && ' (Default)'}</TableCell>
                    <TableCell>{w.stock_levels_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
