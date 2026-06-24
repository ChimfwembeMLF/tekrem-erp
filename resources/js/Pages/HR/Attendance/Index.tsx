import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import useRoute from '@/Hooks/useRoute';
import HrPageShell, { HrStatCard } from '@/Components/HR/HrPageShell';
import {
  Clock,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';

export default function AttendanceIndex({ attendances, employees, filters }) {
  const route = useRoute();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);

    router.get(
      route('hr.attendance.index'),
      { ...filters, search: form.get('search') || undefined },
      { preserveState: true, replace: true }
    );
  };

  const handleFilterChange = (key: string, value: string) => {
    router.get(
      route('hr.attendance.index'),
      { ...filters, [key]: value === 'all' ? undefined : value },
      { preserveState: true, replace: true }
    );
  };

  const stats = {
    present: attendances.data.filter(a => a.status === 'present').length,
    absent: attendances.data.filter(a => a.status === 'absent').length,
    late: attendances.data.filter(a => a.status === 'late').length,
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <HrPageShell
      title="Attendance"
      description="Track and manage employee attendance records"
      actions={
        <div className="flex gap-2">
          <Link href={route('hr.attendance.reports')}>
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Reports
            </Button>
          </Link>
          <Link href={route('hr.attendance.create')}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Attendance
            </Button>
          </Link>
        </div>
      }
    >
      <Head title="Attendance" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <HrStatCard label="Present Today" value={stats.present} />
        <HrStatCard label="Absent" value={stats.absent} />
        <HrStatCard label="Late" value={stats.late} />
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input name="search" placeholder="Search attendance..." className="flex-1" />
          <Button variant="outline"><Search className="h-4 w-4" /></Button>
        </form>

        <div className="flex flex-wrap gap-3">
          <Select onValueChange={(v) => handleFilterChange('employee_id', v)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {employees.map(e => (
                <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(v) => handleFilterChange('status', v)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="late">Late</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl border divide-y">
        {attendances.data.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No attendance records found.
          </p>
        ) : (
          attendances.data.map((a) => (
            <Link
              key={a.id}
              href={route('hr.attendance.show', a.id)}
              className="flex items-center justify-between px-4 py-3 hover:bg-muted/40"
            >
              <div>
                <p className="font-medium">{a.employee.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {a.date} · In: {a.clock_in ?? '-'} · Out: {a.clock_out ?? '-'}
                </p>
              </div>

              <Badge className={statusColor(a.status)}>
                {a.status}
              </Badge>
            </Link>
          ))
        )}
      </div>
    </HrPageShell>
  );
}