import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Edit } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Onboarding {
  id: number;
  title: string;
  status: string;
  employee_name: string;
}

interface ShowOnboardingProps {
  onboarding: Onboarding;
}

export default function ShowOnboarding({ onboarding }: ShowOnboardingProps) {
  const route = useRoute();
  return (
    <AppLayout title="Onboarding Details">
      <Head title="Onboarding Details" />
      <div className="max-w-xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Onboarding Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="font-medium">Title:</div>
              <div>{onboarding.title}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium">Status:</div>
              <div>{onboarding.status}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium">Employee:</div>
              <div>{onboarding.employee_name}</div>
            </div>
            <Link href={route('hr.onboarding.edit', onboarding.id)}><Button variant="outline"><Edit className="h-4 w-4 mr-2" />Edit</Button></Link>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
