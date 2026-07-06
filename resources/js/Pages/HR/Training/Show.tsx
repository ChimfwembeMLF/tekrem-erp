import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import useRoute from '@/Hooks/useRoute';
import { Edit, UserPlus } from 'lucide-react';

interface Enrollment {
  id: number;
  status: string;
  employee: { user: { name: string }; employee_id: string };
}

interface Training {
  id: number;
  title: string;
  description?: string;
  type: string;
  category?: string;
  status: string;
  mode: string;
  start_date: string;
  end_date: string;
  max_participants?: number;
  enrolled_count: number;
  instructor?: { name: string };
  enrollments: Enrollment[];
}

interface Props {
  training: Training;
}

export default function Show({ training }: Props) {
  const route = useRoute();

  return (
    <AppLayout title={training.title}>
      <Head title={training.title} />
      <div className="max-w-7xl mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{training.title}</h1>
            <p className="text-muted-foreground">{training.type} · {training.mode}</p>
          </div>
          <div className="flex gap-2">
            <Badge>{training.status}</Badge>
            <Link href={route('hr.training.edit', training.id)}>
              <Button variant="outline" size="sm"><Edit className="h-4 w-4 mr-2" />Edit</Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle>Program Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {training.description && <p>{training.description}</p>}
            <div><span className="text-muted-foreground">Dates: </span>{training.start_date} – {training.end_date}</div>
            {training.instructor && <div><span className="text-muted-foreground">Instructor: </span>{training.instructor.name}</div>}
            <div><span className="text-muted-foreground">Enrollment: </span>{training.enrolled_count}{training.max_participants ? ` / ${training.max_participants}` : ''}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enrolled Employees</CardTitle>
            <CardDescription>{training.enrollments.length} participants</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {training.enrollments.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No enrollments yet</TableCell></TableRow>
                ) : training.enrollments.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.employee.user.name}</TableCell>
                    <TableCell>{e.employee.employee_id}</TableCell>
                    <TableCell><Badge variant="outline">{e.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
