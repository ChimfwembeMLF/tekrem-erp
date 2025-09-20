import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import useRoute from '@/Hooks/useRoute';
import { Edit } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
}

interface Attendance {
  id: number;
  employee: Employee;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  break_duration: number | null;
  overtime_hours: number | null;
  status: string;
  notes: string | null;
  is_manual_entry: boolean;
}

interface ShowAttendanceProps {
  attendance: Attendance;
}

export default function ShowAttendance({ attendance }: ShowAttendanceProps) {
  const route = useRoute();
  return (
    <AppLayout title="Attendance Details">
      <Head title="Attendance Details" />
      <div className="max-w-xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Employee</div>
                <div className="font-semibold text-lg">{attendance.employee?.name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Date</div>
                <div>{attendance.date}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Clock In</div>
                <div>{attendance.clock_in ?? <span className="text-gray-400">N/A</span>}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Clock Out</div>
                <div>{attendance.clock_out ?? <span className="text-gray-400">N/A</span>}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Break Duration</div>
                <div>{attendance.break_duration ?? <span className="text-gray-400">N/A</span>} minutes</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Overtime Hours</div>
                <div>{attendance.overtime_hours ?? <span className="text-gray-400">N/A</span>}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Status</div>
                <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800">
                  {attendance.status}
                </span>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Manual Entry</div>
                <div>{attendance.is_manual_entry ? 'Yes' : 'No'}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-gray-500 uppercase mb-1">Notes</div>
                <div>{attendance.notes ?? <span className="text-gray-400">N/A</span>}</div>
              </div>
            </div>
            <div className="flex justify-end mt-8">
              <Link href={route('hr.attendance.edit', attendance.id)}>
                <Button variant="outline"><Edit className="h-4 w-4 mr-2" />Edit</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
