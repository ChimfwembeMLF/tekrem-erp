import React from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Separator } from '@/Components/ui/separator';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MapPin,
  Package,
  Truck,
  User,
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { formatZmw } from '@/lib/formatCurrency';
import ModuleDashboardShell from '@/Components/Dashboard/ModuleDashboardShell';
import EcommerceModuleNav from '@/Components/Ecommerce/EcommerceModuleNav';
import {
  ModuleFormSection,
  ModuleFormGrid,
  ModuleFormField,
} from '@/Components/Module/moduleFormWrappers';

interface Props {
  order: {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    payment_method?: string | null;
    total: string;
    shipping_address?: string | null;
    metadata?: { customer_name?: string; customer_email?: string; customer_phone?: string };
    items: Array<{ description: string; quantity: string; unit_price: string; total: string }>;
    shipment?: {
      id: number;
      tracking_number: string;
      status: string;
      carrier?: string | null;
      events: Array<{ status: string; description?: string; occurred_at: string }>;
    } | null;
    shipping_method?: { name: string } | null;
  };
}

const shipmentStatusLabel: Record<string, string> = {
  pending: 'Awaiting dispatch',
  processing: 'Processing',
  in_transit: 'In transit',
  delivered: 'Delivered',
};

export default function OrderShow({ order }: Props) {
  const route = useRoute();
  const { data, setData, post, processing, errors } = useForm({
    tracking_number: '',
    carrier: 'Tekrem Logistics',
  });

  const handleShip = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('ecommerce.orders.ship', order.id), { preserveScroll: true });
  };

  return (
    <ModuleDashboardShell
      title={order.order_number}
      description={`${order.metadata?.customer_name ?? 'Guest'} · ${order.metadata?.customer_email ?? 'No email'}`}
      workspaceLabel="Ecommerce workspace"
      heroAccent="from-emerald-500/15 via-emerald-500/5 to-secondary/10"
      moduleNav={<EcommerceModuleNav />}
      actions={
        <Button variant="outline" asChild>
          <Link href={route('ecommerce.orders.index')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to orders
          </Link>
        </Button>
      }
    >
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="capitalize">{order.status}</Badge>
        <Badge variant="secondary" className="capitalize">{order.payment_status}</Badge>
        {order.payment_method && <Badge variant="outline">{order.payment_method}</Badge>}
        {order.shipping_method && (
          <Badge variant="outline" className="gap-1">
            <Truck className="h-3 w-3" />
            {order.shipping_method.name}
          </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ModuleFormSection title="Customer" description="Delivery contact details." icon={<User className="h-5 w-5" />}>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{order.metadata?.customer_name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd>{order.metadata?.customer_email ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd>{order.metadata?.customer_phone ?? '—'}</dd>
            </div>
            <Separator />
            <div>
              <dt className="mb-1 flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                Shipping address
              </dt>
              <dd className="whitespace-pre-wrap rounded-lg border border-border/60 bg-muted/20 p-3">
                {order.shipping_address ?? 'No address provided'}
              </dd>
            </div>
          </dl>
        </ModuleFormSection>

        <ModuleFormSection title="Order items" description="Products in this order." icon={<Package className="h-5 w-5" />}>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-start justify-between gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium">{item.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatZmw(Number(item.unit_price))} × {Number(item.quantity).toFixed(0)}
                  </p>
                </div>
                <p className="font-medium">{formatZmw(Number(item.total))}</p>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatZmw(Number(order.total))}</span>
            </div>
          </div>
        </ModuleFormSection>
      </div>

      <ModuleFormSection
        title="Shipment & tracking"
        description={order.shipment ? 'Track dispatch and delivery progress.' : 'Create a shipment when the order leaves the warehouse.'}
        icon={<Truck className="h-5 w-5" />}
      >
        {order.shipment ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Tracking number</p>
                <p className="mt-1 font-mono text-lg font-semibold">{order.shipment.tracking_number}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Carrier</p>
                <p className="mt-1 font-medium">{order.shipment.carrier ?? 'Tekrem Logistics'}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                <Badge className="mt-2 capitalize">
                  {shipmentStatusLabel[order.shipment.status] ?? order.shipment.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            {order.shipment.events.length > 0 && (
              <div className="space-y-0">
                <p className="mb-3 text-sm font-medium">Tracking history</p>
                <ol className="relative space-y-4 border-l border-border/60 pl-6">
                  {order.shipment.events.map((event, index) => (
                    <li key={index} className="relative">
                      <span className="absolute -left-[1.55rem] top-1 flex h-3 w-3 rounded-full border-2 border-primary bg-background" />
                      <p className="text-sm font-medium capitalize">{event.status.replace('_', ' ')}</p>
                      {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.occurred_at).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {order.shipment.status !== 'delivered' && (
              <div className="flex justify-end border-t border-border/60 pt-4">
                <Button onClick={() => router.post(route('ecommerce.orders.deliver', order.id))}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as delivered
                </Button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleShip} className="space-y-5">
            <ModuleFormGrid>
              <ModuleFormField label="Tracking number" htmlFor="tracking_number" error={errors.tracking_number} hint="Leave blank to auto-generate.">
                <Input
                  id="tracking_number"
                  value={data.tracking_number}
                  onChange={(e) => setData('tracking_number', e.target.value)}
                  placeholder="TRK-XXXXXXXXXX"
                  className="font-mono"
                />
              </ModuleFormField>
              <ModuleFormField label="Carrier" htmlFor="carrier" error={errors.carrier}>
                <Input
                  id="carrier"
                  value={data.carrier}
                  onChange={(e) => setData('carrier', e.target.value)}
                  placeholder="Tekrem Logistics"
                />
              </ModuleFormField>
            </ModuleFormGrid>

            <div className="flex justify-end border-t border-border/60 pt-4">
              <Button type="submit" disabled={processing} className="min-w-[160px]">
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Truck className="mr-2 h-4 w-4" />
                    Mark as shipped
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </ModuleFormSection>
    </ModuleDashboardShell>
  );
}
