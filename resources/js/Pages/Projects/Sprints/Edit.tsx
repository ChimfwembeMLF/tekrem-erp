import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import useRoute from '@/Hooks/useRoute';

type IdLike = number | string;

interface Sprint {
  id: IdLike;
  name?: string;
  goal?: string | null;
  start_date?: string | null; // "YYYY-MM-DD" or ISO
  end_date?: string | null;
  team_capacity?: number | string | null;
}

interface Project {
  id: IdLike;
  name: string;
}

interface Props {
  auth: { user: any };
  sprint: Sprint;
  project: Project;
}

const toDateInput = (v?: string | null) => {
  if (!v) return '';
  // supports "YYYY-MM-DD" or ISO strings
  return String(v).slice(0, 10);
};

export default function EditSprint({ auth, sprint, project }: Props) {
  const route = useRoute();

  const { data, setData, put, processing, errors } = useForm({
    name: sprint.name ?? '',
    goal: sprint.goal ?? '',
    start_date: toDateInput(sprint.start_date),
    end_date: toDateInput(sprint.end_date),
    team_capacity:
      sprint.team_capacity === null || sprint.team_capacity === undefined
        ? ''
        : String(sprint.team_capacity),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    put(route('agile.sprints.update', sprint.id), {
      data: {
        ...data,
        team_capacity: data.team_capacity ? Number(data.team_capacity) : null,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
      },
      preserveScroll: true,
    });
  };

  return (
    <AppLayout
      title={`Edit Sprint - ${project.name}`}
      renderHeader={() => (
        <div>
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Edit Sprint
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <Link href={route('projects.show', project?.id)} className="hover:underline">
              {project.name}
            </Link>{' '}
            · Sprint
          </p>
        </div>
      )}
    >
      <Head title={`Edit Sprint - ${project.name}`} />

      <div className="mx-auto max-w-full sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Sprint Details</CardTitle>
            <CardDescription>Update sprint details for this project.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Sprint Name *</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className={errors.name ? 'border-destructive' : ''}
                  required
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              {/* Goal */}
              <div className="space-y-2">
                <Label htmlFor="goal">Goal</Label>
                <Textarea
                  id="goal"
                  value={data.goal}
                  onChange={(e) => setData('goal', e.target.value)}
                  rows={5}
                />
                {errors.goal && <p className="text-sm text-destructive">{errors.goal}</p>}
              </div>

              {/* Dates */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={data.start_date}
                    onChange={(e) => setData('start_date', e.target.value)}
                    className={errors.start_date ? 'border-destructive' : ''}
                    required
                  />
                  {errors.start_date && (
                    <p className="text-sm text-destructive">{errors.start_date}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={data.end_date}
                    onChange={(e) => setData('end_date', e.target.value)}
                    className={errors.end_date ? 'border-destructive' : ''}
                    required
                  />
                  {errors.end_date && <p className="text-sm text-destructive">{errors.end_date}</p>}
                </div>
              </div>

              {/* Team capacity */}
              <div className="space-y-2">
                <Label htmlFor="team_capacity">Team Capacity</Label>
                <Input
                  id="team_capacity"
                  type="number"
                  min={0}
                  value={data.team_capacity}
                  onChange={(e) => setData('team_capacity', e.target.value)}
                  className={errors.team_capacity ? 'border-destructive' : ''}
                  placeholder="e.g. 40"
                />
                {errors.team_capacity && (
                  <p className="text-sm text-destructive">{errors.team_capacity}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <Link href={route('agile.sprints.show', sprint.id)}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>

                <Button type="submit" disabled={processing}>
                  {processing ? 'Updating...' : 'Update Sprint'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}