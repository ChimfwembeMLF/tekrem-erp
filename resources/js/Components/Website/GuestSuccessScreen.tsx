import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import GuestFlowIllustration from '@/Components/Website/GuestFlowIllustration';
import DocumentCodeStrip from '@/Components/Codes/DocumentCodeStrip';

interface Action {
  label: string;
  href: string;
  variant?: 'default' | 'outline';
}

interface NextStep {
  title: string;
  description: string;
}

interface Props {
  title: string;
  description: string;
  reference?: string;
  referenceLabel?: string;
  nextSteps?: NextStep[];
  primaryAction?: Action;
  secondaryAction?: Action;
  onReset?: () => void;
  resetLabel?: string;
}

export default function GuestSuccessScreen({
  title,
  description,
  reference,
  referenceLabel = 'Reference',
  nextSteps = [],
  primaryAction,
  secondaryAction,
  onReset,
  resetLabel = 'Submit another',
}: Props) {
  return (
    <div className="mx-auto max-w-2xl">
      <Card className="overflow-hidden border-emerald-500/20 shadow-lg">
        <div className="bg-gradient-to-br from-emerald-500/10 via-background to-primary/5 px-6 pt-8 pb-4">
          <GuestFlowIllustration type="success" className="mx-auto max-w-xs border-emerald-500/20" />
          <div className="mt-6 text-center">
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            <p className="mt-2 text-muted-foreground">{description}</p>
            {reference && (
              <div className="mt-4">
                <DocumentCodeStrip
                  label={referenceLabel}
                  value={reference}
                  layout="stack"
                  className="mx-auto max-w-sm border-primary/20 bg-background/90"
                  barcodeHeight={44}
                  qrSize={88}
                />
              </div>
            )}
          </div>
        </div>

        <CardContent className="space-y-6 pt-6">
          {nextSteps.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">What happens next</p>
              <ul className="space-y-2">
                {nextSteps.map((step) => (
                  <li key={step.title} className="flex gap-3 rounded-lg border bg-muted/30 px-4 py-3 text-sm">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <span>
                      <span className="font-medium text-foreground">{step.title}</span>
                      <span className="block text-muted-foreground">{step.description}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            {onReset && (
              <Button type="button" variant="outline" onClick={onReset}>
                {resetLabel}
              </Button>
            )}
            {secondaryAction && (
              <Button asChild variant={secondaryAction.variant ?? 'outline'}>
                <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
              </Button>
            )}
            {primaryAction && (
              <Button asChild className="bg-gradient-to-r from-secondary to-primary">
                <Link href={primaryAction.href}>{primaryAction.label}</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
