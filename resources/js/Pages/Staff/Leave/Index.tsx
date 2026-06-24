import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import StaffPortalNav from '@/Components/Staff/StaffPortalNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Plus } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Props {
  leaves: { data: Array<{ id: number; status: string; start_date: string; end_date: string; days_requested: number; leave_type?: { name: string }; reason: string }> };
  balances: Array<{ name: string; remaining: number; used: number }>;
}

export default function StaffLeaveIndex({ leaves, balances }: Props) {
  const route = useRoute();

  return (
    <AppLayout title="My leave" renderHeader={() => <h2 className="text-xl font-semibold">My leave</h2>}>
      <div className="space-y-6">
        <StaffPortalNav />
        <div className="flex justify-end">
          <Button asChild>
            <Link href={route('staff.leave.create')}>
              <Plus className="mr-2 h-4 w-4" />
              Request leave
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {balances.map((b) => (
            <Card key={b.name}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{b.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{b.remaining}</p>
                <p className="text-xs text-muted-foreground">{b.used} used</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {leaves.data.length === 0 && (
              <p className="text-sm text-muted-foreground">No leave requests yet.</p>
            )}
            {leaves.data.map((leave) => (
              <div key={leave.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 last:border-0">
                <div>
                  <p className="font-medium">{leave.leave_type?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {leave.start_date} → {leave.end_date} · {leave.days_requested} day(s)
                  </p>
                </div>
                <Badge>{leave.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
