import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import AppLayout from '@/Layouts/AppLayout';
import useRoute from '@/Hooks/useRoute';

interface Team {
  id: number;
  name: string;
  description: string;
}

interface ShowTeamProps {
  team: Team;
}

export default function ShowTeam({ team }: ShowTeamProps) {
  const route = useRoute();
  return (
    <AppLayout
      title="Team Details"
      renderHeader={() => (
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <a href={route('hr.teams.index')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Teams
            </a>
          </Button>
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Team Details
          </h2>
        </div>
      )}
    >
      <Head title="Team Details" />
      <div className="py-6">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Team Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="font-medium">Team Name:</div>
                <div>{team.name}</div>
              </div>
              <div>
                <div className="font-medium">Description:</div>
                <div>{team.description}</div>
              </div>
              <div className="flex justify-end">
                <Link href={route('hr.teams.edit', team.id)}>
                  <Button variant="outline"><Edit className="h-4 w-4 mr-2" />Edit</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
