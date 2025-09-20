import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Plus, Eye, Edit } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import AppLayout from '@/Layouts/AppLayout';
import useRoute from '@/Hooks/useRoute';

interface Team {
  id: number;
  name: string;
  description: string;
}

interface TeamsIndexProps {
  teams: Team[];
}

export default function TeamsIndex({ teams = [] }: TeamsIndexProps) {
  const route = useRoute();
  return (
    <AppLayout
      title="Teams"
      renderHeader={() => (
        <div className="flex items-center gap-4">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Teams
          </h2>
        </div>
      )}
    >
      <Head title="Teams" />
      <div className="py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Teams</h1>
            <Link href={route('hr.teams.create')}><Button><Plus className="h-4 w-4 mr-2" />Add Team</Button></Link>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Team Directory</CardTitle>
            </CardHeader>
            <CardContent>
              {teams.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">No teams found.</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Description</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team) => (
                      <tr key={team.id}>
                        <td className="px-4 py-2">{team.name}</td>
                        <td className="px-4 py-2">{team.description}</td>
                        <td className="px-4 py-2 flex gap-2">
                          <Link href={route('hr.teams.show', team.id)}><Button size="sm" variant="outline"><Eye className="h-4 w-4" /></Button></Link>
                          <Link href={route('hr.teams.edit', team.id)}><Button size="sm" variant="ghost"><Edit className="h-4 w-4" /></Button></Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
