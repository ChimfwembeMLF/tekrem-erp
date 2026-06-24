import React from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import useRoute from '@/Hooks/useRoute';

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
    <AppLayout title="Product reviews">
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <h1 className="text-2xl font-bold">Product reviews</h1>
        {reviews.data.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">No reviews yet.</CardContent></Card>
        ) : (
          reviews.data.map((r) => (
            <Card key={r.id}>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{r.reviewer_name} · {r.rating}/5</p>
                  <Badge variant={r.is_approved ? 'default' : 'secondary'}>{r.is_approved ? 'Approved' : 'Pending'}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{r.product?.name}</p>
                {r.title && <p className="font-medium">{r.title}</p>}
                {r.body && <p className="text-sm">{r.body}</p>}
                {!r.is_approved && (
                  <Button size="sm" onClick={() => router.post(route('ecommerce.reviews.approve', r.id))}>Approve</Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AppLayout>
  );
}
