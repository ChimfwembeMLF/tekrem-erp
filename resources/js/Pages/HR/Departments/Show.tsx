import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import useRoute from '@/Hooks/useRoute';
import { Edit } from 'lucide-react';

interface Manager {
  id: number;
  name: string;
}

interface ParentDepartment {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
  manager: Manager | null;
  parent_department: ParentDepartment | null;
  location: string;
  budget: number;
  is_active: boolean;
}

interface DepartmentShowProps {
  department: Department;
}

export default function ShowDepartment({ department }: DepartmentShowProps) {
  const route = useRoute();
  return (
    <AppLayout title="Department Details">
      <Head title="Department Details" />
      <div className="max-w-xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Department Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="font-medium">Name:</div>
              <div>{department.name}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium">Code:</div>
              <div>{department.code}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium">Description:</div>
              <div>{department.description}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium">Manager:</div>
              <div>{department.manager?.name || 'None'}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium">Parent Department:</div>
              <div>{department.parent_department?.name || 'None'}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium">Location:</div>
              <div>{department.location}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium">Budget:</div>
              <div>{department.budget}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium">Status:</div>
              <div>{department.is_active ? 'Active' : 'Inactive'}</div>
            </div>
            <Link href={route('hr.departments.edit', department.id)}>
              <Button variant="outline"><Edit className="h-4 w-4 mr-2" />Edit</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
