import React from 'react';
import { Link } from '@inertiajs/react';
import useRoute from '@/Hooks/useRoute';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import type { ServiceData } from '@/Data/servicesData';

interface PricingSectionProps {
  services: ServiceData[];
  showServiceHeaders?: boolean;
}

function formatPrice(service: ServiceData): { amount: string; unit?: string } {
  const pkg = service.packages[0];
  if (!pkg) return { amount: 'Custom quote' };
  return { amount: pkg.price, unit: pkg.priceNote };
}

export default function PricingSection({ services }: PricingSectionProps) {
  const route = useRoute();

  return (
    <div className="space-y-8">
      {/* Desktop / tablet catalogue table */}
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:block">
        <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)_minmax(0,0.9fr)] border-b border-border bg-muted/50 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Service</span>
          <span>Description</span>
          <span className="text-right">Price (ZMW)</span>
        </div>
        <ul className="divide-y divide-border">
          {services.map((service) => {
            const { amount, unit } = formatPrice(service);
            return (
              <li
                key={service.id}
                id={service.id}
                className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)_minmax(0,0.9fr)] items-center gap-4 px-6 py-5 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg">
                    {service.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground leading-snug">{service.title}</p>
                    <Link
                      href={`${route('guest.quote.create')}?service=${service.id}`}
                      className="mt-0.5 inline-flex items-center text-xs text-primary hover:underline"
                    >
                      Get a quote
                      <ArrowRight className="ml-0.5 h-3 w-3" />
                    </Link>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{service.shortDescription}</p>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary whitespace-nowrap">{amount}</p>
                  {unit && <p className="text-xs text-muted-foreground">{unit.replace(/^\//, '')}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Mobile stacked cards */}
      <div className="space-y-3 md:hidden">
        {services.map((service) => {
          const { amount, unit } = formatPrice(service);
          return (
            <article
              key={service.id}
              id={service.id}
              className="rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-base">
                    {service.icon}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground leading-snug">{service.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{service.shortDescription}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-base font-bold text-primary leading-tight">{amount}</p>
                  {unit && <p className="text-[11px] text-muted-foreground">{unit}</p>}
                </div>
              </div>
              <Button variant="link" size="sm" className="mt-2 h-auto p-0" asChild>
                <Link href={`${route('guest.quote.create')}?service=${service.id}`}>
                  Get a quote
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </article>
          );
        })}
      </div>

      <div className="flex justify-center pt-4">
        <Button
          asChild
          size="lg"
          className="bg-gradient-to-r from-secondary to-primary hover:from-primary hover:to-secondary"
        >
          <Link href={route('guest.quote.create')}>Request a tailored quote</Link>
        </Button>
      </div>
    </div>
  );
}
