import React, { useEffect, useMemo, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Progress } from '@/Components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { CheckCircle2, Circle, ClipboardList } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required_fields: string[];
}

interface Props {
  onboarding: {
    completed: boolean;
    progress: number;
    steps: Step[];
    profile: {
      name: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      country: string;
      tax_id: string;
      registration_number: string;
      industry: string;
      display_name: string;
      primary_color: string;
      tagline: string | null;
      logo_url: string | null;
    };
  };
  options: {
    industries: Record<string, string>;
    countries: Record<string, string>;
  };
  plan: { name: string; trial_days: number } | null;
}

export default function OrganizationOnboarding({ onboarding, options, plan }: Props) {
  const route = useRoute();
  const profile = onboarding.profile;
  const firstIncomplete = onboarding.steps.find((s) => !s.completed)?.id ?? onboarding.steps[0]?.id ?? 'company_profile';
  const [activeStep, setActiveStep] = useState(firstIncomplete);
  const [logoPreview, setLogoPreview] = useState<string | null>(profile.logo_url ?? null);

  const stepForm = useForm({
    step: activeStep,
    name: profile.name ?? '',
    industry: profile.industry ?? '',
    registration_number: profile.registration_number ?? '',
    email: profile.email ?? '',
    phone: profile.phone ?? '',
    address: profile.address ?? '',
    city: profile.city ?? '',
    country: profile.country ?? 'ZM',
    tax_id: profile.tax_id ?? '',
    display_name: profile.display_name ?? profile.name ?? '',
    primary_color: profile.primary_color ?? '#059669',
    tagline: profile.tagline ?? '',
    logo: null as File | null,
    remove_logo: false,
  });

  useEffect(() => {
    stepForm.setData({
      step: activeStep,
      name: profile.name ?? '',
      industry: profile.industry ?? '',
      registration_number: profile.registration_number ?? '',
      email: profile.email ?? '',
      phone: profile.phone ?? '',
      address: profile.address ?? '',
      city: profile.city ?? '',
      country: profile.country ?? 'ZM',
      tax_id: profile.tax_id ?? '',
      display_name: profile.display_name ?? profile.name ?? '',
      primary_color: profile.primary_color ?? '#059669',
      tagline: profile.tagline ?? '',
      logo: null,
      remove_logo: false,
    });
    setLogoPreview(profile.logo_url ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep, profile]);

  const submitForm = useForm({ confirmed: false as boolean });

  const activeMeta = useMemo(
    () => onboarding.steps.find((s) => s.id === activeStep),
    [activeStep, onboarding.steps],
  );

  const saveStep = (e: React.FormEvent) => {
    e.preventDefault();
    stepForm.setData('step', activeStep);

    const options = { preserveScroll: true as const };

    if (activeStep === 'branding' && (stepForm.data.logo || stepForm.data.remove_logo)) {
      stepForm.post(route('organization.onboarding.step.upload'), {
        ...options,
        forceFormData: true,
      });
      return;
    }

    stepForm.put(route('organization.onboarding.step'), options);
  };

  const handleLogoChange = (file: File | null) => {
    stepForm.setData('logo', file);
    stepForm.setData('remove_logo', false);

    if (file) {
      setLogoPreview(URL.createObjectURL(file));
      return;
    }

    setLogoPreview(profile.logo_url ?? null);
  };

  const submitOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm.post(route('organization.onboarding.submit'));
  };

  const allStepsComplete = onboarding.steps.every((s) => s.completed);

  return (
    <AppLayout title="Company onboarding">
      <Head title="Company onboarding" />

      <div className="mx-auto max-w-7xl space-y-6 py-4">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <ClipboardList className="h-5 w-5" />
            <span className="text-sm font-medium">Required company information</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Complete your company profile</h1>
          <p className="mt-1 text-muted-foreground">
            Submit all required details before using the ERP{plan ? ` on your ${plan.name} trial` : ''}.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span>{onboarding.progress}% complete</span>
              <span>{onboarding.steps.filter((s) => s.completed).length} of {onboarding.steps.length} steps</span>
            </div>
            <Progress value={onboarding.progress} className="h-2" />
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <nav className="space-y-1">
            {onboarding.steps.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(step.id)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors',
                  activeStep === step.id ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted/50',
                )}
              >
                {step.completed ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span>
                  <span className="block text-sm font-medium">{step.title}</span>
                  <span className="block text-xs text-muted-foreground">{step.description}</span>
                </span>
              </button>
            ))}
          </nav>

          <Card>
            <CardHeader>
              <CardTitle>{activeMeta?.title}</CardTitle>
              <CardDescription>{activeMeta?.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveStep} className="space-y-4">
                {activeStep === 'company_profile' && (
                  <>
                    <Field label="Legal company name" error={stepForm.errors.name}>
                      <Input value={stepForm.data.name} onChange={(e) => stepForm.setData('name', e.target.value)} required />
                    </Field>
                    <Field label="Industry" error={stepForm.errors.industry}>
                      <Select value={stepForm.data.industry} onValueChange={(v) => stepForm.setData('industry', v)}>
                        <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(options.industries).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Company registration number (PACRA)" error={stepForm.errors.registration_number}>
                      <Input
                        value={stepForm.data.registration_number}
                        onChange={(e) => stepForm.setData('registration_number', e.target.value)}
                        placeholder="e.g. 120000000000"
                        required
                      />
                    </Field>
                  </>
                )}

                {activeStep === 'contact_location' && (
                  <>
                    <Field label="Business email" error={stepForm.errors.email}>
                      <Input type="email" value={stepForm.data.email} onChange={(e) => stepForm.setData('email', e.target.value)} required />
                    </Field>
                    <Field label="Phone number" error={stepForm.errors.phone}>
                      <Input value={stepForm.data.phone} onChange={(e) => stepForm.setData('phone', e.target.value)} placeholder="097xxxxxxx" required />
                    </Field>
                    <Field label="Street address" error={stepForm.errors.address}>
                      <Textarea value={stepForm.data.address} onChange={(e) => stepForm.setData('address', e.target.value)} required />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="City" error={stepForm.errors.city}>
                        <Input value={stepForm.data.city} onChange={(e) => stepForm.setData('city', e.target.value)} required />
                      </Field>
                      <Field label="Country" error={stepForm.errors.country}>
                        <Select value={stepForm.data.country} onValueChange={(v) => stepForm.setData('country', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(options.countries).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                  </>
                )}

                {activeStep === 'tax_compliance' && (
                  <>
                    <Field label="TPIN (10-digit tax ID)" error={stepForm.errors.tax_id}>
                      <Input
                        value={stepForm.data.tax_id}
                        onChange={(e) => stepForm.setData('tax_id', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="1000000000"
                        inputMode="numeric"
                        required
                      />
                    </Field>
                    <p className="text-sm text-muted-foreground">
                      Required for ZRA invoices, tax reporting, and compliant receipts.
                    </p>
                  </>
                )}

                {activeStep === 'branding' && (
                  <>
                    <Field label="Company logo (optional)" error={stepForm.errors.logo}>
                      <div className="flex flex-wrap items-center gap-4">
                        {logoPreview && (
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="h-16 max-w-[160px] rounded border bg-white object-contain p-2"
                          />
                        )}
                        <Input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/svg+xml"
                          onChange={(e) => handleLogoChange(e.target.files?.[0] ?? null)}
                        />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Shown in the sidebar, login, and registration pages. PNG, JPG, WebP, or SVG up to 2 MB.
                      </p>
                      {logoPreview && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            stepForm.setData('remove_logo', true);
                            stepForm.setData('logo', null);
                            setLogoPreview(null);
                          }}
                        >
                          Remove logo
                        </Button>
                      )}
                    </Field>
                    <Field label="Display name (shop & documents)" error={stepForm.errors.display_name}>
                      <Input value={stepForm.data.display_name} onChange={(e) => stepForm.setData('display_name', e.target.value)} required />
                    </Field>
                    <Field label="Tagline (optional)" error={stepForm.errors.tagline}>
                      <Input value={stepForm.data.tagline} onChange={(e) => stepForm.setData('tagline', e.target.value)} />
                    </Field>
                    <Field label="Brand colour" error={stepForm.errors.primary_color}>
                      <div className="flex gap-3">
                        <Input type="color" className="h-10 w-16 p-1" value={stepForm.data.primary_color} onChange={(e) => stepForm.setData('primary_color', e.target.value)} />
                        <Input value={stepForm.data.primary_color} onChange={(e) => stepForm.setData('primary_color', e.target.value)} required />
                      </div>
                    </Field>
                  </>
                )}

                <Button type="submit" disabled={stepForm.processing}>
                  {stepForm.processing ? 'Saving…' : 'Save & continue'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card className={cn(!allStepsComplete && 'opacity-80')}>
          <CardHeader>
            <CardTitle className="text-lg">Submit company profile</CardTitle>
            <CardDescription>
              Confirm that all information is accurate. You must complete every step above first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitOnboarding} className="space-y-4">
              <ul className="space-y-2 text-sm">
                {onboarding.steps.map((step) => (
                  <li key={step.id} className="flex items-center gap-2">
                    {step.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={step.completed ? 'text-foreground' : 'text-muted-foreground'}>{step.title}</span>
                    {step.completed && <Badge variant="outline" className="ml-auto text-xs">Done</Badge>}
                  </li>
                ))}
              </ul>

              <div className="flex items-start gap-3 rounded-lg border p-3">
                <Checkbox
                  id="confirmed"
                  checked={submitForm.data.confirmed}
                  onCheckedChange={(checked) => submitForm.setData('confirmed', checked === true)}
                  disabled={!allStepsComplete}
                />
                <Label htmlFor="confirmed" className="text-sm leading-relaxed">
                  I confirm this company information is complete and accurate for billing, tax, and regulatory purposes.
                </Label>
              </div>
              {submitForm.errors.confirmed && <p className="text-sm text-destructive">{submitForm.errors.confirmed}</p>}
              {submitForm.errors.checklist && <p className="text-sm text-destructive">{submitForm.errors.checklist}</p>}

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={!allStepsComplete || submitForm.processing || !submitForm.data.confirmed}>
                  Submit & go to dashboard
                </Button>
                {!allStepsComplete && (
                  <p className="self-center text-sm text-muted-foreground">Complete all steps to enable submission.</p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
