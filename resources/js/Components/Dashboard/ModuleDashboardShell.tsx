import React, { PropsWithChildren, ReactNode } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModuleDashboardShellProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  workspaceLabel?: string;
  heroAccent?: string;
  moduleNav?: ReactNode;
}

export default function ModuleDashboardShell({
  title,
  description,
  actions,
  className,
  workspaceLabel,
  heroAccent = 'from-primary/15 via-primary/5 to-secondary/10',
  moduleNav,
  children,
}: PropsWithChildren<ModuleDashboardShellProps>) {
  return (
    <AppLayout title={title}>
      <Head title={title} />
      <div className={cn('space-y-6', className)}>
        <div
          className={cn(
            'relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br p-6 sm:p-8',
            heroAccent,
          )}
        >
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-background/20 blur-2xl" />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              {workspaceLabel && (
                <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                  {workspaceLabel}
                </div>
              )}
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
              {description && (
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
              )}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
          </div>
        </div>

        {moduleNav}
        {children}
      </div>
    </AppLayout>
  );
}

export function ModuleStatCard({
  label,
  value,
  hint,
  href,
  icon,
  variant = 'default',
}: {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
  icon?: ReactNode;
  variant?: 'default' | 'warning' | 'success';
}) {
  const valueClass =
    variant === 'warning'
      ? 'text-orange-600 dark:text-orange-400'
      : variant === 'success'
        ? 'text-green-600 dark:text-green-400'
        : 'text-foreground';

  const content = (
    <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent/30">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        {icon}
      </div>
      <p className={cn('mt-1 text-2xl font-bold', valueClass)}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export function ModuleWorkflowCard({
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
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
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

export function AttentionBanner({
  title,
  items,
  total,
}: {
  title: string;
  items: Array<{ label: string; href: string; count?: number }>;
  total?: number;
}) {
  if (items.length === 0) return null;

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {title}
          {total != null && total > 0 ? ` (${total})` : ''}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
              {item.count != null ? `${item.count} ` : ''}
              {item.label}
            </Badge>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

export function RecentRows({
  title,
  description,
  emptyMessage,
  rows,
  viewAllHref,
}: {
  title: string;
  description?: string;
  emptyMessage: string;
  rows: Array<{
    id: number | string;
    primary: ReactNode;
    secondary?: ReactNode;
    trailing?: ReactNode;
    href?: string;
  }>;
  viewAllHref?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-sm text-primary hover:underline">
            View all
          </Link>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          rows.map((row) => {
            const body = (
              <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-2 transition-colors hover:bg-accent/30">
                <div className="min-w-0">
                  <div className="font-medium">{row.primary}</div>
                  {row.secondary && (
                    <div className="mt-0.5 text-sm text-muted-foreground">{row.secondary}</div>
                  )}
                </div>
                {row.trailing && <div className="shrink-0 text-right text-sm">{row.trailing}</div>}
              </div>
            );

            return row.href ? (
              <Link key={row.id} href={row.href} className="block">
                {body}
              </Link>
            ) : (
              <div key={row.id}>{body}</div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
