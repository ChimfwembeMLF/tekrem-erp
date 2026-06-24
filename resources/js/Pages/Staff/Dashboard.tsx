import React from 'react';
import { Link } from '@inertiajs/react';
import ModuleDashboardShell from '@/Components/Dashboard/ModuleDashboardShell';
import StaffPortalNav from '@/Components/Staff/StaffPortalNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Calendar, Clock, Receipt, UserPlus } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Props {
  employee: {
    employee_id: string;
    job_title: string;
    department?: string;
    manager?: string;
  };
  leaveBalances: Array<{ name: string; color: string; remaining: number; used: number }>;
  recentLeaves: Array<{ id: number; status: string; start_date: string; end_date: string; leave_type?: { name: string } }>;
  recentAttendance: Array<{ date: string; status: string; clock_in?: string; clock_out?: string }>;
  recentPayslips: Array<{ id: number; period: string; amount: string }>;
  managerQueue?: { pending_team_leaves: number; team_on_leave_today: number } | null;
}

export default function StaffDashboard({
  employee,
  leaveBalances,
  recentLeaves,
  recentAttendance,
  recentPayslips,
  managerQueue,
}: Props) {
  const route = useRoute();

  return (
    <ModuleDashboardShell
      title="My HR"
      description={`${employee.job_title}${employee.department ? ` · ${employee.department}` : ''}`}
      workspaceLabel="Employee portal"
      heroAccent="from-blue-500/15 via-indigo-500/8 to-violet-500/5"
    >
        <StaffPortalNav showTeam={Boolean(managerQueue)} />

        {managerQueue && managerQueue.pending_team_leaves > 0 && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="flex items-center justify-between py-4">
              <p className="text-sm">
                <strong>{managerQueue.pending_team_leaves}</strong> leave request(s) from your team need approval
              </p>
              <Button size="sm" asChild>
                <Link href={route('staff.team.index')}>Review team</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {leaveBalances.slice(0, 4).map((b) => (
            <Card key={b.name}>
              <CardHeader className="pb-2">
                <CardDescription>{b.name}</CardDescription>
                <CardTitle className="text-2xl">{b.remaining} days</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">{b.used} used this year</CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent leave</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href={route('staff.leave.create')}>
                  <UserPlus className="mr-1 h-3 w-3" />
                  Request
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentLeaves.length === 0 && (
                <p className="text-sm text-muted-foreground">No leave requests yet.</p>
              )}
              {recentLeaves.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between text-sm">
                  <span>{leave.leave_type?.name}</span>
                  <Badge variant="secondary">{leave.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Attendance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentAttendance.map((row, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{row.date}</span>
                  <span className="text-muted-foreground">{row.clock_in ?? '—'} – {row.clock_out ?? '—'}</span>
                </div>
              ))}
              <Button variant="link" className="h-auto p-0" asChild>
                <Link href={route('staff.attendance.index')}>View all</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Receipt className="h-4 w-4" />
                Payslips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentPayslips.length === 0 && (
                <p className="text-sm text-muted-foreground">No approved payslips yet.</p>
              )}
              {recentPayslips.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span>{p.period}</span>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={route('staff.payslips.download', p.id)}>Download</a>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
    </ModuleDashboardShell>
  );
}
