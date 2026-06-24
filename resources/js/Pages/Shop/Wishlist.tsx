import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ShopLayout from '@/Layouts/ShopLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Heart } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { formatZmw } from '@/lib/formatCurrency';
import { useShopSheets } from '@/Components/Shop/ShopSheetProvider';

interface Props {
  items: Array<{ id: number; product: { id: number; slug: string; name: string; sale_price: string; image_urls?: string[] } }>;
  cartCount: number;
}

export default function Wishlist({ items, cartCount }: Props) {
  const route = useRoute();
  const { refreshCartCount } = useShopSheets();

  const addToCart = (productId: number) => {
    router.post(route('shop.cart.add', productId), {}, {
      preserveScroll: true,
      onSuccess: () => refreshCartCount(),
    });
  };

  return (
    <ShopLayout title="Wishlist" cartCount={cartCount}>
      <Head title="Wishlist" />

      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold"><Heart className="h-6 w-6 text-primary" />Wishlist</h1>

        {items.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">Your wishlist is empty.</CardContent></Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex gap-4 p-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-muted/30">
                    {item.product.image_urls?.[0] && <img src={item.product.image_urls[0]} alt={item.product.name} className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={route('shop.show', item.product.slug || item.product.id)} className="font-medium hover:text-primary">{item.product.name}</Link>
                    <p className="mt-1 font-semibold text-primary">{formatZmw(Number(item.product.sale_price))}</p>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" onClick={() => addToCart(item.product.id)}>Add to cart</Button>
                      <Button size="sm" variant="outline" onClick={() => router.post(route('shop.wishlist.toggle', item.product.slug || item.product.id))}>Remove</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ShopLayout>
  );
}
