import React from 'react';
import { Link, router } from '@inertiajs/react';
import HrPageShell, { HrStatCard } from '@/Components/HR/HrPageShell';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import { Plus, UserPlus } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Onboarding {
  id: number;
  title?: string;
  status: string;
  start_date: string;
  employee_name: string;
  progress: number;
}

interface Props {
  onboardings: Onboarding[];
  stats: { in_progress: number; completed: number };
}

export default function OnboardingIndex({ onboardings, stats }: Props) {
  const route = useRoute();

  return (
    <HrPageShell
      title="Onboarding"
      description="Track new hire orientation from offer acceptance through first-day readiness."
      actions={
        <Button onClick={() => router.get(route('hr.onboarding.create'))}>
          <Plus className="mr-2 h-4 w-4" />
          Start onboarding
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <HrStatCard label="In progress" value={stats.in_progress} />
        <HrStatCard label="Completed" value={stats.completed} />
      </div>

      <div className="space-y-3">
        {onboardings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-12 text-center">
            <UserPlus className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No onboarding workflows yet.</p>
          </div>
        ) : (
          onboardings.map((o) => (
            <Link
              key={o.id}
              href={route('hr.onboarding.show', o.id)}
              className="block rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-foreground">{o.title ?? `Onboarding — ${o.employee_name}`}</p>
                  <p className="text-sm text-muted-foreground">
                    {o.employee_name} · Starts {o.start_date}
                  </p>
                </div>
                <div className="flex items-center gap-4 sm:min-w-[200px]">
                  <div className="flex-1">
                    <Progress value={o.progress} className="h-2" />
                    <p className="mt-1 text-xs text-muted-foreground">{o.progress}% complete</p>
                  </div>
                  <Badge variant={o.status === 'completed' ? 'default' : 'secondary'}>{o.status}</Badge>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </HrPageShell>
  );
}
