import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import { Link } from '@inertiajs/react';
import { ShoppingBag, Truck } from 'lucide-react';
import { formatZmw } from '@/lib/formatCurrency';
import { ShopCartItem, ShopTotals } from '@/lib/shopTotals';
import { useShopSheets } from '@/Components/Shop/ShopSheetProvider';
import useRoute from '@/Hooks/useRoute';

interface OrderSummaryProps {
  items: ShopCartItem[];
  totals: ShopTotals;
  action?: React.ReactNode;
  showItems?: boolean;
}

export default function OrderSummary({ items, totals, action, showItems = true }: OrderSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showItems && (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="flex gap-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-muted/30">
                  {item.product.image_urls?.[0] ? (
                    <img src={item.product.image_urls[0]} alt={item.product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">No image</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">Qty {Number(item.quantity).toFixed(0)}</p>
                </div>
                <p className="text-sm font-medium">
                  {formatZmw(Number(item.product.sale_price) * Number(item.quantity))}
                </p>
              </div>
            ))}
          </div>
        )}

        <Separator />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatZmw(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span>{formatZmw(totals.tax_amount)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatZmw(totals.total)}</span>
          </div>
        </div>

        {action}
      </CardContent>
    </Card>
  );
}

interface ShopHeaderProps {
  title: string;
  subtitle?: string;
}

export function ShopHeader({ title, subtitle }: ShopHeaderProps) {
  const { cartCount, openCart } = useShopSheets();
  const route = useRoute();
  
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="ghost" size="sm" asChild>
          <Link href={route('shop.tracking')}><Truck className="mr-2 h-4 w-4" />Track</Link>
        </Button>
        <Button type="button" variant="outline" onClick={openCart}>
          <ShoppingBag className="mr-2 h-4 w-4" />
          Cart ({Number(cartCount).toFixed(0)})
        </Button>
      </div>
    </div>
  );
}
