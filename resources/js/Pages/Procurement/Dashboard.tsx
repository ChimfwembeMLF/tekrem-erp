import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Truck, FileText } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { formatZmw } from '@/lib/formatCurrency';
import ModuleDashboardShell, {
  ModuleStatCard,
  AttentionBanner,
  RecentRows,
} from '@/Components/Dashboard/ModuleDashboardShell';

interface Props {
  stats: { suppliers: number; open_pos: number; pending_approval: number };
  recentOrders: Array<{ id: number; po_number: string; status: string; total: string; supplier: { name: string } }>;
  pendingApproval: Array<{ id: number; po_number: string; supplier: { name: string } }>;
}

export default function ProcurementDashboard({ stats, recentOrders, pendingApproval }: Props) {
  const route = useRoute();

  return (
    <ModuleDashboardShell
      title="Procurement"
      description="Suppliers, purchase orders, and goods receipt"
      actions={
        <Button asChild>
          <Link href={route('procurement.purchase-orders.create')}>New purchase order</Link>
        </Button>
      }
    >
      <AttentionBanner
        title="Needs attention"
        items={
          stats.pending_approval > 0
            ? [{ label: 'POs awaiting approval', href: route('procurement.purchase-orders.index'), count: stats.pending_approval }]
            : []
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <ModuleStatCard label="Suppliers" value={stats.suppliers} icon={<Truck className="h-4 w-4 text-muted-foreground" />} />
        <ModuleStatCard label="Open POs" value={stats.open_pos} icon={<FileText className="h-4 w-4 text-muted-foreground" />} />
        <ModuleStatCard label="Pending approval" value={stats.pending_approval} variant={stats.pending_approval ? 'warning' : 'default'} />
      </div>

      {pendingApproval.length > 0 && (
        <RecentRows
          title="Pending approval"
          rows={pendingApproval.map((po) => ({
            id: po.id,
            href: route('procurement.purchase-orders.show', po.id),
            primary: po.po_number,
            secondary: po.supplier.name,
          }))}
          emptyMessage=""
        />
      )}

      <RecentRows
        title="Recent purchase orders"
        emptyMessage="No purchase orders yet."
        rows={recentOrders.map((o) => ({
          id: o.id,
          href: route('procurement.purchase-orders.show', o.id),
          primary: o.po_number,
          secondary: o.supplier.name,
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
