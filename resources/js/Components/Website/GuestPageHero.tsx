import React from 'react';
import GuestFlowIllustration, { GuestFlowType } from '@/Components/Website/GuestFlowIllustration';

interface GuestPageHeroProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  flowType?: GuestFlowType;
}

export default function GuestPageHero({ title, description, icon, flowType }: GuestPageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/5 via-background to-secondary/5 pt-28 pb-12 dark:from-primary/10">
      <div className="pointer-events-none absolute -right-20 top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            {icon && (
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary lg:mx-0">
                {icon}
              </div>
            )}
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
            <p className="mt-3 text-lg text-muted-foreground">{description}</p>
          </div>
          {flowType && (
            <GuestFlowIllustration type={flowType} className="hidden max-h-[200px] sm:block lg:max-h-[220px]" />
          )}
        </div>
      </div>
    </section>
  );
}
