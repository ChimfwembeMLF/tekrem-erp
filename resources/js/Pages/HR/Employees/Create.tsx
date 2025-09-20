import React, { useEffect, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { showFormErrors } from './useSonnerError';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import useRoute from '@/Hooks/useRoute';


interface User { id: number; name: string; email: string; }
interface Department { id: number; name: string; }
interface CreateEmployeeProps { departments: Department[]; users: User[]; }

export default function CreateEmployee({ departments = [], users = [] }: CreateEmployeeProps) {
  const route = useRoute();
  const { data, setData, post, processing, errors } = useForm({
    user_id: '',
    name: '',
    email: '',
    employee_id: '',
    job_title: '',
    department_id: '',
    employment_type: '',
    employment_status: '',
    hire_date: '',
    pay_frequency: '',
    notes: '',
  });

  const prevErrors = useRef(errors);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('hr.employees.store'), {
      onError: (errs) => {
        showFormErrors(errs);
      },
    });
  };

  // Show errors if they exist on first render (e.g., after redirect)
  useEffect(() => {
    if (errors && Object.keys(errors).length > 0 && prevErrors.current !== errors) {
      showFormErrors(errors);
      prevErrors.current = errors;
    }
  }, [errors]);

  return (
    <AppLayout title="Add Employee">
      <Head title="Add Employee" />
      <div className="py-6">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Employee</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user_id">User *</Label>
                    <Select value={data.user_id} onValueChange={(value: string) => setData('user_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select User" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>{user.name} ({user.email})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.user_id && <p className="text-sm text-red-500">{errors.user_id}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pay_frequency">Pay Frequency *</Label>
                    <Select value={data.pay_frequency} onValueChange={(value: string) => setData('pay_frequency', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Pay Frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="bi_weekly">Bi-Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.pay_frequency && <p className="text-sm text-red-500">{errors.pay_frequency}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee_id">Employee ID *</Label>
                    <Input id="employee_id" value={data.employee_id} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('employee_id', e.target.value)} />
                    {errors.employee_id && <p className="text-sm text-red-500">{errors.employee_id}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job_title">Job Title *</Label>
                    <Input id="job_title" value={data.job_title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('job_title', e.target.value)} />
                    {errors.job_title && <p className="text-sm text-red-500">{errors.job_title}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department_id">Department</Label>
                    <Select value={data.department_id} onValueChange={(value: string) => setData('department_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employment_type">Employment Type</Label>
                    <Select value={data.employment_type} onValueChange={(value: string) => setData('employment_type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">Full Time</SelectItem>
                        <SelectItem value="part_time">Part Time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="intern">Intern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employment_status">Employment Status</Label>
                    <Select value={data.employment_status} onValueChange={(value: string) => setData('employment_status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="terminated">Terminated</SelectItem>
                        <SelectItem value="on_leave">On Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hire_date">Hire Date</Label>
                    <Input id="hire_date" type="date" value={data.hire_date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('hire_date', e.target.value)} />
                    {errors.hire_date && <p className="text-sm text-red-500">{errors.hire_date}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" value={data.notes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('notes', e.target.value)} />
                  {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end gap-4">
              <Button type="submit" disabled={processing}>
                {processing ? 'Saving...' : 'Save Employee'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
