
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
}

interface ShowPayrollProps {
  payroll: Payroll;
}

export default function ShowPayroll({ payroll }: ShowPayrollProps) {
  const route = useRoute();
  return (
    <AppLayout title="Payroll Details">
      <Head title="Payroll Details" />
      <div className="max-w-xl mx-auto py-8">
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
              <div className="pt-4">
                <Link href={route('hr.payroll.edit', payroll.id)}>
                  <Button variant="outline"><Edit className="h-4 w-4 mr-2" />Edit</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
