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
  SelectValue
} from '@/Components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Search, Filter, Eye, Edit, Receipt, Plus } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Payroll {
  id: number;
  employee_name: string;
  period: string;
  amount: string;
  status?: string;
}

interface Props {
  payrolls: {
    data: Payroll[];
    links: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  filters: {
    employee?: string;
    period?: string;
    status?: string;
  };
}

export default function PayrollIndex({ payrolls, filters }: Props) {
  const route = useRoute();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);

    router.get(route('hr.payroll.index'), {
      ...filters,
      employee: form.get('employee') || undefined
    }, {
      preserveState: true,
      replace: true
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    router.get(route('hr.payroll.index'), {
      ...filters,
      [key]: value === 'all' ? undefined : value
    }, {
      preserveState: true,
      replace: true
    });
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <HrPageShell
      title="Payroll"
      description="Manage employee payroll records and salary cycles."
      actions={
        <Link href={route('hr.payroll.create')}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add payroll
          </Button>
        </Link>
      }
    >
      <Head title="Payroll" />

      {/* Filters */}
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              name="employee"
              placeholder="Search employee..."
              defaultValue={filters?.employee || ''}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          <Input
            placeholder="Period (YYYY-MM)"
            defaultValue={filters.period || ''}
            onBlur={e => handleFilterChange('period', e.target.value)}
            className="w-40"
          />

          <Select
            value={filters.status || 'all'}
            onValueChange={value => handleFilterChange('status', value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {payrolls.data.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.employee_name}</TableCell>
                <TableCell>{p.period}</TableCell>
                <TableCell>{p.amount}</TableCell>
                <TableCell>
                  <Badge className={statusColor(p.status || 'pending')}>
                    {(p.status || 'pending').replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={route('hr.payroll.show', p.id)}>
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={route('hr.payroll.edit', p.id)}>
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {payrolls.data.length === 0 && (
          <div className="py-12 text-center">
            <Receipt className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No payroll records found.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {payrolls.last_page > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {payrolls.from} to {payrolls.to} of {payrolls.total}
          </div>

          <div className="flex gap-1">
            {payrolls.links.map((link, i) =>
              link.url ? (
                <Link key={i} href={link.url}>
                  <Button size="sm" variant={link.active ? 'default' : 'outline'}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                </Link>
              ) : (
                <Button
                  key={i}
                  size="sm"
                  variant="outline"
                  disabled
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              )
            )}
          </div>
        </div>
      )}
    </HrPageShell>
  );
}