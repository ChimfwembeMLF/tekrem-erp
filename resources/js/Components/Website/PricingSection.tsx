import React from 'react';
import { Link } from '@inertiajs/react';
import useRoute from '@/Hooks/useRoute';
import { CheckCircle, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import type { ServiceData, ServicePackage } from '@/Data/servicesData';

interface PricingSectionProps {
  services: ServiceData[];
  showServiceHeaders?: boolean;
}

function PackageCard({ pkg, quoteHref }: { pkg: ServicePackage; quoteHref: string }) {
  return (
    <Card className={`relative h-full ${pkg.popular ? 'border-primary shadow-lg ring-1 ring-primary/20' : ''}`}>
      {pkg.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary px-3 py-1 text-primary-foreground">
            <Star className="mr-1 h-3 w-3" />
            Most Popular
          </Badge>
        </div>
      )}
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{pkg.name}</CardTitle>
        <div className="text-3xl font-bold text-primary">
          {pkg.price}
          {pkg.priceNote && <span className="ml-1 text-base font-normal text-muted-foreground">{pkg.priceNote}</span>}
        </div>
        <CardDescription>{pkg.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex h-full flex-col">
        <ul className="mb-6 flex-1 space-y-3">
          {pkg.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button asChild className="w-full bg-gradient-to-r from-secondary to-primary hover:from-primary hover:to-secondary">
          <Link href={quoteHref}>Request Quote</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function PricingSection({ services, showServiceHeaders = true }: PricingSectionProps) {
  const route = useRoute();

  return (
    <div className="space-y-16">
      {services.map((service) => (
        <div key={service.id} id={service.id}>
          {showServiceHeaders && (
            <div className="mb-8 text-center">
              <h3 className="text-2xl font-bold text-foreground">{service.title}</h3>
              <p className="mt-2 text-muted-foreground">{service.shortDescription}</p>
            </div>
          )}
          <div className="grid gap-6 md:grid-cols-3">
            {service.packages.map((pkg) => (
              <PackageCard key={`${service.id}-${pkg.name}`} pkg={pkg} quoteHref={route('guest.quote.create')} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
