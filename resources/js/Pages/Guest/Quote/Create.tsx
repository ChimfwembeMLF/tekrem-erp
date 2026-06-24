import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/Components/ui/select';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { CheckCircle, Send, DollarSign, Plus, X } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import { toast } from 'sonner';
import useRoute from '@/Hooks/useRoute';
import WebsiteHero from '@/Components/Website/WebsiteHero';

interface Props {
  serviceTypes?: Record<string, string>;
  budgetRanges?: Record<string, string>;
  timelines?: Record<string, string>;
  priorities?: Record<string, string>;
}

export default function Create({
  serviceTypes,
  budgetRanges,
  timelines,
  priorities
}: Props) {
  const route = useRoute();

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');

  const [requirements, setRequirements] = useState<string[]>(['']);

  // 🧯 hard safety nets (backend is optional apparently)
  const safeServiceTypes = serviceTypes ?? {};
  const safeBudgetRanges = budgetRanges ?? {};
  const safeTimelines = timelines ?? {};
  const safePriorities = priorities ?? {};

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    service_type: '',
    project_description: '',
    budget_range: '',
    timeline: '',
    requirements: [] as string[],
    priority: 'normal',
    source: 'website',
    utm_source: new URLSearchParams(window.location.search).get('utm_source') || '',
    utm_medium: new URLSearchParams(window.location.search).get('utm_medium') || '',
    utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign') || ''
  });

  const addRequirement = () => setRequirements([...requirements, '']);

  const updateRequirement = (i: number, value: string) => {
    const updated = [...requirements];
    updated[i] = value;
    setRequirements(updated);
    setData('requirements', updated.filter(x => x.trim() !== ''));
  };

  const removeRequirement = (i: number) => {
    const updated = requirements.filter((_, idx) => idx !== i);
    setRequirements(updated.length ? updated : ['']);
    setData('requirements', updated.filter(x => x.trim() !== ''));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setData('requirements', requirements.filter(x => x.trim() !== ''));

    post('/guest/quote', {
      onSuccess: (res: any) => {
        setIsSubmitted(true);
        setReferenceNumber(res?.props?.flash?.reference_number || '');
        reset();
        setRequirements(['']);
        toast.success('Quote request submitted');
      },
      onError: () => {
        toast.error('Failed to submit quote request');
      }
    });
  };

  if (isSubmitted) {
    return (
      <GuestLayout title="Quote Submitted">
        <Head title="Quote Submitted" />

        <div className="min-h-screen flex items-center justify-center bg-green-50 p-6">
          <Card className="max-w-lg w-full">
            <CardHeader className="text-center">
              <CheckCircle className="mx-auto h-10 w-10 text-green-600" />
              <CardTitle>Request Submitted</CardTitle>
              <CardDescription>We’ll respond shortly.</CardDescription>
            </CardHeader>

            <CardContent className="text-center space-y-4">
              {referenceNumber && (
                <Alert>
                  <AlertDescription>
                    Ref: {referenceNumber}
                  </AlertDescription>
                </Alert>
              )}

              <Button onClick={() => setIsSubmitted(false)} variant="outline">
                New Request
              </Button>
            </CardContent>
          </Card>
        </div>
      </GuestLayout>
    );
  }

  return (
    <GuestLayout title="Request Quote">

      <WebsiteHero
        badge="Quote"
        badgeIcon="💰"
        title="Request a Quote"
        description="Tell us what you need. We’ll price it properly."
        primaryCta={{ label: 'Contact', href: route('contact') }}
      />

      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto px-4">

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Quote Request
              </CardTitle>
              <CardDescription>
                Fill details accurately for better pricing.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* CONTACT */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Input placeholder="Name"
                    value={data.name}
                    onChange={e => setData('name', e.target.value)} />

                  <Input placeholder="Email"
                    value={data.email}
                    onChange={e => setData('email', e.target.value)} />
                </div>

                {/* SELECTS */}
                <div className="grid md:grid-cols-2 gap-4">

                  <Select value={data.service_type}
                    onValueChange={v => setData('service_type', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Service Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(safeServiceTypes).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={data.priority}
                    onValueChange={v => setData('priority', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(safePriorities).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                </div>

                {/* DESCRIPTION */}
                <Textarea
                  placeholder="Project description"
                  value={data.project_description}
                  onChange={e => setData('project_description', e.target.value)}
                />

                {/* REQUIREMENTS */}
                <div>
                  <div className="flex justify-between">
                    <Label>Requirements</Label>
                    <Button type="button" size="sm" onClick={addRequirement}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {requirements.map((r, i) => (
                    <div key={i} className="flex gap-2 mt-2">
                      <Input
                        value={r}
                        onChange={e => updateRequirement(i, e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeRequirement(i)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* SUBMIT */}
                <div className="flex justify-end">
                  <Button disabled={processing} type="submit">
                    <Send className="w-4 h-4 mr-2" />
                    Submit Quote
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>

        </div>
      </div>

    </GuestLayout>
  );
}