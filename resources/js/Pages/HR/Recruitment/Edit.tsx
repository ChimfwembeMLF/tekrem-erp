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
  posting: Record<string, unknown>;
  departments: { id: number; name: string }[];
}

export default function RecruitmentEdit({ posting, departments }: Props) {
  const route = useRoute();
  const p = posting as {
    id: number;
    title: string;
    department_id?: number;
    location?: string;
    employment_type: string;
    description: string;
    requirements?: string;
    responsibilities?: string;
    salary_range?: string;
    closes_at?: string;
  };

  const { data, setData, put, processing } = useForm({
    title: p.title,
    department_id: p.department_id ? String(p.department_id) : '',
    location: p.location ?? '',
    employment_type: p.employment_type,
    description: p.description,
    requirements: p.requirements ?? '',
    responsibilities: p.responsibilities ?? '',
    salary_range: p.salary_range ?? '',
    closes_at: p.closes_at?.slice(0, 10) ?? '',
  });

  return (
    <HrPageShell title="Edit job posting">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          put(route('hr.recruitment.update', p.id));
        }}
        className="mx-auto max-w-2xl space-y-4"
      >
        <Card>
          <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={data.title} onChange={(e) => setData('title', e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={5} value={data.description} onChange={(e) => setData('description', e.target.value)} />
            </div>
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
          </CardContent>
        </Card>
        <Button type="submit" disabled={processing}>Save changes</Button>
      </form>
    </HrPageShell>
  );
}
