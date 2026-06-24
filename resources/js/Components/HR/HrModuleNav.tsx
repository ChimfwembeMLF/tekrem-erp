import React from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { useHrNavigation } from '@/Components/HR/hrNavigation';

export default function HrModuleNav() {
  const { groups, isActive } = useHrNavigation();

  return (
    <nav
      aria-label="HR modules"
      className="overflow-x-auto rounded-xl border border-border/60 bg-card/80 p-2 shadow-sm backdrop-blur-sm"
    >
      <div className="flex min-w-max flex-wrap items-center gap-1">
        {groups.map((group, groupIndex) => (
          <React.Fragment key={group.label}>
            {groupIndex > 0 && (
              <span className="mx-1 hidden h-4 w-px shrink-0 bg-border sm:block" aria-hidden />
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.pattern);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
}
