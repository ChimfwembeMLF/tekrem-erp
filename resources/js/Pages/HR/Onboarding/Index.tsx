import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Plus, Eye, Edit } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Onboarding {
  id: number;
  title: string;
  status: string;
  employee_name: string;
}

interface OnboardingIndexProps {
  onboardings: Onboarding[];
}

export default function OnboardingIndex({ onboardings = [] }: OnboardingIndexProps) {
  const route = useRoute();
  return (
    <AppLayout title="Onboarding Workflows">
      <Head title="Onboarding Workflows" />
      <div className="max-w-5xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Onboarding Workflows</h1>
          <Link href={route('hr.onboarding.create')}><Button><Plus className="h-4 w-4 mr-2" />Add Workflow</Button></Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Onboarding List</CardTitle>
          </CardHeader>
          <CardContent>
            {onboardings.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No onboarding workflows found.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Employee</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {onboardings.map((ob) => (
                    <tr key={ob.id}>
                      <td className="px-4 py-2">{ob.title}</td>
                      <td className="px-4 py-2">{ob.status}</td>
                      <td className="px-4 py-2">{ob.employee_name}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <Link href={route('hr.onboarding.show', ob.id)}><Button size="sm" variant="outline"><Eye className="h-4 w-4" /></Button></Link>
                        <Link href={route('hr.onboarding.edit', ob.id)}><Button size="sm" variant="ghost"><Edit className="h-4 w-4" /></Button></Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
