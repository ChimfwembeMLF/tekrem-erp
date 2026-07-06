import React, { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Separator } from '@/Components/ui/separator';
import { Checkbox } from '@/Components/ui/checkbox';
import { Label } from '@/Components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/Components/ui/alert-dialog';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MapPin,
  Package,
  Plus,
  RotateCcw,
  Truck,
  User,
  XCircle,
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { formatZmw } from '@/lib/formatCurrency';
import { shipmentStatusLabel } from '@/lib/shipmentStatuses';
import ShipmentTrackingTimeline from '@/Components/Shop/ShipmentTrackingTimeline';
import DocumentCodeStrip from '@/Components/Codes/DocumentCodeStrip';
import ModuleDashboardShell from '@/Components/Dashboard/ModuleDashboardShell';
import EcommerceModuleNav from '@/Components/Ecommerce/EcommerceModuleNav';
import {
  ModuleFormSection,
  ModuleFormGrid,
  ModuleFormField,
} from '@/Components/Module/moduleFormWrappers';

interface ShipmentStatusOption {
  value: string;
  label: string;
}

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
      events: Array<{ id: number; status: string; description?: string; location?: string; occurred_at: string }>;
    } | null;
    shipping_method?: { name: string } | null;
  };
  shipmentStatuses: ShipmentStatusOption[];
}

const QUICK_CHECKPOINTS = [
  'processing',
  'picked_up',
  'in_transit',
  'at_hub',
  'out_for_delivery',
  'delivered',
] as const;

export default function OrderShow({ order, shipmentStatuses }: Props) {
  const route = useRoute();
  const { data, setData, post, processing, errors } = useForm({
    tracking_number: '',
    carrier: 'Tekrem Logistics',
  });

  const checkpointForm = useForm({
    status: order.shipment?.status === 'pending' ? 'processing' : 'in_transit',
    description: '',
    location: '',
    notify_customer: true,
  });

  const handleShip = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('ecommerce.orders.ship', order.id), { preserveScroll: true });
  };

  const submitCheckpoint = (e: React.FormEvent) => {
    e.preventDefault();
    checkpointForm.post(route('ecommerce.orders.checkpoint', order.id), {
      preserveScroll: true,
      onSuccess: () => checkpointForm.reset('description', 'location'),
    });
  };

  const addQuickCheckpoint = (status: string) => {
    router.post(route('ecommerce.orders.checkpoint', order.id), {
      status,
      notify_customer: true,
    }, { preserveScroll: true });
  };

  const [cancelReason, setCancelReason] = useState('');
  const canCancel = !['cancelled', 'fulfilled'].includes(order.status);

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

      <DocumentCodeStrip
        label="Order number"
        value={order.order_number}
        qrValue={route('ecommerce.orders.show', order.id)}
        layout="row"
      />

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
        description={order.shipment ? 'Update checkpoints as the package moves.' : 'Create a shipment when the order leaves the warehouse.'}
        icon={<Truck className="h-5 w-5" />}
      >
        {order.shipment ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Tracking number</p>
                <p className="mt-1 font-mono text-lg font-semibold">{order.shipment.tracking_number}</p>
                <Button variant="link" size="sm" className="mt-1 h-auto px-0" asChild>
                  <Link href={route('shop.tracking.show', order.shipment.tracking_number)} target="_blank">
                    View customer tracking
                  </Link>
                </Button>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Carrier</p>
                <p className="mt-1 font-medium">{order.shipment.carrier ?? 'Tekrem Logistics'}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Current status</p>
                <Badge className="mt-2">{shipmentStatusLabel(order.shipment.status)}</Badge>
              </div>
            </div>

            <ShipmentTrackingTimeline
              currentStatus={order.shipment.status}
              events={order.shipment.events}
            />

            {order.shipment.status !== 'delivered' && order.shipment.status !== 'cancelled' && (
              <>
                <div className="border-t border-border/60 pt-4">
                  <p className="mb-3 text-sm font-medium">Quick checkpoints</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_CHECKPOINTS.filter((status) => status !== order.shipment?.status).map((status) => (
                      <Button
                        key={status}
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => addQuickCheckpoint(status)}
                      >
                        {shipmentStatusLabel(status)}
                      </Button>
                    ))}
                  </div>
                </div>

                <form onSubmit={submitCheckpoint} className="space-y-4 border-t border-border/60 pt-4">
                  <p className="text-sm font-medium">Add checkpoint</p>
                  <ModuleFormGrid columns={2}>
                    <ModuleFormField label="Status" htmlFor="checkpoint-status" error={checkpointForm.errors.status} required>
                      <Select
                        value={checkpointForm.data.status}
                        onValueChange={(value) => checkpointForm.setData('status', value)}
                      >
                        <SelectTrigger id="checkpoint-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {shipmentStatuses.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </ModuleFormField>
                    <ModuleFormField label="Location" htmlFor="checkpoint-location" error={checkpointForm.errors.location} hint="City, hub, or depot (optional).">
                      <Input
                        id="checkpoint-location"
                        value={checkpointForm.data.location}
                        onChange={(e) => checkpointForm.setData('location', e.target.value)}
                        placeholder="Lusaka distribution hub"
                      />
                    </ModuleFormField>
                  </ModuleFormGrid>
                  <ModuleFormField label="Description" htmlFor="checkpoint-description" error={checkpointForm.errors.description} hint="Leave blank to use the default message for this status.">
                    <Textarea
                      id="checkpoint-description"
                      rows={2}
                      value={checkpointForm.data.description}
                      onChange={(e) => checkpointForm.setData('description', e.target.value)}
                      placeholder="Optional custom message for the customer"
                    />
                  </ModuleFormField>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="notify_customer"
                      checked={checkpointForm.data.notify_customer}
                      onCheckedChange={(checked) => checkpointForm.setData('notify_customer', checked === true)}
                    />
                    <Label htmlFor="notify_customer" className="font-normal">
                      Email customer about this update
                    </Label>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button type="submit" disabled={checkpointForm.processing}>
                      {checkpointForm.processing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving…
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Add checkpoint
                        </>
                      )}
                    </Button>
                    {order.shipment.status !== 'delivered' && (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => router.post(route('ecommerce.orders.deliver', order.id))}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Mark delivered
                      </Button>
                    )}
                  </div>
                </form>
              </>
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
                    Create shipment & dispatch
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </ModuleFormSection>

      {(canCancel || order.payment_status === 'paid') && (
        <ModuleFormSection
          title="Order actions"
          description="Cancel the order or record a refund for mobile money payments."
          icon={<XCircle className="h-5 w-5" />}
        >
          <div className="flex flex-wrap gap-3">
            {canCancel && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel order
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Stock will be released and the customer will be notified. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-2">
                    <Label htmlFor="admin-cancel-reason">Reason (optional)</Label>
                    <Textarea
                      id="admin-cancel-reason"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      rows={3}
                      placeholder="Out of stock, customer request, etc."
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep order</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => router.post(route('ecommerce.orders.cancel', order.id), { reason: cancelReason }, { preserveScroll: true })}
                    >
                      Cancel order
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {order.payment_status === 'paid' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Issue refund
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Record refund?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Marks payment as refunded and notifies the customer. For MoMo, initiate the actual refund in your payment provider if required.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Not now</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => router.post(route('ecommerce.orders.refund', order.id), {}, { preserveScroll: true })}
                    >
                      Confirm refund
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </ModuleFormSection>
      )}
    </ModuleDashboardShell>
  );
}
