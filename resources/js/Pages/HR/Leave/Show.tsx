import React from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import useRoute from '@/Hooks/useRoute';
import { Edit, Check, X } from 'lucide-react';

interface Leave {
  id: number;
  employee: { name?: string; full_name?: string; user?: { name: string } };
  leave_type: { name: string };
  start_date: string;
  end_date: string;
  days_requested: number;
  status: string;
  reason: string;
  submitted_at: string;
  approver?: { name: string };
}

interface Props {
  leave: Leave;
  balance: { remaining: number; used: number; total_allocated: number };
}

export default function ShowLeave({ leave, balance }: Props) {
  const route = useRoute();
  const [showReject, setShowReject] = React.useState(false);
  const approveForm = useForm({ approval_notes: '' });
  const rejectForm = useForm({ rejection_reason: '' });

  const approve = (e: React.FormEvent) => {
    e.preventDefault();
    approveForm.post(route('hr.leave.approve', leave.id));
  };

  const reject = (e: React.FormEvent) => {
    e.preventDefault();
    rejectForm.post(route('hr.leave.reject', leave.id), {
      onSuccess: () => setShowReject(false),
    });
  };

  return (
    <AppLayout title="Leave Request Details">
      <Head title="Leave Request Details" />
      <div className="w-full max-w-2xl mx-auto py-8 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Leave Request Details</CardTitle>
            <Badge>{leave.status}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><div className="font-medium text-sm text-muted-foreground">Employee</div><div>{leave.employee?.full_name ?? leave.employee?.user?.name}</div></div>
            <div><div className="font-medium text-sm text-muted-foreground">Leave Type</div><div>{leave.leave_type?.name}</div></div>
            <div className="grid grid-cols-2 gap-4">
              <div><div className="font-medium text-sm text-muted-foreground">Start</div><div>{leave.start_date}</div></div>
              <div><div className="font-medium text-sm text-muted-foreground">End</div><div>{leave.end_date}</div></div>
            </div>
            <div><div className="font-medium text-sm text-muted-foreground">Days Requested</div><div>{leave.days_requested}</div></div>
            <div><div className="font-medium text-sm text-muted-foreground">Balance After Approval</div><div>{balance.remaining} days remaining</div></div>
            <div><div className="font-medium text-sm text-muted-foreground">Reason</div><div>{leave.reason}</div></div>
            {leave.approver && (
              <div><div className="font-medium text-sm text-muted-foreground">Approver</div><div>{leave.approver.name}</div></div>
            )}
            <div className="flex gap-2 pt-2">
              <Link href={route('hr.leave.edit', leave.id)}>
                <Button variant="outline"><Edit className="h-4 w-4 mr-2" />Edit</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {leave.status === 'pending' && (
          <Card>
            <CardHeader><CardTitle>Manager Actions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={approve} className="space-y-3">
                <div className="space-y-2">
                  <Label>Approval Notes (optional)</Label>
                  <Textarea
                    value={approveForm.data.approval_notes}
                    onChange={(e) => approveForm.setData('approval_notes', e.target.value)}
                    rows={2}
                  />
                </div>
                <Button type="submit" disabled={approveForm.processing}>
                  <Check className="h-4 w-4 mr-2" />Approve
                </Button>
              </form>
              {!showReject ? (
                <Button variant="destructive" onClick={() => setShowReject(true)}>
                  <X className="h-4 w-4 mr-2" />Reject
                </Button>
              ) : (
                <form onSubmit={reject} className="space-y-3 border-t pt-4">
                  <div className="space-y-2">
                    <Label>Rejection Reason *</Label>
                    <Textarea
                      value={rejectForm.data.rejection_reason}
                      onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                      rows={3}
                      required
                    />
                    {rejectForm.errors.rejection_reason && (
                      <p className="text-sm text-red-500">{rejectForm.errors.rejection_reason}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" variant="destructive" disabled={rejectForm.processing}>Confirm Reject</Button>
                    <Button type="button" variant="outline" onClick={() => setShowReject(false)}>Cancel</Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
