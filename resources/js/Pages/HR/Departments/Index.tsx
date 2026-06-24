import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import HrPageShell from '@/Components/HR/HrPageShell';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import {
  Building,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Users,
  DollarSign,
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
  manager: { name: string } | null;
  parent_department: { name: string } | null;
  location: string;
  budget: number;
  employee_count: number;
  is_active: boolean;
  employees_count: number;
}

interface ParentDepartment {
  id: number;
  name: string;
}

interface DepartmentsIndexProps {
  departments: {
    data: Department[];
    links: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  parentDepartments: ParentDepartment[];
  filters: {
    search?: string;
    is_active?: boolean;
    parent_id?: string;
  };
}

export default function Index({
  departments,
  parentDepartments,
  filters,
}: DepartmentsIndexProps) {
  const { t } = useTranslate();
  const route = useRoute();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const search = formData.get('search') as string;

    router.get(
      route('hr.departments.index'),
      { ...filters, search: search || undefined },
      { preserveState: true, replace: true }
    );
  };

  const handleFilterChange = (key: string, value: string) => {
    router.get(
      route('hr.departments.index'),
      { ...filters, [key]: value === 'all' ? undefined : value },
      { preserveState: true, replace: true }
    );
  };

  const getStatusColor = (isActive: boolean) =>
    isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW',
    }).format(amount);

  return (
    <HrPageShell
      title="Departments"
      description="Manage organizational departments and structure."
      actions={
        <Link href={route('hr.departments.create')}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Department
          </Button>
        </Link>
      }
    >
      <Head title="Departments" />

      {/* Filters */}
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              name="search"
              placeholder="Search departments..."
              defaultValue={filters.search || ''}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Filter className="h-4 w-4 text-gray-500" />
            Filters:
          </div>

          <Select
            value={filters.is_active?.toString() || 'all'}
            onValueChange={(v) => handleFilterChange('is_active', v)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.parent_id || 'all'}
            onValueChange={(v) => handleFilterChange('parent_id', v)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Parent Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="root">Root Departments</SelectItem>
              {parentDepartments.map((d) => (
                <SelectItem key={d.id} value={d.id.toString()}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Employees</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {departments.data.map((d) => (
              <TableRow key={d.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{d.name}</div>
                    {d.description && (
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {d.description}
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant="outline">{d.code}</Badge>
                </TableCell>

                <TableCell>{d.manager?.name ?? '—'}</TableCell>

                <TableCell>{d.parent_department?.name ?? 'Root'}</TableCell>

                <TableCell className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {d.employees_count}
                </TableCell>

                <TableCell className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  {d.budget ? formatCurrency(d.budget) : 'N/A'}
                </TableCell>

                <TableCell>
                  <Badge className={getStatusColor(d.is_active)}>
                    {d.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={route('hr.departments.show', d.id)}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>

                    <Link href={route('hr.departments.edit', d.id)}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {departments.data.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No departments found.
          </p>
        )}
      </div>
    </HrPageShell>
  );
}