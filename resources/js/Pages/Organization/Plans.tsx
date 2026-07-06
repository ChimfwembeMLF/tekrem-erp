import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import WebsiteHero from '@/Components/Website/WebsiteHero';
import PlanCard, { PublicPlan } from '@/Components/Organization/PlanCard';
import ProcessTimeline from '@/Components/Website/ProcessTimeline';
import { Button } from '@/Components/ui/button';
import useRoute from '@/Hooks/useRoute';
import { cn } from '@/lib/utils';

interface Props {
  plans: PublicPlan[];
  modules: Record<string, string>;
}

export default function OrganizationPlans({ plans }: Props) {
  const route = useRoute();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <GuestLayout title="ERP Plans">
      <Head title="ERP Plans & Pricing" />

      <WebsiteHero
        badge="ERP SaaS"
        badgeIcon="🏢"
        title="Run your business on"
        highlight="Tekrem ERP"
        description="Online shop, inventory, CRM, finance, and more — with mobile money billing via PawaPay. Every plan includes a free trial."
        primaryCta={{ label: 'Start free trial', href: route('organization.signup') }}
        secondaryCta={{ label: 'Sign in', href: route('login') }}
      />

      <section className="border-b bg-muted/20 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <ProcessTimeline
            title="Get started in minutes"
            subtitle="Create your organization, complete onboarding, and run your business — no credit card until your trial ends."
            steps={['Choose a plan', 'Create your org', 'Onboard modules', 'Go live with PawaPay billing']}
          />
        </div>
      </section>

      <section className="bg-background py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <span className="text-sm font-medium text-muted-foreground">Billing cycle</span>
            <div className="inline-flex rounded-lg border p-1">
              <Button
                type="button"
                size="sm"
                variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly
              </Button>
              <Button
                type="button"
                size="sm"
                variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
                onClick={() => setBillingCycle('yearly')}
              >
                Yearly
                <span className={cn('ml-1 text-xs', billingCycle === 'yearly' ? 'text-primary-foreground/80' : 'text-emerald-600')}>
                  Save ~17%
                </span>
              </Button>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                billingCycle={billingCycle}
                highlighted={index === 1}
              />
            ))}
          </div>

          <div className="mt-12 rounded-xl border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            <p>
              All prices in ZMW. Trials start immediately — pay with PawaPay (MTN, Airtel, Zamtel) when your trial ends.
            </p>
            <p className="mt-2">
              Need a custom deployment or agency services?{' '}
              <Link href={route('pricing')} className="font-medium text-primary underline-offset-4 hover:underline">
                View our services pricing
              </Link>
            </p>
          </div>
        </div>
      </section>
    </GuestLayout>
  );
}
