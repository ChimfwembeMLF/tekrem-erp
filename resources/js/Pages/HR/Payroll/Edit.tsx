
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

interface Payroll {
  id: number;
  employee_id: string;
  period: string;
  amount: string;
}

interface EditPayrollProps {
  payroll: Payroll;
  employees: Employee[];
}

export default function EditPayroll({ payroll, employees = [] }: EditPayrollProps) {
  const route = useRoute();
  const { data, setData, put, processing, errors } = useForm({
    employee_id: payroll.employee_id || '',
    period: payroll.period || '',
    amount: payroll.amount || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('hr.payroll.update', payroll.id));
  };

  return (
    <AppLayout title="Edit Payroll Record">
      <Head title="Edit Payroll Record" />
      <div className="max-w-xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Edit Payroll Record</CardTitle>
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
              <Button type="submit" disabled={processing}>Update Payroll</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
