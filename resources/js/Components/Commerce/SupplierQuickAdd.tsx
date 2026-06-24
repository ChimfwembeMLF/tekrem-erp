import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/Components/ui/dialog';
import { Plus } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Props {
  onCreated?: () => void;
  reloadOnly?: string[];
}

export default function SupplierQuickAdd({ onCreated, reloadOnly = ['suppliers'] }: Props) {
  const route = useRoute();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', email: '', phone: '' });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    router.post(route('procurement.suppliers.store'), form, {
      preserveScroll: true,
      onSuccess: () => {
        setForm({ code: '', name: '', email: '', phone: '' });
        setOpen(false);
        onCreated?.();
          router.reload({ only: reloadOnly });
      },
      onFinish: () => setSaving(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="icon" title="Add supplier">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>New supplier</DialogTitle>
            <DialogDescription>Quick-add a vendor for purchase orders.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div className="space-y-2">
              <Label htmlFor="sup_code">Code *</Label>
              <Input
                id="sup_code"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="SUP-001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sup_name">Name *</Label>
              <Input
                id="sup_name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sup_email">Email</Label>
              <Input
                id="sup_email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sup_phone">Phone</Label>
              <Input
                id="sup_phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Create supplier'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
