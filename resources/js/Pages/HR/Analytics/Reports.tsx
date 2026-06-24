import React from 'react';
import { Head, router } from '@inertiajs/react';
import useRoute from '@/Hooks/useRoute';

import HrPageShell from '@/Components/HR/HrPageShell';
import { HrStatCard } from '@/Components/HR/HrPageShell';

import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
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

import { FileBarChart } from 'lucide-react';

interface Props {
  reportType: string;
  reportData: Record<string, unknown>[];
  filters: { start_date: string; end_date: string };
}

export default function Reports({ reportType, reportData, filters }: Props) {
  const route = useRoute();

  const [type, setType] = React.useState(reportType);
  const [startDate, setStartDate] = React.useState(filters.start_date);
  const [endDate, setEndDate] = React.useState(filters.end_date);

  const loadReport = (e: React.FormEvent) => {
    e.preventDefault();

    router.get(route('hr.analytics.reports'), {
      type,
      start_date: startDate,
      end_date: endDate
    });
  };

  const columns = reportData.length > 0
    ? Object.keys(reportData[0])
    : [];

  return (
    <HrPageShell
      title="HR Reports"
      description="Generate and analyze workforce performance, attendance, leave, and training insights."
      actions={
        <Button onClick={loadReport}>
          <FileBarChart className="mr-2 h-4 w-4" />
          Generate
        </Button>
      }
    >
      <Head title="HR Reports" />

      {/* tiny stat placeholder (optional but keeps layout consistent) */}
      <div className="grid gap-4 sm:grid-cols-2">
        <HrStatCard label="Report Type" value={type} />
        <HrStatCard label="Records" value={reportData.length} />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={loadReport} className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employees">Employees</SelectItem>
                  <SelectItem value="attendance">Attendance</SelectItem>
                  <SelectItem value="leave">Leave</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>End</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <Button type="submit" variant="outline">
              Generate
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>
            {type.charAt(0).toUpperCase() + type.slice(1)} Report
          </CardTitle>
        </CardHeader>

        <CardContent>
          {reportData.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No data for the selected period.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col}>
                      {col.replace(/_/g, ' ')}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {reportData.map((row, i) => (
                  <TableRow key={i}>
                    {columns.map((col) => (
                      <TableCell key={col}>
                        {String(row[col] ?? '')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </HrPageShell>
  );
}