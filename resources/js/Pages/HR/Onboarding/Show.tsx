import React from 'react';
import HrPageShell from '@/Components/HR/HrPageShell';
import HrLifecycleChecklist, { ChecklistItem } from '@/Components/HR/HrLifecycleChecklist';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import useRoute from '@/Hooks/useRoute';

interface Props {
  onboarding: {
    id: number;
    title?: string;
    status: string;
    start_date: string;
    checklist: ChecklistItem[];
    employee: {
      id: number;
      full_name?: string;
      job_title?: string;
      department?: { name: string };
      user?: { name: string; email: string };
    };
  };
}

export default function OnboardingShow({ onboarding }: Props) {
  const route = useRoute();
  const name = onboarding.employee?.user?.name ?? onboarding.employee?.full_name ?? 'Employee';

  return (
    <HrPageShell
      title={onboarding.title ?? `Onboarding — ${name}`}
      description={`Start date: ${onboarding.start_date}`}
      actions={
        <Link href={route('hr.employees.show', onboarding.employee.id)}>
          <Button variant="outline">View employee profile</Button>
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <HrLifecycleChecklist
          items={onboarding.checklist ?? []}
          updateUrl={route('hr.onboarding.checklist', onboarding.id)}
        />

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">New hire</CardTitle>
              <Badge>{onboarding.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Name:</span> {name}</p>
            <p><span className="text-muted-foreground">Role:</span> {onboarding.employee?.job_title}</p>
            <p><span className="text-muted-foreground">Department:</span> {onboarding.employee?.department?.name}</p>
            <p><span className="text-muted-foreground">Email:</span> {onboarding.employee?.user?.email}</p>
          </CardContent>
        </Card>
      </div>
    </HrPageShell>
  );
}
