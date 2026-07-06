import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Building2, CreditCard, Eye, ExternalLink } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface TenantAccess {
  host: string | null;
  url: string | null;
  type: 'subdomain' | 'custom_domain' | null;
}

interface OrganizationRow {
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
  tenant: TenantAccess;
}

interface TenantRouting {
  configured: boolean;
  app_domain: string | null;
  central_domains: string[];
  example_host: string | null;
}

interface Props {
  organizations: OrganizationRow[];
  plans: Array<{ id: number; name: string; slug: string }>;
  tenantRouting: TenantRouting;
}

export default function OrganizationsIndex({ organizations, tenantRouting }: Props) {
  const route = useRoute();

  const statusVariant = (status: string) => {
    if (status === 'active') return 'default';
    if (status === 'trial') return 'secondary';
    if (status === 'suspended') return 'destructive';
    return 'outline';
  };

  return (
    <AppLayout title="Organizations">
      <Head title="Organizations" />

      <div className="mx-auto max-w-6xl space-y-6 py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Organizations</h1>
            <p className="text-muted-foreground">Tenants on the platform — billing, status, and members.</p>
          </div>
          <Button asChild>
            <Link href={route('admin.platform.organizations.create')}>
              <Building2 className="mr-2 h-4 w-4" />
              Create organization
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={route('admin.platform.plans.index')}>
              <CreditCard className="mr-2 h-4 w-4" />
              Billing plans
            </Link>
          </Button>
        </div>

        {!tenantRouting.configured && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Set <code className="text-xs">ORGANIZATION_APP_DOMAIN</code> in <code className="text-xs">.env</code> to
              enable tenant subdomain URLs. See <code className="text-xs">.env.example</code> for local setup with{' '}
              <code className="text-xs">erp.test</code>.
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5" />
              Tenants ({organizations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Tenant URL</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <p className="font-medium">{org.name}</p>
                      <p className="text-xs text-muted-foreground">{org.slug}{org.subdomain ? ` · ${org.subdomain}` : ''}</p>
                    </TableCell>
                    <TableCell className="text-sm">
                      {org.tenant.url ? (
                        <a
                          href={org.tenant.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          {org.tenant.host}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">Configure ORGANIZATION_APP_DOMAIN</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {org.owner ? (
                        <>
                          <p>{org.owner.name}</p>
                          <p className="text-xs text-muted-foreground">{org.owner.email}</p>
                        </>
                      ) : '—'}
                    </TableCell>
                    <TableCell>{org.plan?.name ?? '—'}</TableCell>
                    <TableCell>{org.users_count}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(org.status)} className="capitalize">{org.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={route('admin.platform.organizations.show', org.id)}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
