import React from 'react';
import { useForm } from '@inertiajs/react';
import HrPageShell from '@/Components/HR/HrPageShell';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import useRoute from '@/Hooks/useRoute';

interface Props {
  departments: { id: number; name: string }[];
}

export default function RecruitmentCreate({ departments }: Props) {
  const route = useRoute();
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    department_id: '',
    location: '',
    employment_type: 'full_time',
    description: '',
    requirements: '',
    responsibilities: '',
    salary_range: '',
    closes_at: '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('hr.recruitment.store'));
  };

  return (
    <HrPageShell title="New job posting" description="Draft a role — publish when ready to appear on the career portal.">
      <form onSubmit={submit} className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Role details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Job title</Label>
              <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} />
              {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Department</Label>
                <Select value={data.department_id} onValueChange={(v) => setData('department_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={data.location} onChange={(e) => setData('location', e.target.value)} placeholder="Lusaka / Remote" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Employment type</Label>
                <Select value={data.employment_type} onValueChange={(v) => setData('employment_type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full time</SelectItem>
                    <SelectItem value="part_time">Part time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="salary">Salary range</Label>
                <Input id="salary" value={data.salary_range} onChange={(e) => setData('salary_range', e.target.value)} placeholder="Competitive" />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={5} value={data.description} onChange={(e) => setData('description', e.target.value)} />
              {errors.description && <p className="mt-1 text-sm text-destructive">{errors.description}</p>}
            </div>
            <div>
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea id="requirements" rows={3} value={data.requirements} onChange={(e) => setData('requirements', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="closes_at">Closes on (optional)</Label>
              <Input id="closes_at" type="date" value={data.closes_at} onChange={(e) => setData('closes_at', e.target.value)} />
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
          <Button type="submit" disabled={processing}>Save draft</Button>
        </div>
      </form>
    </HrPageShell>
  );
}
