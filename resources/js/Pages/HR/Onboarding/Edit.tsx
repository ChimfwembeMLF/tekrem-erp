
import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
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

interface EditOnboardingProps {
  onboarding: {
    id: number;
    title: string;
    status: string;
    employee_id: string;
    start_date: string;
  };
  employees: Employee[];
}

export default function EditOnboarding({ onboarding, employees = [] }: EditOnboardingProps) {
  const route = useRoute();
  const { data, setData, put, processing, errors } = useForm({
    title: onboarding.title || '',
    status: onboarding.status || '',
    employee_id: onboarding.employee_id || '',
    start_date: onboarding.start_date || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('hr.onboarding.update', onboarding.id));
  };

  return (
    <AppLayout title="Edit Onboarding Workflow">
      <Head title="Edit Onboarding Workflow" />
      <div className="max-w-xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Edit Onboarding Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" type="text" value={data.title} onChange={e => setData('title', e.target.value)} />
                {errors.title && <div className="text-red-500 text-xs mt-1">{errors.title}</div>}
              </div>
              <div>
                <Label htmlFor="employee_id">Employee</Label>
                <Select value={data.employee_id} onValueChange={value => setData('employee_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id.toString()}>
                        {emp.name} ({emp.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.employee_id && <div className="text-red-500 text-xs mt-1">{errors.employee_id}</div>}
              </div>
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input id="start_date" type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} />
                {errors.start_date && <div className="text-red-500 text-xs mt-1">{errors.start_date}</div>}
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={data.status} onValueChange={value => setData('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <div className="text-red-500 text-xs mt-1">{errors.status}</div>}
              </div>
              <Button type="submit" disabled={processing}>Update Workflow</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
