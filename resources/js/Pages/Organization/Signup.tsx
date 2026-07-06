import React, { useMemo, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import PlanCard, { PublicPlan } from '@/Components/Organization/PlanCard';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { FormCheckbox, FormInput } from '@/Components/Auth';
import ReCaptcha from '@/Components/ReCaptcha';
import useRoute from '@/Hooks/useRoute';
import useTypedPage from '@/Hooks/useTypedPage';
import { formatZmw } from '@/lib/formatCurrency';
import GuestPageHero from '@/Components/Website/GuestPageHero';
import ProcessTimeline from '@/Components/Website/ProcessTimeline';
import { Building2 } from 'lucide-react';

interface Props {
  plans: PublicPlan[];
  selectedPlanId: number;
  billingCycle: 'monthly' | 'yearly';
}

export default function OrganizationSignup({ plans, selectedPlanId, billingCycle: initialCycle }: Props) {
  const route = useRoute();
  const page = useTypedPage();
  const recaptcha = page.props.recaptcha;
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(initialCycle);

  const form = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    organization_name: '',
    phone: '',
    billing_plan_id: selectedPlanId,
    billing_cycle: initialCycle,
    terms: false,
    recaptcha_token: '',
  });

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === form.data.billing_plan_id) ?? plans[0],
    [plans, form.data.billing_plan_id],
  );

  const price = selectedPlan
    ? Number(billingCycle === 'yearly' ? selectedPlan.price_yearly : selectedPlan.price_monthly)
    : 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    form.setData('billing_cycle', billingCycle);

    if (recaptcha?.enabled && recaptchaToken) {
      form.setData('recaptcha_token', recaptchaToken);
    }

    form.post(route('organization.signup.store'), {
      onFinish: () => {
        form.reset('password', 'password_confirmation');
        setRecaptchaToken('');
      },
    });
  };

  return (
    <GuestLayout title="Start your organization" showHeader={false}>
      <Head title="Start your organization" />

      <GuestPageHero
        title="Create your organization"
        description={`Start your ${selectedPlan?.trial_days ?? 14}-day free trial on Tekrem ERP. No payment until the trial ends.`}
        icon={<Building2 className="h-6 w-6" />}
        flowType="signup"
      />

      <section className="border-b bg-muted/20 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <ProcessTimeline
            title="Signup flow"
            subtitle="You will be the organization owner with full admin access."
            steps={['Pick a plan', 'Create account', 'Set up your company', 'Start your trial']}
            className="py-0"
          />
        </div>
      </section>

      <div className="min-h-screen bg-muted/20 py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <Link href={route('erp.plans')} className="text-sm text-muted-foreground hover:text-primary">
              ← Back to plans
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-5">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Choose a plan</CardTitle>
                  <CardDescription>Each plan includes its own trial period.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="inline-flex rounded-lg border p-1">
                    <Button
                      type="button"
                      size="sm"
                      variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
                      onClick={() => setBillingCycle('monthly')}
                    >
                      Monthly
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
                      onClick={() => setBillingCycle('yearly')}
                    >
                      Yearly
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {plans.map((plan) => (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        billingCycle={billingCycle}
                        showCta={false}
                        selected={form.data.billing_plan_id === plan.id}
                        onSelect={(planId) => form.setData('billing_plan_id', planId)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {selectedPlan && (
                <Card className="border-emerald-500/30 bg-emerald-500/5">
                  <CardContent className="pt-6 text-sm">
                    <p className="font-medium text-emerald-800 dark:text-emerald-200">
                      {selectedPlan.trial_days}-day trial on {selectedPlan.name}
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      Then {formatZmw(price)}/{billingCycle === 'yearly' ? 'year' : 'month'} via PawaPay.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Account & organization</CardTitle>
                <CardDescription>You will be the organization owner with full admin access.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={submit} className="space-y-4">
                  <FormInput
                    label="Your full name"
                    id="name"
                    value={form.data.name}
                    onChange={(e) => form.setData('name', e.currentTarget.value)}
                    error={form.errors.name}
                    required
                    autoFocus
                  />

                  <FormInput
                    label="Work email"
                    id="email"
                    type="email"
                    value={form.data.email}
                    onChange={(e) => form.setData('email', e.currentTarget.value)}
                    error={form.errors.email}
                    required
                  />

                  <FormInput
                    label="Organization name"
                    id="organization_name"
                    value={form.data.organization_name}
                    onChange={(e) => form.setData('organization_name', e.currentTarget.value)}
                    error={form.errors.organization_name}
                    required
                    placeholder="e.g. Acme Trading Ltd"
                  />

                  <FormInput
                    label="Phone (optional)"
                    id="phone"
                    value={form.data.phone}
                    onChange={(e) => form.setData('phone', e.currentTarget.value)}
                    error={form.errors.phone}
                    placeholder="097xxxxxxx"
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      label="Password"
                      id="password"
                      type="password"
                      value={form.data.password}
                      onChange={(e) => form.setData('password', e.currentTarget.value)}
                      error={form.errors.password}
                      required
                      autoComplete="new-password"
                    />
                    <FormInput
                      label="Confirm password"
                      id="password_confirmation"
                      type="password"
                      value={form.data.password_confirmation}
                      onChange={(e) => form.setData('password_confirmation', e.currentTarget.value)}
                      error={form.errors.password_confirmation}
                      required
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="space-y-2">
                    <FormCheckbox
                      id="terms"
                      checked={form.data.terms}
                      onChange={(checked) => form.setData('terms', checked)}
                      required
                      label={
                        <span className="text-sm text-muted-foreground">
                          I agree to the{' '}
                          <Link href={route('terms.show')} target="_blank" className="text-primary underline underline-offset-4">
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link href={route('privacy-policy.show')} target="_blank" className="text-primary underline underline-offset-4">
                            Privacy Policy
                          </Link>
                        </span>
                      }
                    />
                    {form.errors.terms && <p className="text-sm font-medium text-destructive">{form.errors.terms}</p>}
                  </div>

                  {recaptcha?.enabled && (
                    <ReCaptcha
                      siteKey={recaptcha.site_key}
                      theme={recaptcha.theme as 'light' | 'dark'}
                      size={recaptcha.size as 'normal' | 'compact'}
                      onVerify={setRecaptchaToken}
                      onExpired={() => setRecaptchaToken('')}
                      error={form.errors.recaptcha_token}
                      label="Security verification"
                      required
                    />
                  )}

                  {form.errors.billing_plan_id && (
                    <p className="text-sm font-medium text-destructive">{form.errors.billing_plan_id}</p>
                  )}

                  <Button type="submit" disabled={form.processing} className="w-full">
                    {form.processing ? 'Creating organization…' : `Start ${selectedPlan?.trial_days ?? 14}-day free trial`}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href={route('login')} className="font-medium text-primary hover:underline">
                      Sign in
                    </Link>
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
