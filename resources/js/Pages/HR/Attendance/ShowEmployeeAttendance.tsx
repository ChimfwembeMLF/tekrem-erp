import React from 'react';
import EmployeeAttendance from './EmployeeAttendance';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

// Example data for demonstration
const sampleRecords = [
  { date: '2025-09-01', status: 'Present' as const, checkIn: '08:00', checkOut: '17:00' },
  { date: '2025-09-02', status: 'Late' as const, checkIn: '08:30', checkOut: '17:00' },
  { date: '2025-09-03', status: 'Absent' as const },
  { date: '2025-09-04', status: 'On Leave' as const },
];

export default function ShowEmployeeAttendance() {
  return (
    <AppLayout title="Employee Attendance">
      <Head title="Employee Attendance" />
      <div className="max-w-2xl mx-auto py-8">
        <EmployeeAttendance employeeName="John Doe" records={sampleRecords} />
      </div>
    </AppLayout>
  );
}
