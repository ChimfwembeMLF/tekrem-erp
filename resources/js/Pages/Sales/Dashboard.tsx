import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Plus } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { formatZmw } from '@/lib/formatCurrency';
import ModuleDashboardShell, {
  ModuleStatCard,
  AttentionBanner,
  RecentRows,
} from '@/Components/Dashboard/ModuleDashboardShell';

interface Props {
  stats: { total: number; pending: number; fulfilled: number; ecommerce: number };
  recentOrders: Array<{ id: number; order_number: string; status: string; source: string; total: string; client?: { name: string } }>;
  pendingOrders: Array<{ id: number; order_number: string; status: string; client?: { name: string } }>;
}

export default function SalesDashboard({ stats, recentOrders, pendingOrders }: Props) {
  const route = useRoute();

  return (
    <ModuleDashboardShell
      title="Sales"
      description="Orders, fulfillment, and channel performance"
      actions={
        <Button asChild>
          <Link href={route('sales.orders.create')}>
            <Plus className="mr-2 h-4 w-4" />
            New order
          </Link>
        </Button>
      }
    >
      <AttentionBanner
        title="Needs attention"
        items={
          stats.pending > 0
            ? [{ label: 'orders to fulfill', href: route('sales.orders.index'), count: stats.pending }]
            : []
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <ModuleStatCard label="Total orders" value={stats.total} />
        <ModuleStatCard label="Pending" value={stats.pending} variant={stats.pending ? 'warning' : 'default'} />
        <ModuleStatCard label="Fulfilled" value={stats.fulfilled} variant="success" />
        <ModuleStatCard label="Ecommerce" value={stats.ecommerce} />
      </div>

      {pendingOrders.length > 0 && (
        <RecentRows
          title="Pending fulfillment"
          rows={pendingOrders.map((o) => ({
            id: o.id,
            href: route('sales.orders.show', o.id),
            primary: o.order_number,
            secondary: o.client?.name ?? 'Walk-in',
            trailing: <Badge variant="outline">{o.status}</Badge>,
          }))}
          emptyMessage=""
        />
      )}

      <RecentRows
        title="Recent orders"
        emptyMessage="No sales orders yet."
        rows={recentOrders.map((o) => ({
          id: o.id,
          href: route('sales.orders.show', o.id),
          primary: o.order_number,
          secondary: `${o.client?.name ?? 'Walk-in'} · ${o.source}`,
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
