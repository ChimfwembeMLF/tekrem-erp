import React from 'react';
import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import WebsiteHero from '@/Components/Website/WebsiteHero';
import PricingSection from '@/Components/Website/PricingSection';
import useRoute from '@/Hooks/useRoute';
import { getAllServices } from '@/Data/servicesData';

export default function Pricing() {
  const route = useRoute();
  const services = getAllServices();

  return (
    <GuestLayout title="Pricing">
      <Head title="Pricing" />

      <WebsiteHero
        badge="Pricing"
        badgeIcon="💰"
        title="Simple, transparent"
        highlight="pricing in Zambian Kwacha"
        description="All service packages in one place. Prices are indicative starting points — every project gets a tailored quote after discovery."
        primaryCta={{ label: 'Request a Quote', href: route('guest.quote.create') }}
        secondaryCta={{ label: 'Talk to Us', href: route('guest.inquiry.create') }}
      />

      <section className="bg-background py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PricingSection services={services} />
          <p className="mt-12 text-center text-sm text-muted-foreground">
            All prices are in ZMW (Zambian Kwacha). Cloud plans are billed monthly; other packages are project-based unless stated otherwise.
            VAT and third-party fees may apply.
          </p>
        </div>
      </section>
    </GuestLayout>
  );
}
