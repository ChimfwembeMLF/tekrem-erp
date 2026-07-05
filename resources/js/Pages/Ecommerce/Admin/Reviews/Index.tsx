import React from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Switch } from '@/Components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { MessageSquare, Star, Trash2 } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import ModuleDashboardShell from '@/Components/Dashboard/ModuleDashboardShell';
import EcommerceModuleNav from '@/Components/Ecommerce/EcommerceModuleNav';
import { ModuleFormSection } from '@/Components/Module/moduleFormWrappers';

interface Review {
  id: number;
  reviewer_name: string;
  rating: number;
  title?: string | null;
  body?: string | null;
  is_approved: boolean;
  product?: { name: string };
}

export default function ReviewsIndex({ reviews }: { reviews: { data: Review[] } }) {
  const route = useRoute();

  return (
    <ModuleDashboardShell
      title="Product reviews"
      description="Moderate customer reviews before they appear on the storefront"
      workspaceLabel="Ecommerce workspace"
      heroAccent="from-emerald-500/15 via-emerald-500/5 to-secondary/10"
      moduleNav={<EcommerceModuleNav />}
    >
      <ModuleFormSection
        title="Review queue"
        description={`${reviews.data.length} review${reviews.data.length === 1 ? '' : 's'} on this page`}
        icon={<MessageSquare className="h-5 w-5" />}
      >
        {reviews.data.length === 0 ? (
          <div className="py-12 text-center">
            <Star className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-medium">No reviews yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Reviews appear here when customers submit them on product pages.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead>Product</TableHead>
                  <TableHead>Reviewer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.data.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">{review.product?.name ?? '—'}</TableCell>
                    <TableCell>{review.reviewer_name}</TableCell>
                    <TableCell>{review.rating}/5</TableCell>
                    <TableCell className="max-w-xs">
                      {review.title && <p className="font-medium">{review.title}</p>}
                      {review.body && <p className="text-sm text-muted-foreground line-clamp-2">{review.body}</p>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={review.is_approved ? 'default' : 'secondary'}>
                        {review.is_approved ? 'Approved' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!review.is_approved && (
                          <Button size="sm" onClick={() => router.post(route('ecommerce.reviews.approve', review.id))}>
                            Approve
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => router.delete(route('ecommerce.reviews.destroy', review.id))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </ModuleFormSection>
    </ModuleDashboardShell>
  );
}
