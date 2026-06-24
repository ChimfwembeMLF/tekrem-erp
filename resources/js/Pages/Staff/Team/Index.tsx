import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import StaffPortalNav from '@/Components/Staff/StaffPortalNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import useRoute from '@/Hooks/useRoute';

interface LeaveRow {
  id: number;
  status: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  reason: string;
  employee?: { user?: { name: string } };
  leave_type?: { name: string };
}

interface Props {
  pendingLeaves: LeaveRow[];
  onLeaveToday: LeaveRow[];
  team: Array<{ id: number; name: string; job_title: string; on_leave: boolean }>;
}

export default function ManagerTeamIndex({ pendingLeaves, onLeaveToday, team }: Props) {
  const route = useRoute();
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const rejectForm = useForm({ rejection_reason: '' });

  const approve = (id: number) => {
    router.post(route('staff.team.leaves.approve', id), {}, { preserveScroll: true });
  };

  const submitReject = (id: number) => {
    rejectForm.post(route('staff.team.leaves.reject', id), {
      preserveScroll: true,
      onSuccess: () => {
        setRejectingId(null);
        rejectForm.reset();
      },
    });
  };

  return (
    <AppLayout title="My team" renderHeader={() => <h2 className="text-xl font-semibold">My team</h2>}>
      <div className="space-y-6">
        <StaffPortalNav showTeam />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team members</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {team.map((member) => (
              <Badge key={member.id} variant={member.on_leave ? 'secondary' : 'outline'}>
                {member.name}
                {member.on_leave ? ' · on leave' : ''}
              </Badge>
            ))}
          </CardContent>
        </Card>

        {onLeaveToday.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">On leave today</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {onLeaveToday.map((leave) => (
                <p key={leave.id} className="text-sm">
                  {leave.employee?.user?.name} — {leave.leave_type?.name} until {leave.end_date}
                </p>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending approvals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingLeaves.length === 0 && (
              <p className="text-sm text-muted-foreground">No pending leave requests.</p>
            )}
            {pendingLeaves.map((leave) => (
              <div key={leave.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{leave.employee?.user?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {leave.leave_type?.name} · {leave.start_date} → {leave.end_date} ({leave.days_requested} days)
                    </p>
                    <p className="mt-1 text-sm">{leave.reason}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => approve(leave.id)}>
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setRejectingId(leave.id)}>
                      Reject
                    </Button>
                  </div>
                </div>
                {rejectingId === leave.id && (
                  <div className="mt-3 space-y-2 border-t border-border pt-3">
                    <Label>Rejection reason</Label>
                    <Textarea
                      value={rejectForm.data.rejection_reason}
                      onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                      rows={2}
                    />
                    <Button size="sm" variant="destructive" onClick={() => submitReject(leave.id)}>
                      Confirm reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
