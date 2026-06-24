import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import useRoute from '@/Hooks/useRoute';

import HrPageShell from '@/Components/HR/HrPageShell';
import { HrStatCard } from '@/Components/HR/HrPageShell';

import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { Plus } from 'lucide-react';

interface LeaveType {
  id: number;
  name: string;
  code: string;
  days_per_year: number;
  is_paid: boolean;
  is_active: boolean;
  color: string;
}

interface Props {
  leaveTypes: { data: LeaveType[] };
}

export default function Types({ leaveTypes }: Props) {
  const route = useRoute();

  const { data, setData, post, processing, reset } = useForm({
    name: '',
    code: '',
    days_per_year: 21,
    min_notice_days: 7,
    color: '#3b82f6',
    is_paid: true,
    requires_approval: true,
    carry_forward: false,
    is_active: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('hr.leave-types.store'), {
      onSuccess: () => reset(),
    });
  };

  const activeCount = leaveTypes.data.filter(l => l.is_active).length;

  return (
    <HrPageShell
      title="Leave Types"
      description="Configure leave categories, entitlements, and rules."
      actions={
        <Button onClick={() => router.get(route('hr.leave-types.create'))}>
          <Plus className="mr-2 h-4 w-4" />
          New type
        </Button>
      }
    >
      <Head title="Leave Types" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <HrStatCard label="Total Types" value={leaveTypes.data.length} />
        <HrStatCard label="Active Types" value={activeCount} />
      </div>

      {/* Create Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Leave Type</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Code</Label>
              <Input
                value={data.code}
                onChange={(e) => setData('code', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Days per Year</Label>
              <Input
                type="number"
                value={data.days_per_year}
                onChange={(e) =>
                  setData('days_per_year', Number(e.target.value))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Min Notice Days</Label>
              <Input
                type="number"
                value={data.min_notice_days}
                onChange={(e) =>
                  setData('min_notice_days', Number(e.target.value))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <Input
                type="color"
                value={data.color}
                onChange={(e) => setData('color', e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <Button type="submit" disabled={processing}>
                Create Leave Type
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Configured Types</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Days/Year</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {leaveTypes.data.map((lt) => (
                <TableRow key={lt.id}>
                  <TableCell className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: lt.color }}
                    />
                    {lt.name}
                  </TableCell>

                  <TableCell>{lt.code}</TableCell>
                  <TableCell>{lt.days_per_year}</TableCell>
                  <TableCell>{lt.is_paid ? 'Yes' : 'No'}</TableCell>

                  <TableCell>
                    <Badge variant={lt.is_active ? 'default' : 'secondary'}>
                      {lt.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </HrPageShell>
  );
}