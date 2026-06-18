import React from 'react';
import { Link } from '@inertiajs/react';
import {
  LayoutDashboard,
  Kanban,
  Zap,
  Layers,
  Target,
  Package,
  ListTodo,
  FileText,
  Clock,
  Settings,
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { cn } from '@/lib/utils';

export type ProjectAgileTab =
  | 'project'
  | 'board'
  | 'sprints'
  | 'backlog'
  | 'epics'
  | 'releases'
  | 'tasks'
  | 'files'
  | 'time'
  | 'settings';

interface ProjectAgileTabsProps {
  projectId: number;
  boardId?: number;
  active: ProjectAgileTab;
  className?: string;
}

export default function ProjectAgileTabs({
  projectId,
  boardId,
  active,
  className,
}: ProjectAgileTabsProps) {
  const route = useRoute();

  const tabs: Array<{
    id: ProjectAgileTab;
    label: string;
    icon: React.ElementType;
    href: string;
    requiresBoard?: boolean;
  }> = [
    {
      id: 'project',
      label: 'Overview',
      icon: LayoutDashboard,
      href: route('projects.show', projectId),
    },
    {
      id: 'board',
      label: 'Board',
      icon: Kanban,
      href: boardId ? route('agile.board.show', boardId) : route('projects.kanban', projectId),
    },
    {
      id: 'sprints',
      label: 'Sprints',
      icon: Zap,
      href: route('agile.sprints.index', projectId),
    },
    {
      id: 'backlog',
      label: 'Backlog',
      icon: Layers,
      href: route('agile.backlog.index', projectId),
    },
    {
      id: 'epics',
      label: 'Epics',
      icon: Target,
      href: route('agile.epics.index', projectId),
    },
    {
      id: 'releases',
      label: 'Releases',
      icon: Package,
      href: route('agile.releases.index', projectId),
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: ListTodo,
      href: route('projects.tasks.index', projectId),
    },
    {
      id: 'files',
      label: 'Files',
      icon: FileText,
      href: route('projects.files.index', projectId),
    },
    {
      id: 'time',
      label: 'Time',
      icon: Clock,
      href: route('projects.time-logs.index', projectId),
    },
  ];

  if (boardId) {
    tabs.push({
      id: 'settings',
      label: 'Board settings',
      icon: Settings,
      href: route('agile.board.settings', boardId),
      requiresBoard: true,
    });
  }

  return (
    <nav
      className={cn(
        'mb-4 overflow-x-auto border-b border-border',
        className,
      )}
      aria-label="Project agile navigation"
    >
      <div className="flex min-w-max gap-1 pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                'inline-flex items-center gap-1.5 whitespace-nowrap rounded-t-md border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
