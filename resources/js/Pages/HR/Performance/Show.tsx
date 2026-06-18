import React from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import useRoute from '@/Hooks/useRoute';
import { Edit, Send, PlayCircle, Check } from 'lucide-react';

interface Performance {
  id: number;
  employee: { user?: { name: string }; full_name?: string };
  reviewer: { name: string };
  review_period: string;
  review_start_date: string;
  review_end_date: string;
  due_date: string;
  status: string;
  overall_rating: number | null;
  bonus?: number | null;
  is_self_review: boolean;
  submitted_at: string | null;
  completed_at: string | null;
}

interface Props {
  performance: Performance;
}

export default function ShowPerformance({ performance }: Props) {
  const route = useRoute();
  const approveForm = useForm({ bonus: performance.bonus?.toString() ?? '' });

  const submit = () => router.post(route('hr.performance.submit', performance.id));
  const startReview = () => router.post(route('hr.performance.start-review', performance.id));
  const approve = (e: React.FormEvent) => {
    e.preventDefault();
    approveForm.post(route('hr.performance.approve', performance.id));
  };

  return (
    <AppLayout title="Performance Review Details">
      <Head title="Performance Review Details" />
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Performance Review</CardTitle>
            <Badge>{performance.status}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div><span className="text-muted-foreground text-sm">Employee: </span>{performance.employee?.full_name ?? performance.employee?.user?.name}</div>
            <div><span className="text-muted-foreground text-sm">Reviewer: </span>{performance.reviewer?.name}</div>
            <div><span className="text-muted-foreground text-sm">Period: </span>{performance.review_period}</div>
            <div><span className="text-muted-foreground text-sm">Dates: </span>{performance.review_start_date} – {performance.review_end_date}</div>
            <div><span className="text-muted-foreground text-sm">Due: </span>{performance.due_date}</div>
            <div><span className="text-muted-foreground text-sm">Rating: </span>{performance.overall_rating ?? 'N/A'}</div>
            {performance.bonus != null && (
              <div><span className="text-muted-foreground text-sm">Bonus: </span>{performance.bonus}</div>
            )}
            <Link href={route('hr.performance.edit', performance.id)}>
              <Button variant="outline" size="sm"><Edit className="h-4 w-4 mr-2" />Edit</Button>
            </Link>
          </CardContent>
        </Card>

        {performance.status === 'draft' && (
          <Button onClick={submit}><Send className="h-4 w-4 mr-2" />Submit for Review</Button>
        )}
        {performance.status === 'submitted' && (
          <Button onClick={startReview}><PlayCircle className="h-4 w-4 mr-2" />Start Manager Review</Button>
        )}
        {performance.status === 'in_review' && (
          <Card>
            <CardHeader><CardTitle>Complete Review</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={approve} className="space-y-4">
                <div className="space-y-2">
                  <Label>Bonus Amount (optional)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={approveForm.data.bonus}
                    onChange={(e) => approveForm.setData('bonus', e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={approveForm.processing}>
                  <Check className="h-4 w-4 mr-2" />Approve & Complete
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
