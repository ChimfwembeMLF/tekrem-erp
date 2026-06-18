import React from 'react';
import { Link, router } from '@inertiajs/react';
import HrPageShell, { HrStatCard } from '@/Components/HR/HrPageShell';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Plus } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Offboarding {
  id: number;
  status: string;
  last_working_date: string;
  reason?: string;
  employee: { user?: { name: string }; job_title?: string; department?: { name: string } };
}

interface Props {
  offboardings: { data: Offboarding[] };
  stats: { in_progress: number; completed: number; pending_interviews: number };
}

export default function OffboardingIndex({ offboardings, stats }: Props) {
  const route = useRoute();

  return (
    <HrPageShell
      title="Offboarding"
      description="Manage departures, exit interviews, and clearance checklists."
      actions={
        <Button onClick={() => router.get(route('hr.offboarding.create'))}>
          <Plus className="mr-2 h-4 w-4" />
          Start offboarding
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <HrStatCard label="In progress" value={stats.in_progress} />
        <HrStatCard label="Completed" value={stats.completed} />
        <HrStatCard label="Exit interviews due" value={stats.pending_interviews} />
      </div>

      <div className="rounded-xl border border-border divide-y divide-border">
        {offboardings.data.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No offboarding records yet.</p>
        ) : (
          offboardings.data.map((o) => (
            <Link
              key={o.id}
              href={route('hr.offboarding.show', o.id)}
              className="flex items-center justify-between px-4 py-3 hover:bg-muted/40"
            >
              <div>
                <p className="font-medium">{o.employee?.user?.name ?? 'Employee'}</p>
                <p className="text-sm text-muted-foreground">
                  Last day: {o.last_working_date} · {o.employee?.department?.name}
                </p>
              </div>
              <Badge variant={o.status === 'completed' ? 'default' : 'secondary'}>{o.status}</Badge>
            </Link>
          ))
        )}
      </div>
    </HrPageShell>
  );
}
