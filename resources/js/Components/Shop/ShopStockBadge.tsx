import React from 'react';
import { Badge } from '@/Components/ui/badge';

interface Props {
  stock: number;
}

export default function ShopStockBadge({ stock }: Props) {
  if (stock <= 0) {
    return <Badge variant="destructive">Out of stock</Badge>;
  }

  if (stock <= 5) {
    return (
      <Badge variant="secondary">
        Only {Math.floor(stock)} left
      </Badge>
    );
  }

  return <Badge variant="outline">In stock</Badge>;
}
