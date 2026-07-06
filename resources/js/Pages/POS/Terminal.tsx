import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import { Loader2, Minus, Plus, Trash2 } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import BarcodeDisplay from '@/Components/Inventory/BarcodeDisplay';

interface Product { id: number; name: string; sku: string; sale_price: string; tax_rate: string; barcode?: string }
interface CartItem extends Product { quantity: number }
interface Props {
  register: { id: number; name: string; warehouse: { name: string } };
  session: { id: number };
  products: Product[];
}

const NETWORKS = [
  { code: 'auto', label: 'Auto-detect network' },
  { code: 'MTN_MOMO_ZMB', label: 'MTN Mobile Money' },
  { code: 'AIRTEL_OAPI_ZMB', label: 'Airtel Money' },
  { code: 'ZAMTEL_ZMB', label: 'Zamtel Kwacha' },
];

export default function PosTerminal({ register, session, products }: Props) {
  const route = useRoute();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [processing, setProcessing] = useState(false);
  const [momoOpen, setMomoOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [correspondent, setCorrespondent] = useState('auto');
  const [awaitingPayment, setAwaitingPayment] = useState(false);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
    || p.sku.toLowerCase().includes(search.toLowerCase())
    || (p.barcode ?? '').includes(search)
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(i => i.id === productId ? { ...i, quantity } : i));
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(i => i.id !== productId));
  };

  const clearCart = () => setCart([]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || !search.trim()) {
      return;
    }

    const term = search.trim();
    const exact = products.find(p => p.barcode === term || p.sku === term);
    if (exact) {
      addToCart(exact);
      setSearch('');
      e.preventDefault();
    }
  };

  const total = cart.reduce((sum, i) => sum + Number(i.sale_price) * i.quantity, 0);

  const cartPayload = () => ({
    items: cart.map(i => ({
      product_id: i.id,
      description: i.name,
      quantity: i.quantity,
      unit_price: i.sale_price,
      tax_rate: i.tax_rate,
    })),
  });

  const openReceipt = (saleId: number) => {
    window.open(route('pos.sales.receipt', saleId), '_blank');
  };

  const pollMomoStatus = async (transactionId: number, saleId: number, saleNumber: string) => {
    const maxAttempts = 40;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 3000));

      const { data } = await axios.post(route('pos.momo.status', transactionId));

      if (data.status === 'completed') {
        toast.success(`Sale ${saleNumber} paid via mobile money.`);
        setCart([]);
        setMomoOpen(false);
        setPhoneNumber('');
        setCorrespondent('auto');
        setAwaitingPayment(false);
        openReceipt(saleId);
        return;
      }

      if (['failed', 'cancelled'].includes(data.status)) {
        throw new Error('Mobile money payment was not completed.');
      }
    }

    throw new Error('Payment is still pending. Check Finance → Mobile Money for the latest status.');
  };

  const checkout = async (method: string) => {
    if (!cart.length) return;
    setProcessing(true);
    try {
      const { data } = await axios.post(route('pos.sale', session.id), {
        payment_method: method,
        ...cartPayload(),
      });
      toast.success(data.message);
      openReceipt(data.sale.id);
      setCart([]);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message ?? 'Sale failed. Please check stock and try again.'
        : 'Sale failed. Please check stock and try again.';
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  const initiateMomoCheckout = async () => {
    if (!cart.length || !phoneNumber.trim()) return;

    setProcessing(true);
    setAwaitingPayment(true);

    try {
      const payload: Record<string, unknown> = {
        phone_number: phoneNumber.trim(),
        ...cartPayload(),
      };

      if (correspondent !== 'auto') {
        payload.correspondent = correspondent;
      }

      const { data } = await axios.post(route('pos.momo-sale', session.id), payload);

      toast.info(data.message);
      await pollMomoStatus(data.transaction.id, data.sale.id, data.sale.sale_number);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message ?? 'Mobile money payment failed.'
        : error instanceof Error ? error.message : 'Mobile money payment failed.';
      toast.error(message);
      setAwaitingPayment(false);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AppLayout title={`POS — ${register.name}`}>
      <Head title="POS Terminal" />
      <div className="grid gap-4 lg:grid-cols-3 h-[calc(100vh-8rem)]">
        <div className="lg:col-span-2 space-y-4 overflow-hidden flex flex-col">
          <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 overflow-y-auto flex-1">
            {filtered.map(p => (
              <button key={p.id} type="button" onClick={() => addToCart(p)} className="text-left p-3 border rounded-lg hover:bg-accent">
                <p className="font-medium text-sm">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.sku}</p>
                <p className="font-bold mt-1">ZMW {Number(p.sale_price).toFixed(2)}</p>
              </button>
            ))}
          </div>
        </div>
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Cart · {register.warehouse.name}</CardTitle>
            {cart.length > 0 && (
              <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={clearCart}>
                Clear
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-3">
            {cart.length === 0 ? (
              <p className="text-sm text-muted-foreground">Tap products to add them to the cart.</p>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-start justify-between gap-2 border-b pb-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">ZMW {Number(item.sale_price).toFixed(2)} each</p>
                    <div className="mt-2 flex items-center rounded-md border w-fit">
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">ZMW {(Number(item.sale_price) * item.quantity).toFixed(2)}</p>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
          <div className="p-4 border-t space-y-2">
            <div className="flex justify-between font-bold text-lg"><span>Total</span><span>ZMW {total.toFixed(2)}</span></div>
            <div className="grid grid-cols-2 gap-2">
              <Button disabled={processing || !cart.length} onClick={() => checkout('cash')}>Cash</Button>
              <Button disabled={processing || !cart.length} variant="secondary" onClick={() => setMomoOpen(true)}>MoMo</Button>
            </div>
          </div>
        </Card>
      </div>

      <Dialog open={momoOpen} onOpenChange={(open) => !awaitingPayment && setMomoOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Collect via PawaPay</DialogTitle>
            <DialogDescription>
              The customer will receive a prompt on their phone to approve ZMW {total.toFixed(2)}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="momo-phone">Customer phone</Label>
              <Input
                id="momo-phone"
                placeholder="0977123456"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={awaitingPayment}
              />
            </div>

            <div className="space-y-2">
              <Label>Network</Label>
              <Select value={correspondent} onValueChange={setCorrespondent} disabled={awaitingPayment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NETWORKS.map((network) => (
                    <SelectItem key={network.code} value={network.code}>
                      {network.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMomoOpen(false)} disabled={awaitingPayment}>
              Cancel
            </Button>
            <Button onClick={initiateMomoCheckout} disabled={processing || !phoneNumber.trim() || !cart.length}>
              {awaitingPayment ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Waiting for approval...
                </>
              ) : (
                `Charge ZMW ${total.toFixed(2)}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
