import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';

interface Supplier { id: number; code: string; name: string; email?: string; phone?: string; is_active: boolean }
interface Props { suppliers: { data: Supplier[] } }

export default function SuppliersIndex({ suppliers }: Props) {
  const [form, setForm] = useState({ code: '', name: '', email: '', phone: '' });
  const submit = (e: React.FormEvent) => { e.preventDefault(); router.post(route('procurement.suppliers.store'), form); };

  return (
    <AppLayout title="Suppliers">
      <Head title="Suppliers" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Add Supplier</CardTitle></CardHeader><CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div><Label>Code</Label><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required /></div>
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
            <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <Button type="submit">Create Supplier</Button>
          </form>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Suppliers</CardTitle></CardHeader><CardContent className="space-y-2">
          {suppliers.data.map(s => <div key={s.id} className="border-b pb-2"><p className="font-medium">{s.name}</p><p className="text-sm text-muted-foreground">{s.code} · {s.email}</p></div>)}
        </CardContent></Card>
      </div>
    </AppLayout>
  );
}
