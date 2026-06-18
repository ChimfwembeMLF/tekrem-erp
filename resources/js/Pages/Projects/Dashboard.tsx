import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import { Plus, BarChart3, AlertTriangle, FolderOpen } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import usePermissions from '@/Hooks/usePermissions';
import { Project, ProjectAnalytics } from '@/types';
import ModuleDashboardShell, {
  ModuleStatCard,
  AttentionBanner,
  RecentRows,
} from '@/Components/Dashboard/ModuleDashboardShell';

interface ProjectsDashboardProps {
  analytics: ProjectAnalytics;
  recentProjects: Project[];
  overdueProjects: Project[];
  upcomingDeadlines: Project[];
}

const statusColors: Record<string, string> = {
  active: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  'on-hold': 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function ProjectsDashboard({
  analytics,
  recentProjects,
  overdueProjects,
  upcomingDeadlines,
}: ProjectsDashboardProps) {
  const route = useRoute();
  const { hasPermission } = usePermissions();

  const a = analytics ?? {
    total_projects: 0,
    active_projects: 0,
    completed_projects: 0,
    overdue_projects: 0,
  };

  return (
    <ModuleDashboardShell
      title="Projects"
      description="Delivery status, deadlines, and portfolio health"
      actions={
        <>
          <Button variant="outline" asChild>
            <Link href={route('projects.analytics')}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Link>
          </Button>
          {hasPermission('projects.create') && (
            <Button asChild>
              <Link href={route('projects.create')}>
                <Plus className="mr-2 h-4 w-4" />
                New project
              </Link>
            </Button>
          )}
        </>
      }
    >
      <AttentionBanner
        title="Needs attention"
        items={[
          ...(a.overdue_projects > 0
            ? [{ label: 'overdue projects', href: route('projects.index'), count: a.overdue_projects }]
            : []),
        ]}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <ModuleStatCard label="Total" value={a.total_projects} icon={<FolderOpen className="h-4 w-4 text-muted-foreground" />} />
        <ModuleStatCard label="Active" value={a.active_projects} />
        <ModuleStatCard label="Completed" value={a.completed_projects} variant="success" />
        <ModuleStatCard
          label="Overdue"
          value={a.overdue_projects}
          variant={a.overdue_projects ? 'warning' : 'default'}
          icon={<AlertTriangle className="h-4 w-4 text-orange-600" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentRows
          title="Overdue"
          emptyMessage="No overdue projects."
          rows={overdueProjects.map((project) => ({
            id: project.id,
            href: route('projects.show', project.id),
            primary: project.name,
            secondary: project.client?.name ?? 'No client',
            trailing: <Badge className="bg-red-100 text-red-800">{Math.abs(project.days_remaining || 0)}d overdue</Badge>,
          }))}
        />

        <RecentRows
          title="Due in 30 days"
          emptyMessage="No upcoming deadlines."
          rows={upcomingDeadlines.map((project) => ({
            id: project.id,
            href: route('projects.show', project.id),
            primary: project.name,
            secondary: `${project.days_remaining} days left`,
            trailing: (
              <div className="w-24">
                <Progress value={project.progress} className="h-1.5" />
                <p className="mt-1 text-xs text-muted-foreground">{project.progress}%</p>
              </div>
            ),
          }))}
        />
      </div>

      <RecentRows
        title="Recent projects"
        emptyMessage="No projects yet."
        rows={recentProjects.map((project) => ({
          id: project.id,
          href: route('projects.show', project.id),
          primary: project.name,
          secondary: project.client?.name ?? 'No client',
          trailing: <Badge className={statusColors[project.status] || 'bg-muted'}>{project.status}</Badge>,
        }))}
      />
    </ModuleDashboardShell>
  );
}
