import React, { PropsWithChildren, ReactNode } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { cn } from '@/lib/utils';

interface ModuleDashboardShellProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export default function ModuleDashboardShell({
  title,
  description,
  actions,
  className,
  children,
}: PropsWithChildren<ModuleDashboardShellProps>) {
  return (
    <AppLayout
      title={title}
      renderHeader={() => (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
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
      ? 'text-orange-600'
      : variant === 'success'
        ? 'text-green-600'
        : 'text-foreground';

  const content = (
    <Card className={href ? 'transition-colors hover:bg-accent/30' : undefined}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', valueClass)}>{value}</div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export function AttentionBanner({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; href: string; count?: number }>;
}) {
  if (items.length === 0) return null;

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
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
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          rows.map((row) => {
            const body = (
              <div className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
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
              <Link key={row.id} href={row.href} className="block rounded-lg hover:bg-accent/40">
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
