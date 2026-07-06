import React, { FormEvent, useState } from 'react';
import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import GuestPageHero from '@/Components/Website/GuestPageHero';
import GuestFlowShell from '@/Components/Website/GuestFlowShell';
import GuestSuccessScreen from '@/Components/Website/GuestSuccessScreen';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import useRoute from '@/Hooks/useRoute';
import axios from 'axios';

interface Props {
  projectTypes: Record<string, string>;
  projectCategories: Record<string, string>;
  budgetRanges: Record<string, string>;
  timelines: Record<string, string>;
  priorities: Record<string, string>;
}

const STEPS = ['Share your brief', 'Consultant review', 'Receive a proposal'];

export default function Create({ projectTypes, budgetRanges, timelines }: Props) {
  const route = useRoute();
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState('');
  const [processing, setProcessing] = useState(false);

  const [form, setForm] = useState({
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
    setProcessing(true);
    try {
      const response = await axios.post(route('guest.project.store'), form);
      setReference(response.data.reference_number ?? '');
      setSubmitted(true);
      toast.success('Project inquiry submitted.');
    } catch {
      toast.error('Failed to submit. Please check the form and try again.');
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setReference('');
    setForm({
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
  };

  return (
    <GuestLayout title="Project Consultation">
      <Head title="Project Consultation" />
      <GuestPageHero
        title="Project consultation"
        description="Tell us about your project and we'll follow up with a tailored proposal."
        icon={<Briefcase className="h-6 w-6" />}
        flowType="project"
      />

      <GuestFlowShell
        flowType="project"
        steps={STEPS}
        currentStep={submitted ? 2 : 0}
        title="Consultation process"
        description="From first brief to a scoped proposal — clear steps, no surprises."
      >
        {submitted ? (
          <GuestSuccessScreen
            title="Consultation request submitted"
            description="A consultant will review your brief and contact you shortly."
            reference={reference || undefined}
            nextSteps={[
              { title: 'Brief review', description: 'We assess scope, timeline, and fit.' },
              { title: 'Discovery call', description: 'We may reach out to clarify requirements.' },
              { title: 'Proposal delivery', description: 'You will receive a tailored project proposal.' },
            ]}
            primaryAction={{ label: 'Check status', href: route('guest.project.status-form') }}
            onReset={resetForm}
          />
        ) : (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Project details</CardTitle>
              <CardDescription>The more detail you share, the better we can scope your project.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name">
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </Field>
                  <Field label="Email">
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Phone">
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </Field>
                  <Field label="Company">
                    <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                  </Field>
                </div>
                <Field label="Project type">
                  <Select value={form.project_type} onValueChange={(v) => setForm({ ...form, project_type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(projectTypes).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Project title">
                  <Input
                    value={form.project_title}
                    onChange={(e) => setForm({ ...form, project_title: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Description">
                  <Textarea
                    rows={5}
                    value={form.project_description}
                    onChange={(e) => setForm({ ...form, project_description: e.target.value })}
                    required
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Budget (ZMW)">
                    <Select value={form.budget_range} onValueChange={(v) => setForm({ ...form, budget_range: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(budgetRanges).map(([k, v]) => (
                          <SelectItem key={k} value={k}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Timeline">
                    <Select value={form.timeline} onValueChange={(v) => setForm({ ...form, timeline: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeline" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(timelines).map(([k, v]) => (
                          <SelectItem key={k} value={k}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Button type="submit" disabled={processing} className="w-full bg-gradient-to-r from-secondary to-primary">
                  {processing ? 'Submitting…' : 'Submit consultation request'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </GuestFlowShell>
    </GuestLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
