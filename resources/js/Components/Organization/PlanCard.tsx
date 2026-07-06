import React from 'react';
import { Link } from '@inertiajs/react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Check } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { formatZmw } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';

export interface PublicPlan {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price_monthly: string;
  price_yearly: string;
  currency: string;
  trial_days: number;
  max_users: number | null;
  max_products: number | null;
  max_orders_per_month: number | null;
  features: string[];
  enabled_modules?: string[];
}

interface PlanCardProps {
  plan: PublicPlan;
  billingCycle?: 'monthly' | 'yearly';
  highlighted?: boolean;
  showCta?: boolean;
  selected?: boolean;
  onSelect?: (planId: number) => void;
}

export default function PlanCard({
  plan,
  billingCycle = 'monthly',
  highlighted = false,
  showCta = true,
  selected = false,
  onSelect,
}: PlanCardProps) {
  const route = useRoute();
  const price = billingCycle === 'yearly' ? Number(plan.price_yearly) : Number(plan.price_monthly);
  const cycleLabel = billingCycle === 'yearly' ? '/year' : '/month';

  return (
    <Card
      className={cn(
        'relative flex h-full flex-col transition-shadow',
        highlighted && 'border-primary shadow-lg ring-1 ring-primary/20',
        selected && 'border-primary ring-2 ring-primary/30',
        onSelect && 'cursor-pointer hover:border-primary/60',
      )}
      onClick={onSelect ? () => onSelect(plan.id) : undefined}
    >
      {highlighted && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most popular</Badge>
      )}

      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <div>
          <p className="text-3xl font-bold tracking-tight">
            {formatZmw(price)}
            <span className="text-base font-normal text-muted-foreground">{cycleLabel}</span>
          </p>
          <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
            {plan.trial_days}-day free trial — no card required
          </p>
        </div>

        <ul className="space-y-2 text-sm">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      {showCta && (
        <CardFooter>
          <Button asChild className="w-full" variant={highlighted ? 'default' : 'outline'}>
            <Link href={route('organization.signup', { plan: plan.slug, cycle: billingCycle })}>
              Start {plan.trial_days}-day trial
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
