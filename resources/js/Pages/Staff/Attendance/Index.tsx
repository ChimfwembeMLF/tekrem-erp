import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import StaffPortalNav from '@/Components/Staff/StaffPortalNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import useRoute from '@/Hooks/useRoute';

interface Props {
  attendance: {
    data: Array<{
      date: string;
      status: string;
      clock_in?: string;
      clock_out?: string;
      total_hours?: number;
    }>;
  };
}

export default function StaffAttendanceIndex({ attendance }: Props) {
  const route = useRoute();

  return (
    <AppLayout title="My attendance" renderHeader={() => <h2 className="text-xl font-semibold">My attendance</h2>}>
      <div className="space-y-6">
        <StaffPortalNav />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attendance history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {attendance.data.length === 0 && (
              <p className="text-sm text-muted-foreground">No attendance records yet.</p>
            )}
            {attendance.data.map((row, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 border-b border-border py-2 text-sm last:border-0">
                <span>{row.date}</span>
                <span className="text-muted-foreground">{row.clock_in ?? '—'}</span>
                <span className="text-muted-foreground">{row.clock_out ?? '—'}</span>
                <span className="capitalize">{row.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
