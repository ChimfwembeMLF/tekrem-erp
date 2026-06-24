import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { ChevronRight, Edit, MessageSquare, Settings } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import usePermissions from '@/Hooks/usePermissions';
import ProjectTabs, { ProjectTab } from '@/Components/Projects/ProjectAgileTabs';

interface ProjectSummary {
  id: number;
  name: string;
  status?: string;
  priority?: string;
  category?: string;
  enable_boards?: boolean;
  enable_milestones?: boolean;
}

interface Props {
  project: ProjectSummary;
  boardId?: number;
  activeTab: ProjectTab;
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  active: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'on-hold': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const priorityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export default function ProjectShowLayout({
  project,
  boardId,
  activeTab,
  title,
  actions,
  children,
}: Props) {
  const route = useRoute();
  const { hasPermission } = usePermissions();
  const pageTitle = title ?? project.name;

  return (
    <AppLayout
      title={pageTitle}
      renderHeader={() => (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Link href={route('projects.index')} className="hover:text-foreground">
                Projects
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="truncate">{project.name}</span>
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">{project.name}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge className={statusColors[project.status || 'draft']}>
                {(project.status || 'draft').replace('-', ' ')}
              </Badge>
              <Badge className={priorityColors[project.priority || 'medium']}>
                {project.priority || 'medium'} priority
              </Badge>
              {project.category && <Badge variant="outline">{project.category}</Badge>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {actions}
            {activeTab !== 'chat' && (
              <Button variant="outline" size="sm" asChild>
                <Link href={route('projects.livechat', project.id)}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Chat
                </Link>
              </Button>
            )}
            {hasPermission('projects.edit') && (
              <Button variant="outline" size="icon" className="h-9 w-9" asChild title="Project settings">
                <Link href={route('projects.edit', project.id)}>
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
            )}
            {hasPermission('projects.edit') && (
              <Button size="sm" asChild>
                <Link href={route('projects.edit', project.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    >
      <Head title={pageTitle} />
      <ProjectTabs
        projectId={project.id}
        boardId={boardId}
        active={activeTab}
        enableBoards={project.enable_boards ?? true}
        enableMilestones={project.enable_milestones ?? true}
      />
      <div className="pb-8">{children}</div>
    </AppLayout>
  );
}
