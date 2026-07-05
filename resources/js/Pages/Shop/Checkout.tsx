import React, { useEffect, useMemo, useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import ShopLayout from '@/Layouts/ShopLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import OrderSummary, { ShopHeader } from '@/Components/Shop/OrderSummary';
import { formatZmw } from '@/lib/formatCurrency';
import { ShopCartItem, ShopShippingMethod, ShopTotals } from '@/lib/shopTotals';
import { AlertCircle, Loader2, Smartphone, Tag, Truck } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Cart { items: ShopCartItem[] }
interface Defaults { name: string; email: string; phone: string }
interface Props {
  cart: Cart;
  totals: ShopTotals;
  cartCount: number;
  stockIssues?: string[];
  defaults: Defaults;
  shippingMethods: ShopShippingMethod[];
  momoAvailable: boolean;
}

function stockErrorList(errors: Record<string, string | string[]>, stockIssues: string[]): string[] {
  return [...new Set([
    ...stockIssues,
    ...(Array.isArray(errors.stock) ? errors.stock : errors.stock ? [errors.stock] : []),
  ])];
}

export default function ShopCheckout({
  cart,
  totals: initialTotals,
  cartCount,
  stockIssues = [],
  defaults,
  shippingMethods,
  momoAvailable,
}: Props) {
  const route = useRoute();
  const page = usePage();
  const { errors } = page.props as { errors: Record<string, string | string[]> };
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [totals, setTotals] = useState(initialTotals);
  const [recalculating, setRecalculating] = useState(false);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  const { data, setData, post, processing } = useForm({
    name: defaults.name,
    email: defaults.email,
    phone: defaults.phone,
    shipping_address: '',
    shipping_method_id: shippingMethods[0]?.id ?? '',
    payment_method: 'cod' as 'cod' | 'momo',
    coupon_code: '',
  });

  const stockMessages = stockErrorList(errors, stockIssues);
  const hasStockBlock = stockMessages.length > 0;

  const resolvedShippingId = useMemo(() => {
    const id = Number(data.shipping_method_id);
    return Number.isFinite(id) && id > 0 ? id : shippingMethods[0]?.id ?? null;
  }, [data.shipping_method_id, shippingMethods]);

  useEffect(() => {
    if (shippingMethods.length > 0 && !data.shipping_method_id) {
      setData('shipping_method_id', shippingMethods[0].id);
    }
  }, [shippingMethods, data.shipping_method_id, setData]);

  useEffect(() => {
    if (!resolvedShippingId) return;

    let cancelled = false;
    setRecalculating(true);

    axios
      .get(route('shop.api.cart'), {
        params: {
          shipping_method_id: resolvedShippingId,
          coupon_code: data.coupon_code || undefined,
        },
      })
      .then(({ data: response }) => {
        if (!cancelled) setTotals(response.totals);
      })
      .finally(() => {
        if (!cancelled) setRecalculating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [resolvedShippingId, data.coupon_code, route]);

  const applyCoupon = async () => {
    if (!data.coupon_code.trim()) return;
    try {
      await axios.post(route('shop.api.coupon'), {
        coupon_code: data.coupon_code,
        shipping_method_id: resolvedShippingId,
      });
      setCouponMessage('Coupon applied');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setCouponMessage(error.response.data.message);
      } else {
        setCouponMessage('Invalid coupon');
      }
    }
  };

  const submit = () => {
    if (!resolvedShippingId) {
      setSubmitError('Please select a shipping method.');
      return;
    }

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
    });
  };

  const canSubmit =
    data.name.trim() !== '' &&
    data.email.trim() !== '' &&
    data.shipping_address.trim() !== '' &&
    resolvedShippingId !== null &&
    !hasStockBlock;

  return (
    <ShopLayout title="Checkout" cartCount={cartCount}>
      <Head title="Checkout" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
        <ShopHeader title="Checkout" subtitle="Delivery, shipping, and payment" />

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
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="grid gap-8 lg:grid-cols-3"
        >
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {shippingMethods.length === 0 ? (
                  <p className="text-sm text-destructive">No shipping methods configured. Contact the store admin.</p>
                ) : (
                  shippingMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setData('shipping_method_id', method.id)}
                      className={`flex w-full items-start justify-between rounded-lg border p-3 text-left transition-colors ${
                        resolvedShippingId === method.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                    >
                      <div>
                        <p className="font-medium">{method.name}</p>
                        <p className="text-xs text-muted-foreground">{method.description}</p>
                      </div>
                      <span className="text-sm font-semibold">{formatZmw(Number(method.base_cost))}</span>
                    </button>
                  ))
                )}
                {errors.shipping_method_id && <p className="text-sm text-destructive">{errors.shipping_method_id}</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact &amp; delivery</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="name">Full name *</Label>
                  <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} required />
                  {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} required />
                  {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="+260..." />
                  {errors.phone && <p className="mt-1 text-sm text-destructive">{errors.phone}</p>}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="shipping_address">Shipping address *</Label>
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
                <div className="sm:col-span-2">
                  <Label htmlFor="coupon">Coupon code</Label>
                  <div className="flex gap-2">
                    <Input id="coupon" value={data.coupon_code} onChange={e => setData('coupon_code', e.target.value.toUpperCase())} placeholder="WELCOME10" />
                    <Button type="button" variant="outline" onClick={applyCoupon}>
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                  {couponMessage && <p className="mt-1 text-xs text-muted-foreground">{couponMessage}</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button
                  type="button"
                  onClick={() => setData('payment_method', 'cod')}
                  className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left ${data.payment_method === 'cod' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                >
                  <Truck className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-medium">Pay on delivery</p>
                    <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => momoAvailable && setData('payment_method', 'momo')}
                  disabled={!momoAvailable}
                  className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left ${data.payment_method === 'momo' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'} ${!momoAvailable ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <Smartphone className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-medium">Mobile money</p>
                    <p className="text-sm text-muted-foreground">
                      {momoAvailable ? 'PawaPay prompt on your phone' : 'Not configured'}
                    </p>
                  </div>
                </button>
              </CardContent>
            </Card>

            <div className="lg:hidden">
              <OrderSummary items={cart.items} totals={totals} />
            </div>

            <Button type="submit" size="lg" className="w-full lg:hidden" disabled={processing || !canSubmit || recalculating}>
              {processing ? 'Placing order...' : 'Place order'}
            </Button>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-28">
              <OrderSummary
                items={cart.items}
                totals={totals}
                action={
                  <Button type="submit" size="lg" className="w-full" disabled={processing || !canSubmit || recalculating}>
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Placing order...
                      </>
                    ) : (
                      'Place order'
                    )}
                  </Button>
                }
              />
            </div>
          </div>
        </form>
      </div>
    </ShopLayout>
  );
}
