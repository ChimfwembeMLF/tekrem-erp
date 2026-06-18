import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import OrderSummary, { ShopHeader } from '@/Components/Shop/OrderSummary';
import { formatZmw } from '@/lib/formatCurrency';
import { ShopCartItem, ShopTotals } from '@/lib/shopTotals';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface Cart { items: ShopCartItem[] }
interface Props { cart: Cart; totals: ShopTotals; cartCount: number }

export default function ShopCart({ cart, totals, cartCount }: Props) {
  const updateQuantity = (item: ShopCartItem, quantity: number) => {
    router.patch(route('shop.cart.update', item.id), { quantity }, { preserveScroll: true });
  };

  const removeItem = (item: ShopCartItem) => {
    router.delete(route('shop.cart.remove', item.id), { preserveScroll: true });
  };

  return (
    <GuestLayout title="Cart">
      <Head title="Cart" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
        <ShopHeader title="Your cart" subtitle="Review items before checkout" cartCount={cartCount} />

        {cart.items.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground mb-4">Your cart is empty.</p>
              <Button asChild><Link href={route('shop.index')}>Continue shopping</Link></Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map(item => (
                <Card key={item.id}>
                  <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border bg-muted/30">
                      {item.product.image_urls?.[0] ? (
                        <img src={item.product.image_urls[0]} alt={item.product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No image</div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <Link href={route('shop.show', item.product.id)} className="font-medium hover:underline">
                        {item.product.name}
                      </Link>
                      {item.product.category && (
                        <p className="text-sm text-muted-foreground">{item.product.category.name}</p>
                      )}
                      <p className="text-sm font-medium">{formatZmw(Number(item.product.sale_price))}</p>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <div className="flex items-center rounded-md border">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (Number(item.quantity) <= 1) {
                              removeItem(item);
                            } else {
                              updateQuantity(item, Number(item.quantity) - 1);
                            }
                          }}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          min={1}
                          value={Number(item.quantity).toFixed(0)}
                          onChange={e => updateQuantity(item, Number(e.target.value) || 1)}
                          className="h-9 w-14 border-0 text-center shadow-none focus-visible:ring-0"
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => updateQuantity(item, Number(item.quantity) + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">{formatZmw(Number(item.product.sale_price) * Number(item.quantity))}</p>
                        <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => removeItem(item)}>
                          <Trash2 className="mr-1 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <OrderSummary
                items={cart.items}
                totals={totals}
                showItems={false}
                action={
                  <div className="space-y-3 pt-2">
                    <Button asChild className="w-full" size="lg">
                      <Link href={route('shop.checkout')}>Proceed to checkout</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={route('shop.index')}>Continue shopping</Link>
                    </Button>
                  </div>
                }
              />
            </div>
          </div>
        )}
      </div>
    </GuestLayout>
  );
}
