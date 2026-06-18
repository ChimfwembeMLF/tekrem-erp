import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import useRoute from '@/Hooks/useRoute';

interface Summary {
  total_records: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  avg_hours_worked: number;
  total_overtime: number;
}

interface DepartmentStat {
  department_name: string;
  total_records: number;
  present_count: number;
  late_count: number;
}

interface Props {
  summary: Summary;
  departmentStats: DepartmentStat[];
  filters: { start_date: string; end_date: string };
}

export default function AttendanceReport({ summary, departmentStats, filters }: Props) {
  const route = useRoute();
  const [startDate, setStartDate] = React.useState(filters.start_date);
  const [endDate, setEndDate] = React.useState(filters.end_date);

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('hr.attendance.reports'), { start_date: startDate, end_date: endDate }, { preserveState: true });
  };

  return (
    <AppLayout title="Attendance Report">
      <Head title="Attendance Report" />
      <div className="max-w-5xl mx-auto py-8 space-y-6">
        <h1 className="text-2xl font-bold">Attendance Report</h1>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={applyFilters} className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <Button type="submit">Apply</Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{summary?.total_records ?? 0}</div><p className="text-xs text-muted-foreground">Total records</p></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{summary?.present_count ?? 0}</div><p className="text-xs text-muted-foreground">Present</p></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{summary?.absent_count ?? 0}</div><p className="text-xs text-muted-foreground">Absent</p></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{summary?.late_count ?? 0}</div><p className="text-xs text-muted-foreground">Late</p></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{Number(summary?.avg_hours_worked ?? 0).toFixed(1)}</div><p className="text-xs text-muted-foreground">Avg hours</p></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{Number(summary?.total_overtime ?? 0).toFixed(1)}</div><p className="text-xs text-muted-foreground">Overtime hrs</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>By Department</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Present</TableHead>
                  <TableHead>Late</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departmentStats.map((d) => (
                  <TableRow key={d.department_name}>
                    <TableCell>{d.department_name}</TableCell>
                    <TableCell>{d.total_records}</TableCell>
                    <TableCell>{d.present_count}</TableCell>
                    <TableCell>{d.late_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
