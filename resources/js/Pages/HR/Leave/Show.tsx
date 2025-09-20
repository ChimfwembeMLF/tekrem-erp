import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import useRoute from '@/Hooks/useRoute';
import { Edit } from 'lucide-react';

interface LeaveType {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  name: string;
}

interface Leave {
  id: number;
  employee: Employee;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  days_requested: number;
  status: string;
  reason: string;
  submitted_at: string;
  approver?: {
    name: string;
  };
}

interface ShowLeaveProps {
  leave: Leave;
}

export default function ShowLeave({ leave }: ShowLeaveProps) {
  const route = useRoute();
  return (
    <AppLayout title="Leave Request Details">
      <Head title="Leave Request Details" />
      <div className="max-w-xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Leave Request Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="font-medium">Employee:</div>
              <div>{leave.employee?.name}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium">Leave Type:</div>
              <div>{leave.leave_type?.name}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium">Start Date:</div>
              <div>{leave.start_date}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium">End Date:</div>
              <div>{leave.end_date}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium">Days Requested:</div>
              <div>{leave.days_requested}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium">Status:</div>
              <div>{leave.status}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium">Reason:</div>
              <div>{leave.reason}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium">Submitted At:</div>
              <div>{leave.submitted_at}</div>
            </div>
            {leave.approver && (
              <div className="mb-4">
                <div className="font-medium">Approver:</div>
                <div>{leave.approver.name}</div>
              </div>
            )}
            <Link href={route('hr.leave.edit', leave.id)}>
              <Button variant="outline"><Edit className="h-4 w-4 mr-2" />Edit</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
