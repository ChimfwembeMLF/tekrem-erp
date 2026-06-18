import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { Plus } from 'lucide-react';

interface Product { id: number; sku: string; name: string; sale_price: string; is_active: boolean; is_published: boolean; category?: { name: string } }
interface Props { products: { data: Product[] }; filters: { search?: string } }

export default function ProductsIndex({ products }: Props) {
  return (
    <AppLayout title="Products">
      <Head title="Products" />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Products</h1>
          <Button asChild><Link href={route('inventory.products.create')}><Plus className="h-4 w-4 mr-2" />New Product</Link></Button>
        </div>
        <Card>
          <CardHeader><CardTitle>Catalog</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.data.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>{p.sku}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.category?.name ?? '—'}</TableCell>
                    <TableCell>ZMW {Number(p.sale_price).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={p.is_active ? 'default' : 'secondary'}>{p.is_active ? 'Active' : 'Inactive'}</Badge>
                      {p.is_published && <Badge className="ml-1" variant="outline">Online</Badge>}
                    </TableCell>
                    <TableCell><Button variant="ghost" size="sm" asChild><Link href={route('inventory.products.show', p.id)}>View</Link></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
