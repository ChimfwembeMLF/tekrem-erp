import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Store } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { formatZmw } from '@/lib/formatCurrency';
import ModuleDashboardShell, {
  ModuleStatCard,
  AttentionBanner,
  RecentRows,
} from '@/Components/Dashboard/ModuleDashboardShell';
import EcommerceModuleNav from '@/Components/Ecommerce/EcommerceModuleNav';

interface Props {
  stats: {
    published_products: number;
    ecommerce_orders: number;
    pending_orders: number;
    pending_shipments: number;
    in_transit: number;
  };
  recentOrders: Array<{ id: number; order_number: string; status: string; total: string; client?: { name: string } }>;
}

export default function EcommerceAdmin({ stats, recentOrders }: Props) {
  const route = useRoute();

  const attentionItems = [
    stats.pending_orders > 0
      ? { label: 'pending web orders', href: route('ecommerce.orders.index'), count: stats.pending_orders }
      : null,
    stats.pending_shipments > 0
      ? { label: 'shipments awaiting dispatch', href: route('ecommerce.orders.index'), count: stats.pending_shipments }
      : null,
    stats.in_transit > 0
      ? { label: 'shipments in transit', href: route('ecommerce.orders.index'), count: stats.in_transit }
      : null,
  ].filter(Boolean) as Array<{ label: string; href: string; count: number }>;

  return (
    <ModuleDashboardShell
      title="Ecommerce"
      description="Online storefront and web orders"
      workspaceLabel="Ecommerce workspace"
      heroAccent="from-emerald-500/15 via-emerald-500/5 to-secondary/10"
      moduleNav={<EcommerceModuleNav />}
      actions={
        <Button variant="outline" asChild>
          <Link href={route('shop.index')}>
            <Store className="mr-2 h-4 w-4" />
            View storefront
          </Link>
        </Button>
      }
    >
      {attentionItems.length > 0 && (
        <AttentionBanner title="Needs attention" items={attentionItems} />
      )}

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <ModuleStatCard label="Published products" value={stats.published_products} />
        <ModuleStatCard label="Online orders" value={stats.ecommerce_orders} />
        <ModuleStatCard label="Pending orders" value={stats.pending_orders} variant={stats.pending_orders ? 'warning' : 'default'} href={route('ecommerce.orders.index')} />
        <ModuleStatCard label="Awaiting dispatch" value={stats.pending_shipments} href={route('ecommerce.shipping.index')} />
        <ModuleStatCard label="In transit" value={stats.in_transit} href={route('ecommerce.orders.index')} />
      </div>

      <RecentRows
        title="Recent online orders"
        emptyMessage="No ecommerce orders yet."
        rows={recentOrders.map((o) => ({
          id: o.id,
          href: route('ecommerce.orders.show', o.id),
          primary: o.order_number,
          secondary: o.client?.name ?? 'Guest',
          trailing: (
            <>
              <Badge variant="outline">{o.status}</Badge>
              <p className="mt-1">{formatZmw(Number(o.total))}</p>
            </>
          ),
        }))}
      />
    </ModuleDashboardShell>
  );
}
