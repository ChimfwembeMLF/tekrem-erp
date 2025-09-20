

import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import useRoute from '@/Hooks/useRoute';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';

interface Employee {
  id: number;
  name: string;
}

interface Attendance {
  id: number;
  employee: Employee;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  break_duration: number | null;
  overtime_hours: number | null;
  status: string;
  notes: string | null;
  is_manual_entry: boolean;
}

interface EditAttendanceProps {
  attendance: Attendance;
  employees: Employee[];
}

export default function EditAttendance({ attendance, employees = [] }: EditAttendanceProps) {
  const route = useRoute();
    const { data, setData, put, processing, errors } = useForm({
      employee_id: attendance.employee?.id || '',
      date: attendance.date || '',
      clock_in: attendance.clock_in || '',
      clock_out: attendance.clock_out || '',
      break_start: attendance.break_start || '',
      break_end: attendance.break_end || '',
      break_duration: attendance.break_duration || '',
      overtime_hours: attendance.overtime_hours || '',
      status: attendance.status || '',
      notes: attendance.notes || '',
      location: attendance.location || '',
      is_manual_entry: attendance.is_manual_entry || false,
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('hr.attendance.update', attendance.id));
  };

  return (
    <AppLayout title="Edit Attendance Record">
      <Head title="Edit Attendance Record" />
      <div className="py-6">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Edit Attendance Record</CardTitle>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employee_id">Employee *</Label>
                      <Select value={data.employee_id} onValueChange={(value: string) => setData('employee_id', value)}>
                        <SelectTrigger className={errors.employee_id ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select Employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id.toString()}>{emp.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.employee_id && <p className="text-sm text-red-500">{errors.employee_id}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input id="date" type="date" value={data.date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('date', e.target.value)} className={errors.date ? 'border-red-500' : ''} />
                      {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clock_in">Clock In</Label>
                      <Input id="clock_in" type="time" value={data.clock_in} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('clock_in', e.target.value)} className={errors.clock_in ? 'border-red-500' : ''} />
                      {errors.clock_in && <p className="text-sm text-red-500">{errors.clock_in}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clock_out">Clock Out</Label>
                      <Input id="clock_out" type="time" value={data.clock_out} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('clock_out', e.target.value)} className={errors.clock_out ? 'border-red-500' : ''} />
                      {errors.clock_out && <p className="text-sm text-red-500">{errors.clock_out}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="break_start">Break Start</Label>
                      <Input id="break_start" type="time" value={data.break_start} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('break_start', e.target.value)} className={errors.break_start ? 'border-red-500' : ''} />
                      {errors.break_start && <p className="text-sm text-red-500">{errors.break_start}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="break_end">Break End</Label>
                      <Input id="break_end" type="time" value={data.break_end} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('break_end', e.target.value)} className={errors.break_end ? 'border-red-500' : ''} />
                      {errors.break_end && <p className="text-sm text-red-500">{errors.break_end}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="break_duration">Break Duration (minutes)</Label>
                      <Input id="break_duration" type="number" value={data.break_duration} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('break_duration', e.target.value)} className={errors.break_duration ? 'border-red-500' : ''} />
                      {errors.break_duration && <p className="text-sm text-red-500">{errors.break_duration}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="overtime_hours">Overtime Hours</Label>
                      <Input id="overtime_hours" type="number" value={data.overtime_hours} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('overtime_hours', e.target.value)} className={errors.overtime_hours ? 'border-red-500' : ''} />
                      {errors.overtime_hours && <p className="text-sm text-red-500">{errors.overtime_hours}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" type="text" value={data.location} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('location', e.target.value)} className={errors.location ? 'border-red-500' : ''} />
                    {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select value={data.status} onValueChange={(value: string) => setData('status', value)}>
                      <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                        <SelectItem value="half_day">Half Day</SelectItem>
                        <SelectItem value="on_leave">On Leave</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea id="notes" value={data.notes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('notes', e.target.value)} className={errors.notes ? 'border-red-500' : ''} />
                    {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="is_manual_entry" checked={data.is_manual_entry} onChange={e => setData('is_manual_entry', e.target.checked)} />
                    <Label htmlFor="is_manual_entry">Manual Entry</Label>
                  </div>
                </CardContent>
              </CardHeader>
            </Card>
            <div className="flex justify-end gap-4">
              <Button type="submit" disabled={processing}>
                {processing ? 'Updating...' : 'Update Attendance'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
