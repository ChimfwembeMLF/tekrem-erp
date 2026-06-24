import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { AlertCircle, ArrowRight, Calendar, DollarSign, TrendingUp, UserPlus } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

export interface PeopleActionQueueData {
  pending_leaves: number;
  overdue_reviews: number;
  pending_payroll: number;
  onboarding_due: number;
  on_leave_today?: number;
  total: number;
}

export default function PeopleActionQueue({ queue }: { queue: PeopleActionQueueData }) {
  const route = useRoute();

  if (!queue || queue.total <= 0) {
    return null;
  }

  const items = [
    {
      label: 'Leave requests',
      count: queue.pending_leaves,
      href: route('hr.leave.index', { status: 'pending' }),
      icon: Calendar,
    },
    {
      label: 'Payroll pending',
      count: queue.pending_payroll,
      href: route('hr.payroll.index', { status: 'pending' }),
      icon: DollarSign,
    },
    {
      label: 'Overdue reviews',
      count: queue.overdue_reviews,
      href: route('hr.performance.index'),
      icon: TrendingUp,
    },
    {
      label: 'Onboarding',
      count: queue.onboarding_due,
      href: route('hr.onboarding.index'),
      icon: UserPlus,
    },
  ].filter((item) => item.count > 0);

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          People — needs attention ({queue.total})
        </CardTitle>
        <CardDescription>HR items waiting for review or approval</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-lg border border-border/60 bg-card px-3 py-2"
            >
              <div className="flex items-center gap-2 text-sm">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span>{item.label}</span>
                <span className="font-semibold text-foreground">{item.count}</span>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={item.href}>
                  Review
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          );
        })}
        <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
          <Link href={route('hr.dashboard')}>Open People dashboard</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
