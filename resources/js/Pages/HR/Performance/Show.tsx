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

interface Reviewer {
  id: number;
  name: string;
}

interface Performance {
  id: number;
  employee: Employee;
  reviewer: Reviewer;
  review_period: string;
  review_start_date: string;
  review_end_date: string;
  due_date: string;
  status: string;
  overall_rating: number | null;
  is_self_review: boolean;
  submitted_at: string | null;
  completed_at: string | null;
}

interface ShowPerformanceProps {
  performance: Performance;
}

export default function ShowPerformance({ performance }: ShowPerformanceProps) {
  const route = useRoute();
  return (
    <AppLayout title="Performance Review Details">
      <Head title="Performance Review Details" />
      <div className="max-w-xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Performance Review Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="font-medium">Employee:</div>
              <div>{performance.employee?.name}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium">Reviewer:</div>
              <div>{performance.reviewer?.name}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium">Review Period:</div>
              <div>{performance.review_period}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium">Review Start Date:</div>
              <div>{performance.review_start_date}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium">Review End Date:</div>
              <div>{performance.review_end_date}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium">Due Date:</div>
              <div>{performance.due_date}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium">Status:</div>
              <div>{performance.status}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium">Overall Rating:</div>
              <div>{performance.overall_rating ?? 'N/A'}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium">Self Review:</div>
              <div>{performance.is_self_review ? 'Yes' : 'No'}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium">Submitted At:</div>
              <div>{performance.submitted_at ?? 'N/A'}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium">Completed At:</div>
              <div>{performance.completed_at ?? 'N/A'}</div>
            </div>
            <Link href={route('hr.performance.edit', performance.id)}>
              <Button variant="outline"><Edit className="h-4 w-4 mr-2" />Edit</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
