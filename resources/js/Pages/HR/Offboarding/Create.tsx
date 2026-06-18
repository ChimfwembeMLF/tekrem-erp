import React from 'react';
import { useForm } from '@inertiajs/react';
import HrPageShell from '@/Components/HR/HrPageShell';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import useRoute from '@/Hooks/useRoute';

interface Props {
  employees: { id: number; name: string; job_title?: string }[];
}

export default function OffboardingCreate({ employees }: Props) {
  const route = useRoute();
  const { data, setData, post, processing } = useForm({
    employee_id: '',
    last_working_date: '',
    reason: '',
  });

  return (
    <HrPageShell title="Start offboarding" description="Begin the exit process including exit interview and clearance.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          post(route('hr.offboarding.store'));
        }}
        className="mx-auto max-w-lg space-y-4"
      >
        <Card>
          <CardHeader><CardTitle className="text-base">Departure details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Employee</Label>
              <Select value={data.employee_id} onValueChange={(v) => setData('employee_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={String(e.id)}>{e.name} — {e.job_title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Last working date</Label>
              <Input type="date" value={data.last_working_date} onChange={(e) => setData('last_working_date', e.target.value)} />
            </div>
            <div>
              <Label>Reason (optional)</Label>
              <Input value={data.reason} onChange={(e) => setData('reason', e.target.value)} placeholder="Resignation, retirement, etc." />
            </div>
          </CardContent>
        </Card>
        <Button type="submit" disabled={processing}>Start offboarding</Button>
      </form>
    </HrPageShell>
  );
}
