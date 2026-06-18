import React, { FormEvent, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import GuestPageHero from '@/Components/Website/GuestPageHero';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface Props {
  projectTypes: Record<string, string>;
  projectCategories: Record<string, string>;
  budgetRanges: Record<string, string>;
  timelines: Record<string, string>;
  priorities: Record<string, string>;
}

export default function Create({ projectTypes, budgetRanges, timelines, priorities }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState('');

  const { data, setData, processing, errors, reset } = useForm({
    name: '',
    email: '',
    phone: '',
    company: '',
    project_type: '',
    project_title: '',
    project_description: '',
    budget_range: '',
    timeline: '',
    priority: 'normal',
    source: 'website',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/guest/project', data);
      setReference(response.data.reference_number ?? '');
      setSubmitted(true);
      reset();
      toast.success('Project inquiry submitted.');
    } catch {
      toast.error('Failed to submit. Please check the form and try again.');
    }
  };

  return (
    <GuestLayout title="Project Consultation">
      <Head title="Project Consultation" />
      <GuestPageHero
        title="Project consultation"
        description="Tell us about your project and we'll follow up with a tailored proposal."
        icon={<Briefcase className="h-6 w-6" />}
      />

      <div className="mx-auto max-w-2xl px-4 py-12">
        {submitted ? (
          <Card>
            <CardHeader>
              <CardTitle>Submitted successfully</CardTitle>
              <CardDescription>
                Reference: <strong>{reference}</strong>
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Project details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name" error={errors.name}>
                    <Input value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                  </Field>
                  <Field label="Email" error={errors.email}>
                    <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Phone" error={errors.phone}>
                    <Input value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                  </Field>
                  <Field label="Company" error={errors.company}>
                    <Input value={data.company} onChange={(e) => setData('company', e.target.value)} />
                  </Field>
                </div>
                <Field label="Project type" error={errors.project_type}>
                  <Select value={data.project_type} onValueChange={(v) => setData('project_type', v)}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(projectTypes).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Project title" error={errors.project_title}>
                  <Input value={data.project_title} onChange={(e) => setData('project_title', e.target.value)} required />
                </Field>
                <Field label="Description" error={errors.project_description}>
                  <Textarea rows={5} value={data.project_description} onChange={(e) => setData('project_description', e.target.value)} required />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Budget (ZMW)" error={errors.budget_range}>
                    <Select value={data.budget_range} onValueChange={(v) => setData('budget_range', v)}>
                      <SelectTrigger><SelectValue placeholder="Select range" /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(budgetRanges).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Timeline" error={errors.timeline}>
                    <Select value={data.timeline} onValueChange={(v) => setData('timeline', v)}>
                      <SelectTrigger><SelectValue placeholder="Select timeline" /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(timelines).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Button type="submit" disabled={processing} className="w-full">
                  {processing ? 'Submitting...' : 'Submit consultation request'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </GuestLayout>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
