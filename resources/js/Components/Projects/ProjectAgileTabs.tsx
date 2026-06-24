import React from 'react';
import { Link } from '@inertiajs/react';
import {
  LayoutDashboard,
  Kanban,
  Zap,
  Layers,
  Target,
  Package,
  Boxes,
  ListTodo,
  FileText,
  Clock,
  MessageSquare,
  Milestone,
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { cn } from '@/lib/utils';

export type ProjectTab =
  | 'overview'
  | 'board'
  | 'backlog'
  | 'sprints'
  | 'tasks'
  | 'milestones'
  | 'milestone-board'
  | 'epics'
  | 'releases'
  | 'time'
  | 'files'
  | 'chat'
  | 'settings';

interface TabDef {
  id: ProjectTab;
  label: string;
  icon: React.ElementType;
  href: string;
  hidden?: boolean;
}

interface ProjectTabsProps {
  projectId: number;
  boardId?: number;
  active: ProjectTab;
  enableBoards?: boolean;
  enableMilestones?: boolean;
  className?: string;
}

export default function ProjectTabs({
  projectId,
  boardId,
  active,
  enableBoards = true,
  enableMilestones = true,
  className,
}: ProjectTabsProps) {
  const route = useRoute();

  const boardHref = boardId
    ? route('agile.board.show', boardId)
    : route('agile.boards.create', projectId);

  const groups: Array<{ label: string; tabs: TabDef[] }> = [
    {
      label: 'Plan',
      tabs: [
        {
          id: 'overview',
          label: 'Overview',
          icon: LayoutDashboard,
          href: route('projects.show', projectId),
        },
        {
          id: 'milestones',
          label: 'Milestones',
          icon: Target,
          href: route('projects.milestones.index', projectId),
          hidden: !enableMilestones,
        },
        {
          id: 'milestone-board',
          label: 'Milestone board',
          icon: Milestone,
          href: route('projects.kanban', projectId),
          hidden: !enableMilestones,
        },
        {
          id: 'epics',
          label: 'Epics',
          icon: Boxes,
          href: route('agile.epics.index', projectId),
          hidden: !enableBoards,
        },
        {
          id: 'releases',
          label: 'Releases',
          icon: Package,
          href: route('agile.releases.index', projectId),
          hidden: !enableBoards,
        },
      ],
    },
    {
      label: 'Execute',
      tabs: [
        {
          id: 'board',
          label: 'Board',
          icon: Kanban,
          href: boardHref,
          hidden: !enableBoards,
        },
        {
          id: 'backlog',
          label: 'Backlog',
          icon: Layers,
          href: route('agile.backlog.index', projectId),
          hidden: !enableBoards,
        },
        {
          id: 'sprints',
          label: 'Sprints',
          icon: Zap,
          href: route('agile.sprints.index', projectId),
          hidden: !enableBoards,
        },
        {
          id: 'tasks',
          label: 'Tasks',
          icon: ListTodo,
          href: route('projects.tasks.index', projectId),
        },
      ],
    },
    {
      label: 'Track',
      tabs: [
        {
          id: 'time',
          label: 'Time',
          icon: Clock,
          href: route('projects.time-logs.index', projectId),
        },
        {
          id: 'files',
          label: 'Files',
          icon: FileText,
          href: route('projects.files.index', projectId),
        },
        {
          id: 'chat',
          label: 'Chat',
          icon: MessageSquare,
          href: route('projects.livechat', projectId),
        },
      ],
    },
  ];

  if (boardId) {
    groups.push({
      label: '',
      tabs: [
        {
          id: 'settings',
          label: 'Board settings',
          icon: Kanban,
          href: route('agile.board.settings', boardId),
        },
      ],
    });
  }

  return (
    <nav
      className={cn('mb-6 overflow-x-auto border-b border-border', className)}
      aria-label="Project navigation"
    >
      <div className="flex min-w-max flex-col gap-3 pb-px sm:flex-row sm:items-end sm:gap-6">
        {groups.map((group) => {
          const visibleTabs = group.tabs.filter((tab) => !tab.hidden);
          if (visibleTabs.length === 0) {
            return null;
          }

          return (
            <div key={group.label || 'settings'} className="flex flex-col gap-1">
              {group.label && (
                <span className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </span>
              )}
              <div className="flex gap-1">
                {visibleTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = active === tab.id;

                  return (
                    <Link
                      key={tab.id}
                      href={tab.href}
                      className={cn(
                        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-t-md border-b-2 px-3 py-2 text-sm font-medium transition-colors',
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
            </div>
          );
        })}
      </div>
    </nav>
  );
}

// Backward-compatible export name
export { ProjectTabs as ProjectAgileTabs };
