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

export default function WarehouseQuickAdd({ onCreated, reloadOnly = ['warehouses'] }: Props) {
  const route = useRoute();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', address: '' });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    router.post(
      route('inventory.warehouses.store'),
      { ...form, is_default: false, is_active: true },
      {
        preserveScroll: true,
        onSuccess: () => {
          setForm({ code: '', name: '', address: '' });
          setOpen(false);
          onCreated?.();
          router.reload({ only: reloadOnly });
        },
        onFinish: () => setSaving(false),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="icon" title="Add warehouse">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>New warehouse</DialogTitle>
            <DialogDescription>Add a stock location for inventory, procurement, and POS.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div className="space-y-2">
              <Label htmlFor="wh_code">Code *</Label>
              <Input
                id="wh_code"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="MAIN"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wh_name">Name *</Label>
              <Input
                id="wh_name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Main Warehouse"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wh_address">Address</Label>
              <Input
                id="wh_address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Lusaka"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Create warehouse'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
