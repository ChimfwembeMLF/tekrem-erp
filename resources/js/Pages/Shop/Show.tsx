import React, { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import ShopLayout from '@/Layouts/ShopLayout';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import ProductGallery from '@/Components/Inventory/ProductGallery';
import { ShopHeader } from '@/Components/Shop/OrderSummary';
import { useShopSheets } from '@/Components/Shop/ShopSheetProvider';
import { formatZmw } from '@/lib/formatCurrency';
import { Heart, Minus, Plus, ShoppingCart, Star, Truck } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { cn } from '@/lib/utils';

interface VideoItem { type: 'file' | 'embed'; url: string; embed_url?: string }
interface Review {
  id: number;
  reviewer_name: string;
  rating: number;
  title?: string | null;
  body?: string | null;
  created_at: string;
}
interface Product {
  id: number;
  slug?: string;
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
  approved_reviews?: Review[];
}
interface Props {
  product: Product;
  cartCount: number;
  averageRating?: number;
  reviewCount?: number;
  inWishlist?: boolean;
}

export default function ShopShow({ product, cartCount, averageRating = 0, reviewCount = 0, inWishlist = false }: Props) {
  const route = useRoute();
  const page = usePage();
  const user = page.props.auth?.user as { name?: string; email?: string } | null | undefined;
  const { openCheckout } = useShopSheets();
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(inWishlist);
  const price = Number(product.sale_price);
  const taxRate = Number(product.tax_rate ?? 0);
  const lineTax = price * quantity * (taxRate / 100);
  const inStock = !product.track_inventory || (product.stock_on_hand ?? 0) > 0;
  const productKey = product.slug || product.id;
  const reviews = product.approved_reviews ?? [];

  const { data, setData, post, processing, reset } = useForm({
    rating: 5,
    title: '',
    body: '',
    reviewer_name: user?.name ?? '',
    reviewer_email: user?.email ?? '',
  });

  const addToCart = () => {
    router.post(route('shop.cart.add', productKey), { quantity }, { preserveScroll: true });
  };

  const buyNow = () => {
    router.post(route('shop.cart.add', productKey), { quantity }, {
      onSuccess: () => openCheckout(),
    });
  };

  const toggleWishlist = () => {
    router.post(route('shop.wishlist.toggle', productKey), {}, {
      preserveScroll: true,
      onSuccess: () => setWishlisted((current) => !current),
    });
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('shop.reviews.store', productKey), {
      preserveScroll: true,
      onSuccess: () => reset('title', 'body'),
    });
  };

  const adjustQty = (delta: number) => {
    setQuantity((current) => Math.max(1, Math.min(99, current + delta)));
  };

  return (
    <ShopLayout title={product.name} cartCount={cartCount}>
      <Head title={product.name} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
        <ShopHeader title={product.name} subtitle={product.category?.name} />

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
                {reviewCount > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {averageRating} ({reviewCount})
                  </Badge>
                )}
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
                      onChange={(e) => setQuantity(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
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
                  {user && (
                    <Button size="lg" variant="outline" onClick={toggleWishlist}>
                      <Heart className={cn('mr-2 h-4 w-4', wishlisted && 'fill-primary text-primary')} />
                      {wishlisted ? 'Saved' : 'Wishlist'}
                    </Button>
                  )}
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
            <TabsTrigger value="reviews">Reviews ({reviewCount})</TabsTrigger>
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
          <TabsContent value="reviews" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review this product.</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b border-border/60 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{review.reviewer_name}</p>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={cn('h-3.5 w-3.5', i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30')} />
                          ))}
                        </div>
                      </div>
                      {review.title && <p className="mt-1 text-sm font-medium">{review.title}</p>}
                      {review.body && <p className="mt-1 text-sm text-muted-foreground">{review.body}</p>}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Write a review</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitReview} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="reviewer_name">Your name</Label>
                      <Input id="reviewer_name" value={data.reviewer_name} onChange={(e) => setData('reviewer_name', e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rating">Rating</Label>
                      <Input id="rating" type="number" min={1} max={5} value={data.rating} onChange={(e) => setData('rating', Number(e.target.value))} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="review_title">Title</Label>
                    <Input id="review_title" value={data.title} onChange={(e) => setData('title', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="review_body">Review</Label>
                    <Textarea id="review_body" rows={4} value={data.body} onChange={(e) => setData('body', e.target.value)} />
                  </div>
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Submitting…' : 'Submit review'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ShopLayout>
  );
}
