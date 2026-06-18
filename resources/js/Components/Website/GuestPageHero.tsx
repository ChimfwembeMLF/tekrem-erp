import React from 'react';

interface GuestPageHeroProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export default function GuestPageHero({ title, description, icon }: GuestPageHeroProps) {
  return (
    <section className="border-b border-border bg-gradient-to-br from-primary/5 via-background to-secondary/5 pt-28 pb-10 dark:from-primary/10 dark:to-secondary/10">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        {icon && (
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{description}</p>
      </div>
    </section>
  );
}
