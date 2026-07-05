import React from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import useRoute from '@/Hooks/useRoute';
import { formatZmw } from '@/lib/formatCurrency';
import ModuleDashboardShell, { RecentRows } from '@/Components/Dashboard/ModuleDashboardShell';
import EcommerceModuleNav from '@/Components/Ecommerce/EcommerceModuleNav';

interface Props {
  orders: {
    data: Array<{ id: number; order_number: string; status: string; total: string; metadata?: { customer_name?: string }; shipment?: { status: string; tracking_number?: string } | null }>;
    links: Array<{ url: string | null; label: string; active: boolean }>;
  };
  filters: { search?: string; status?: string };
}

export default function OrdersIndex({ orders, filters }: Props) {
  const route = useRoute();

  return (
    <ModuleDashboardShell
      title="Shop orders"
      description="Manage ecommerce orders and shipments"
      workspaceLabel="Ecommerce workspace"
      heroAccent="from-emerald-500/15 via-emerald-500/5 to-secondary/10"
      moduleNav={<EcommerceModuleNav />}
    >
        <form
          className="mb-6 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            router.get(route('ecommerce.orders.index'), { search: fd.get('search') });
          }}
        >
          <Input name="search" defaultValue={filters.search} placeholder="Search orders..." className="max-w-sm" />
          <Button type="submit">Search</Button>
        </form>

        <RecentRows
          title="Orders"
          emptyMessage="No shop orders yet."
          rows={orders.data.map((o) => ({
            id: o.id,
            href: route('ecommerce.orders.show', o.id),
            primary: o.order_number,
            secondary: o.metadata?.customer_name ?? 'Guest',
            trailing: (
              <>
                <Badge variant="outline" className="capitalize">{o.status}</Badge>
                {o.shipment?.tracking_number && <p className="mt-1 text-xs text-muted-foreground">{o.shipment.tracking_number}</p>}
                <p className="mt-1">{formatZmw(Number(o.total))}</p>
              </>
            ),
          }))}
        />
      </ModuleDashboardShell>
  );
}
