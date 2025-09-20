import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';

interface AttendanceRecord {
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'On Leave';
  checkIn?: string;
  checkOut?: string;
}

interface EmployeeAttendanceProps {
  employeeName: string;
  records: AttendanceRecord[];
}

const statusColor = {
  Present: 'text-green-600',
  Absent: 'text-red-600',
  Late: 'text-yellow-600',
  'On Leave': 'text-blue-600',
};

export default function EmployeeAttendance({ employeeName, records }: EmployeeAttendanceProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance for {employeeName}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-400">No attendance records found.</TableCell>
              </TableRow>
            ) : (
              records.map((rec, i) => (
                <TableRow key={i}>
                  <TableCell>{rec.date}</TableCell>
                  <TableCell className={statusColor[rec.status]}>{rec.status}</TableCell>
                  <TableCell>{rec.checkIn || '-'}</TableCell>
                  <TableCell>{rec.checkOut || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
