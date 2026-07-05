export const SHIPMENT_CHECKPOINTS = [
  { status: 'pending', label: 'Order received' },
  { status: 'processing', label: 'Processing' },
  { status: 'picked_up', label: 'Picked up' },
  { status: 'in_transit', label: 'In transit' },
  { status: 'at_hub', label: 'At hub' },
  { status: 'out_for_delivery', label: 'Out for delivery' },
  { status: 'delivered', label: 'Delivered' },
] as const;

export type ShipmentCheckpointStatus = (typeof SHIPMENT_CHECKPOINTS)[number]['status'];

export const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Order received',
  processing: 'Processing at warehouse',
  picked_up: 'Picked up by carrier',
  in_transit: 'In transit',
  at_hub: 'Arrived at regional hub',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Shipment cancelled',
};

export function shipmentStatusLabel(status: string): string {
  return SHIPMENT_STATUS_LABELS[status] ?? status.replace(/_/g, ' ');
}

export function checkpointProgressIndex(status: string): number {
  const idx = SHIPMENT_CHECKPOINTS.findIndex((step) => step.status === status);
  return idx >= 0 ? idx : 0;
}

export interface ShipmentEventLike {
  id?: number;
  status: string;
  location?: string | null;
  description?: string | null;
  occurred_at: string;
}

export function sortEventsChronologically<T extends ShipmentEventLike>(events: T[]): T[] {
  return [...events].sort(
    (a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime(),
  );
}
