import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/Components/ui/badge';
import DocumentCodeStrip from '@/Components/Codes/DocumentCodeStrip';

interface GuestStatusResultProps {
  title?: string;
  reference: string;
  status: string;
  statusLabel?: string;
  fields: Array<{ label: string; value: React.ReactNode }>;
  nextMessage?: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  new: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  open: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  in_progress: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
  pending: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
  resolved: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  closed: 'bg-muted text-muted-foreground',
  paid: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
};

export default function GuestStatusResult({
  title,
  reference,
  status,
  statusLabel,
  fields,
  nextMessage,
  className,
}: GuestStatusResultProps) {
  const badgeClass = statusStyles[status] ?? 'bg-muted text-foreground';

  return (
    <div className={cn('animate-in fade-in slide-in-from-bottom-2 duration-300', className)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="font-mono text-sm text-muted-foreground">{reference}</p>
        </div>
        <Badge className={cn('capitalize', badgeClass)}>{statusLabel ?? status.replace(/_/g, ' ')}</Badge>
      </div>

      <DocumentCodeStrip
        label="Reference"
        value={reference}
        layout="row"
        className="mb-4"
        barcodeHeight={40}
        qrSize={80}
      />

      <dl className="grid gap-4 sm:grid-cols-2">
        {fields.map(({ label, value }) => (
          <div key={label} className="rounded-lg border bg-muted/20 px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
          </div>
        ))}
      </dl>

      {nextMessage && (
        <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
          {nextMessage}
        </div>
      )}
    </div>
  );
}

export function statusNextMessage(status: string, type: 'inquiry' | 'quote' | 'ticket' | 'project'): string {
  const messages: Record<string, Record<string, string>> = {
    inquiry: {
      new: 'Your inquiry is in our queue. We typically respond within one business day.',
      in_progress: 'Our team is reviewing your message and will reply soon.',
      resolved: 'This inquiry has been resolved. Reply to the same thread if you need more help.',
      closed: 'This inquiry is closed. Submit a new one if you need further assistance.',
    },
    quote: {
      new: 'We are reviewing your requirements and preparing a quote.',
      in_progress: 'Your quote is being finalized — watch your email for updates.',
      resolved: 'Your quote has been sent. Check your email for the full proposal.',
    },
    ticket: {
      open: 'Your ticket is open. An agent will be assigned shortly.',
      in_progress: 'We are working on your issue and will update you here.',
      resolved: 'This ticket is resolved. Reopen by replying if the issue persists.',
      closed: 'This ticket is closed.',
    },
    project: {
      new: 'A consultant will review your project brief and contact you.',
      in_progress: 'We are preparing a tailored proposal for your project.',
    },
  };

  return messages[type][status] ?? 'Thank you for your patience.';
}
