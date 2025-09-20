import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Edit } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Department { id: number; name: string; }
interface Employee {
  id: number;
  name: string;
  email: string;
  employee_id: string;
  job_title: string;
  department: Department | null;
  employment_type: string;
  employment_status: string;
  hire_date: string;
  notes: string;
}
interface ShowEmployeeProps { employee: Employee; }

export default function ShowEmployee({ employee }: ShowEmployeeProps) {
  const route = useRoute();
  return (
    <AppLayout title="Employee Details">
      <Head title="Employee Details" />
      <div className="max-w-xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Employee Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Name</div>
                <div className="font-semibold text-lg">{employee.name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Email</div>
                <div>{employee.email}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Employee ID</div>
                <div>{employee.employee_id}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Job Title</div>
                <div>{employee.job_title}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Department</div>
                <div>{employee.department?.name || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Employment Type</div>
                <div>{employee.employment_type.replace('_', ' ')}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Employment Status</div>
                <div>{employee.employment_status.replace('_', ' ')}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Hire Date</div>
                <div>{employee.hire_date}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs text-gray-500 uppercase mb-1">Notes</div>
                <div>{employee.notes || <span className="text-gray-400">N/A</span>}</div>
              </div>
            </div>
            <div className="flex justify-end mt-8">
              <Link href={route('hr.employees.edit', employee.id)}>
                <Button variant="outline"><Edit className="h-4 w-4 mr-2" />Edit</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
