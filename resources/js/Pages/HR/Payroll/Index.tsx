
import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Eye, Edit } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Payroll {
  id: number;
  employee_name: string;
  period: string;
  amount: string;
}

interface PayrollIndexProps {
  payrolls: Payroll[];
}

export default function PayrollIndex({ payrolls = [] }: PayrollIndexProps) {
  const route = useRoute();
  return (
    <AppLayout title="Payroll">
      <Head title="Payroll" />
      <div className="max-w-5xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Payroll</h1>
          <Link href={route('hr.payroll.create')}><Button>Add Payroll</Button></Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Payroll Records</CardTitle>
          </CardHeader>
          <CardContent>
            {payrolls.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No payroll records found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Period</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {payrolls.map((payroll) => (
                      <tr key={payroll.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                        <td className="px-6 py-4 whitespace-nowrap">{payroll.employee_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{payroll.period}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{payroll.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                          <Link href={route('hr.payroll.show', payroll.id)}><Button size="sm" variant="outline"><Eye className="h-4 w-4" /></Button></Link>
                          <Link href={route('hr.payroll.edit', payroll.id)}><Button size="sm" variant="ghost"><Edit className="h-4 w-4" /></Button></Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
