import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { CheckCircle, Send, MessageSquare } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import { toast } from 'sonner';
import useRoute from '@/Hooks/useRoute';
import WebsiteHero from '@/Components/Website/WebsiteHero';

interface Props {
  inquiryTypes: Record<string, string>;
  urgencyLevels: Record<string, string>;
  contactMethods: Record<string, string>;
}

export default function Create({ inquiryTypes, urgencyLevels, contactMethods }: Props) {
  const route = useRoute();

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');

  const getQuery = (key: string) =>
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get(key) || ''
      : '';

  const { data, setData, post, processing, errors, reset } = useForm({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    post(route('guest.inquiry.store'), {
      onSuccess: () => {
        setIsSubmitted(true);
        setReferenceNumber('');
        reset();
        toast.success('Inquiry submitted successfully!');
      },
      onError: () => {
        toast.error('Failed to submit inquiry. Please try again.');
      },
    });
  };

  if (isSubmitted) {
    return (
      <GuestLayout title="Inquiry Submitted">
        <Head title="Inquiry Submitted" />

        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card className="shadow-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl text-green-600">
                    Inquiry Submitted Successfully!
                  </CardTitle>
                  <CardDescription>
                    Thank you for contacting us. We’ll respond shortly.
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-center space-y-4">
                  {referenceNumber && (
                    <Alert>
                      <AlertDescription>
                        <strong>Reference Number:</strong> {referenceNumber}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={() => setIsSubmitted(false)} variant="outline">
                      Submit Another Inquiry
                    </Button>

                    <Button asChild>
                      <a href="/guest/inquiry/status">Check Inquiry Status</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </GuestLayout>
    );
  }

  return (
    <GuestLayout title="Contact Us">

<WebsiteHero
        badge="Contact"
        badgeIcon="📩"
        title="Get in Touch"
        description="Tell us what you need. We’ll respond quickly and clearly."
        primaryCta={{ label: 'Support Center', href: route('contact') }}
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">

            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Get in Touch
              </h1>
              <p className="text-xl text-gray-600">
                Tell us what you need. We respond fast.
              </p>
            </div>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Contact Form
                </CardTitle>
                <CardDescription>
                  Fill out the form and we’ll get back to you.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="space-y-2">
                      <Label>Inquiry Type</Label>
                      <Select value={data.type} onValueChange={(v) => setData('type', v)}>
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
                      {errors.type && <p className="text-sm text-red-600">{errors.type}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Urgency</Label>
                      <Select value={data.urgency} onValueChange={(v) => setData('urgency', v)}>
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
                      {errors.urgency && (
                        <p className="text-sm text-red-600">{errors.urgency}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                      />
                      {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                      />
                      {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input
                      value={data.subject}
                      onChange={(e) => setData('subject', e.target.value)}
                    />
                    {errors.subject && <p className="text-sm text-red-600">{errors.subject}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea
                      rows={6}
                      value={data.message}
                      onChange={(e) => setData('message', e.target.value)}
                    />
                    {errors.message && <p className="text-sm text-red-600">{errors.message}</p>}
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={processing}>
                      {processing ? 'Sending...' : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Inquiry
                        </>
                      )}
                    </Button>
                  </div>

                </form>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </GuestLayout>
  );
}