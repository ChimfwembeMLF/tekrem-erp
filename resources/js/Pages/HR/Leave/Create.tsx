import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input.jsx';
import { Label } from '@/Components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select.jsx';
import { Textarea } from '@/Components/ui/textarea.jsx';
import { Checkbox } from '@/Components/ui/checkbox.jsx';
import { toast } from 'sonner';
import useRoute from '@/Hooks/useRoute';

interface LeaveType {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  name: string;
}

interface CreateLeaveProps {
  leaveTypes: LeaveType[];
  employees: Employee[];
}

export default function CreateLeave({ leaveTypes = [], employees = [] }: CreateLeaveProps) {
  const route = useRoute();
  const { data, setData, post, processing, errors, reset } = useForm({
    employee_id: '',
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: '',
    is_half_day: false,
    half_day_period: '',
    attachments: [],
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setData('attachments', Array.from(e.target.files));
    }
  };

  React.useEffect(() => {
    if (Object.keys(errors).length > 0) {
      Object.values(errors).forEach((err) => {
        if (err) toast.error(err as string);
      });
    }
  }, [errors]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('hr.leave.store'), {
      onSuccess: () => {
        toast.success('Leave request submitted successfully');
        reset();
      },
      onError: () => {
        toast.error('Please fix the errors in the form.');
      },
    });
  };

  return (
    <AppLayout title="Request Leave">
      <Head title="Request Leave" />
      <div className="py-6">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Request Leave</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employee_id">Employee *</Label>
                  <Select value={data.employee_id} onValueChange={value => setData('employee_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Employee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select Employee</SelectItem>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>{emp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.employee_id && <p className="text-sm text-red-500">{errors.employee_id}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leave_type_id">Leave Type *</Label>
                  <Select value={data.leave_type_id} onValueChange={value => setData('leave_type_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Leave Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select Leave Type</SelectItem>
                      {leaveTypes.map((lt) => (
                        <SelectItem key={lt.id} value={lt.id.toString()}>{lt.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.leave_type_id && <p className="text-sm text-red-500">{errors.leave_type_id}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={data.start_date}
                    onChange={e => setData('start_date', e.target.value)}
                    className={errors.start_date ? 'border-red-500' : ''}
                  />
                  {errors.start_date && <p className="text-sm text-red-500">{errors.start_date}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={data.end_date}
                    onChange={e => setData('end_date', e.target.value)}
                    className={errors.end_date ? 'border-red-500' : ''}
                  />
                  {errors.end_date && <p className="text-sm text-red-500">{errors.end_date}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason *</Label>
                  <Textarea
                    id="reason"
                    value={data.reason}
                    onChange={e => setData('reason', e.target.value)}
                    className={errors.reason ? 'border-red-500' : ''}
                    placeholder="Enter reason for leave"
                  />
                  {errors.reason && <p className="text-sm text-red-500">{errors.reason}</p>}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id="is_half_day" checked={data.is_half_day} onCheckedChange={checked => setData('is_half_day', !!checked)} />
                    <Label htmlFor="is_half_day">Half Day?</Label>
                  </div>
                  {data.is_half_day && (
                    <div>
                      <Label htmlFor="half_day_period">Half Day Period *</Label>
                      <Select value={data.half_day_period} onValueChange={value => setData('half_day_period', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="PM">PM</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.half_day_period && <p className="text-sm text-red-500">{errors.half_day_period}</p>}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attachments">Attachments</Label>
                  <Input id="attachments" type="file" multiple onChange={handleFileChange} />
                  {errors.attachments && <p className="text-sm text-red-500">{errors.attachments}</p>}
                </div>
                <Button type="submit" disabled={processing}>Submit Request</Button>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
