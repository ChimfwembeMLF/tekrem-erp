import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/Components/ui/button';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { formatZmw } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';

interface Product {
  id: number;
  name: string;
  slug: string;
  sale_price: string;
  description?: string;
  category?: { name: string };
  image_urls?: string[];
}

interface Props {
  products: Product[];
  onAddToCart: (productId: number) => void;
  backgroundImageUrl?: string | null;
}

const AUTO_PLAY_MS = 6000;

export default function FeaturedProductsCarousel({ products, onAddToCart, backgroundImageUrl }: Props) {
  const [current, setCurrent] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isPaused = userPaused || isHovered;

  const count = products.length;
  const product = products[current];

  const goTo = useCallback(
    (index: number, slideDirection?: number) => {
      if (count === 0) return;
      setDirection(slideDirection ?? (index > current ? 1 : -1));
      setCurrent((index + count) % count);
    },
    [count, current],
  );

  const goNext = useCallback(() => {
    goTo(current + 1, 1);
  }, [current, goTo]);

  const goPrev = useCallback(() => {
    goTo(current - 1, -1);
  }, [current, goTo]);

  useEffect(() => {
    if (count <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(goNext, AUTO_PLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [count, isPaused, goNext]);

  if (count === 0 || !product) return null;

  const subtitle = [
    product.category?.name,
    product.description?.trim(),
    formatZmw(Number(product.sale_price)),
  ]
    .filter(Boolean)
    .join(' · ');

  const slideVariants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 32 : -32 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -32 : 32 }),
  };

  return (
    <section
      className="group relative overflow-hidden rounded-2xl bg-muted md:rounded-3xl"
      aria-roledescription="carousel"
      aria-label="Featured products"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative min-h-[280px] sm:min-h-[320px] md:min-h-[380px] lg:min-h-[420px]">
        {backgroundImageUrl ? (
          <img
            src={backgroundImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/35 via-primary/15 to-secondary/25" />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={product.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex h-full min-h-[inherit] flex-col justify-end px-6 pb-20 pt-10 sm:px-10 sm:pb-24 md:flex-row md:items-center md:justify-start md:gap-10 md:pb-10 md:pt-0 lg:px-14"
          >
            {product.image_urls?.[0] && (
              <div className="mb-6 hidden shrink-0 rounded-2xl bg-white/95 p-4 shadow-lg md:mb-0 md:block md:w-44 lg:w-52">
                <img
                  src={product.image_urls[0]}
                  alt={product.name}
                  className="aspect-square w-full object-contain"
                />
              </div>
            )}

            <div className="max-w-2xl">
              {product.category && (
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                  Featured · {product.category.name}
                </p>
              )}
              <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                {product.name}
              </h2>
              {subtitle && (
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
                  {subtitle}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="h-11 rounded-full bg-white px-7 text-sm font-semibold text-black hover:bg-white/90"
                >
                  <Link href={route('shop.show', product.id)}>View product</Link>
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="h-11 rounded-full border-white/60 bg-white/10 px-7 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                  onClick={() => onAddToCart(product.id)}
                >
                  Add to cart
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {count > 1 && (
          <>
            <div
              className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2"
              role="tablist"
              aria-label="Featured product slides"
            >
              {products.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={index === current}
                  aria-label={`Go to slide ${index + 1}: ${item.name}`}
                  onClick={() => goTo(index, index > current ? 1 : -1)}
                  className={cn(
                    'rounded-full transition-all duration-300',
                    index === current
                      ? 'h-2.5 w-2.5 bg-white'
                      : 'h-2.5 w-2.5 border border-white/80 bg-transparent hover:bg-white/30',
                  )}
                />
              ))}
            </div>

            <div className="absolute bottom-4 right-4 flex items-center gap-2 sm:bottom-5 sm:right-5">
              <CarouselControl label="Previous slide" onClick={goPrev}>
                <ChevronLeft className="h-4 w-4" />
              </CarouselControl>
              <CarouselControl label="Next slide" onClick={goNext}>
                <ChevronRight className="h-4 w-4" />
              </CarouselControl>
              <CarouselControl
                label={userPaused ? 'Play carousel' : 'Pause carousel'}
                onClick={() => setUserPaused((prev) => !prev)}
              >
                {userPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </CarouselControl>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function CarouselControl({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-md transition-transform hover:scale-105 active:scale-95"
    >
      {children}
    </button>
  );
}
