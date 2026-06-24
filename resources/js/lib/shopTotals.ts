export interface ShopCartProduct {
  id: number;
  name: string;
  sale_price: string;
  tax_rate?: string;
  image_urls?: string[];
  category?: { name: string };
}

export interface ShopCartItem {
  id: number;
  quantity: string;
  product: ShopCartProduct;
}

export interface ShopTotals {
  subtotal: number;
  tax_amount: number;
  discount_amount?: number;
  shipping_cost?: number;
  total: number;
}

export interface ShopShippingMethod {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  base_cost: string;
  estimated_days_min: number;
  estimated_days_max: number;
}

export function calcLineTotals(quantity: number, unitPrice: number, taxRate = 0) {
  const lineNet = quantity * unitPrice;
  const tax = lineNet * (taxRate / 100);

  return {
    lineNet,
    tax,
    total: lineNet + tax,
  };
}

export function calcCartTotals(items: ShopCartItem[]): ShopTotals {
  return items.reduce(
    (acc, item) => {
      const qty = Number(item.quantity);
      const price = Number(item.product.sale_price);
      const taxRate = Number(item.product.tax_rate ?? 0);
      const { lineNet, tax } = calcLineTotals(qty, price, taxRate);

      acc.subtotal += lineNet;
      acc.tax_amount += tax;
      acc.total += lineNet + tax;

      return acc;
    },
    { subtotal: 0, tax_amount: 0, total: 0 },
  );
}
