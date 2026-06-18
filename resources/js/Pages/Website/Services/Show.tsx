import React from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import WebsiteHero from '@/Components/Website/WebsiteHero';
import useRoute from '@/Hooks/useRoute';
import { getServiceBySlug, serviceIllustrations } from '@/Data/servicesData';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface Props {
  slug: string;
}

export default function Show({ slug }: Props) {
  const route = useRoute();
  const service = getServiceBySlug(slug);

  if (!service) {
    return (
      <GuestLayout title="Service Not Found">
        <div className="mx-auto max-w-3xl px-4 py-32 text-center">
          <h1 className="text-2xl font-bold">Service not found</h1>
          <Button asChild className="mt-6">
            <Link href={route('services')}>Back to Services</Link>
          </Button>
        </div>
      </GuestLayout>
    );
  }

  const illustration = serviceIllustrations[slug];

  return (
    <GuestLayout title={service.title}>
      <Head title={service.title} />

      <WebsiteHero
        badge={service.title}
        badgeIcon={service.icon}
        title={service.title}
        highlight="Built for African businesses"
        description={service.fullDescription}
        image={illustration}
        imageAlt={service.title}
        primaryCta={{ label: 'Request a Quote', href: route('guest.quote.create') }}
        secondaryCta={{ label: 'View Pricing', href: `${route('pricing')}#${service.id}` }}
      />

      <section className="bg-background py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold">What we deliver</h2>
            <p className="mt-2 text-muted-foreground">Everything you need for a successful launch</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {service.features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-3xl font-bold">Why choose us</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {service.benefits.map((benefit) => (
              <div key={benefit.title} className="flex gap-4">
                <CheckCircle className="mt-1 h-6 w-6 shrink-0 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">{benefit.title}</h3>
                  <p className="mt-1 text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border bg-gradient-to-br from-primary/5 to-secondary/5 p-8 text-center md:p-12">
            <h2 className="text-3xl font-bold">Transparent pricing in ZMW</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              All packages are listed on our unified pricing page — no hidden fees, no per-service surprises.
            </p>
            <Button asChild size="lg" className="mt-6 bg-gradient-to-r from-secondary to-primary hover:from-primary hover:to-secondary">
              <Link href={`${route('pricing')}#${service.id}`}>
                See {service.title} pricing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold">Our process</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {service.processSteps.map((step, index) => (
              <div key={step} className="rounded-xl border bg-card p-4 text-center">
                <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </div>
                <p className="font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold">FAQ</h2>
          <div className="space-y-4">
            {service.faq.map((item) => (
              <div key={item.question} className="rounded-xl border bg-card p-5">
                <h3 className="font-semibold">{item.question}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </GuestLayout>
  );
}
