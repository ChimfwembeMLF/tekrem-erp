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

interface Props {
  stats: { published_products: number; ecommerce_orders: number; pending_orders: number };
  recentOrders: Array<{ id: number; order_number: string; status: string; total: string; client?: { name: string } }>;
}

export default function EcommerceAdmin({ stats, recentOrders }: Props) {
  const route = useRoute();

  return (
    <ModuleDashboardShell
      title="Ecommerce"
      description="Online storefront and web orders"
      actions={
        <Button variant="outline" asChild>
          <Link href={route('shop.index')}>
            <Store className="mr-2 h-4 w-4" />
            View storefront
          </Link>
        </Button>
      }
    >
      <AttentionBanner
        title="Needs attention"
        items={
          stats.pending_orders > 0
            ? [{ label: 'pending web orders', href: route('sales.orders.index'), count: stats.pending_orders }]
            : []
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <ModuleStatCard label="Published products" value={stats.published_products} />
        <ModuleStatCard label="Online orders" value={stats.ecommerce_orders} />
        <ModuleStatCard label="Pending" value={stats.pending_orders} variant={stats.pending_orders ? 'warning' : 'default'} />
      </div>

      <RecentRows
        title="Recent online orders"
        emptyMessage="No ecommerce orders yet."
        rows={recentOrders.map((o) => ({
          id: o.id,
          href: route('sales.orders.show', o.id),
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
