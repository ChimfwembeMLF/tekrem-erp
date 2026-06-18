import React from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import WebsiteHero from '@/Components/Website/WebsiteHero';
import useRoute from '@/Hooks/useRoute';
import { getAllServices, getStartingPrice } from '@/Data/servicesData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { ArrowRight } from 'lucide-react';
import servicesIllustration from '../../../../public/assets/illustrations/services-illustration.png';

const routeMap: Record<string, string> = {
  'web-development': 'services.web-development',
  'mobile-apps': 'services.mobile-apps',
  'ai-solutions': 'services.ai-solutions',
  'cloud-services': 'services.cloud-services',
};

export default function Services() {
  const route = useRoute();
  const services = getAllServices();

  return (
    <GuestLayout title="Services">
      <Head title="Services" />

      <WebsiteHero
        badge="Our Services"
        badgeIcon="🛠️"
        title="Technology solutions"
        highlight="for modern businesses"
        description="Web, mobile, AI, and cloud — delivered by a Lusaka-based team with transparent ZMW pricing."
        image={servicesIllustration}
        imageAlt="Our services"
        primaryCta={{ label: 'View Pricing', href: route('pricing') }}
        secondaryCta={{ label: 'Request a Quote', href: route('guest.quote.create') }}
      />

      <section className="bg-background py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            {services.map((service) => (
              <Card key={service.id} className="flex flex-col">
                <CardHeader>
                  <div className="mb-2 text-2xl">{service.icon}</div>
                  <CardTitle>{service.title}</CardTitle>
                  <CardDescription>{service.shortDescription}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto flex flex-col gap-4">
                  <p className="text-sm text-muted-foreground">
                    From <span className="font-semibold text-primary">{getStartingPrice(service)}</span>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild variant="outline" size="sm">
                      <Link href={route(routeMap[service.id])}>Learn more</Link>
                    </Button>
                    <Button asChild size="sm" className="bg-gradient-to-r from-secondary to-primary hover:from-primary hover:to-secondary">
                      <Link href={`${route('pricing')}#${service.id}`}>
                        See pricing
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </GuestLayout>
  );
}
