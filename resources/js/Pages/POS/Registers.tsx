import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';

interface Warehouse { id: number; name: string; code: string }
interface Register {
  id: number;
  name: string;
  is_active: boolean;
  requires_pin: boolean;
  warehouse: Warehouse;
}
interface Props {
  registers: Register[];
  warehouses: Warehouse[];
}

const emptyForm = { name: '', warehouse_id: '', pin: '', is_active: true };

export default function PosRegisters({ registers, warehouses }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Register | null>(null);
  const [editForm, setEditForm] = useState({ name: '', warehouse_id: '', pin: '', clear_pin: false, is_active: true });

  const createTerminal = (e: React.FormEvent) => {
    e.preventDefault();
    router.post(route('pos.registers.store'), form, {
      onSuccess: () => setForm(emptyForm),
    });
  };

  const openEdit = (register: Register) => {
    setEditing(register);
    setEditForm({
      name: register.name,
      warehouse_id: String(register.warehouse.id),
      pin: '',
      clear_pin: false,
      is_active: register.is_active,
    });
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    router.put(route('pos.registers.update', editing.id), editForm, {
      onSuccess: () => setEditing(null),
    });
  };

  const deactivate = (register: Register) => {
    if (!confirm(`Deactivate terminal "${register.name}"?`)) return;
    router.delete(route('pos.registers.destroy', register.id));
  };

  return (
    <AppLayout title="POS Terminals">
      <Head title="POS Terminals" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">POS Terminals</h1>
          <p className="text-muted-foreground">Create registers, assign warehouses, and set employee PINs.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>New terminal</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={createTerminal} className="space-y-4">
                <div>
                  <Label>Terminal name</Label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Front Counter" required />
                </div>
                <div>
                  <Label>Warehouse</Label>
                  <Select value={form.warehouse_id} onValueChange={v => setForm({ ...form, warehouse_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                    <SelectContent>
                      {warehouses.map(w => (
                        <SelectItem key={w.id} value={String(w.id)}>{w.name} ({w.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Employee PIN (optional)</Label>
                  <Input
                    type="password"
                    inputMode="numeric"
                    value={form.pin}
                    onChange={e => setForm({ ...form, pin: e.target.value })}
                    placeholder="4–20 digits"
                    minLength={4}
                    maxLength={20}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Cashiers must enter this PIN to open a session on the terminal.</p>
                </div>
                <Button type="submit">Create terminal</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>All terminals</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>PIN</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registers.map(register => (
                    <TableRow key={register.id}>
                      <TableCell className="font-medium">{register.name}</TableCell>
                      <TableCell>{register.warehouse.name}</TableCell>
                      <TableCell>
                        <Badge variant={register.requires_pin ? 'default' : 'secondary'}>
                          {register.requires_pin ? 'Protected' : 'Open'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={register.is_active ? 'default' : 'secondary'}>
                          {register.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => openEdit(register)}>Edit</Button>
                        {register.is_active && (
                          <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => deactivate(register)}>
                            Deactivate
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!editing} onOpenChange={open => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit terminal</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveEdit} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
            </div>
            <div>
              <Label>Warehouse</Label>
              <Select value={editForm.warehouse_id} onValueChange={v => setEditForm({ ...editForm, warehouse_id: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {warehouses.map(w => (
                    <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>New PIN (leave blank to keep current)</Label>
              <Input
                type="password"
                inputMode="numeric"
                value={editForm.pin}
                onChange={e => setEditForm({ ...editForm, pin: e.target.value })}
                placeholder="4–20 digits"
              />
            </div>
            {editing?.requires_pin && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editForm.clear_pin}
                  onChange={e => setEditForm({ ...editForm, clear_pin: e.target.checked })}
                />
                Remove PIN protection
              </label>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editForm.is_active}
                onChange={e => setEditForm({ ...editForm, is_active: e.target.checked })}
              />
              Active
            </label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
