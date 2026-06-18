import React, { FormEvent, useState } from 'react';
import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import GuestPageHero from '@/Components/Website/GuestPageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface Props {
  categories: Record<string, string>;
  priorities: Record<string, string>;
}

export default function CreateTicket({ categories, priorities }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    priority: 'normal',
    subject: '',
    description: '',
  });
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const response = await axios.post('/guest/support/ticket', form);
      setTicketNumber(response.data.ticket_number ?? '');
      setSubmitted(true);
      toast.success('Ticket created.');
    } catch {
      toast.error('Failed to create ticket.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <GuestLayout title="Submit a Ticket">
      <Head title="Submit a Ticket" />
      <GuestPageHero
        title="Submit a support ticket"
        description="Describe your issue and our team will respond as soon as possible."
        icon={<MessageSquare className="h-6 w-6" />}
      />

      <div className="mx-auto max-w-2xl px-4 py-12">
        {submitted ? (
          <Card>
            <CardHeader>
              <CardTitle>Ticket created</CardTitle>
              <p className="text-sm text-muted-foreground">Ticket number: <strong>{ticketNumber}</strong></p>
            </CardHeader>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(categories).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(priorities).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
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
                  <Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                </div>
                <Button type="submit" disabled={processing} className="w-full">
                  {processing ? 'Submitting...' : 'Submit ticket'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </GuestLayout>
  );
}
