import React from 'react';
import { Link } from '@inertiajs/react';
import { FolderOpen, CheckSquare, Layout, Tag } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { cn } from '@/lib/utils';

export type ProjectsWorkTab = 'projects' | 'my-tasks';
export type ProjectsLibraryTab = 'templates' | 'tags';

interface TabDef {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
}

interface TabGroupProps<T extends string> {
  active: T;
  tabs: TabDef[];
  'aria-label': string;
}

function TabGroup<T extends string>({ active, tabs, 'aria-label': ariaLabel }: TabGroupProps<T>) {
  return (
    <nav className="mb-6 overflow-x-auto border-b border-border" aria-label={ariaLabel}>
      <div className="flex min-w-max gap-1 pb-px">
        {tabs.map((tab) => {
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
    </nav>
  );
}

export function ProjectsWorkTabs({ active }: { active: ProjectsWorkTab }) {
  const route = useRoute();

  return (
    <TabGroup
      active={active}
      aria-label="Projects work navigation"
      tabs={[
        {
          id: 'projects',
          label: 'All Projects',
          icon: FolderOpen,
          href: route('projects.index'),
        },
        {
          id: 'my-tasks',
          label: 'My Tasks',
          icon: CheckSquare,
          href: route('projects.my-tasks'),
        },
      ]}
    />
  );
}

export function ProjectsLibraryTabs({ active }: { active: ProjectsLibraryTab }) {
  const route = useRoute();

  return (
    <TabGroup
      active={active}
      aria-label="Projects library navigation"
      tabs={[
        {
          id: 'templates',
          label: 'Templates',
          icon: Layout,
          href: route('projects.templates.index'),
        },
        {
          id: 'tags',
          label: 'Tags',
          icon: Tag,
          href: route('projects.tags.index'),
        },
      ]}
    />
  );
}
