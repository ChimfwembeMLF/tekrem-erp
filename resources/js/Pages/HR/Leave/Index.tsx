import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import useRoute from '@/Hooks/useRoute';
import HrPageShell, { HrStatCard } from '@/Components/HR/HrPageShell';
import {
  Calendar,
  Plus,
  Search,
  Check,
  X,
  Clock,
} from 'lucide-react';

export default function LeaveIndex({ leaves, leaveTypes, employees, filters }) {
  const route = useRoute();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);

    router.get(route('hr.leave.index'), {
      ...filters,
      search: form.get('search') || undefined,
    }, { preserveState: true, replace: true });
  };

  const handleFilterChange = (key: string, value: string) => {
    router.get(route('hr.leave.index'), {
      ...filters,
      [key]: value === 'all' ? undefined : value,
    }, { preserveState: true, replace: true });
  };

  const stats = {
    pending: leaves.data.filter(l => l.status === 'pending').length,
    approved: leaves.data.filter(l => l.status === 'approved').length,
    rejected: leaves.data.filter(l => l.status === 'rejected').length,
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <Check className="h-3 w-3" />;
      case 'rejected': return <X className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <HrPageShell
      title="Leave"
      description="Review and manage employee leave requests"
      actions={
        <Link href={route('hr.leave.create')}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New request
          </Button>
        </Link>
      }
    >
      <Head title="Leave" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <HrStatCard label="Pending" value={stats.pending} />
        <HrStatCard label="Approved" value={stats.approved} />
        <HrStatCard label="Rejected" value={stats.rejected} />
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input name="search" placeholder="Search leave requests..." className="flex-1" />
          <Button variant="outline"><Search className="h-4 w-4" /></Button>
        </form>

        <div className="flex flex-wrap gap-3">
          <Select onValueChange={(v) => handleFilterChange('status', v)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(v) => handleFilterChange('leave_type_id', v)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Leave type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {leaveTypes.map(t => (
                <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(v) => handleFilterChange('employee_id', v)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All employees</SelectItem>
              {employees.map(e => (
                <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl border divide-y">
        {leaves.data.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No leave requests found.
          </p>
        ) : (
          leaves.data.map((l) => (
            <Link
              key={l.id}
              href={route('hr.leave.show', l.id)}
              className="flex items-center justify-between px-4 py-3 hover:bg-muted/40"
            >
              <div>
                <p className="font-medium">{l.employee.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {l.leave_type.name} · {l.start_date} → {l.end_date}
                </p>
              </div>

              <Badge className={`${statusColor(l.status)} flex items-center gap-1`}>
                {statusIcon(l.status)}
                {l.status}
              </Badge>
            </Link>
          ))
        )}
      </div>
    </HrPageShell>
  );
}