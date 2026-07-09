import React, { useEffect, useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { AlertCircle, CheckCircle2, CreditCard, Loader2, Smartphone, XCircle, History } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { formatZmw } from '@/lib/formatCurrency';

interface Plan {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price_monthly: string;
  price_yearly: string;
  currency: string;
  trial_days: number;
  features: string[];
}

interface Props {
  billing: {
    subscription: {
      id: number;
      status: string;
      billing_cycle: string;
      current_period_end: string | null;
      plan: Plan | null;
    } | null;
    amount_due: number;
    currency: string;
    needs_payment: boolean;
    pawapay_configured: boolean;
    networks: Array<{ code: string; label: string }>;
  };
  plans: Plan[];
  transactions: Array<{
    id: number;
    transaction_number: string;
    amount: string;
    currency: string;
    status: string;
    created_at: string;
    phone_number: string | null;
  }>;
}

export default function OrganizationBilling({ billing, plans, transactions = [] }: Props) {
  const route = useRoute();
  const page = usePage<{ flash?: { billing_payment?: { subscription_id: number; transaction_number: string } } }>();
  const pendingPayment = page.props.flash?.billing_payment;

  const [polling, setPolling] = useState(!!pendingPayment);
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');

  const defaultPlanId = billing.subscription?.plan?.id ?? plans[0]?.id ?? '';
  const { data, setData, post, processing, errors } = useForm({
    billing_plan_id: defaultPlanId ? String(defaultPlanId) : '',
    billing_cycle: billing.subscription?.billing_cycle ?? 'monthly',
    phone_number: '',
    correspondent: '',
  });

  const selectedPlan = plans.find((p) => String(p.id) === data.billing_plan_id) ?? billing.subscription?.plan ?? plans[0];
  const amountDue = selectedPlan
    ? Number(data.billing_cycle === 'yearly' ? selectedPlan.price_yearly : selectedPlan.price_monthly)
    : billing.amount_due;

  useEffect(() => {
    if (!pendingPayment?.subscription_id) return;

    const interval = window.setInterval(async () => {
      try {
        const { data: statusData } = await axios.get(
          route('organization.billing.payment-status', pendingPayment.subscription_id),
        );
        setPaymentStatus(statusData.payment_status);
        if (['paid', 'failed'].includes(statusData.payment_status)) {
          setPolling(false);
          window.clearInterval(interval);
          if (statusData.payment_status === 'paid') {
            window.location.reload();
          }
        }
      } catch {
        setPolling(false);
        window.clearInterval(interval);
      }
    }, 4000);

    return () => window.clearInterval(interval);
  }, [pendingPayment?.subscription_id, route]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('organization.billing.pay'));
  };

  return (
    <AppLayout title="Organization billing">
      <Head title="Billing" />

      <div className="mx-auto max-w-3xl space-y-6 py-8 px-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Organization billing</h1>
          <p className="text-muted-foreground">Pay for your ERP plan with mobile money via PawaPay (MTN, Airtel, Zamtel).</p>
        </div>

        {billing.needs_payment && (
          <Card className="border-amber-500/40 bg-amber-500/5">
            <CardContent className="flex items-start gap-3 pt-6">
              <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium">Payment required</p>
                <p className="text-sm text-muted-foreground">
                  Your trial has ended or your subscription period expired. Pay with mobile money to keep access.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {!billing.needs_payment && billing.subscription?.status === 'trialing' && (
          <Card className="border-emerald-500/40 bg-emerald-500/5">
            <CardContent className="flex items-start gap-3 pt-6">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div>
                <p className="font-medium">Free trial active</p>
                <p className="text-sm text-muted-foreground">
                  No payment due until your trial ends. You can pay early below if you prefer.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {pendingPayment && (
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              {polling ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <div>
                    <p className="font-medium">Waiting for PawaPay approval</p>
                    <p className="text-sm text-muted-foreground">Reference: {pendingPayment.transaction_number}</p>
                  </div>
                </>
              ) : paymentStatus === 'paid' ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <p className="font-medium text-emerald-700">Payment successful — plan activated.</p>
                </>
              ) : paymentStatus === 'failed' ? (
                <>
                  <XCircle className="h-5 w-5 text-destructive" />
                  <p className="font-medium text-destructive">Payment failed. Try again with the same or a different number.</p>
                </>
              ) : null}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5" />
              Current subscription
            </CardTitle>
            <CardDescription>
              {billing.subscription?.plan?.name ?? 'No active plan'} ·{' '}
              <Badge variant="outline" className="capitalize">{billing.subscription?.status ?? 'none'}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            {billing.subscription?.current_period_end && (
              <p>Renews / paid through: {new Date(billing.subscription.current_period_end).toLocaleDateString()}</p>
            )}
            <p className="font-semibold text-base">
              {billing.needs_payment || billing.subscription?.status !== 'trialing'
                ? <>Due now: {formatZmw(amountDue)}</>
                : <>After trial: {formatZmw(amountDue)}</>}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Smartphone className="h-5 w-5" />
              Pay with mobile money
            </CardTitle>
            <CardDescription>
              {billing.pawapay_configured
                ? 'You will receive a prompt on your phone to approve the payment.'
                : 'PawaPay is not configured on this platform yet.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label>Plan</Label>
                <Select value={data.billing_plan_id} onValueChange={(v) => setData('billing_plan_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={String(plan.id)}>{plan.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Billing cycle</Label>
                <Select value={data.billing_cycle} onValueChange={(v) => setData('billing_cycle', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">
                      Monthly {selectedPlan ? `— ${formatZmw(Number(selectedPlan.price_monthly))}` : ''}
                    </SelectItem>
                    <SelectItem value="yearly">
                      Yearly {selectedPlan ? `— ${formatZmw(Number(selectedPlan.price_yearly))}` : ''}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile number</Label>
                  <Input
                    id="phone"
                    value={data.phone_number}
                    onChange={(e) => setData('phone_number', e.target.value)}
                    placeholder="097xxxxxxx"
                  />
                  {errors.phone_number && <p className="text-sm text-destructive">{errors.phone_number}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Network (optional)</Label>
                  <Select value={data.correspondent || '__auto'} onValueChange={(v) => setData('correspondent', v === '__auto' ? '' : v)}>
                    <SelectTrigger><SelectValue placeholder="Auto-detect" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__auto">Auto-detect</SelectItem>
                      {billing.networks.map((n) => (
                        <SelectItem key={n.code} value={n.code}>{n.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {errors.authorization && <p className="text-sm text-destructive">{errors.authorization}</p>}

              <Button type="submit" disabled={processing || !billing.pawapay_configured} className="w-full sm:w-auto">
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Initiating…
                  </>
                ) : (
                  <>Pay {formatZmw(amountDue)} via PawaPay</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {selectedPlan && selectedPlan.features.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Included in {selectedPlan.name}</CardTitle></CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {selectedPlan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5" />
              Transaction History
            </CardTitle>
            <CardDescription>
              Your recent subscription payments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No billing transactions found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                    <tr>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Reference</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Phone</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          {new Date(t.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{t.transaction_number}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {formatZmw(Number(t.amount))}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{t.phone_number || '—'}</td>
                        <td className="px-4 py-3">
                          <Badge 
                            variant={t.status === 'completed' ? 'default' : (t.status === 'failed' ? 'destructive' : 'secondary')}
                            className={t.status === 'completed' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                          >
                            {t.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
