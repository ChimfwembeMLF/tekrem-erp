import React from 'react';
import { cn } from '@/lib/utils';
import GuestFlowIllustration, { GuestFlowType } from '@/Components/Website/GuestFlowIllustration';
import { Check } from 'lucide-react';

interface GuestFlowShellProps {
  flowType: GuestFlowType;
  steps: string[];
  currentStep?: number;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export default function GuestFlowShell({
  flowType,
  steps,
  currentStep = 0,
  title,
  description,
  children,
  className,
}: GuestFlowShellProps) {
  return (
    <section className={cn('border-b border-border bg-muted/20 py-12 lg:py-16', className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 lg:mb-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">How it works</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
        </div>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <GuestFlowIllustration type={flowType} className="mb-8" />
            <ol className="space-y-3">
              {steps.map((step, index) => {
                const done = index < currentStep;
                const active = index === currentStep;
                return (
                  <li
                    key={step}
                    className={cn(
                      'flex items-start gap-3 rounded-xl border px-4 py-3 transition-colors',
                      active && 'border-primary/40 bg-primary/5 shadow-sm',
                      done && 'border-emerald-500/30 bg-emerald-500/5',
                      !active && !done && 'border-border/60 bg-card/50',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                        done && 'bg-emerald-600 text-white',
                        active && !done && 'bg-primary text-primary-foreground',
                        !active && !done && 'bg-muted text-muted-foreground',
                      )}
                    >
                      {done ? <Check className="h-4 w-4" /> : index + 1}
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Step {index + 1}
                      </p>
                      <p className="font-medium text-foreground">{step}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="lg:col-span-7">{children}</div>
        </div>
      </div>
    </section>
  );
}
