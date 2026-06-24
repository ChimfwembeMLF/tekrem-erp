import React from 'react';
import { Head } from '@inertiajs/react';
import HrPageShell, { HrStatCard } from '@/Components/HR/HrPageShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
  BarChart3,
  Users,
  Building,
  Calendar,
  Clock,
  TrendingUp,
  GraduationCap,
  Download,
  Filter
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

export default function Dashboard({ stats, charts, filters }: any) {
  const { t } = useTranslate();
  const route = useRoute();

  const handleDateFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set(key, value);
    window.location.href = `${route('hr.analytics.dashboard')}?${params.toString()}`;
  };

  return (
    <HrPageShell
      title={t('hr.analytics_dashboard', 'HR Analytics Dashboard')}
      description="System-wide HR performance visibility and operational insights"
      actions={
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          {t('hr.export_data', 'Export Data')}
        </Button>
      }
    >
      <Head title="HR Analytics Dashboard" />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('hr.date_range', 'Date Range')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm">From</label>
            <Input
              type="date"
              value={filters.start_date}
              onChange={(e) => handleDateFilterChange('start_date', e.target.value)}
              className="w-40"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm">To</label>
            <Input
              type="date"
              value={filters.end_date}
              onChange={(e) => handleDateFilterChange('end_date', e.target.value)}
              className="w-40"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <HrStatCard
          label="Total Employees"
          value={stats.employees.total}
        />
        <HrStatCard
          label="Active Employees"
          value={stats.employees.active}
        />
        <HrStatCard
          label="Leave Requests"
          value={stats.leave.total_requests}
        />
        <HrStatCard
          label="Attendance Rate"
          value={`${stats.attendance.average_attendance_rate}%`}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>Total Reviews: {stats.performance.total_reviews}</div>
              <div>Completed: {stats.performance.completed_reviews}</div>
              <div>Overdue: {stats.performance.overdue_reviews}</div>
              <div>Avg Rating: {stats.performance.average_rating.toFixed(1)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Training Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>Programs: {stats.training.total_programs}</div>
              <div>Enrollments: {stats.training.total_enrollments}</div>
              <div>Completed: {stats.training.completed_programs}</div>
              <div>Completion Rate: {stats.training.completion_rate}%</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Department Overview</CardTitle>
          <CardDescription>Headcount and budget allocation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.departments.map((d: any, i: number) => (
              <div key={i} className="flex justify-between text-sm border-b pb-2">
                <span>{d.name} ({d.employee_count})</span>
                <span>${d.budget?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </HrPageShell>
  );
}