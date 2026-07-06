import React, { FormEvent, useState } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { MessageSquare, Send } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import GuestPageHero from '@/Components/Website/GuestPageHero';
import GuestFlowShell from '@/Components/Website/GuestFlowShell';
import GuestSuccessScreen from '@/Components/Website/GuestSuccessScreen';
import { toast } from 'sonner';
import useRoute from '@/Hooks/useRoute';
import axios from 'axios';

interface Props {
  inquiryTypes: Record<string, string>;
  urgencyLevels: Record<string, string>;
  contactMethods: Record<string, string>;
}

const STEPS = ['Share your details', 'We review your message', 'Get a response by email'];

export default function Create({ inquiryTypes, urgencyLevels, contactMethods }: Props) {
  const route = useRoute();
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getQuery = (key: string) =>
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get(key) || '' : '';

  const [form, setForm] = useState({
    type: 'general',
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    subject: '',
    message: '',
    preferred_contact_method: 'email',
    urgency: 'normal',
    source: 'website',
    utm_source: getQuery('utm_source'),
    utm_medium: getQuery('utm_medium'),
    utm_campaign: getQuery('utm_campaign'),
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    try {
      const response = await axios.post(route('guest.inquiry.store'), form);
      setReference(response.data.reference_number ?? '');
      setSubmitted(true);
      toast.success('Inquiry submitted successfully!');
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.errors) {
        const fieldErrors: Record<string, string> = {};
        Object.entries(error.response.data.errors).forEach(([key, messages]) => {
          fieldErrors[key] = Array.isArray(messages) ? messages[0] : String(messages);
        });
        setErrors(fieldErrors);
      }
      toast.error('Failed to submit inquiry. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setReference('');
    setForm((prev) => ({
      ...prev,
      name: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      subject: '',
      message: '',
    }));
  };

  return (
    <GuestLayout title="Contact Us">
      <Head title="Contact Us" />
      <GuestPageHero
        title="Get in touch"
        description="Tell us what you need — we respond quickly and clearly."
        icon={<MessageSquare className="h-6 w-6" />}
        flowType="inquiry"
      />

      <GuestFlowShell
        flowType="inquiry"
        steps={STEPS}
        currentStep={submitted ? 2 : 0}
        title="How inquiries work"
        description="Submit once, track anytime with your reference number."
      >
        {submitted ? (
          <GuestSuccessScreen
            title="Inquiry submitted"
            description="Thank you for reaching out. Our team will review your message shortly."
            reference={reference || undefined}
            referenceLabel="Reference number"
            nextSteps={[
              { title: 'Confirmation email', description: 'Check your inbox for a copy of your submission.' },
              { title: 'Team review', description: 'We typically respond within one business day.' },
              { title: 'Track progress', description: 'Use your reference number to check status anytime.' },
            ]}
            primaryAction={{ label: 'Check status', href: route('guest.inquiry.status-form') }}
            secondaryAction={{ label: 'Back to home', href: route('home') }}
            onReset={resetForm}
            resetLabel="Submit another inquiry"
          />
        ) : (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Contact form</CardTitle>
              <CardDescription>Fill in the details below and we&apos;ll get back to you.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Field label="Inquiry type" error={errors.type}>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(inquiryTypes).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Urgency" error={errors.urgency}>
                    <Select value={form.urgency} onValueChange={(v) => setForm({ ...form, urgency: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(urgencyLevels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
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

                <div className="grid gap-6 md:grid-cols-2">
                  <Field label="Phone (optional)" error={errors.phone}>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </Field>
                  <Field label="Preferred contact" error={errors.preferred_contact_method}>
                    <Select
                      value={form.preferred_contact_method}
                      onValueChange={(v) => setForm({ ...form, preferred_contact_method: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(contactMethods).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <Field label="Subject" error={errors.subject}>
                  <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
                </Field>

                <Field label="Message" error={errors.message}>
                  <Textarea
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                  />
                </Field>

                <div className="flex justify-end">
                  <Button type="submit" disabled={processing} className="bg-gradient-to-r from-secondary to-primary">
                    {processing ? (
                      'Sending…'
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send inquiry
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
