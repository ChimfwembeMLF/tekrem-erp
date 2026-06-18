import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { ShopHeader } from '@/Components/Shop/OrderSummary';
import { formatZmw } from '@/lib/formatCurrency';

interface Product {
  id: number;
  name: string;
  slug: string;
  sale_price: string;
  description?: string;
  category?: { name: string };
  image_urls?: string[];
}
interface Props { products: { data: Product[] }; cartCount: number; filters: { search?: string } }

export default function ShopIndex({ products, cartCount, filters }: Props) {
  return (
    <GuestLayout title="Shop">
      <Head title="Shop" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
        <ShopHeader title="Shop" subtitle="Browse our products" cartCount={cartCount} />

        <form
          onSubmit={e => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            router.get(route('shop.index'), { search: fd.get('search') });
          }}
        >
          <Input name="search" defaultValue={filters.search} placeholder="Search products..." className="max-w-md" />
        </form>

        {products.data.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              No products found. Try a different search.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.data.map(p => (
              <Card key={p.id} className="overflow-hidden transition-shadow hover:shadow-md">
                <Link href={route('shop.show', p.id)} className="block">
                  <div className="aspect-[4/3] bg-muted/30">
                    {p.image_urls?.[0] ? (
                      <img src={p.image_urls[0]} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No image</div>
                    )}
                  </div>
                </Link>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg leading-snug">
                    <Link href={route('shop.show', p.id)} className="hover:underline">{p.name}</Link>
                  </CardTitle>
                  {p.category && <p className="text-sm text-muted-foreground">{p.category.name}</p>}
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xl font-bold">{formatZmw(Number(p.sale_price))}</p>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={route('shop.show', p.id)}>View</Link>
                  </Button>
                  <Button className="flex-1" onClick={() => router.post(route('shop.cart.add', p.id))}>
                    Add to cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </GuestLayout>
  );
}
