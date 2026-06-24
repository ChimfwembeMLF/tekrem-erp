import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ShopProductCard, { ShopProduct } from '@/Components/Shop/ShopProductCard';
import { cn } from '@/lib/utils';

interface Props {
  products: ShopProduct[];
  title?: string;
  className?: string;
}

export default function ShopProductCarousel({ products, title, className }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    setCanScrollLeft(track.scrollLeft > 4);
    setCanScrollRight(track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const track = trackRef.current;
    if (!track) return;

    track.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      track.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [products, updateScrollState]);

  const scrollByPage = (direction: 'left' | 'right') => {
    const track = trackRef.current;
    if (!track) return;

    const cardWidth = track.querySelector('article')?.getBoundingClientRect().width ?? 210;
    const gap = 16;
    const amount = (cardWidth + gap) * 3;
    track.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (products.length === 0) return null;

  return (
    <section className={cn('relative', className)}>
      {title && (
        <h2 className="mb-4 text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      )}

      <div className="relative px-1 sm:px-4">
        {canScrollLeft && (
          <CarouselArrow direction="left" onClick={() => scrollByPage('left')} />
        )}
        {canScrollRight && (
          <CarouselArrow direction="right" onClick={() => scrollByPage('right')} />
        )}

        <div
          ref={trackRef}
          className={cn(
            'flex gap-4 overflow-x-auto pb-1',
            'snap-x snap-mandatory scroll-smooth',
            '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          )}
        >
          {products.map((product) => (
            <ShopProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CarouselArrow({
  direction,
  onClick,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
}) {
  const isLeft = direction === 'left';

  return (
    <button
      type="button"
      aria-label={isLeft ? 'Scroll products left' : 'Scroll products right'}
      onClick={onClick}
      className={cn(
        'absolute top-[38%] z-10 hidden -translate-y-1/2 items-center justify-center rounded-full shadow-md transition-transform hover:scale-105 active:scale-95 sm:flex',
        'h-10 w-10',
        isLeft
          ? 'left-0 -translate-x-1/2 bg-black/10 text-foreground backdrop-blur-sm'
          : 'right-0 translate-x-1/2 bg-white text-foreground',
      )}
    >
      {isLeft ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
    </button>
  );
}
