import React, { ReactNode } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ChevronRight } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import {
  ProjectsLibraryTabs,
  ProjectsLibraryTab,
  ProjectsWorkTabs,
  ProjectsWorkTab,
} from '@/Components/Projects/ProjectsModuleTabs';

interface Props {
  title: string;
  description?: string;
  actions?: ReactNode;
  workTab?: ProjectsWorkTab;
  libraryTab?: ProjectsLibraryTab;
  children: ReactNode;
}

export default function ProjectsModuleLayout({
  title,
  description,
  actions,
  workTab,
  libraryTab,
  children,
}: Props) {
  const route = useRoute();

  return (
    <AppLayout
      title={title}
      renderHeader={() => (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Link href={route('projects.index')} className="hover:text-foreground">
                Projects
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="truncate">{title}</span>
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
    >
      <Head title={title} />
      {workTab && <ProjectsWorkTabs active={workTab} />}
      {libraryTab && <ProjectsLibraryTabs active={libraryTab} />}
      <div className="pb-8">{children}</div>
    </AppLayout>
  );
}
