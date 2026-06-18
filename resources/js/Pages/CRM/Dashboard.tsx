import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Plus, Users, UserPlus } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import ModuleDashboardShell, { ModuleStatCard, RecentRows } from '@/Components/Dashboard/ModuleDashboardShell';

interface Client {
  id: number;
  name: string;
  email: string | null;
  status: string;
}

interface Lead {
  id: number;
  name: string;
  email: string | null;
  status: string;
  source: string | null;
}

interface DashboardProps {
  stats: {
    totalClients: number;
    totalLeads: number;
    leadsByStatus: Array<{ status: string; count: number }>;
    clientsByStatus: Array<{ status: string; count: number }>;
  };
  recentClients: Client[];
  recentLeads: Lead[];
}

export default function Dashboard({ stats, recentClients, recentLeads }: DashboardProps) {
  const route = useRoute();

  const qualifiedLeads = stats.leadsByStatus.find((s) => s.status === 'qualified')?.count || 0;
  const activeClients = stats.clientsByStatus.find((s) => s.status === 'active')?.count || 0;

  return (
    <ModuleDashboardShell
      title="CRM"
      description="Clients, leads, and pipeline activity"
      actions={
        <>
          <Button variant="outline" asChild>
            <Link href={route('crm.leads.create')}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add lead
            </Link>
          </Button>
          <Button asChild>
            <Link href={route('crm.clients.create')}>
              <Plus className="mr-2 h-4 w-4" />
              Add client
            </Link>
          </Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        <ModuleStatCard label="Clients" value={stats.totalClients} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
        <ModuleStatCard label="Active clients" value={activeClients} variant="success" />
        <ModuleStatCard label="Leads" value={stats.totalLeads} />
        <ModuleStatCard label="Qualified leads" value={qualifiedLeads} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentRows
          title="Recent clients"
          emptyMessage="No clients yet."
          rows={recentClients.map((client) => ({
            id: client.id,
            href: route('crm.clients.show', client.id),
            primary: client.name,
            secondary: client.email ?? 'No email',
            trailing: <Badge variant="outline">{client.status}</Badge>,
          }))}
        />

        <RecentRows
          title="Recent leads"
          emptyMessage="No leads yet."
          rows={recentLeads.map((lead) => ({
            id: lead.id,
            href: route('crm.leads.show', lead.id),
            primary: lead.name,
            secondary: lead.source ?? 'Unknown source',
            trailing: <Badge variant="outline">{lead.status}</Badge>,
          }))}
        />
      </div>
    </ModuleDashboardShell>
  );
}
