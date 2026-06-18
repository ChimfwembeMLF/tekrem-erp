import React, { useEffect, useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import OrderSummary, { ShopHeader } from '@/Components/Shop/OrderSummary';
import { ShopCartItem, ShopTotals } from '@/lib/shopTotals';
import { AlertCircle } from 'lucide-react';

interface Cart { items: ShopCartItem[] }
interface Defaults { name: string; email: string; phone: string }
interface Props {
  cart: Cart;
  totals: ShopTotals;
  cartCount: number;
  stockIssues?: string[];
  defaults: Defaults;
}

function stockErrorList(errors: Record<string, string | string[]>, stockIssues: string[]): string[] {
  const fromProps = [
    ...stockIssues,
    ...(Array.isArray(errors.stock) ? errors.stock : errors.stock ? [errors.stock] : []),
  ];

  return [...new Set(fromProps)];
}

export default function ShopCheckout({ cart, totals, cartCount, stockIssues = [], defaults }: Props) {
  const page = usePage();
  const { errors } = page.props as { errors: Record<string, string | string[]> };
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data, setData, post, processing } = useForm({
    name: defaults.name,
    email: defaults.email,
    phone: defaults.phone,
    shipping_address: '',
  });

  const stockMessages = stockErrorList(errors, stockIssues);

  useEffect(() => {
    if (stockMessages.length > 0) {
      setSubmitError(null);
    }
  }, [stockMessages.length]);

  const submit = () => {
    setSubmitError(null);
    post(route('shop.checkout.store'), {
      preserveScroll: true,
      onError: (formErrors) => {
        const stock = formErrors.stock;
        if (stock) {
          setSubmitError(Array.isArray(stock) ? stock.join(' ') : stock);
          return;
        }

        const firstError = Object.values(formErrors).flat()[0];
        setSubmitError(typeof firstError === 'string' ? firstError : 'Could not place your order. Please check the form and try again.');
      },
      onFinish: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    });
  };

  const hasStockBlock = stockMessages.length > 0;

  return (
    <GuestLayout title="Checkout">
      <Head title="Checkout" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
        <ShopHeader title="Checkout" subtitle="Enter delivery details to complete your order" cartCount={cartCount} />

        {(hasStockBlock || submitError) && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex gap-3 pt-6 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="space-y-1">
                <p className="font-medium">Unable to complete your order</p>
                {hasStockBlock ? (
                  <ul className="list-disc pl-5">
                    {stockMessages.map((message, index) => <li key={index}>{message}</li>)}
                  </ul>
                ) : (
                  <p>{submitError}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <form
          onSubmit={e => {
            e.preventDefault();
            submit();
          }}
          className="grid gap-8 lg:grid-cols-3"
        >
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact &amp; delivery</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} required />
                  {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} required />
                  {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="+260..." />
                  {errors.phone && <p className="mt-1 text-sm text-destructive">{errors.phone}</p>}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="shipping_address">Shipping address</Label>
                  <Textarea
                    id="shipping_address"
                    rows={4}
                    value={data.shipping_address}
                    onChange={e => setData('shipping_address', e.target.value)}
                    placeholder="Street, area, city, province"
                    required
                  />
                  {errors.shipping_address && <p className="mt-1 text-sm text-destructive">{errors.shipping_address}</p>}
                </div>
              </CardContent>
            </Card>

            <div className="lg:hidden">
              <OrderSummary items={cart.items} totals={totals} />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={processing || hasStockBlock}>
              {processing ? 'Placing order...' : 'Place order'}
            </Button>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-28">
              <OrderSummary
                items={cart.items}
                totals={totals}
                action={
                  <Button type="submit" size="lg" className="w-full" disabled={processing || hasStockBlock}>
                    {processing ? 'Placing order...' : 'Place order'}
                  </Button>
                }
              />
            </div>
          </div>
        </form>
      </div>
    </GuestLayout>
  );
}
