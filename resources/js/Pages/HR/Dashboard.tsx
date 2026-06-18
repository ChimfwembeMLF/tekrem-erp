import React from 'react';
import { Link, router } from '@inertiajs/react';
import HrPageShell, { HrWorkflowCard, HrStatCard } from '@/Components/HR/HrPageShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
  Users,
  Briefcase,
  UserPlus,
  UserMinus,
  Calendar,
  Clock,
  TrendingUp,
  GraduationCap,
  DollarSign,
  AlertCircle,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface DashboardProps {
  stats: {
    employees: { total: number; active: number; new_this_month: number };
    leave: { pending: number; approved_today: number };
    attendance: { attendance_rate: number; present_today: number; late_today: number };
    performance: { overdue_reviews: number; average_rating: number };
    training: { upcoming: number; mandatory: number };
  };
  pipeline: {
    recruitment: { open_jobs: number; new_applications: number; interviews: number };
    onboarding: { in_progress: number; completed_month: number };
    offboarding: { in_progress: number; pending_interviews: number };
    payroll: { pending: number; approved_month: number };
  };
  action_queue: {
    pending_leaves: number;
    overdue_reviews: number;
    pending_payroll: number;
    onboarding_due: number;
  };
  recent_activities: {
    leaves: Array<{ id: number; employee_name: string; leave_type: string; status: string; start_date: string }>;
    hires: Array<{ id: number; name: string; job_title: string; department: string; hire_date: string }>;
  };
}

export default function Dashboard({ stats, pipeline, action_queue, recent_activities }: DashboardProps) {
  const route = useRoute();

  const totalActions =
    action_queue.pending_leaves +
    action_queue.overdue_reviews +
    action_queue.pending_payroll +
    action_queue.onboarding_due;

  return (
    <HrPageShell
      title="People Operations"
      description="Hire → onboard → develop → pay → offboard — your full employee lifecycle in one place."
      actions={
        <>
          <Button variant="outline" onClick={() => router.get(route('hr.analytics.reports'))}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Reports
          </Button>
          <Button onClick={() => router.get(route('hr.employees.create'))}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add employee
          </Button>
        </>
      }
    >
      {totalActions > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              Needs your attention ({totalActions})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {action_queue.pending_leaves > 0 && (
              <Link href={route('hr.leave.index')}>
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                  {action_queue.pending_leaves} leave requests
                </Badge>
              </Link>
            )}
            {action_queue.overdue_reviews > 0 && (
              <Link href={route('hr.performance.index')}>
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                  {action_queue.overdue_reviews} overdue reviews
                </Badge>
              </Link>
            )}
            {action_queue.pending_payroll > 0 && (
              <Link href={route('hr.payroll.index')}>
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                  {action_queue.pending_payroll} payroll pending
                </Badge>
              </Link>
            )}
            {action_queue.onboarding_due > 0 && (
              <Link href={route('hr.onboarding.index')}>
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                  {action_queue.onboarding_due} onboarding in progress
                </Badge>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <HrStatCard label="Active employees" value={stats.employees.active} hint={`${stats.employees.new_this_month} new this month`} href={route('hr.employees.index')} />
        <HrStatCard label="Attendance today" value={`${stats.attendance.attendance_rate}%`} hint={`${stats.attendance.present_today} present`} href={route('hr.attendance.index')} />
        <HrStatCard label="Leave pending" value={stats.leave.pending} hint={`${stats.leave.approved_today} on leave today`} href={route('hr.leave.index')} />
        <HrStatCard label="Avg performance" value={stats.performance.average_rating?.toFixed(1) ?? '—'} hint={`${stats.performance.overdue_reviews} overdue`} href={route('hr.performance.index')} />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Employee lifecycle
        </h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <HrWorkflowCard
            title="Recruitment"
            description="Job postings, applications & interviews"
            href={route('hr.recruitment.index')}
            icon={<Briefcase className="h-5 w-5" />}
            stats={[
              { label: 'Open roles', value: pipeline.recruitment.open_jobs },
              { label: 'New apps (7d)', value: pipeline.recruitment.new_applications },
              { label: 'Interviews', value: pipeline.recruitment.interviews },
            ]}
          />
          <HrWorkflowCard
            title="Onboarding"
            description="New hire checklists & orientation"
            href={route('hr.onboarding.index')}
            icon={<UserPlus className="h-5 w-5" />}
            stats={[
              { label: 'In progress', value: pipeline.onboarding.in_progress },
              { label: 'Completed', value: pipeline.onboarding.completed_month },
            ]}
          />
          <HrWorkflowCard
            title="People"
            description="Employee directory & org structure"
            href={route('hr.employees.index')}
            icon={<Users className="h-5 w-5" />}
            stats={[
              { label: 'Total', value: stats.employees.total },
              { label: 'Active', value: stats.employees.active },
            ]}
          />
          <HrWorkflowCard
            title="Time & leave"
            description="Attendance, leave requests & policies"
            href={route('hr.leave.index')}
            icon={<Calendar className="h-5 w-5" />}
            stats={[
              { label: 'Pending leave', value: stats.leave.pending },
              { label: 'Attendance', value: `${stats.attendance.attendance_rate}%` },
            ]}
          />
          <HrWorkflowCard
            title="Performance"
            description="Reviews, goals & assessments"
            href={route('hr.performance.index')}
            icon={<TrendingUp className="h-5 w-5" />}
            stats={[
              { label: 'Overdue', value: stats.performance.overdue_reviews },
              { label: 'Training due', value: stats.training.mandatory },
            ]}
          />
          <HrWorkflowCard
            title="Payroll"
            description="Process pay runs & approve payslips"
            href={route('hr.payroll.index')}
            icon={<DollarSign className="h-5 w-5" />}
            stats={[
              { label: 'Pending', value: pipeline.payroll.pending },
              { label: 'Approved', value: pipeline.payroll.approved_month },
            ]}
          />
          <HrWorkflowCard
            title="Training"
            description="Programs, enrollments & certifications"
            href={route('hr.training.index')}
            icon={<GraduationCap className="h-5 w-5" />}
            stats={[
              { label: 'Upcoming', value: stats.training.upcoming },
              { label: 'Mandatory', value: stats.training.mandatory },
            ]}
          />
          <HrWorkflowCard
            title="Offboarding"
            description="Exit interviews & clearance"
            href={route('hr.offboarding.index')}
            icon={<UserMinus className="h-5 w-5" />}
            stats={[
              { label: 'In progress', value: pipeline.offboarding.in_progress },
              { label: 'Exit interviews', value: pipeline.offboarding.pending_interviews },
            ]}
          />
          <HrWorkflowCard
            title="Career portal"
            description="Public job listings & applications"
            href={route('careers.index')}
            icon={<Briefcase className="h-5 w-5" />}
            stats={[
              { label: 'Live jobs', value: pipeline.recruitment.open_jobs },
            ]}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent leave requests</CardTitle>
              <CardDescription>Pending and recent submissions</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href={route('hr.leave.index')}>
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent_activities.leaves.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent leave requests</p>
            ) : (
              recent_activities.leaves.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{leave.employee_name}</p>
                    <p className="text-xs text-muted-foreground">{leave.leave_type} · {leave.start_date}</p>
                  </div>
                  <Badge variant={leave.status === 'pending' ? 'secondary' : 'outline'}>{leave.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent hires</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href={route('hr.employees.index')}>
                Directory <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent_activities.hires.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent hires</p>
            ) : (
              recent_activities.hires.map((hire) => (
                <div key={hire.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{hire.name}</p>
                    <p className="text-xs text-muted-foreground">{hire.job_title} · {hire.department}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{hire.hire_date}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </HrPageShell>
  );
}
