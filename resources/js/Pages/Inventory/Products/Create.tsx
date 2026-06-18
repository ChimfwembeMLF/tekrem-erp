import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import ProductMediaFields from '@/Components/Inventory/ProductMediaFields';

interface Category { id: number; name: string }
interface Props { categories: Category[] }

export default function ProductsCreate({ categories }: Props) {
  const [processing, setProcessing] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [form, setForm] = useState({
    sku: '', name: '', description: '', category_id: '', barcode: '', unit: 'pcs',
    cost_price: '', sale_price: '', tax_rate: '16', track_inventory: true, is_active: true, is_published: false,
  });

  const setField = (key: keyof typeof form, value: string | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        formData.append(key, value ? '1' : '0');
      } else {
        formData.append(key, value);
      }
    });
    imageFiles.forEach(file => formData.append('images[]', file));
    videoFiles.forEach(file => formData.append('videos[]', file));
    videoUrls.filter(Boolean).forEach(url => formData.append('video_urls[]', url));

    router.post(route('inventory.products.store'), formData, {
      forceFormData: true,
      onFinish: () => setProcessing(false),
    });
  };

  return (
    <AppLayout title="New Product">
      <Head title="New Product" />
      <form onSubmit={submit} className="max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold">New Product</h1>
        <Card>
          <CardHeader><CardTitle>Product Details</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div><Label>SKU</Label><Input value={form.sku} onChange={e => setField('sku', e.target.value)} required /></div>
            <div><Label>Name</Label><Input value={form.name} onChange={e => setField('name', e.target.value)} required /></div>
            <div className="md:col-span-2"><Label>Description</Label><Input value={form.description} onChange={e => setField('description', e.target.value)} /></div>
            <div>
              <Label>Category</Label>
              <Select value={form.category_id} onValueChange={v => setField('category_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Unit</Label><Input value={form.unit} onChange={e => setField('unit', e.target.value)} /></div>
            <div><Label>Cost Price</Label><Input type="number" step="0.01" value={form.cost_price} onChange={e => setField('cost_price', e.target.value)} required /></div>
            <div><Label>Sale Price</Label><Input type="number" step="0.01" value={form.sale_price} onChange={e => setField('sale_price', e.target.value)} required /></div>
            <div><Label>Tax Rate %</Label><Input type="number" step="0.01" value={form.tax_rate} onChange={e => setField('tax_rate', e.target.value)} /></div>
            <div className="md:col-span-2 flex gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_published} onChange={e => setField('is_published', e.target.checked)} />
                Publish to online store
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Images &amp; Videos</CardTitle></CardHeader>
          <CardContent>
            <ProductMediaFields
              onImagesChange={setImageFiles}
              onVideosChange={setVideoFiles}
              onExistingImagesChange={() => {}}
              onExistingVideosChange={() => {}}
              onVideoUrlsChange={setVideoUrls}
            />
          </CardContent>
        </Card>

        <Button type="submit" disabled={processing}>Create Product</Button>
      </form>
    </AppLayout>
  );
}
