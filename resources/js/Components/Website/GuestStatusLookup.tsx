import React, { FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import GuestLayout from '@/Layouts/GuestLayout';
import GuestPageHero from '@/Components/Website/GuestPageHero';
import GuestFlowShell from '@/Components/Website/GuestFlowShell';
import { Search } from 'lucide-react';
import { GuestFlowType } from '@/Components/Website/GuestFlowIllustration';

interface GuestStatusLookupProps {
  title: string;
  description: string;
  submitUrl: string;
  fieldKey?: string;
  fieldLabel?: string;
  fieldPlaceholder?: string;
  flowType?: GuestFlowType;
  steps?: string[];
}

export default function GuestStatusLookup({
  title,
  description,
  submitUrl,
  fieldKey = 'reference_number',
  fieldLabel = 'Reference Number',
  fieldPlaceholder = 'Enter your reference number',
  flowType = 'status',
  steps = ['Enter reference', 'View live status', 'Follow up if needed'],
}: GuestStatusLookupProps) {
  const { data, setData, post, processing, errors } = useForm({
    [fieldKey]: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    post(submitUrl);
  };

  const value = (data as Record<string, string>)[fieldKey] ?? '';
  const fieldError = (errors as Record<string, string>)[fieldKey];

  return (
    <GuestLayout title={title}>
      <GuestPageHero title={title} description={description} icon={<Search className="h-6 w-6" />} flowType={flowType} />

      <GuestFlowShell
        flowType={flowType}
        steps={steps}
        currentStep={0}
        title="Track your request"
        description="Use the reference from your confirmation email or receipt."
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Reference lookup</CardTitle>
            <CardDescription>We&apos;ll show the latest status and next steps.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={fieldKey}>{fieldLabel}</Label>
                <Input
                  id={fieldKey}
                  value={value}
                  onChange={(e) => setData(fieldKey, e.target.value.toUpperCase())}
                  placeholder={fieldPlaceholder}
                  className="font-mono uppercase tracking-wide"
                  required
                />
                {fieldError && <p className="text-sm text-destructive">{fieldError}</p>}
              </div>
              <Button type="submit" disabled={processing} className="w-full bg-gradient-to-r from-secondary to-primary">
                {processing ? 'Checking…' : 'Check status'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </GuestFlowShell>
    </GuestLayout>
  );
}
