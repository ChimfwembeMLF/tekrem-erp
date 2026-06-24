import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import useRoute from '@/Hooks/useRoute';
import HrPageShell, { HrStatCard } from '@/Components/HR/HrPageShell';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import {
  Users,
  Plus,
  Search,
  Building,
} from 'lucide-react';

interface Employee {
  id: number;
  employee_id: string;
  user: { name: string; email: string };
  job_title: string;
  department: { name: string } | null;
  employment_type: string;
  employment_status: string;
  hire_date: string;
}

interface Props {
  employees: { data: Employee[] };
  departments: { id: number; name: string }[];
  filters: {
    search?: string;
    department_id?: string;
    employment_status?: string;
    employment_type?: string;
  };
  stats?: {
    total: number;
    active: number;
    on_leave: number;
  };
}

export default function EmployeesIndex({
  employees,
  departments,
  filters,
  stats,
}: Props) {
  const route = useRoute();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const search = new FormData(e.currentTarget).get('search') as string;

    router.get(
      route('hr.employees.index'),
      { ...filters, search: search || undefined },
      { preserveState: true, replace: true }
    );
  };

  const handleFilter = (key: string, value: string) => {
    router.get(
      route('hr.employees.index'),
      { ...filters, [key]: value === 'all' ? undefined : value },
      { preserveState: true, replace: true }
    );
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'on_leave': return 'secondary';
      case 'terminated': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <HrPageShell
      title="Employees"
      description="Manage workforce, roles, and organizational structure."
      actions={
        <Link href={route('hr.employees.create')}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </Link>
      }
    >
      <Head title="Employees" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <HrStatCard label="Total" value={stats?.total ?? 0} icon={<Users className="h-4 w-4" />} />
        <HrStatCard label="Active" value={stats?.active ?? 0} variant="success" />
        <HrStatCard label="On leave" value={stats?.on_leave ?? 0} variant="warning" />
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input name="search" placeholder="Search employees..." />
          <Button variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex flex-wrap gap-3">
          <Select
            value={filters.department_id || 'all'}
            onValueChange={(v) => handleFilter('department_id', v)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id.toString()}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.employment_status || 'all'}
            onValueChange={(v) => handleFilter('employment_status', v)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
              <SelectItem value="on_leave">On leave</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl border border-border divide-y divide-border">
        {employees.data.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No employees found.
          </p>
        ) : (
          employees.data.map((e) => (
            <Link
              key={e.id}
              href={route('hr.employees.show', e.id)}
              className="flex items-center justify-between px-4 py-3 hover:bg-muted/40"
            >
              <div>
                <p className="font-medium">{e.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {e.job_title} · {e.department?.name ?? 'No department'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant={statusColor(e.employment_status)}>
                  {e.employment_status.replace('_', ' ')}
                </Badge>

                <span className="text-sm text-muted-foreground">
                  {e.employee_id}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </HrPageShell>
  );
}