import React, { PropsWithChildren, ReactNode } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';

interface HrPageShellProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export default function HrPageShell({
  title,
  description,
  actions,
  className,
  children,
}: PropsWithChildren<HrPageShellProps>) {
  return (
    <AppLayout
      title={title}
      renderHeader={() => (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
    >
      <Head title={title} />
      <div className={cn('space-y-6', className)}>{children}</div>
    </AppLayout>
  );
}

export function HrStatCard({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
}) {
  const content = (
    <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/30">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export function HrWorkflowCard({
  title,
  description,
  stats,
  href,
  icon,
}: {
  title: string;
  description: string;
  stats: { label: string; value: number | string }[];
  href: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      <h3 className="font-semibold text-foreground group-hover:text-primary">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 flex flex-wrap gap-4">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-lg font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </Link>
  );
}
