
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

interface CreatePayrollProps {
  employees: Employee[];
}

export default function CreatePayroll({ employees = [] }: CreatePayrollProps) {
  const route = useRoute();
  const { data, setData, post, processing, errors } = useForm({
    employee_id: '',
    period: '',
    amount: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('hr.payroll.store'));
  };

  return (
    <AppLayout title="Add Payroll Record">
      <Head title="Add Payroll Record" />
      <div className="max-w-xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Add Payroll Record</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="period">Period</Label>
                <Input id="period" type="text" value={data.period} onChange={e => setData('period', e.target.value)} />
                {errors.period && <div className="text-red-500 text-xs mt-1">{errors.period}</div>}
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" value={data.amount} onChange={e => setData('amount', e.target.value)} />
                {errors.amount && <div className="text-red-500 text-xs mt-1">{errors.amount}</div>}
              </div>
              <Button type="submit" disabled={processing}>Save Payroll</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
