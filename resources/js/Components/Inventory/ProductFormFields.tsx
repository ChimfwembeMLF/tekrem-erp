import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import BarcodeDisplay from '@/Components/Inventory/BarcodeDisplay';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/Components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { Plus, RefreshCw } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

export interface ProductFormState {
  sku: string;
  name: string;
  description: string;
  category_id: string;
  barcode: string;
  unit: string;
  cost_price: string;
  sale_price: string;
  tax_rate: string;
  track_inventory: boolean;
  is_active: boolean;
  is_published: boolean;
  is_featured: boolean;
}

interface Category {
  id: number;
  name: string;
}

interface Props {
  form: ProductFormState;
  categories: Category[];
  onChange: (key: keyof ProductFormState, value: string | boolean) => void;
}

const UNITS = ['pcs', 'box', 'kg', 'g', 'l', 'ml', 'm', 'pack', 'set'];

export default function ProductFormFields({ form, categories, onChange }: Props) {
  const route = useRoute();
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categorySaving, setCategorySaving] = useState(false);
  const [barcodeGenerating, setBarcodeGenerating] = useState(false);

  const generateBarcode = async () => {
    setBarcodeGenerating(true);
    try {
      const { data } = await axios.get(route('inventory.products.barcode.suggest'));
      onChange('barcode', data.barcode);
    } finally {
      setBarcodeGenerating(false);
    }
  };

  const createCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      return;
    }

    setCategorySaving(true);
    router.post(
      route('inventory.categories.store'),
      { name: categoryName.trim() },
      {
        preserveScroll: true,
        onSuccess: () => {
          setCategoryName('');
          setCategoryDialogOpen(false);
          router.reload({ only: ['categories', 'selectedCategoryId'] });
        },
        onFinish: () => setCategorySaving(false),
      },
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>SKU, naming, and catalog classification</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sku">SKU *</Label>
            <Input
              id="sku"
              value={form.sku}
              onChange={(e) => onChange('sku', e.target.value)}
              placeholder="PRD-001"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="barcode">Barcode</Label>
            <div className="flex gap-2">
              <Input
                id="barcode"
                className="flex-1 font-mono"
                value={form.barcode}
                onChange={(e) => onChange('barcode', e.target.value)}
                placeholder="Scan code or generate"
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateBarcode}
                disabled={barcodeGenerating}
                title="Generate EAN-13 barcode"
              >
                <RefreshCw className={`h-4 w-4 ${barcodeGenerating ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            {form.barcode && (
              <BarcodeDisplay value={form.barcode} className="mt-2" />
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="Product name"
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => onChange('description', e.target.value)}
              placeholder="Short description for procurement, POS, and online store"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <div className="flex gap-2">
              <Select value={form.category_id} onValueChange={(v) => onChange('category_id', v)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" size="icon" title="Add category">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={createCategory}>
                    <DialogHeader>
                      <DialogTitle>New category</DialogTitle>
                      <DialogDescription>Add a product category for inventory and procurement.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Label htmlFor="category_name">Category name</Label>
                      <Input
                        id="category_name"
                        className="mt-2"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        placeholder="e.g. Office Supplies"
                        required
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={categorySaving}>
                        {categorySaving ? 'Saving…' : 'Create category'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Unit</Label>
            <Select value={form.unit} onValueChange={(v) => onChange('unit', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNITS.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing (ZMW)</CardTitle>
          <CardDescription>Cost for procurement and sale price for POS / ecommerce</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="cost_price">Cost Price *</Label>
            <Input
              id="cost_price"
              type="number"
              min="0"
              step="0.01"
              value={form.cost_price}
              onChange={(e) => onChange('cost_price', e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sale_price">Sale Price *</Label>
            <Input
              id="sale_price"
              type="number"
              min="0"
              step="0.01"
              value={form.sale_price}
              onChange={(e) => onChange('sale_price', e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax_rate">Tax Rate %</Label>
            <Input
              id="tax_rate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={form.tax_rate}
              onChange={(e) => onChange('tax_rate', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inventory &amp; visibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">Track inventory</p>
              <p className="text-sm text-muted-foreground">Update stock when goods are received or sold</p>
            </div>
            <Switch
              checked={form.track_inventory}
              onCheckedChange={(checked) => onChange('track_inventory', checked)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">Active</p>
              <p className="text-sm text-muted-foreground">Available in procurement, POS, and sales</p>
            </div>
            <Switch checked={form.is_active} onCheckedChange={(checked) => onChange('is_active', checked)} />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">Publish to online store</p>
              <p className="text-sm text-muted-foreground">Show on the public ecommerce catalog</p>
            </div>
            <Switch
              checked={form.is_published}
              onCheckedChange={(checked) => onChange('is_published', checked)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">Featured on shop</p>
              <p className="text-sm text-muted-foreground">Highlight in the shop featured carousel</p>
            </div>
            <Switch
              checked={form.is_featured}
              onCheckedChange={(checked) => onChange('is_featured', checked)}
              disabled={!form.is_published}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
