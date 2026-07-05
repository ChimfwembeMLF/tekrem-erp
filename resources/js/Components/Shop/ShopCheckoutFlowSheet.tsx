import React, { useEffect, useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import useRoute from '@/Hooks/useRoute';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/Components/ui/sheet';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Separator } from '@/Components/ui/separator';
import { AlertCircle, ArrowLeft, Loader2, Minus, Plus, Tag, Trash2, Truck, Smartphone } from 'lucide-react';
import { formatZmw } from '@/lib/formatCurrency';
import { ShopCartItem, ShopShippingMethod, ShopTotals } from '@/lib/shopTotals';
import type { ShopFlowStep } from '@/Components/Shop/ShopSheetProvider';

interface CheckoutDefaults {
  name: string;
  email: string;
  phone: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step: ShopFlowStep;
  onStepChange: (step: ShopFlowStep) => void;
  loading: boolean;
  recalculating?: boolean;
  items: ShopCartItem[];
  totals: ShopTotals;
  shippingMethods: ShopShippingMethod[];
  stockIssues: string[];
  defaults: CheckoutDefaults;
  momoAvailable: boolean;
  onCartChange: (params?: { shipping_method_id?: number; coupon_code?: string }) => Promise<unknown>;
  onCartCountChange: (count: number) => void;
}

export default function ShopCheckoutFlowSheet({
  open,
  onOpenChange,
  step,
  onStepChange,
  loading,
  recalculating = false,
  items,
  totals,
  shippingMethods,
  stockIssues,
  defaults,
  momoAvailable,
  onCartChange,
  onCartCountChange,
}: Props) {
  const route = useRoute();
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    email: '',
    phone: '',
    shipping_address: '',
  });
  const [shippingMethodId, setShippingMethodId] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'momo'>('cod');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [itemBusy, setItemBusy] = useState<number | null>(null);

  const resolvedShippingMethodId = useMemo(
    () => shippingMethodId ?? shippingMethods[0]?.id ?? null,
    [shippingMethodId, shippingMethods],
  );

  useEffect(() => {
    if (!open) return;
    setCheckoutForm((current) => ({
      ...current,
      name: defaults.name || current.name,
      email: defaults.email || current.email,
      phone: defaults.phone || current.phone,
    }));
  }, [open, defaults]);

  useEffect(() => {
    if (shippingMethods.length === 0) return;
    setShippingMethodId((current) => current ?? shippingMethods[0].id);
  }, [shippingMethods]);

  useEffect(() => {
    if (!open || !resolvedShippingMethodId) return;
    onCartChange({
      shipping_method_id: resolvedShippingMethodId,
      coupon_code: appliedCoupon || undefined,
    });
  }, [open, resolvedShippingMethodId, appliedCoupon]);

  const updateQuantity = async (item: ShopCartItem, quantity: number) => {
    setItemBusy(item.id);
    try {
      if (quantity <= 0) {
        await axios.delete(route('shop.cart.remove', item.id));
      } else {
        await axios.patch(route('shop.cart.update', item.id), { quantity });
      }
      const data = await onCartChange({
        shipping_method_id: resolvedShippingMethodId ?? undefined,
        coupon_code: appliedCoupon || undefined,
      });
      onCartCountChange((data as { cartCount: number }).cartCount);
    } finally {
      setItemBusy(null);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      await axios.post(route('shop.api.coupon'), {
        coupon_code: couponCode,
        shipping_method_id: resolvedShippingMethodId,
      });
      setAppliedCoupon(couponCode.trim());
      setCouponMessage('Coupon applied');
      await onCartChange({
        shipping_method_id: resolvedShippingMethodId ?? undefined,
        coupon_code: couponCode.trim(),
      });
    } catch (error) {
      setAppliedCoupon('');
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setCouponMessage(error.response.data.message);
      } else {
        setCouponMessage('Invalid coupon');
      }
    }
  };

  const proceedToCheckout = () => {
    if (items.length === 0) return;
    setSubmitError(null);
    onStepChange('checkout');
  };

  const proceedToPayment = () => {
    if (!checkoutForm.name.trim() || !checkoutForm.email.trim() || !checkoutForm.shipping_address.trim()) {
      setSubmitError('Please complete all required delivery fields.');
      return;
    }
    if (!resolvedShippingMethodId) {
      setSubmitError('Please select a shipping method. If none are listed, contact the store admin.');
      return;
    }
    setSubmitError(null);
    onStepChange('payment');
  };

  const placeOrder = () => {
    if (!resolvedShippingMethodId) {
      setSubmitError('Please select a shipping method.');
      onStepChange('checkout');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    router.post(
      route('shop.checkout.store'),
      {
        ...checkoutForm,
        payment_method: paymentMethod,
        shipping_method_id: resolvedShippingMethodId,
        coupon_code: appliedCoupon || undefined,
      },
      {
        preserveState: true,
        onError: (errors) => {
          const stock = errors.stock;
          if (stock) {
            setSubmitError(Array.isArray(stock) ? stock.join(' ') : stock);
            onStepChange('checkout');
            return;
          }
          const first = Object.values(errors).flat()[0];
          setSubmitError(typeof first === 'string' ? first : 'Could not place your order.');
        },
        onFinish: () => setSubmitting(false),
      },
    );
  };

  const canContinueToPayment =
    checkoutForm.name.trim() !== '' &&
    checkoutForm.email.trim() !== '' &&
    checkoutForm.shipping_address.trim() !== '' &&
    resolvedShippingMethodId !== null;

  const titles: Record<ShopFlowStep, string> = {
    cart: 'Your cart',
    checkout: 'Delivery details',
    payment: 'Payment',
  };

  const descriptions: Record<ShopFlowStep, string> = {
    cart: 'Review items before checkout',
    checkout: 'Where should we deliver your order?',
    payment: 'Choose how you would like to pay',
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="z-[1100] flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b px-4 py-4 text-left">
          <div className="flex items-center gap-2">
            {step !== 'cart' && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => onStepChange(step === 'payment' ? 'checkout' : 'cart')}
                disabled={submitting}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <SheetTitle>{titles[step]}</SheetTitle>
              <SheetDescription>{descriptions[step]}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {(submitError || stockIssues.length > 0) && (
                  <div className="mb-4 flex gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      {stockIssues.length > 0 ? (
                        <ul className="list-disc pl-4">
                          {stockIssues.map((issue, index) => <li key={index}>{issue}</li>)}
                        </ul>
                      ) : (
                        <p>{submitError}</p>
                      )}
                    </div>
                  </div>
                )}

                {step === 'cart' && (
                  <div className="space-y-4">
                    {items.length === 0 ? (
                      <p className="py-8 text-center text-muted-foreground">Your cart is empty.</p>
                    ) : (
                      items.map((item) => (
                        <div key={item.id} className="flex gap-3 border-b pb-4">
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-muted/30">
                            {item.product.image_urls?.[0] ? (
                              <img src={item.product.image_urls[0]} alt={item.product.name} className="h-full w-full object-cover" />
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">{formatZmw(Number(item.product.sale_price))}</p>
                            <div className="mt-2 flex w-fit items-center rounded-md border">
                              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={itemBusy === item.id} onClick={() => updateQuantity(item, Number(item.quantity) - 1)}>
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center text-sm">{Number(item.quantity).toFixed(0)}</span>
                              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={itemBusy === item.id} onClick={() => updateQuantity(item, Number(item.quantity) + 1)}>
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{formatZmw(Number(item.product.sale_price) * Number(item.quantity))}</p>
                            <Button type="button" variant="ghost" size="sm" className="mt-1 text-destructive" disabled={itemBusy === item.id} onClick={() => updateQuantity(item, 0)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {step === 'checkout' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Shipping method</Label>
                      {shippingMethods.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                          No shipping methods are configured. Checkout cannot continue until an admin adds methods under Ecommerce → Shipping.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {shippingMethods.map((method) => (
                            <button
                              key={method.id}
                              type="button"
                              onClick={() => setShippingMethodId(method.id)}
                              className={`flex w-full items-start justify-between rounded-lg border p-3 text-left transition-colors ${
                                resolvedShippingMethodId === method.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                              }`}
                            >
                              <div>
                                <p className="font-medium">{method.name}</p>
                                <p className="text-xs text-muted-foreground">{method.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  {method.estimated_days_min}-{method.estimated_days_max} days
                                </p>
                              </div>
                              <span className="text-sm font-semibold">{formatZmw(Number(method.base_cost))}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shop-coupon">Coupon code</Label>
                      <div className="flex gap-2">
                        <Input id="shop-coupon" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="WELCOME10" />
                        <Button type="button" variant="outline" onClick={applyCoupon} disabled={recalculating}>
                          <Tag className="h-4 w-4" />
                        </Button>
                      </div>
                      {couponMessage && <p className="text-xs text-muted-foreground">{couponMessage}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shop-name">Full name *</Label>
                      <Input id="shop-name" value={checkoutForm.name} onChange={(e) => setCheckoutForm((f) => ({ ...f, name: e.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shop-email">Email *</Label>
                      <Input id="shop-email" type="email" value={checkoutForm.email} onChange={(e) => setCheckoutForm((f) => ({ ...f, email: e.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shop-phone">Phone</Label>
                      <Input id="shop-phone" value={checkoutForm.phone} onChange={(e) => setCheckoutForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+260..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shop-address">Shipping address *</Label>
                      <Textarea id="shop-address" rows={4} value={checkoutForm.shipping_address} onChange={(e) => setCheckoutForm((f) => ({ ...f, shipping_address: e.target.value }))} placeholder="Street, area, city, province" required />
                    </div>
                  </div>
                )}

                {step === 'payment' && (
                  <div className="space-y-3">
                    <button type="button" onClick={() => setPaymentMethod('cod')} className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                      <Truck className="mt-0.5 h-5 w-5 shrink-0" />
                      <div>
                        <p className="font-medium">Pay on delivery</p>
                        <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                      </div>
                    </button>

                    <button type="button" onClick={() => momoAvailable && setPaymentMethod('momo')} disabled={!momoAvailable} className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors ${paymentMethod === 'momo' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'} ${!momoAvailable ? 'cursor-not-allowed opacity-50' : ''}`}>
                      <Smartphone className="mt-0.5 h-5 w-5 shrink-0" />
                      <div>
                        <p className="font-medium">Mobile money</p>
                        <p className="text-sm text-muted-foreground">
                          {momoAvailable ? 'PawaPay payment initiated on your phone' : 'Not configured — use pay on delivery'}
                        </p>
                      </div>
                    </button>

                    {paymentMethod === 'momo' && (
                      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-muted-foreground">
                        Ensure your phone number above is correct. You will receive a prompt to approve payment.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t bg-background px-4 py-4">
                  <div className="mb-3 space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatZmw(totals.subtotal)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatZmw(totals.tax_amount)}</span></div>
                    {(totals.discount_amount ?? 0) > 0 && (
                      <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatZmw(totals.discount_amount ?? 0)}</span></div>
                    )}
                    {(totals.shipping_cost ?? 0) > 0 && (
                      <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{formatZmw(totals.shipping_cost ?? 0)}</span></div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span className="inline-flex items-center gap-2">
                        Total
                        {recalculating && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                      </span>
                      <span>{formatZmw(totals.total)}</span>
                    </div>
                  </div>

                  {step === 'cart' && (
                    <Button className="w-full" size="lg" onClick={proceedToCheckout} disabled={stockIssues.length > 0}>
                      Proceed to checkout
                    </Button>
                  )}
                  {step === 'checkout' && (
                    <>
                      {!canContinueToPayment && (
                        <p className="mb-2 text-center text-xs text-muted-foreground">
                          {resolvedShippingMethodId === null
                            ? 'Select a shipping method to continue'
                            : 'Fill in name, email, and shipping address to continue'}
                        </p>
                      )}
                      <Button className="w-full" size="lg" onClick={proceedToPayment} disabled={!canContinueToPayment || recalculating}>
                        Continue to payment
                      </Button>
                    </>
                  )}
                  {step === 'payment' && (
                    <Button className="w-full" size="lg" onClick={placeOrder} disabled={submitting}>
                      {submitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Placing order...</>) : `Place order · ${formatZmw(totals.total)}`}
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
