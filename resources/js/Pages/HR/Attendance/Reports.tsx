import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';

interface AttendanceSummary {
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

interface ReportsProps {
  summary: AttendanceSummary;
  departmentStats: DepartmentStat[];
  filters: {
    start_date: string;
    end_date: string;
  };
}

export default function AttendanceReports({ summary, departmentStats, filters }: ReportsProps) {
  return (
    <AppLayout title="Attendance Reports">
      <Head title="Attendance Reports" />
      <div className="max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Summary ({filters.start_date} to {filters.end_date})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Total Records</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Late</TableHead>
                    <TableHead>Avg Hours Worked</TableHead>
                    <TableHead>Total Overtime</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{summary.total_records}</TableCell>
                    <TableCell>{summary.present_count}</TableCell>
                    <TableCell>{summary.absent_count}</TableCell>
                    <TableCell>{summary.late_count}</TableCell>
                    <TableCell>{summary.avg_hours_worked?.toFixed(2)}</TableCell>
                    <TableCell>{summary.total_overtime}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Department-wise Attendance</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Total Records</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Late</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentStats.map((dept) => (
                    <TableRow key={dept.department_name}>
                      <TableCell>{dept.department_name}</TableCell>
                      <TableCell>{dept.total_records}</TableCell>
                      <TableCell>{dept.present_count}</TableCell>
                      <TableCell>{dept.late_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
