import React, { FormEvent, useState } from 'react';
import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import GuestPageHero from '@/Components/Website/GuestPageHero';
import GuestFlowShell from '@/Components/Website/GuestFlowShell';
import GuestSuccessScreen from '@/Components/Website/GuestSuccessScreen';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import useRoute from '@/Hooks/useRoute';
import axios from 'axios';

interface Props {
  categories: Record<string, string>;
  priorities: Record<string, string>;
}

const STEPS = ['Describe your issue', 'Agent assignment', 'Resolution & updates'];

export default function CreateTicket({ categories, priorities }: Props) {
  const route = useRoute();
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    priority: 'normal',
    subject: '',
    description: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const response = await axios.post(route('guest.support.ticket.store'), form);
      setTicketNumber(response.data.ticket_number ?? '');
      setSubmitted(true);
      toast.success('Ticket created.');
    } catch {
      toast.error('Failed to create ticket.');
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setTicketNumber('');
    setForm({
      name: '',
      email: '',
      phone: '',
      category: '',
      priority: 'normal',
      subject: '',
      description: '',
    });
  };

  return (
    <GuestLayout title="Submit a Ticket">
      <Head title="Submit a Ticket" />
      <GuestPageHero
        title="Submit a support ticket"
        description="Describe your issue and our team will respond as soon as possible."
        icon={<MessageSquare className="h-6 w-6" />}
        flowType="ticket"
      />

      <GuestFlowShell
        flowType="ticket"
        steps={STEPS}
        currentStep={submitted ? 2 : 0}
        title="Support flow"
        description="Track your ticket from submission to resolution."
      >
        {submitted ? (
          <GuestSuccessScreen
            title="Ticket created"
            description="We have received your request and will update you as we work on it."
            reference={ticketNumber || undefined}
            referenceLabel="Ticket number"
            nextSteps={[
              { title: 'Queue review', description: 'Your ticket enters our support queue.' },
              { title: 'Agent response', description: 'An agent will be assigned based on category and priority.' },
              { title: 'Status tracking', description: 'Use your ticket number to check progress anytime.' },
            ]}
            primaryAction={{ label: 'Check ticket status', href: route('guest.support.ticket.status-form') }}
            onReset={resetForm}
            resetLabel="Submit another ticket"
          />
        ) : (
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categories).map(([k, v]) => (
                          <SelectItem key={k} value={k}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(priorities).map(([k, v]) => (
                          <SelectItem key={k} value={k}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    rows={5}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" disabled={processing} className="w-full bg-gradient-to-r from-secondary to-primary">
                  {processing ? 'Submitting…' : 'Submit ticket'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </GuestFlowShell>
    </GuestLayout>
  );
}
