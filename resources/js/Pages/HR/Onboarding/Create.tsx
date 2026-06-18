import React from 'react';
import { useForm } from '@inertiajs/react';
import HrPageShell from '@/Components/HR/HrPageShell';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import useRoute from '@/Hooks/useRoute';

interface Employee {
  id: number;
  employee_id: string;
  name: string;
  email: string;
}

interface CreateOnboardingProps {
  employees: Employee[];
  workflowTitles: string[];
}

export default function CreateOnboarding({ employees = [], workflowTitles = [] }: CreateOnboardingProps) {
  const route = useRoute();
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    employee_id: '',
    start_date: '',
  });

  return (
    <HrPageShell title="Start onboarding" description="A checklist will be created automatically for the new hire.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          post(route('hr.onboarding.store'));
        }}
        className="mx-auto max-w-lg space-y-4"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New hire</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="employee_id">Employee</Label>
              <Select value={data.employee_id} onValueChange={(v) => setData('employee_id', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.name} ({emp.employee_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.employee_id && <p className="mt-1 text-sm text-destructive">{errors.employee_id}</p>}
            </div>
            <div>
              <Label htmlFor="title">Workflow title</Label>
              <Select value={data.title} onValueChange={(v) => setData('title', v === '__default__' ? '' : v)}>
                <SelectTrigger id="title">
                  <SelectValue placeholder="Select workflow" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__default__">Default (employee name)</SelectItem>
                  {workflowTitles.map((title) => (
                    <SelectItem key={title} value={title}>
                      {title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title}</p>}
            </div>
            <div>
              <Label htmlFor="start_date">Start date</Label>
              <Input id="start_date" type="date" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} />
              {errors.start_date && <p className="mt-1 text-sm text-destructive">{errors.start_date}</p>}
            </div>
          </CardContent>
        </Card>
        <Button type="submit" disabled={processing}>Start onboarding</Button>
      </form>
    </HrPageShell>
  );
}
