import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ShopLayout from '@/Layouts/ShopLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { ShopHeader } from '@/Components/Shop/OrderSummary';
import FeaturedProductsCarousel from '@/Components/Shop/FeaturedProductsCarousel';
import ShopPagination from '@/Components/Shop/ShopPagination';
import ShopStockBadge from '@/Components/Shop/ShopStockBadge';
import { formatZmw } from '@/lib/formatCurrency';
import useRoute from '@/Hooks/useRoute';
import { cn } from '@/lib/utils';

interface Product {
  id: number;
  name: string;
  slug: string;
  sale_price: string;
  description?: string;
  category?: { name: string };
  image_urls?: string[];
  available_stock?: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface ShopHero {
  background_url?: string | null;
}

interface Props {
  products: {
    data: Product[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
  };
  featuredProducts: Product[];
  categories: Category[];
  cartCount: number;
  filters: { search?: string; category?: string };
  shopHero?: ShopHero;
}

export default function ShopIndex({
  products,
  featuredProducts,
  categories,
  cartCount,
  filters,
  shopHero,
}: Props) {
  const route = useRoute();
  const showFeatured = featuredProducts.length > 0 && !filters.search && !filters.category;

  return (
    <ShopLayout title="Shop" cartCount={cartCount}>
      <Head title="Shop" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
        <ShopHeader title="Shop" subtitle="Browse our products" />

        {showFeatured && (
          <FeaturedProductsCarousel
            products={featuredProducts}
            backgroundImageUrl={shopHero?.background_url}
            onAddToCart={(productId) => {
              const product = featuredProducts.find((item) => item.id === productId);
              router.post(route('shop.cart.add', product?.slug || productId));
            }}
          />
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <form
            className="flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              router.get(route('shop.index'), {
                search: fd.get('search') || undefined,
                category: filters.category,
              });
            }}
          >
            <Input
              name="search"
              defaultValue={filters.search}
              placeholder="Search products..."
              className="max-w-md"
            />
          </form>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={!filters.category ? 'default' : 'outline'}
              onClick={() => router.get(route('shop.index'), { search: filters.search })}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                type="button"
                size="sm"
                variant={filters.category === category.slug ? 'default' : 'outline'}
                onClick={() =>
                  router.get(route('shop.index'), {
                    category: category.slug,
                    search: filters.search,
                  })
                }
              >
                {category.name}
              </Button>
            ))}
          </div>
        )}

        {products.data.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              No products found. Try a different search or category.
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.data.map((p) => {
                const outOfStock = (p.available_stock ?? 1) <= 0;

                return (
                  <Card key={p.id} className={cn('overflow-hidden transition-shadow hover:shadow-md', outOfStock && 'opacity-90')}>
                    <Link href={route('shop.show', p.slug || p.id)} className="block">
                      <div className="relative aspect-[4/3] bg-muted/30">
                        {p.image_urls?.[0] ? (
                          <img src={p.image_urls[0]} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            No image
                          </div>
                        )}
                        {p.available_stock !== undefined && (
                          <div className="absolute left-3 top-3">
                            <ShopStockBadge stock={p.available_stock} />
                          </div>
                        )}
                      </div>
                    </Link>

                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">
                        <Link href={route('shop.show', p.slug || p.id)} className="hover:underline">
                          {p.name}
                        </Link>
                      </CardTitle>
                      {p.category && <Badge variant="secondary">{p.category.name}</Badge>}
                    </CardHeader>

                    <CardContent className="pt-0">
                      <p className="text-xl font-bold">{formatZmw(Number(p.sale_price))}</p>
                    </CardContent>

                    <CardFooter className="gap-2">
                      <Button asChild variant="outline" className="flex-1">
                        <Link href={route('shop.show', p.slug || p.id)}>View</Link>
                      </Button>
                      <Button
                        className="flex-1"
                        disabled={outOfStock}
                        onClick={() => router.post(route('shop.cart.add', p.slug || p.id))}
                      >
                        {outOfStock ? 'Unavailable' : 'Add to cart'}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>

            <ShopPagination links={products.links} />
          </>
        )}
      </div>
    </ShopLayout>
  );
}
