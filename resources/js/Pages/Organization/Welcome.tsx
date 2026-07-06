import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { formatZmw } from '@/lib/formatCurrency';
import { PublicPlan } from '@/Components/Organization/PlanCard';

interface Props {
  organization: {
    id: number;
    name: string;
    slug: string;
    display_name: string;
    status: string;
    trial_ends_at: string | null;
  };
  plan: PublicPlan | null;
  billing: {
    subscription: { status: string; billing_cycle: string } | null;
    amount_due: number;
    currency: string;
    needs_payment: boolean;
  };
  nextSteps: Array<{
    title: string;
    description: string;
    href: string;
  }>;
}

export default function OrganizationWelcome({ organization, plan, billing, nextSteps }: Props) {
  const route = useRoute();
  const trialEnds = organization.trial_ends_at ? new Date(organization.trial_ends_at) : null;

  return (
    <AppLayout title="Welcome">
      <Head title="Welcome" />

      <div className="mx-auto max-w-3xl space-y-8 py-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
            <Sparkles className="h-7 w-7 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to {organization.display_name}</h1>
          <p className="mt-2 text-muted-foreground">Your organization is live. Here is what happens next.</p>
        </div>

        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              {plan?.name ?? 'Trial'} plan activated
            </CardTitle>
            <CardDescription>
              {plan ? (
                <>
                  {plan.trial_days}-day free trial
                  {trialEnds ? ` · ends ${trialEnds.toLocaleDateString()}` : ''}
                  {' · '}
                  then {formatZmw(billing.amount_due)}/{billing.subscription?.billing_cycle === 'yearly' ? 'year' : 'month'}
                </>
              ) : (
                'Your trial subscription is active.'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="capitalize">
              {billing.subscription?.status ?? organization.status}
            </Badge>
            {!billing.needs_payment && (
              <span className="text-sm text-emerald-700 dark:text-emerald-300">No payment due during your trial.</span>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Get started</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {nextSteps.map((step) => (
              <Card key={step.title} className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" size="sm">
                    <Link href={step.href}>
                      Open
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href={route('dashboard')}>Go to dashboard</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={route('organization.billing')}>View billing</Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
