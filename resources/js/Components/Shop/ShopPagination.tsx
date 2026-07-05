import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface Props {
  links: PaginationLink[];
}

export default function ShopPagination({ links }: Props) {
  if (links.length <= 3) return null;

  return (
    <nav aria-label="Product pagination" className="flex flex-wrap items-center justify-center gap-1">
      {links.map((link, index) => {
        const label = link.label.replace('&laquo;', '«').replace('&raquo;', '»').replace(/&[^;]+;/g, '');

        if (!link.url) {
          return (
            <Button key={index} variant="outline" size="sm" disabled className="min-w-9">
              {label}
            </Button>
          );
        }

        return (
          <Button
            key={index}
            variant={link.active ? 'default' : 'outline'}
            size="sm"
            asChild
            className={cn('min-w-9', link.active && 'pointer-events-none')}
          >
            <Link href={link.url} preserveScroll preserveState>
              {label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
