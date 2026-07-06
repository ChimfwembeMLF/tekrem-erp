import React, { FormEvent, useState } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { DollarSign, Plus, Send, X } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import GuestPageHero from '@/Components/Website/GuestPageHero';
import GuestFlowShell from '@/Components/Website/GuestFlowShell';
import GuestSuccessScreen from '@/Components/Website/GuestSuccessScreen';
import { toast } from 'sonner';
import useRoute from '@/Hooks/useRoute';
import axios from 'axios';

interface Service {
  id: string;
  title: string;
  short_description: string;
  icon: string;
  price: string;
  price_note: string | null;
}

interface Props {
  services: Service[];
  selectedService?: string | null;
  timelines: Record<string, string>;
  priorities: Record<string, string>;
}

const STEPS = ['Describe your project', 'We scope & price it', 'Receive your quote'];

export default function Create({ services, selectedService, timelines, priorities }: Props) {
  const route = useRoute();
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [requirements, setRequirements] = useState<string[]>(['']);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    service_type: selectedService ?? '',
    project_description: '',
    timeline: '',
    priority: 'normal',
    source: 'website',
    utm_source: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('utm_source') || '' : '',
    utm_medium: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('utm_medium') || '' : '',
    utm_campaign: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('utm_campaign') || '' : '',
  });

  const addRequirement = () => setRequirements([...requirements, '']);
  const updateRequirement = (i: number, value: string) => {
    const updated = [...requirements];
    updated[i] = value;
    setRequirements(updated);
  };
  const removeRequirement = (i: number) => {
    const updated = requirements.filter((_, idx) => idx !== i);
    setRequirements(updated.length ? updated : ['']);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    try {
      const response = await axios.post(route('guest.quote.store'), {
        ...form,
        requirements: requirements.filter((r) => r.trim() !== ''),
      });
      setReference(response.data.reference_number ?? '');
      setSubmitted(true);
      toast.success('Quote request submitted');
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.errors) {
        const fieldErrors: Record<string, string> = {};
        Object.entries(error.response.data.errors).forEach(([key, messages]) => {
          fieldErrors[key] = Array.isArray(messages) ? messages[0] : String(messages);
        });
        setErrors(fieldErrors);
      }
      toast.error('Failed to submit quote request');
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setReference('');
    setRequirements(['']);
    setForm((prev) => ({
      ...prev,
      name: '',
      email: '',
      phone: '',
      company: '',
      project_description: '',
      service_type: selectedService ?? '',
    }));
  };

  return (
    <GuestLayout title="Request Quote">
      <Head title="Request Quote" />
      <GuestPageHero
        title="Request a quote"
        description="Tell us what you need — we'll price it properly and respond with a clear proposal."
        icon={<DollarSign className="h-6 w-6" />}
        flowType="quote"
      />

      <GuestFlowShell
        flowType="quote"
        steps={STEPS}
        currentStep={submitted ? 2 : 0}
        title="Quote process"
        description="Accurate details help us prepare a better estimate."
      >
        {submitted ? (
          <GuestSuccessScreen
            title="Quote request received"
            description="We're reviewing your requirements and will send a detailed quote soon."
            reference={reference || undefined}
            referenceLabel="Reference number"
            nextSteps={[
              { title: 'Scope review', description: 'Our team reviews your project description and requirements.' },
              { title: 'Quote preparation', description: 'We prepare pricing tailored to your scope and timeline.' },
              { title: 'Email delivery', description: 'You will receive the full proposal in your inbox.' },
            ]}
            primaryAction={{ label: 'Check quote status', href: route('guest.quote.status-form') }}
            onReset={resetForm}
            resetLabel="Submit another request"
          />
        ) : (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Quote request</CardTitle>
              <CardDescription>Fill in details accurately for a better estimate.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Full name" error={errors.name}>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </Field>
                  <Field label="Email" error={errors.email}>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Phone (optional)" error={errors.phone}>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </Field>
                  <Field label="Company (optional)" error={errors.company}>
                    <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Service" error={errors.service_type}>
                    <Select value={form.service_type} onValueChange={(v) => setForm({ ...form, service_type: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.icon} {service.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Priority" error={errors.priority}>
                    <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(priorities).map(([k, v]) => (
                          <SelectItem key={k} value={k}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <Field label="Timeline" error={errors.timeline}>
                  <Select value={form.timeline} onValueChange={(v) => setForm({ ...form, timeline: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="When do you need this?" />
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

                <Field label="Project description" error={errors.project_description}>
                  <Textarea
                    rows={5}
                    value={form.project_description}
                    onChange={(e) => setForm({ ...form, project_description: e.target.value })}
                    required
                    placeholder="Describe goals, scope, and any constraints…"
                  />
                </Field>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label>Requirements (optional)</Label>
                    <Button type="button" size="sm" variant="outline" onClick={addRequirement}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {requirements.map((r, i) => (
                    <div key={i} className="mb-2 flex gap-2">
                      <Input value={r} onChange={(e) => updateRequirement(i, e.target.value)} placeholder="Requirement" />
                      <Button type="button" variant="outline" size="icon" onClick={() => removeRequirement(i)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={processing} className="bg-gradient-to-r from-secondary to-primary">
                    {processing ? (
                      'Submitting…'
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit quote request
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </GuestFlowShell>
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
