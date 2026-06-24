import React, { PropsWithChildren, ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import HrModuleNav from '@/Components/HR/HrModuleNav';
import ModuleDashboardShell, {
  ModuleStatCard,
  ModuleWorkflowCard,
} from '@/Components/Dashboard/ModuleDashboardShell';
import { cn } from '@/lib/utils';

interface HrPageShellProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  hideModuleNav?: boolean;
}

export default function HrPageShell({
  title,
  description,
  actions,
  className,
  hideModuleNav = false,
  children,
}: PropsWithChildren<HrPageShellProps>) {
  return (
    <ModuleDashboardShell
      title={title}
      description={description}
      actions={actions}
      workspaceLabel="People operations"
      heroAccent="from-blue-500/15 via-indigo-500/8 to-violet-500/5"
      moduleNav={!hideModuleNav ? <HrModuleNav /> : undefined}
      className={className}
    >
      {children}
    </ModuleDashboardShell>
  );
}

export const HrStatCard = ModuleStatCard;
export const HrWorkflowCard = ModuleWorkflowCard;
