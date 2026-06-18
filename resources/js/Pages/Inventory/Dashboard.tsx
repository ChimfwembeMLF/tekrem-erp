import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Package, Warehouse, AlertTriangle, Store } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import ModuleDashboardShell, {
  ModuleStatCard,
  AttentionBanner,
  RecentRows,
} from '@/Components/Dashboard/ModuleDashboardShell';

interface Props {
  stats: { products: number; warehouses: number; low_stock: number; published: number };
  lowStockItems: Array<{
    id: number;
    product: string;
    warehouse: string;
    quantity: number;
    reorder_level: number;
  }>;
}

export default function InventoryDashboard({ stats, lowStockItems }: Props) {
  const route = useRoute();

  return (
    <ModuleDashboardShell
      title="Inventory"
      description="Products, warehouses, and stock levels"
      actions={
        <Button asChild>
          <Link href={route('inventory.products.create')}>Add product</Link>
        </Button>
      }
    >
      <AttentionBanner
        title="Needs attention"
        items={
          stats.low_stock > 0
            ? [{ label: 'low stock items', href: route('inventory.products.index'), count: stats.low_stock }]
            : []
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <ModuleStatCard label="Products" value={stats.products} icon={<Package className="h-4 w-4 text-muted-foreground" />} />
        <ModuleStatCard label="Warehouses" value={stats.warehouses} icon={<Warehouse className="h-4 w-4 text-muted-foreground" />} />
        <ModuleStatCard label="Low stock" value={stats.low_stock} variant="warning" icon={<AlertTriangle className="h-4 w-4 text-orange-600" />} />
        <ModuleStatCard label="Published online" value={stats.published} icon={<Store className="h-4 w-4 text-muted-foreground" />} />
      </div>

      <RecentRows
        title="Low stock alerts"
        emptyMessage="All stock levels are healthy."
        rows={lowStockItems.map((item) => ({
          id: item.id,
          primary: item.product,
          secondary: `${item.warehouse} · ${item.quantity} on hand (reorder at ${item.reorder_level})`,
        }))}
      />
    </ModuleDashboardShell>
  );
}
