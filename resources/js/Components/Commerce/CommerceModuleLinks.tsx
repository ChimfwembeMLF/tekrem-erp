import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import useRoute from '@/Hooks/useRoute';
import { Package, Truck, Monitor } from 'lucide-react';

export default function CommerceModuleLinks() {
  const route = useRoute();

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link href={route('inventory.dashboard')}>
          <Package className="mr-2 h-4 w-4" />
          Inventory
        </Link>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <Link href={route('procurement.dashboard')}>
          <Truck className="mr-2 h-4 w-4" />
          Procurement
        </Link>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <Link href={route('pos.index')}>
          <Monitor className="mr-2 h-4 w-4" />
          POS
        </Link>
      </Button>
    </div>
  );
}
