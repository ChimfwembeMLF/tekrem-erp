import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import ProductGallery from '@/Components/Inventory/ProductGallery';
import { formatZmw } from '@/lib/formatCurrency';
import { ArrowLeft, Pencil } from 'lucide-react';

interface StockLevel { quantity: string; reserved_quantity: string; warehouse: { name: string } }
interface VideoItem { type: 'file' | 'embed'; url: string; embed_url?: string }
interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  sale_price: string;
  cost_price: string;
  tax_rate?: string;
  unit?: string;
  barcode?: string;
  is_active?: boolean;
  is_published: boolean;
  track_inventory?: boolean;
  stock_on_hand?: number;
  category?: { name: string };
  stock_levels: StockLevel[];
  image_urls?: string[];
  video_items?: VideoItem[];
}
interface Props { product: Product }

export default function ProductsShow({ product }: Props) {
  const stockTotal = product.stock_levels?.reduce((sum, level) => sum + Number(level.quantity), 0) ?? product.stock_on_hand ?? 0;

  return (
    <AppLayout title={product.name}>
      <Head title={product.name} />
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
              <Link href={route('inventory.products.index')}><ArrowLeft className="mr-2 h-4 w-4" />Back to products</Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
              <p className="text-muted-foreground">SKU: {product.sku}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={product.is_active ? 'default' : 'secondary'}>{product.is_active ? 'Active' : 'Inactive'}</Badge>
              <Badge variant={product.is_published ? 'default' : 'outline'}>{product.is_published ? 'Published online' : 'Not published'}</Badge>
              {product.category && <Badge variant="secondary">{product.category.name}</Badge>}
            </div>
          </div>
          <Button asChild>
            <Link href={route('inventory.products.edit', product.id)}><Pencil className="mr-2 h-4 w-4" />Edit product</Link>
          </Button>
        </div>

        <div className="grid gap-6 xl:grid-cols-5">
          <Card className="xl:col-span-3">
            <CardHeader><CardTitle>Media</CardTitle></CardHeader>
            <CardContent>
              <ProductGallery
                imageUrls={product.image_urls}
                videoItems={product.video_items}
                alt={product.name}
                variant="detail"
              />
            </CardContent>
          </Card>

          <div className="space-y-6 xl:col-span-2">
            <Card>
              <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between"><span className="text-muted-foreground">Sale price</span><span className="text-xl font-bold">{formatZmw(Number(product.sale_price))}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Cost price</span><span className="font-medium">{formatZmw(Number(product.cost_price))}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax rate</span><span>{Number(product.tax_rate ?? 0).toFixed(2)}%</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Inventory</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Track inventory</span>
                  <span>{product.track_inventory ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total on hand</span>
                  <span className="font-medium">{Number(stockTotal).toFixed(0)} {product.unit ?? 'pcs'}</span>
                </div>
                <Separator />
                {product.stock_levels?.length > 0 ? (
                  product.stock_levels.map((level, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{level.warehouse.name}</span>
                      <span>{Number(level.quantity).toFixed(0)} on hand · {Number(level.reserved_quantity).toFixed(0)} reserved</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No stock recorded yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Description</CardTitle></CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed">
              {product.description || 'No description provided.'}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Product details</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div><p className="text-sm text-muted-foreground">Barcode</p><p className="font-medium">{product.barcode || '—'}</p></div>
              <div><p className="text-sm text-muted-foreground">Unit</p><p className="font-medium">{product.unit ?? 'pcs'}</p></div>
              <div><p className="text-sm text-muted-foreground">Category</p><p className="font-medium">{product.category?.name ?? '—'}</p></div>
              <div><p className="text-sm text-muted-foreground">Online store</p><p className="font-medium">{product.is_published ? 'Visible on shop' : 'Hidden from shop'}</p></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
