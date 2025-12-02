import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Edit } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/Components/ui/table"

export default function ShowDepartment({ department, stats, orgChart }) {
  const route = useRoute();

  const rows = [
    { label: "Name", value: department.name },
    { label: "Code", value: department.code },
    { label: "Description", value: department.description },
    { label: "Manager", value: department.manager?.name ?? "None" },
    {
      label: "Parent Department",
      value: department.parent_department?.name ?? "None",
    },
    { label: "Location", value: department.location },
    {
      label: "Budget",
      value: `ZMW ${Number(department.budget).toLocaleString()}`,
    },
    {
      label: "Status",
      value: department.is_active ? "Active" : "Inactive",
    },
  ]

  return (
    <AppLayout title={`Department: ${department.name}`}>
      <Head title={department.name} />

      <div className="w-full mx-auto py-8 space-y-6">

        {/* Overview */}
      <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Department Details
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.label}>
                <TableHead className="w-48 font-medium">{row.label}</TableHead>
                <TableCell>{row.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4">
          <Link href={route("hr.departments.edit", department.id)}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Department
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Department Stats</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Employees" value={stats.total_employees} />
            <Stat label="Total Budget" value={`ZMW ${stats.total_budget.toLocaleString()}`} />
            <Stat label="Sub-Departments" value={stats.child_departments} />
            <Stat label="Avg Salary" value={stats.average_salary ? `ZMW ${stats.average_salary}` : 'N/A'} />
          </CardContent>
        </Card>

        {/* Org Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Org Chart</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="font-medium mb-2">{orgChart.name}</div>
            {orgChart.children.length === 0 && (
              <div className="text-sm text-gray-600">No child departments.</div>
            )}

            {orgChart.children.length > 0 && (
              <ul className="ml-4 list-disc text-sm">
                {orgChart.children.map(child => (
                  <li key={child.id}>{child.name}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Employees */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Employees</CardTitle>
          </CardHeader>
          <CardContent>
            {department.employees.length === 0 ? (
              <div className="text-sm text-gray-600">No employees in this department.</div>
            ) : (
              <ul className="divide-y">
                {department.employees.map(emp => (
                  <li key={emp.id} className="py-2">
                    {emp.user?.name ?? 'Unknown'}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

/* Small helper components */
function Detail({ label, value }) {
  return (
    <div>
      <div className="font-medium">{label}:</div>
      <div className="text-gray-700">{value}</div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="p-3 border rounded-lg">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
