import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Checkbox } from '@/Components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/Components/ui/alert-dialog';
import { Loader2, MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Address {
  id: number;
  label: string;
  recipient_name: string;
  phone?: string | null;
  address_line: string;
  is_default: boolean;
}

interface Props {
  addresses: Address[];
}

export default function Addresses({ addresses }: Props) {
  const route = useRoute();
  const [editing, setEditing] = useState<Address | null>(null);

  const form = useForm({
    label: 'Home',
    recipient_name: '',
    phone: '',
    address_line: '',
    is_default: false,
  });

  const openCreate = () => {
    setEditing(null);
    form.reset();
    form.setData('label', 'Home');
  };

  const openEdit = (address: Address) => {
    setEditing(address);
    form.setData({
      label: address.label,
      recipient_name: address.recipient_name,
      phone: address.phone ?? '',
      address_line: address.address_line,
      is_default: address.is_default,
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      form.put(route('customer.profile.addresses.update', editing.id), {
        preserveScroll: true,
        onSuccess: () => { setEditing(null); form.reset(); },
      });
    } else {
      form.post(route('customer.profile.addresses.store'), {
        preserveScroll: true,
        onSuccess: () => form.reset(),
      });
    }
  };

  return (
    <CustomerLayout>
      <Head title="Delivery addresses" />

      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Delivery addresses</h1>
          <p className="text-muted-foreground">Manage addresses used at shop checkout</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {editing ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editing ? 'Edit address' : 'Add new address'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="label">Label</Label>
                  <Input id="label" value={form.data.label} onChange={(e) => form.setData('label', e.target.value)} placeholder="Home, Office…" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient_name">Recipient name</Label>
                  <Input id="recipient_name" value={form.data.recipient_name} onChange={(e) => form.setData('recipient_name', e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} placeholder="+260…" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_line">Address</Label>
                <Textarea id="address_line" rows={3} value={form.data.address_line} onChange={(e) => form.setData('address_line', e.target.value)} required />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="is_default" checked={form.data.is_default} onCheckedChange={(c) => form.setData('is_default', c === true)} />
                <Label htmlFor="is_default" className="font-normal">Set as default</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={form.processing}>
                  {form.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editing ? 'Save changes' : 'Add address'}
                </Button>
                {editing && (
                  <Button type="button" variant="ghost" onClick={openCreate}>Cancel edit</Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {addresses.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-muted-foreground">No saved addresses yet.</CardContent></Card>
          ) : (
            addresses.map((address) => (
              <Card key={address.id}>
                <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{address.label}</span>
                      {address.is_default && <Badge variant="secondary">Default</Badge>}
                    </div>
                    <p className="font-medium">{address.recipient_name}</p>
                    {address.phone && <p className="text-sm text-muted-foreground">{address.phone}</p>}
                    <p className="text-sm whitespace-pre-line">{address.address_line}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!address.is_default && (
                      <Button size="sm" variant="outline" onClick={() => router.post(route('customer.profile.addresses.default', address.id), {}, { preserveScroll: true })}>
                        <Star className="mr-1 h-3.5 w-3.5" />Default
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => openEdit(address)}>
                      <Pencil className="mr-1 h-3.5 w-3.5" />Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete address?</AlertDialogTitle>
                          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => router.delete(route('customer.profile.addresses.destroy', address.id), { preserveScroll: true })}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
