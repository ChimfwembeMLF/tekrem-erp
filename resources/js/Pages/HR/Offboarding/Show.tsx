import React from 'react';
import { useForm } from '@inertiajs/react';
import HrPageShell from '@/Components/HR/HrPageShell';
import HrLifecycleChecklist, { ChecklistItem } from '@/Components/HR/HrLifecycleChecklist';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import useRoute from '@/Hooks/useRoute';

interface Props {
  offboarding: {
    id: number;
    status: string;
    last_working_date: string;
    reason?: string;
    checklist: ChecklistItem[];
    exit_interview_date?: string;
    exit_interview_notes?: string;
    satisfaction_rating?: number;
    employee: {
      full_name?: string;
      job_title?: string;
      department?: { name: string };
      user?: { name: string; email: string };
    };
  };
}

export default function OffboardingShow({ offboarding }: Props) {
  const route = useRoute();
  const { data, setData, patch, processing } = useForm({
    exit_interview_date: offboarding.exit_interview_date?.slice(0, 10) ?? '',
    exit_interview_notes: offboarding.exit_interview_notes ?? '',
    satisfaction_rating: offboarding.satisfaction_rating ?? '',
  });

  const name = offboarding.employee?.user?.name ?? offboarding.employee?.full_name ?? 'Employee';

  return (
    <HrPageShell
      title={`Offboarding — ${name}`}
      description={`Last day: ${offboarding.last_working_date}`}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <HrLifecycleChecklist
            items={offboarding.checklist ?? []}
            updateUrl={route('hr.offboarding.checklist', offboarding.id)}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Exit interview</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  patch(route('hr.offboarding.exit-interview', offboarding.id));
                }}
              >
                <div>
                  <Label>Interview date</Label>
                  <Input
                    type="date"
                    value={data.exit_interview_date}
                    onChange={(e) => setData('exit_interview_date', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Satisfaction (1–5)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={data.satisfaction_rating}
                    onChange={(e) => setData('satisfaction_rating', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    rows={4}
                    value={data.exit_interview_notes}
                    onChange={(e) => setData('exit_interview_notes', e.target.value)}
                    placeholder="Feedback, reasons for leaving, suggestions..."
                  />
                </div>
                <Button type="submit" disabled={processing}>Save interview</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Employee</CardTitle>
              <Badge>{offboarding.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Name:</span> {name}</p>
            <p><span className="text-muted-foreground">Role:</span> {offboarding.employee?.job_title}</p>
            <p><span className="text-muted-foreground">Department:</span> {offboarding.employee?.department?.name}</p>
            <p><span className="text-muted-foreground">Email:</span> {offboarding.employee?.user?.email}</p>
            {offboarding.reason && (
              <p><span className="text-muted-foreground">Reason:</span> {offboarding.reason}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </HrPageShell>
  );
}
