import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Input } from '@/Components/ui/input';
import ProductGallery from '@/Components/Inventory/ProductGallery';
import { ShopHeader } from '@/Components/Shop/OrderSummary';
import { formatZmw } from '@/lib/formatCurrency';
import { Minus, Plus, ShoppingCart, Truck } from 'lucide-react';

interface VideoItem { type: 'file' | 'embed'; url: string; embed_url?: string }
interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  sale_price: string;
  tax_rate?: string;
  unit?: string;
  track_inventory?: boolean;
  stock_on_hand?: number;
  category?: { name: string };
  image_urls?: string[];
  video_items?: VideoItem[];
}
interface Props { product: Product; cartCount: number }

export default function ShopShow({ product, cartCount }: Props) {
  const [quantity, setQuantity] = useState(1);
  const price = Number(product.sale_price);
  const taxRate = Number(product.tax_rate ?? 0);
  const lineTax = price * quantity * (taxRate / 100);
  const inStock = !product.track_inventory || (product.stock_on_hand ?? 0) > 0;

  const addToCart = () => {
    router.post(route('shop.cart.add', product.id), { quantity }, { preserveScroll: true });
  };

  const buyNow = () => {
    router.post(route('shop.cart.add', product.id), { quantity }, {
      onSuccess: () => router.visit(route('shop.checkout')),
    });
  };

  const adjustQty = (delta: number) => {
    setQuantity(current => Math.max(1, Math.min(99, current + delta)));
  };

  return (
    <GuestLayout title={product.name}>
      <Head title={product.name} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
        <ShopHeader title={product.name} subtitle={product.category?.name} cartCount={cartCount} />

        <div className="grid gap-10 lg:grid-cols-2">
          <ProductGallery
            imageUrls={product.image_urls}
            videoItems={product.video_items}
            alt={product.name}
            variant="detail"
          />

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {product.category && <Badge variant="secondary">{product.category.name}</Badge>}
                <Badge variant={inStock ? 'default' : 'destructive'}>
                  {inStock ? 'In stock' : 'Out of stock'}
                </Badge>
                {product.sku && <span className="text-sm text-muted-foreground">SKU: {product.sku}</span>}
              </div>

              <p className="text-4xl font-bold tracking-tight">{formatZmw(price)}</p>
              {taxRate > 0 && (
                <p className="text-sm text-muted-foreground">
                  Includes {taxRate}% VAT · {formatZmw(lineTax)} tax on {quantity} item{quantity > 1 ? 's' : ''}
                </p>
              )}
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Quantity</span>
                  <div className="flex items-center rounded-md border">
                    <Button type="button" variant="ghost" size="icon" onClick={() => adjustQty(-1)} disabled={quantity <= 1}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min={1}
                      max={99}
                      value={quantity}
                      onChange={e => setQuantity(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
                      className="h-10 w-16 border-0 text-center shadow-none focus-visible:ring-0"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => adjustQty(1)} disabled={quantity >= 99}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" className="flex-1" onClick={addToCart} disabled={!inStock}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to cart
                  </Button>
                  <Button size="lg" variant="outline" className="flex-1" onClick={buyNow} disabled={!inStock}>
                    Buy now
                  </Button>
                </div>

                <div className="flex items-start gap-2 rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                  <Truck className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Delivery details are collected at checkout. Orders are confirmed once placed.</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="description" className="w-full">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-4">
            <Card>
              <CardContent className="pt-6 text-muted-foreground leading-relaxed">
                {product.description || 'No description provided for this product.'}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="details" className="mt-4">
            <Card>
              <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
                <div><p className="text-sm text-muted-foreground">SKU</p><p className="font-medium">{product.sku}</p></div>
                <div><p className="text-sm text-muted-foreground">Unit</p><p className="font-medium">{product.unit ?? 'pcs'}</p></div>
                <div><p className="text-sm text-muted-foreground">Category</p><p className="font-medium">{product.category?.name ?? '—'}</p></div>
                <div><p className="text-sm text-muted-foreground">Availability</p><p className="font-medium">{inStock ? 'Available' : 'Unavailable'}</p></div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </GuestLayout>
  );
}
