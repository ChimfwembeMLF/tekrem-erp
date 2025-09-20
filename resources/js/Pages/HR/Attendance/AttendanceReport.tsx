import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import EmployeeAttendance from './EmployeeAttendance';

interface AttendanceRecord {
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'On Leave';
  checkIn?: string;
  checkOut?: string;
}

interface Employee {
  id: number;
  name: string;
  records: AttendanceRecord[];
}

// Example data for demonstration
const employees: Employee[] = [
  {
    id: 1,
    name: 'John Doe',
    records: [
      { date: '2025-09-01', status: 'Present', checkIn: '08:00', checkOut: '17:00' },
      { date: '2025-09-02', status: 'Late', checkIn: '08:30', checkOut: '17:00' },
      { date: '2025-09-03', status: 'Absent' },
      { date: '2025-09-04', status: 'On Leave' },
    ],
  },
  {
    id: 2,
    name: 'Jane Smith',
    records: [
      { date: '2025-09-01', status: 'Present', checkIn: '08:05', checkOut: '17:10' },
      { date: '2025-09-02', status: 'Present', checkIn: '08:00', checkOut: '17:00' },
      { date: '2025-09-03', status: 'Present', checkIn: '08:00', checkOut: '17:00' },
      { date: '2025-09-04', status: 'Late', checkIn: '08:45', checkOut: '17:00' },
    ],
  },
];

export default function AttendanceReport() {
  return (
    <AppLayout title="Attendance Report">
      <Head title="Attendance Report" />
      <div className="max-w-4xl mx-auto py-8 space-y-8">
        <h1 className="text-2xl font-bold mb-6">Employee Attendance Report</h1>
        {employees.map(emp => (
          <div key={emp.id} className="mb-8">
            <EmployeeAttendance employeeName={emp.name} records={emp.records as any} />
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
