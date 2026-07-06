import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { ArrowLeft, Building2, CreditCard, ExternalLink, Globe } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { formatZmw } from '@/lib/formatCurrency';

interface TenantAccess {
  host: string | null;
  url: string | null;
  type: 'subdomain' | 'custom_domain' | null;
}

interface TenantRouting {
  configured: boolean;
  app_domain: string | null;
  central_domains: string[];
  example_host: string | null;
}

interface Props {
  organization: {
    id: number;
    name: string;
    slug: string;
    subdomain: string | null;
    email: string | null;
    status: string;
    trial_ends_at: string | null;
    users_count: number;
    owner: { id: number; name: string; email: string } | null;
    plan: { id: number; name: string; slug: string } | null;
    subscription: { status: string; billing_cycle: string; current_period_end: string | null } | null;
    users: Array<{ id: number; name: string; email: string; role: string }>;
    subscriptions: Array<{
      id: number;
      status: string;
      billing_cycle: string;
      plan: string | null;
      current_period_start: string | null;
      current_period_end: string | null;
    }>;
    branding: Record<string, unknown> | null;
    tenant: TenantAccess;
  };
  plans: Array<{ id: number; name: string; slug: string; price_monthly: string; price_yearly: string; currency: string }>;
  tenantRouting: TenantRouting;
}

export default function OrganizationShow({ organization, plans, tenantRouting }: Props) {
  const route = useRoute();
  const [status, setStatus] = React.useState(organization.status);
  const [planId, setPlanId] = React.useState(String(organization.plan?.id ?? plans[0]?.id ?? ''));
  const [billingCycle, setBillingCycle] = React.useState(organization.subscription?.billing_cycle ?? 'monthly');

  const updateStatus = () => {
    router.patch(route('admin.platform.organizations.status', organization.id), { status }, { preserveScroll: true });
  };

  const changePlan = () => {
    router.post(route('admin.platform.organizations.plan', organization.id), {
      billing_plan_id: Number(planId),
      billing_cycle: billingCycle,
    }, { preserveScroll: true });
  };

  return (
    <AppLayout title={organization.name}>
      <Head title={organization.name} />

      <div className="mx-auto max-w-7xl space-y-6 py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
              <Link href={route('admin.platform.organizations.index')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                All organizations
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              {organization.name}
            </h1>
            <p className="text-muted-foreground">{organization.slug}{organization.subdomain ? ` · ${organization.subdomain}` : ''}</p>
          </div>
          <Badge className="capitalize">{organization.status}</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4" />
              Tenant access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {organization.tenant.url ? (
              <>
                <p>
                  {organization.tenant.type === 'custom_domain' ? 'Custom domain' : 'Subdomain'}:{' '}
                  <a
                    href={organization.tenant.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                  >
                    {organization.tenant.host}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
                <p className="text-muted-foreground">
                  Opens this organization when users visit that host (via <code className="text-xs">OrganizationResolver</code>).
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">
                Tenant URL unavailable. Set <code className="text-xs">ORGANIZATION_APP_DOMAIN</code> in <code className="text-xs">.env</code>
                {tenantRouting.example_host ? (
                  <> — expected format: <strong>{organization.subdomain ?? organization.slug}.{tenantRouting.app_domain}</strong></>
                ) : null}
                .
              </p>
            )}
            {!tenantRouting.configured && (
              <p className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-muted-foreground">
                See <code className="text-xs">.env.example</code> for local wildcard setup with Valet/nginx and <code className="text-xs">/etc/hosts</code>.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Subscription</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>Current plan: <strong>{organization.plan?.name ?? 'None'}</strong></p>
              {organization.subscription && (
                <>
                  <p>Billing: <strong className="capitalize">{organization.subscription.billing_cycle}</strong></p>
                  <p>Renews: {organization.subscription.current_period_end ? new Date(organization.subscription.current_period_end).toLocaleDateString() : '—'}</p>
                </>
              )}
              <div className="space-y-2 border-t pt-4">
                <Label>Change plan</Label>
                <p className="text-xs text-muted-foreground">Admin override — tenants pay via PawaPay at Organization → Billing.</p>
                <Select value={planId} onValueChange={setPlanId}>
                  <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                  <SelectContent>
                    {plans.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name} — {formatZmw(Number(p.price_monthly))}/mo
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={billingCycle} onValueChange={setBillingCycle}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={changePlan}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Apply plan
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Status</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" onClick={updateStatus}>Update status</Button>
              {organization.trial_ends_at && (
                <p className="text-sm text-muted-foreground">
                  Trial ends {new Date(organization.trial_ends_at).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Members ({organization.users.length})</CardTitle></CardHeader>
          <CardContent>
            <ul className="divide-y text-sm">
              {organization.users.map((user) => (
                <li key={user.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant="outline" className="capitalize">{user.role}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
