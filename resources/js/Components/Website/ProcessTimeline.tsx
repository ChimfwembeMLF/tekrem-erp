import React, { useId } from 'react';
import { cn } from '@/lib/utils';

interface ProcessTimelineProps {
  steps: string[];
  title?: string;
  subtitle?: string;
  className?: string;
}

function StepNode({
  index,
  label,
  size = 'lg',
}: {
  index: number;
  label: string;
  size?: 'lg' | 'md' | 'sm';
}) {
  const sizes = {
    lg: { outer: 'h-14 w-14', inner: 'text-lg', ring: 'ring-4' },
    md: { outer: 'h-12 w-12', inner: 'text-sm', ring: 'ring-2' },
    sm: { outer: 'h-11 w-11', inner: 'text-sm', ring: 'ring-2' },
  };
  const s = sizes[size];

  return (
    <div className="group relative z-10 flex flex-col items-center text-center">
      <div className={cn('relative mb-4 flex items-center justify-center', s.outer)}>
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-secondary/40 to-primary/40 opacity-60 blur-md transition-opacity duration-300 group-hover:opacity-100" />
        <span
          className={cn(
            'relative flex items-center justify-center rounded-full border-2 border-primary/40 bg-background shadow-lg ring-background transition-transform duration-300 group-hover:scale-105',
            s.outer,
            s.ring,
          )}
        >
          <span
            className={cn(
              'bg-gradient-to-br from-secondary to-primary bg-clip-text font-bold text-transparent',
              s.inner,
            )}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
        </span>
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Step {index + 1}
      </p>
      <h3 className="mt-1 font-semibold text-foreground">{label}</h3>
    </div>
  );
}

function ProcessGradientDefs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-stroke`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="hsl(var(--secondary))" />
        <stop offset="45%" stopColor="hsl(var(--primary))" />
        <stop offset="100%" stopColor="hsl(var(--secondary))" />
      </linearGradient>
      <linearGradient id={`${id}-stroke-vertical`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="hsl(var(--secondary))" />
        <stop offset="50%" stopColor="hsl(var(--primary))" />
        <stop offset="100%" stopColor="hsl(var(--secondary) / 0.45)" />
      </linearGradient>
      <filter id={`${id}-glow`} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

/** Horizontal curved connectors between step nodes (desktop) */
function DesktopCurvedPaths({ total, gradientId }: { total: number; gradientId: string }) {
  if (total < 2) return null;

  const paths: string[] = [];
  for (let i = 0; i < total - 1; i++) {
    const x1 = ((i + 0.5) / total) * 100;
    const x2 = ((i + 1.5) / total) * 100;
    const midX = (x1 + x2) / 2;
    const bend = i % 2 === 0 ? 18 : -18;
    paths.push(`M ${x1} 28 Q ${midX} ${28 + bend} ${x2} 28`);
  }

  return (
    <svg
      className="pointer-events-none absolute inset-x-0 top-0 h-24 w-full"
      viewBox="0 0 100 48"
      preserveAspectRatio="none"
      aria-hidden
    >
      <ProcessGradientDefs id={gradientId} />
      {paths.map((d, i) => (
        <g key={i}>
          <path
            d={d}
            fill="none"
            stroke={`url(#${gradientId}-stroke)`}
            strokeWidth="0.35"
            strokeLinecap="round"
            opacity="0.25"
          />
          <path
            d={d}
            fill="none"
            stroke={`url(#${gradientId}-stroke)`}
            strokeWidth="0.65"
            strokeLinecap="round"
            filter={`url(#${gradientId}-glow)`}
            opacity="0.95"
          />
        </g>
      ))}
    </svg>
  );
}

/** Vertical curved spine (mobile) */
function MobileCurvedPaths({
  total,
  gradientId,
  stepHeight = 88,
}: {
  total: number;
  gradientId: string;
  stepHeight?: number;
}) {
  if (total < 2) return null;

  const height = (total - 1) * stepHeight + 40;
  const paths: string[] = [];

  for (let i = 0; i < total - 1; i++) {
    const y1 = 20 + i * stepHeight;
    const y2 = 20 + (i + 1) * stepHeight;
    const midY = (y1 + y2) / 2;
    const bend = i % 2 === 0 ? 14 : -14;
    paths.push(`M 20 ${y1} Q ${20 + bend} ${midY} 20 ${y2}`);
  }

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0 w-10"
      style={{ height }}
      viewBox={`0 0 40 ${height}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <ProcessGradientDefs id={gradientId} />
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={`url(#${gradientId}-stroke-vertical)`}
          strokeWidth="2.5"
          strokeLinecap="round"
          filter={`url(#${gradientId}-glow)`}
          opacity="0.9"
        />
      ))}
    </svg>
  );
}

export default function ProcessTimeline({
  steps,
  title = 'Our process',
  subtitle = 'A clear path from first conversation to delivery — no surprises along the way.',
  className,
}: ProcessTimelineProps) {
  const gradientId = useId().replace(/:/g, '');
  const total = steps.length;

  return (
    <section className={cn('relative overflow-hidden', className)}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-72 w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/15 via-secondary/10 to-transparent blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <div className="mb-12 text-center md:mb-16">
          <span className="mb-3 inline-flex items-center rounded-full border border-primary/25 bg-gradient-to-r from-secondary/10 to-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            How we work
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{title}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{subtitle}</p>
        </div>

        {/* Desktop / tablet — curved horizontal flow */}
        <div className="hidden md:block">
          <div className="relative px-2 pb-4 pt-6">
            <DesktopCurvedPaths total={total} gradientId={gradientId} />
            <ol
              className="relative grid gap-6"
              style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
            >
              {steps.map((step, index) => (
                <li key={step}>
                  <StepNode index={index} label={step} size="lg" />
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Mobile — vertical curved spine */}
        <div className="relative md:hidden">
          <MobileCurvedPaths total={total} gradientId={`${gradientId}-mobile`} />
          <ol className="relative space-y-0 pl-1">
            {steps.map((step, index) => (
              <li key={step} className="relative flex gap-5 pb-8 last:pb-0">
                <div className="relative z-10 flex h-[3.25rem] w-[3.25rem] shrink-0 items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-gradient-to-br from-secondary/30 to-primary/30 blur-sm" />
                  <span className="relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-primary/50 bg-background text-sm font-bold text-primary shadow-sm ring-2 ring-secondary/20">
                    {index + 1}
                  </span>
                </div>
                <div className="min-w-0 flex-1 rounded-xl border border-primary/15 bg-card/95 p-4 shadow-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Step {index + 1} of {total}
                  </p>
                  <h3 className="mt-1 font-semibold text-foreground">{step}</h3>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground md:mt-14">
          <span className="h-px w-10 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <span>Typical engagement — timeline varies by project scope</span>
          <span className="h-px w-10 bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />
        </div>
      </div>
    </section>
  );
}
