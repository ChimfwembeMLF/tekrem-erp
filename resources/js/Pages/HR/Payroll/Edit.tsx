

import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import useRoute from '@/Hooks/useRoute';
import MediaPicker from '@/Components/CMS/MediaPicker';

// Dummy data for components (replace with actual props or API call)
const payrollComponents = [
  { id: 1, name: 'Housing Allowance', type: 'allowance' },
  { id: 2, name: 'Transport Allowance', type: 'allowance' },
  { id: 3, name: 'PAYE', type: 'tax' },
  { id: 4, name: 'NAPSA', type: 'deduction' },
];

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
  status?: string;
  payslip_file_path?: string;
  components?: { payroll_component_id: string; amount: string }[];
}

interface EditPayrollProps {
  payroll: Payroll;
  employees: Employee[];
}

export default function EditPayroll({ payroll, employees = [] }: EditPayrollProps) {
  const route = useRoute();
  const [components, setComponents] = useState(
    payroll.components && payroll.components.length > 0
      ? payroll.components
      : [{ payroll_component_id: '', amount: '' }]
  );
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const { data, setData, put, processing, errors } = useForm({
    employee_id: payroll.employee_id || '',
    period: payroll.period || '',
    amount: payroll.amount || '',
    status: payroll.status || 'pending',
    payslip_file_path: payroll.payslip_file_path || '',
    components: payroll.components || [],
  });

  const handleComponentChange = (idx: number, field: string, value: string) => {
    const updated = [...components];
    updated[idx][field] = value;
    setComponents(updated);
    setData('components', updated);
  };

  const addComponent = () => {
    setComponents([...components, { payroll_component_id: '', amount: '' }]);
  };

  const removeComponent = (idx: number) => {
    const updated = components.filter((_, i) => i !== idx);
    setComponents(updated);
    setData('components', updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('hr.payroll.update', payroll.id));
  };

  return (
    <AppLayout title="Edit Payroll Record">
      <Head title="Edit Payroll Record" />
      <div className="w-full mx-auto py-8">
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
                <Input
                  id="period"
                  type="month"
                  value={data.period}
                  onChange={e => setData('period', e.target.value)}
                />
                {errors.period && <div className="text-red-500 text-xs mt-1">{errors.period}</div>}
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={data.amount}
                  onChange={e => setData('amount', e.target.value)}
                />
                {errors.amount && <div className="text-red-500 text-xs mt-1">{errors.amount}</div>}
              </div>
              <div>
                <Label>Status</Label>
                <Select value={data.status} onValueChange={value => setData('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Payslip File</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="payslip_file_path"
                    type="text"
                    value={data.payslip_file_path}
                    onChange={e => setData('payslip_file_path', e.target.value)}
                    placeholder="Select or paste file path"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={() => setShowMediaPicker(true)}>
                    Pick File
                  </Button>
                </div>
                <MediaPicker
                  isOpen={showMediaPicker}
                  onSelect={media => {
                    setData('payslip_file_path', media.url);
                    setShowMediaPicker(false);
                  }}
                  onClose={() => setShowMediaPicker(false)}
                  type="document"
                />
              </div>
              <div>
                <Label>Payroll Components</Label>
                {components.map((comp, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <Select
                      value={comp.payroll_component_id}
                      onValueChange={value => handleComponentChange(idx, 'payroll_component_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Component" />
                      </SelectTrigger>
                      <SelectContent>
                        {payrollComponents.map(pc => (
                          <SelectItem key={pc.id} value={pc.id.toString()}>
                            {pc.name} ({pc.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={comp.amount}
                      onChange={e => handleComponentChange(idx, 'amount', e.target.value)}
                    />
                    <Button type="button" variant="destructive" onClick={() => removeComponent(idx)}>-</Button>
                  </div>
                ))}
                <Button type="button" onClick={addComponent} variant="secondary">Add Component</Button>
              </div>
              <Button type="submit" disabled={processing}>Update Payroll</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
