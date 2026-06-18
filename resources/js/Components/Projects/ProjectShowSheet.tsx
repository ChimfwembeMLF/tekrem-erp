import React from 'react';
import { router } from '@inertiajs/react';
import {
  Sheet,
  SheetContent,
} from '@/Components/ui/sheet';
import { cn } from '@/lib/utils';

type SheetSize = 'md' | 'lg' | 'xl' | 'full';

interface ProjectShowSheetProps {
  children: React.ReactNode;
  backUrl: string;
  size?: SheetSize;
  className?: string;
}

const sizeClasses: Record<SheetSize, string> = {
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
  full: 'sm:max-w-6xl',
};

export function ProjectShowSheet({
  children,
  backUrl,
  size = 'xl',
  className,
}: ProjectShowSheetProps) {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.visit(backUrl);
    }
  };

  return (
    <Sheet open onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          'flex h-full w-full flex-col gap-0 overflow-hidden p-0',
          sizeClasses[size],
          className,
        )}
      >
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
