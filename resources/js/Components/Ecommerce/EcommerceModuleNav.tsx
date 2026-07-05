import React from 'react';
import { Link } from '@inertiajs/react';
import { ImageIcon, MessageSquare, Package, Settings, Store, Tag, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import useRoute from '@/Hooks/useRoute';

export default function EcommerceModuleNav() {
  const route = useRoute();

  const items = [
    { href: route('ecommerce.dashboard'), label: 'Dashboard', pattern: 'ecommerce.dashboard', icon: Store },
    { href: route('ecommerce.orders.index'), label: 'Orders', pattern: 'ecommerce.orders.*', icon: Package },
    { href: route('ecommerce.shipping.index'), label: 'Shipping', pattern: 'ecommerce.shipping.*', icon: Truck },
    { href: route('ecommerce.coupons.index'), label: 'Coupons', pattern: 'ecommerce.coupons.*', icon: Tag },
    { href: route('ecommerce.reviews.index'), label: 'Reviews', pattern: 'ecommerce.reviews.*', icon: MessageSquare },
    { href: route('ecommerce.settings.edit'), label: 'Storefront', pattern: 'ecommerce.settings.*', icon: Settings },
  ];

  return (
    <nav
      aria-label="Ecommerce modules"
      className="overflow-x-auto rounded-xl border border-border/60 bg-card/80 p-2 shadow-sm backdrop-blur-sm"
    >
      <div className="flex min-w-max flex-wrap items-center gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = route().current(item.pattern);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
