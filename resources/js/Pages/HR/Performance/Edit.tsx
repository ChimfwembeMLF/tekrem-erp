import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import useRoute from '@/Hooks/useRoute';
import { Input } from '@/Components/ui/input.jsx';
import { Label } from '@/Components/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select.jsx';
import { Checkbox } from '@/Components/ui/checkbox.jsx';

interface Employee {
  id: number;
  name: string;
}

interface Reviewer {
  id: number;
  name: string;
}

interface Performance {
  id: number;
  employee: Employee;
  reviewer: Reviewer;
  review_period: string;
  review_start_date: string;
  review_end_date: string;
  due_date: string;
  is_self_review: boolean;
}

interface EditPerformanceProps {
  performance: Performance;
  employees: Employee[];
  reviewers: Reviewer[];
}

export default function EditPerformance({ performance, employees = [], reviewers = [] }: EditPerformanceProps) {
  const route = useRoute();
  const { data, setData, put, processing, errors } = useForm({
    employee_id: performance.employee?.id || '',
    reviewer_id: performance.reviewer?.id || '',
    review_period: performance.review_period || '',
    review_start_date: performance.review_start_date || '',
    review_end_date: performance.review_end_date || '',
    due_date: performance.due_date || '',
    is_self_review: performance.is_self_review || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('hr.performance.update', performance.id));
  };

  return (
    <AppLayout title="Edit Performance Review">
      <Head title="Edit Performance Review" />
      <div className="py-6">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Edit Performance Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employee_id">Employee *</Label>
                  <Select value={data.employee_id} onValueChange={(value: string) => setData('employee_id', value)}>
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
                  <Label htmlFor="reviewer_id">Reviewer *</Label>
                  <Select value={data.reviewer_id} onValueChange={(value: string) => setData('reviewer_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Reviewer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select Reviewer</SelectItem>
                      {reviewers.map((rev) => (
                        <SelectItem key={rev.id} value={rev.id.toString()}>{rev.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.reviewer_id && <p className="text-sm text-red-500">{errors.reviewer_id}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="review_period">Review Period *</Label>
                  <Input
                    id="review_period"
                    type="text"
                    value={data.review_period}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('review_period', e.target.value)}
                    className={errors.review_period ? 'border-red-500' : ''}
                    placeholder="e.g. Q1 2025"
                  />
                  {errors.review_period && <p className="text-sm text-red-500">{errors.review_period}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="review_start_date">Review Start Date *</Label>
                  <Input
                    id="review_start_date"
                    type="date"
                    value={data.review_start_date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('review_start_date', e.target.value)}
                    className={errors.review_start_date ? 'border-red-500' : ''}
                  />
                  {errors.review_start_date && <p className="text-sm text-red-500">{errors.review_start_date}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="review_end_date">Review End Date *</Label>
                  <Input
                    id="review_end_date"
                    type="date"
                    value={data.review_end_date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('review_end_date', e.target.value)}
                    className={errors.review_end_date ? 'border-red-500' : ''}
                  />
                  {errors.review_end_date && <p className="text-sm text-red-500">{errors.review_end_date}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date *</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={data.due_date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('due_date', e.target.value)}
                    className={errors.due_date ? 'border-red-500' : ''}
                  />
                  {errors.due_date && <p className="text-sm text-red-500">{errors.due_date}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="is_self_review" checked={data.is_self_review} onCheckedChange={(checked: boolean | string) => setData('is_self_review', !!checked)} />
                  <Label htmlFor="is_self_review" className="font-medium">Self Review</Label>
                </div>
                <Button type="submit" disabled={processing}>Update Review</Button>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
