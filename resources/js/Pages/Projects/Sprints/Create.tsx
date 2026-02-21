import React, { useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import useRoute from '@/Hooks/useRoute';
import { Board } from '@/types';

type IdLike = number | string;

interface Project {
  id: IdLike;
  name: string;
}

interface Props {
  auth: { user: any };
  project: Project;
  boards?: Board[];
}

export default function CreateSprint({ auth, project, boards = [] }: Props) {
  const route = useRoute();

  const defaultBoardId = boards?.[0]?.id ? String(boards[0].id) : '';

  const { data, setData, post, processing, errors } = useForm({
    board_id: defaultBoardId,
    name: '',
    goal: '',
    start_date: '',
    end_date: '',
    team_capacity: '',
  });

  const selectedBoard = useMemo(() => {
    const id = String(data.board_id || '');
    return boards.find((b: any) => String(b.id) === id) || null;
  }, [boards, data.board_id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    post(route('agile.sprints.store', project.id), {
      data: {
        ...data,
        board_id: data.board_id ? Number(data.board_id) : null,
        team_capacity: data.team_capacity ? Number(data.team_capacity) : null,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
      },
      preserveScroll: true,
    });
  };

  console.log('boards',boards)
  return (
    <AppLayout
      title={`Create Sprint - ${project.name}`}
      renderHeader={() => (
        <div>
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Create Sprint
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <Link
              href={route('projects.show', project.id)}
              className="hover:underline"
            >
              {project.name}
            </Link>{' '}
            · Sprints
          </p>

          {selectedBoard && (
            <p className="text-sm text-blue-600 mt-2">
              Board: <span className="font-semibold">{selectedBoard.name}</span>
            </p>
          )}

          {!selectedBoard && boards.length > 0 && (
            <p className="text-sm text-blue-600 mt-2">
              Boards available: <span className="font-semibold">{boards.length}</span>
            </p>
          )}
        </div>
      )}
    >
      <Head title={`Create Sprint - ${project.name}`} />

      <div className="mx-auto max-w-full sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Sprint Details</CardTitle>
            <CardDescription>Set up a new sprint for this project.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Board */}
              {boards.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="board_id">Board *</Label>
                  <Select
                    value={data.board_id}
                    onValueChange={(value) => setData('board_id', value)}
                  >
                    <SelectTrigger className={errors.board_id ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select board" />
                    </SelectTrigger>
                    <SelectContent>
                      {boards.map((b: any) => (
                        <SelectItem key={b.id} value={String(b.id)}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.board_id && (
                    <p className="text-sm text-destructive">{errors.board_id}</p>
                  )}
                </div>
              )}

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
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
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
                {errors.goal && (
                  <p className="text-sm text-destructive">{errors.goal}</p>
                )}
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
                  {errors.end_date && (
                    <p className="text-sm text-destructive">{errors.end_date}</p>
                  )}
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Creating...' : 'Create Sprint'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}