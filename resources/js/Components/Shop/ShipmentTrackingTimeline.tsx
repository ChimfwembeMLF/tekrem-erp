import React from 'react';
import { Check, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SHIPMENT_CHECKPOINTS,
  ShipmentEventLike,
  checkpointProgressIndex,
  shipmentStatusLabel,
  sortEventsChronologically,
} from '@/lib/shipmentStatuses';

interface Props {
  currentStatus: string;
  events: ShipmentEventLike[];
  showStepper?: boolean;
}

export default function ShipmentTrackingTimeline({
  currentStatus,
  events,
  showStepper = true,
}: Props) {
  const chronological = sortEventsChronologically(events);
  const progressIndex = checkpointProgressIndex(currentStatus);
  const isCancelled = currentStatus === 'cancelled';

  return (
    <div className="space-y-6">
      {showStepper && !isCancelled && (
        <div className="overflow-x-auto pb-2">
          <ol className="flex min-w-[640px] items-center justify-between gap-1">
            {SHIPMENT_CHECKPOINTS.map((step, index) => {
              const completed = index < progressIndex;
              const active = index === progressIndex;

              return (
                <li key={step.status} className="flex flex-1 flex-col items-center gap-2 text-center">
                  <div className="flex w-full items-center">
                    {index > 0 && (
                      <div
                        className={cn(
                          'h-0.5 flex-1',
                          completed || active ? 'bg-primary' : 'bg-border',
                        )}
                      />
                    )}
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold',
                        completed && 'border-primary bg-primary text-primary-foreground',
                        active && !completed && 'border-primary bg-primary/10 text-primary',
                        !completed && !active && 'border-border bg-background text-muted-foreground',
                      )}
                    >
                      {completed ? <Check className="h-4 w-4" /> : index + 1}
                    </div>
                    {index < SHIPMENT_CHECKPOINTS.length - 1 && (
                      <div
                        className={cn(
                          'h-0.5 flex-1',
                          completed ? 'bg-primary' : 'bg-border',
                        )}
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      'max-w-[5.5rem] text-[10px] font-medium leading-tight sm:max-w-none sm:text-xs',
                      active ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {isCancelled && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          This shipment has been cancelled.
        </div>
      )}

      <div className="space-y-0">
        <p className="mb-3 text-sm font-medium">Tracking history</p>
        {chronological.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tracking events yet.</p>
        ) : (
          <ol className="relative space-y-4 border-l border-border/60 pl-6">
            {[...chronological].reverse().map((event, index) => (
              <li key={event.id ?? `${event.status}-${event.occurred_at}-${index}`} className="relative">
                <span
                  className={cn(
                    'absolute -left-[1.55rem] top-1 flex h-3 w-3 rounded-full border-2 bg-background',
                    index === 0 ? 'border-primary' : 'border-muted-foreground/40',
                  )}
                />
                <div className="flex gap-2">
                  <Package className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{shipmentStatusLabel(event.status)}</p>
                    {event.description && (
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    )}
                    {event.location && (
                      <p className="text-xs text-muted-foreground">{event.location}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.occurred_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
