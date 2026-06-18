import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import ProductMediaFields, { ProductVideoRecord } from '@/Components/Inventory/ProductMediaFields';

interface Category { id: number; name: string }
interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  category_id?: number;
  unit: string;
  cost_price: string;
  sale_price: string;
  tax_rate: string;
  is_published: boolean;
  images?: string[];
  image_urls?: string[];
  videos?: ProductVideoRecord[];
}
interface Props { product: Product; categories: Category[] }

export default function ProductsEdit({ product, categories }: Props) {
  const [processing, setProcessing] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(product.images ?? []);
  const [existingVideos, setExistingVideos] = useState<ProductVideoRecord[]>(product.videos ?? []);
  const [form, setForm] = useState({
    sku: product.sku,
    name: product.name,
    description: product.description ?? '',
    category_id: product.category_id ? String(product.category_id) : '',
    unit: product.unit,
    cost_price: product.cost_price,
    sale_price: product.sale_price,
    tax_rate: product.tax_rate,
    track_inventory: true,
    is_active: true,
    is_published: product.is_published,
  });

  const setField = (key: keyof typeof form, value: string | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    const formData = new FormData();
    formData.append('_method', 'put');
    Object.entries(form).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        formData.append(key, value ? '1' : '0');
      } else {
        formData.append(key, value);
      }
    });
    existingImages.forEach(path => formData.append('existing_images[]', path));
    formData.append('existing_videos', JSON.stringify(existingVideos));
    imageFiles.forEach(file => formData.append('images[]', file));
    videoFiles.forEach(file => formData.append('videos[]', file));
    videoUrls.filter(Boolean).forEach(url => formData.append('video_urls[]', url));

    router.post(route('inventory.products.update', product.id), formData, {
      forceFormData: true,
      onFinish: () => setProcessing(false),
    });
  };

  return (
    <AppLayout title={`Edit ${product.name}`}>
      <Head title={`Edit ${product.name}`} />
      <form onSubmit={submit} className="max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <Card>
          <CardContent className="grid gap-4 md:grid-cols-2 pt-6">
            <div><Label>SKU</Label><Input value={form.sku} onChange={e => setField('sku', e.target.value)} required /></div>
            <div><Label>Name</Label><Input value={form.name} onChange={e => setField('name', e.target.value)} required /></div>
            <div><Label>Sale Price</Label><Input type="number" step="0.01" value={form.sale_price} onChange={e => setField('sale_price', e.target.value)} required /></div>
            <div><Label>Cost Price</Label><Input type="number" step="0.01" value={form.cost_price} onChange={e => setField('cost_price', e.target.value)} required /></div>
            <div>
              <Label>Category</Label>
              <Select value={form.category_id} onValueChange={v => setField('category_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" checked={form.is_published} onChange={e => setField('is_published', e.target.checked)} />
              <Label>Publish to online store</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Images &amp; Videos</CardTitle></CardHeader>
          <CardContent>
            <ProductMediaFields
              existingImages={existingImages}
              existingImageUrls={product.image_urls}
              existingVideos={existingVideos}
              onImagesChange={setImageFiles}
              onVideosChange={setVideoFiles}
              onExistingImagesChange={setExistingImages}
              onExistingVideosChange={setExistingVideos}
              onVideoUrlsChange={setVideoUrls}
            />
          </CardContent>
        </Card>

        <Button type="submit" disabled={processing}>Save Changes</Button>
      </form>
    </AppLayout>
  );
}
