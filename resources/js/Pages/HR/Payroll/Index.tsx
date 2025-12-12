import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/Components/ui/card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/Components/ui/table';
import { Search, Filter, Eye, Edit, Receipt } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Payroll {
  id: number;
  employee_name: string;
  period: string;
  amount: string;
  status?: string;
}

interface PayrollIndexProps {
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

export default function PayrollIndex({ payrolls, filters }: PayrollIndexProps) {
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
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <AppLayout title="Payroll" renderHeader={() => (
      <h2 className="font-semibold text-xl text-gray-800 leading-tight">
        Payroll
      </h2>
    )}>
      <Head title="Payroll" />

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Payroll
                  </CardTitle>
                  <CardDescription>
                    Manage employee payroll records
                  </CardDescription>
                </div>

                <Link href={route('hr.payroll.create')}>
                  <Button>
                    <Receipt className="h-4 w-4 mr-2" />
                    Add Payroll
                  </Button>
                </Link>
              </div>
            </CardHeader>

            <CardContent>
              {/* Filters */}
              <div className="mb-6 space-y-4">
                {/* Search by employee */}
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      name="employee"
                      placeholder="Search employee..."
                      defaultValue={filters.employee || ''}
                      className="pl-10"
                    />
                  </div>
                  <Button type="submit" variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>

                {/* Additional filters */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Filters:</span>
                  </div>

                  {/* Period filter */}
                  <Input
                    placeholder="Period (YYYY-MM)"
                    defaultValue={filters.period || ''}
                    onBlur={e => handleFilterChange('period', e.target.value)}
                    className="w-40"
                  />

                  {/* Status filter */}
                  <Select
                    value={filters.status || 'all'}
                    onValueChange={value => handleFilterChange('status', value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Payroll table */}
              <div className="border rounded-lg">
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
                        <TableCell className="font-medium">
                          {p.employee_name}
                        </TableCell>
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

                {/* Empty state */}
                {payrolls.data.length === 0 && (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No payroll records found
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Start by adding your first payroll record.
                    </p>
                    <Link href={route('hr.payroll.create')}>
                      <Button>
                        <Receipt className="h-4 w-4 mr-2" />
                        Add Payroll
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {payrolls.last_page > 1 && (
                <div className="mt-6 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Showing {payrolls.from} to {payrolls.to} of {payrolls.total} records
                  </div>
                  <div className="flex gap-1">
                    {payrolls.links.map((link, i) => {
                      if (!link.url) {
                        return (
                          <Button key={i} variant="outline" size="sm" disabled
                            dangerouslySetInnerHTML={{ __html: link.label }}
                          />
                        );
                      }

                      return (
                        <Link key={i} href={link.url}>
                          <Button
                            variant={link.active ? 'default' : 'outline'}
                            size="sm"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                          />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
