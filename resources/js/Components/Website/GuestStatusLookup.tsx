import React, { FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import GuestLayout from '@/Layouts/GuestLayout';
import GuestPageHero from '@/Components/Website/GuestPageHero';
import { Search } from 'lucide-react';

interface GuestStatusLookupProps {
  title: string;
  description: string;
  submitUrl: string;
  fieldKey?: string;
  fieldLabel?: string;
  fieldPlaceholder?: string;
}

export default function GuestStatusLookup({
  title,
  description,
  submitUrl,
  fieldKey = 'reference_number',
  fieldLabel = 'Reference Number',
  fieldPlaceholder = 'Enter your reference number',
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
      <GuestPageHero title={title} description={description} icon={<Search className="h-6 w-6" />} />
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Track your request</CardTitle>
            <CardDescription>Enter the reference from your confirmation email.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={fieldKey}>{fieldLabel}</Label>
                <Input
                  id={fieldKey}
                  value={value}
                  onChange={(e) => setData(fieldKey, e.target.value)}
                  placeholder={fieldPlaceholder}
                  required
                />
                {fieldError && <p className="text-sm text-destructive">{fieldError}</p>}
              </div>
              <Button type="submit" disabled={processing} className="w-full">
                {processing ? 'Checking...' : 'Check Status'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </GuestLayout>
  );
}
