import React, { FormEvent, PropsWithChildren, ReactNode } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import { TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ModuleFormAccent = 'people' | 'time' | 'pay' | 'growth' | 'org' | 'talent' | 'default' | 'crm' | 'finance' | 'projects' | 'commerce' | 'support' | 'ai';

const accentMap: Record<ModuleFormAccent, { hero: string; icon: string; ring: string }> = {
  default: {
    hero: 'from-primary/20 via-primary/5 to-secondary/10',
    icon: 'bg-primary/15 text-primary',
    ring: 'ring-primary/20',
  },
  people: {
    hero: 'from-blue-500/20 via-indigo-500/10 to-violet-500/5',
    icon: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    ring: 'ring-blue-500/20',
  },
  time: {
    hero: 'from-emerald-500/20 via-teal-500/10 to-cyan-500/5',
    icon: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-500/20',
  },
  pay: {
    hero: 'from-amber-500/20 via-orange-500/10 to-yellow-500/5',
    icon: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-500/20',
  },
  growth: {
    hero: 'from-violet-500/20 via-purple-500/10 to-fuchsia-500/5',
    icon: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    ring: 'ring-violet-500/20',
  },
  org: {
    hero: 'from-slate-500/15 via-zinc-500/10 to-stone-500/5',
    icon: 'bg-slate-500/15 text-slate-700 dark:text-slate-300',
    ring: 'ring-slate-500/20',
  },
  talent: {
    hero: 'from-rose-500/20 via-pink-500/10 to-red-500/5',
    icon: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    ring: 'ring-rose-500/20',
  },
  crm: {
    hero: 'from-sky-500/20 via-blue-500/10 to-indigo-500/5',
    icon: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
    ring: 'ring-sky-500/20',
  },
  finance: {
    hero: 'from-emerald-500/20 via-green-500/10 to-lime-500/5',
    icon: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-500/20',
  },
  projects: {
    hero: 'from-orange-500/20 via-amber-500/10 to-yellow-500/5',
    icon: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
    ring: 'ring-orange-500/20',
  },
  commerce: {
    hero: 'from-fuchsia-500/20 via-purple-500/10 to-violet-500/5',
    icon: 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400',
    ring: 'ring-fuchsia-500/20',
  },
  support: {
    hero: 'from-cyan-500/20 via-teal-500/10 to-emerald-500/5',
    icon: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
    ring: 'ring-cyan-500/20',
  },
  ai: {
    hero: 'from-violet-500/25 via-purple-500/15 to-indigo-500/5',
    icon: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    ring: 'ring-violet-500/20',
  },
};

const maxWidthMap = {
  sm: 'max-w-lg',
  md: 'max-w-2xl',
  lg: 'max-w-3xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-5xl',
  '4xl': 'max-w-6xl',
  full: 'max-w-7xl',
};

interface ModuleFormShellProps {
  title: string;
  description?: string;
  backHref: string;
  backLabel?: string;
  icon?: ReactNode;
  accent?: ModuleFormAccent;
  workspaceLabel?: string;
  onSubmit: (e: FormEvent) => void;
  processing?: boolean;
  submitLabel?: string;
  cancelHref?: string;
  cancelLabel?: string;
  maxWidth?: keyof typeof maxWidthMap;
  hideSubmit?: boolean;
  headerExtra?: ReactNode;
  footerHint?: string;
}

export function ModuleFormShell({
  title,
  description,
  backHref,
  backLabel = 'Back',
  icon,
  accent = 'default',
  workspaceLabel = 'Workspace',
  onSubmit,
  processing = false,
  submitLabel = 'Save',
  cancelHref,
  cancelLabel = 'Cancel',
  maxWidth = 'xl',
  hideSubmit = false,
  headerExtra,
  footerHint = 'Changes are saved when you submit this form.',
  children,
}: PropsWithChildren<ModuleFormShellProps>) {
  const styles = accentMap[accent];

  return (
    <AppLayout title={title}>
      <Head title={title} />
      <div className={cn('mx-auto px-4 py-6 sm:px-6 lg:px-8', maxWidthMap[maxWidth])}>
        <form onSubmit={onSubmit} className="space-y-6">
          <div
            className={cn(
              'relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br p-6 shadow-sm sm:p-8',
              styles.hero,
            )}
          >
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-background/20 blur-2xl" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-4">
                {icon && (
                  <div
                    className={cn(
                      'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-4',
                      styles.icon,
                      styles.ring,
                    )}
                  >
                    {icon}
                  </div>
                )}
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5" />
                    {workspaceLabel}
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
                  {description && (
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" asChild className="shrink-0 bg-background/80 backdrop-blur-sm">
                <Link href={backHref}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {backLabel}
                </Link>
              </Button>
            </div>
            {headerExtra && <div className="relative mt-6">{headerExtra}</div>}
          </div>

          <div className="space-y-6">{children}</div>

          {!hideSubmit && (
            <ModuleFormActions
              processing={processing}
              submitLabel={submitLabel}
              cancelHref={cancelHref ?? backHref}
              cancelLabel={cancelLabel}
              footerHint={footerHint}
            />
          )}
        </form>
      </div>
    </AppLayout>
  );
}

export function ModuleFormSection({
  title,
  description,
  icon,
  children,
  className,
}: PropsWithChildren<{
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
}>) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-xl border border-border/70 bg-card/80 shadow-sm backdrop-blur-sm',
        className,
      )}
    >
      <div className="flex items-start gap-4 border-b border-border/60 bg-muted/20 px-5 py-4 sm:px-6">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="font-semibold text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

export function ModuleFormGrid({
  children,
  columns = 2,
  className,
}: PropsWithChildren<{ columns?: 1 | 2 | 3; className?: string }>) {
  return (
    <div
      className={cn(
        'grid gap-5',
        columns === 1 && 'grid-cols-1',
        columns === 2 && 'grid-cols-1 md:grid-cols-2',
        columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ModuleFormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: PropsWithChildren<{
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}>) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function ModuleFormActions({
  processing,
  submitLabel,
  cancelHref,
  cancelLabel = 'Cancel',
  extra,
  footerHint,
}: {
  processing?: boolean;
  submitLabel?: string;
  cancelHref: string;
  cancelLabel?: string;
  extra?: ReactNode;
  footerHint?: string;
}) {
  return (
    <div className="sticky bottom-4 z-10 flex flex-col-reverse gap-3 rounded-xl border border-border/80 bg-background/95 p-4 shadow-lg backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
      <p className="hidden text-xs text-muted-foreground sm:block">{footerHint}</p>
      <div className="flex flex-wrap justify-end gap-2">
        {extra}
        <Button type="button" variant="outline" asChild>
          <Link href={cancelHref}>{cancelLabel}</Link>
        </Button>
        <Button type="submit" disabled={processing} className="min-w-[120px]">
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            submitLabel ?? 'Save'
          )}
        </Button>
      </div>
    </div>
  );
}

export function ModuleFormTabList({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <TabsList
      className={cn(
        'mb-6 flex h-auto w-full flex-wrap justify-start gap-2 rounded-xl border border-border/60 bg-muted/30 p-2',
        className,
      )}
    >
      {children}
    </TabsList>
  );
}

export function ModuleFormTab({ value, children }: { value: string; children: ReactNode }) {
  return (
    <TabsTrigger
      value={value}
      className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
    >
      {children}
    </TabsTrigger>
  );
}

export function ModuleFormHint({ children }: PropsWithChildren) {
  return (
    <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
      {children}
    </div>
  );
}
