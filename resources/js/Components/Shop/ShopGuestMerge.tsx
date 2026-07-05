import { useEffect, useRef } from 'react';
import axios from 'axios';
import useRoute from '@/Hooks/useRoute';
import useTypedPage from '@/Hooks/useTypedPage';

export const SHOP_WISHLIST_KEY = 'shop_wishlist';

function readGuestWishlist(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(SHOP_WISHLIST_KEY) ?? '[]') as number[];
  } catch {
    return [];
  }
}

export default function ShopGuestMerge() {
  const route = useRoute();
  const page = useTypedPage();
  const user = page.props.auth?.user as { id: number } | null | undefined;
  const mergedRef = useRef(false);

  useEffect(() => {
    if (!user || mergedRef.current) return;

    const productIds = readGuestWishlist();
    if (productIds.length === 0) {
      mergedRef.current = true;
      return;
    }

    mergedRef.current = true;

    axios
      .post(route('shop.wishlist.merge'), { product_ids: productIds })
      .then(() => {
        window.localStorage.removeItem(SHOP_WISHLIST_KEY);
      })
      .catch(() => {
        mergedRef.current = false;
      });
  }, [user, route]);

  return null;
}
