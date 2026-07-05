import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import axios from 'axios';
import useRoute from '@/Hooks/useRoute';
import { ShopCartItem, ShopShippingMethod, ShopTotals } from '@/lib/shopTotals';
import ShopCheckoutFlowSheet from '@/Components/Shop/ShopCheckoutFlowSheet';
import ReceiptPreviewSheet from '@/Components/Shop/ReceiptPreviewSheet';
import type { ReceiptPayload } from '@/Components/Commerce/ReceiptForm';

export type ShopFlowStep = 'cart' | 'checkout' | 'payment';

interface CheckoutDefaults {
  name: string;
  email: string;
  phone: string;
  shipping_address?: string;
}

interface SavedAddress {
  id: number;
  label: string;
  recipient_name: string;
  phone?: string | null;
  address_line: string;
  is_default: boolean;
}

interface CartDataResponse {
  cart: { items: ShopCartItem[] };
  totals: ShopTotals;
  shippingMethods: ShopShippingMethod[];
  stockIssues: string[];
  cartCount: number;
  defaults: CheckoutDefaults;
  savedAddresses: SavedAddress[];
  momoAvailable: boolean;
}

interface ShopSheetContextValue {
  cartCount: number;
  setCartCount: (count: number) => void;
  openCart: () => void;
  openCheckout: () => void;
  openReceipt: (orderId: number, token?: string) => void;
  refreshCartCount: () => Promise<void>;
}

const ShopSheetContext = createContext<ShopSheetContextValue | null>(null);

export function useShopSheets() {
  const context = useContext(ShopSheetContext);
  if (!context) {
    throw new Error('useShopSheets must be used within ShopSheetProvider');
  }
  return context;
}

interface Props {
  children: React.ReactNode;
  initialCartCount?: number;
}

export default function ShopSheetProvider({ children, initialCartCount = 0 }: Props) {
  const route = useRoute();
  const [cartCount, setCartCount] = useState(initialCartCount);
  const [flowOpen, setFlowOpen] = useState(false);
  const [flowStep, setFlowStep] = useState<ShopFlowStep>('cart');
  const [loading, setLoading] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [items, setItems] = useState<ShopCartItem[]>([]);
  const [totals, setTotals] = useState<ShopTotals>({ subtotal: 0, tax_amount: 0, total: 0 });
  const [shippingMethods, setShippingMethods] = useState<ShopShippingMethod[]>([]);
  const [stockIssues, setStockIssues] = useState<string[]>([]);
  const [defaults, setDefaults] = useState<CheckoutDefaults>({ name: '', email: '', phone: '', shipping_address: '' });
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [momoAvailable, setMomoAvailable] = useState(false);

  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptPayload | null>(null);

  const applyCartResponse = useCallback((data: CartDataResponse) => {
    setItems(data.cart.items);
    setTotals(data.totals);
    setShippingMethods(data.shippingMethods ?? []);
    setStockIssues(data.stockIssues);
    setCartCount(data.cartCount);
    setDefaults(data.defaults);
    setSavedAddresses(data.savedAddresses ?? []);
    setMomoAvailable(data.momoAvailable);
  }, []);

  const loadCartData = useCallback(async (
    params?: { shipping_method_id?: number; coupon_code?: string },
    options?: { silent?: boolean },
  ): Promise<CartDataResponse> => {
    const silent = options?.silent ?? false;
    if (silent) {
      setRecalculating(true);
    } else {
      setLoading(true);
    }

    try {
      const { data } = await axios.get<CartDataResponse>(route('shop.api.cart'), { params });
      applyCartResponse(data);
      return data;
    } finally {
      if (silent) {
        setRecalculating(false);
      } else {
        setLoading(false);
      }
    }
  }, [applyCartResponse, route]);

  const refreshCartCount = useCallback(async () => {
    const { data } = await axios.get<CartDataResponse>(route('shop.api.cart'));
    setCartCount(data.cartCount);
  }, [route]);

  const openFlow = useCallback(async (step: ShopFlowStep) => {
    setFlowStep(step);
    setFlowOpen(true);
    await loadCartData();
  }, [loadCartData]);

  const openCart = useCallback(() => openFlow('cart'), [openFlow]);
  const openCheckout = useCallback(() => openFlow('checkout'), [openFlow]);

  const recalculateCart = useCallback(
    (params?: { shipping_method_id?: number; coupon_code?: string }) =>
      loadCartData(params, { silent: true }),
    [loadCartData],
  );

  const openReceipt = useCallback(async (orderId: number, token?: string) => {
    setReceiptOpen(true);
    setReceiptLoading(true);
    setReceipt(null);
    try {
      const { data } = await axios.get<{ receipt: ReceiptPayload }>(route('shop.order.receipt-data', orderId), {
        params: token ? { token } : {},
      });
      setReceipt(data.receipt);
    } finally {
      setReceiptLoading(false);
    }
  }, [route]);

  const value = useMemo(
    () => ({
      cartCount,
      setCartCount,
      openCart,
      openCheckout,
      openReceipt,
      refreshCartCount,
    }),
    [cartCount, openCart, openCheckout, openReceipt, refreshCartCount],
  );

  return (
    <ShopSheetContext.Provider value={value}>
      {children}

      <ShopCheckoutFlowSheet
        open={flowOpen}
        onOpenChange={setFlowOpen}
        step={flowStep}
        onStepChange={setFlowStep}
        loading={loading}
        recalculating={recalculating}
        items={items}
        totals={totals}
        shippingMethods={shippingMethods}
        stockIssues={stockIssues}
        defaults={defaults}
        savedAddresses={savedAddresses}
        momoAvailable={momoAvailable}
        onCartChange={recalculateCart}
        onCartCountChange={setCartCount}
      />

      <ReceiptPreviewSheet
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        loading={receiptLoading}
        receipt={receipt}
      />
    </ShopSheetContext.Provider>
  );
}
