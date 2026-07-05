import React, { useEffect, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Heart } from 'lucide-react';
import { formatZmw } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';
import useRoute from '@/Hooks/useRoute';
import useTypedPage from '@/Hooks/useTypedPage';

const WISHLIST_KEY = 'shop_wishlist';

export interface ShopProduct {
  id: number;
  name: string;
  slug: string;
  sale_price: string;
  description?: string;
  category?: { name: string };
  image_urls?: string[];
}

interface Props {
  product: ShopProduct;
  className?: string;
  inWishlist?: boolean;
}

function readLocalWishlist(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(WISHLIST_KEY) ?? '[]') as number[];
  } catch {
    return [];
  }
}

export default function ShopProductCard({ product, className, inWishlist: initialInWishlist }: Props) {
  const route = useRoute();
  const page = useTypedPage();
  const user = page.props.auth?.user;
  const [wishlisted, setWishlisted] = useState(initialInWishlist ?? false);

  useEffect(() => {
    if (initialInWishlist !== undefined) {
      setWishlisted(initialInWishlist);
      return;
    }
    if (!user) {
      setWishlisted(readLocalWishlist().includes(product.id));
    }
  }, [product.id, initialInWishlist, user]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (user) {
      router.post(route('shop.wishlist.toggle', product.slug || product.id), {}, {
        preserveScroll: true,
        onSuccess: () => setWishlisted((current) => !current),
      });
      return;
    }

    const current = readLocalWishlist();
    const next = current.includes(product.id)
      ? current.filter((id) => id !== product.id)
      : [...current, product.id];

    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
    setWishlisted(next.includes(product.id));
  };

  const productHref = route('shop.show', product.slug || product.id);

  return (
    <article className={cn('group w-[168px] shrink-0 snap-start sm:w-[190px] lg:w-[210px]', className)}>
      <Link href={productHref} className="block">
        <div className="relative overflow-hidden rounded-2xl bg-muted/80 p-4 sm:rounded-[1.25rem] sm:p-5">
          <button
            type="button"
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={toggleWishlist}
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-foreground shadow-sm transition-transform hover:scale-105"
          >
            <Heart
              className={cn('h-4 w-4', wishlisted ? 'fill-primary text-primary' : 'text-foreground/70')}
            />
          </button>

          <div className="flex aspect-square items-center justify-center">
            {product.image_urls?.[0] ? (
              <img
                src={product.image_urls[0]}
                alt={product.name}
                className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <span className="text-xs text-muted-foreground">No image</span>
            )}
          </div>
        </div>

        <div className="mt-3 space-y-1.5 px-0.5">
          <h3 className="line-clamp-3 text-sm font-semibold leading-snug text-foreground sm:text-[15px]">
            {product.name}
          </h3>
          <p className="text-base font-bold text-foreground sm:text-[17px]">
            {formatZmw(Number(product.sale_price))}
          </p>
        </div>
      </Link>
    </article>
  );
}
