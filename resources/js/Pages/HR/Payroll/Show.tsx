
import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Edit } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';


interface Payroll {
  id: number;
  employee_name: string;
  period: string;
  amount: string;
  status?: string;
  rejected_reason?: string;
}

interface ShowPayrollProps {
  payroll: Payroll;
}

export default function ShowPayroll({ payroll }: ShowPayrollProps) {
  const route = useRoute();
  return (
    <AppLayout title="Payroll Details">
      <Head title="Payroll Details" />
      <div className="w-full mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Payroll Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">Employee</div>
                <div className="text-base">{payroll.employee_name}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">Period</div>
                <div className="text-base">{payroll.period}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">Amount</div>
                <div className="text-base">{payroll.amount}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">Status</div>
                <div className="text-base capitalize">{payroll.status || 'pending'}</div>
              </div>
              {payroll.status === 'rejected' && (
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold text-red-600">Rejection Reason</div>
                  <div className="text-base text-red-600">{payroll.rejected_reason}</div>
                </div>
              )}
              <div className="pt-4 flex gap-2">
                <Link href={route('hr.payroll.edit', payroll.id)}>
                  <Button variant="outline"><Edit className="h-4 w-4 mr-2" />Edit</Button>
                </Link>
                {payroll.status === 'pending' && (
                  <>
                    <form method="post" action={route('hr.payroll.approve', payroll.id)} style={{ display: 'inline' }}>
                      <Button type="submit" variant="success">Approve</Button>
                    </form>
                    <form method="post" action={route('hr.payroll.reject', payroll.id)} style={{ display: 'inline', marginLeft: 8 }}>
                      <input type="text" name="reason" placeholder="Rejection reason" required className="border rounded px-2 py-1 mr-2" />
                      <Button type="submit" variant="destructive">Reject</Button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
