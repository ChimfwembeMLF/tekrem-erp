import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { ChromePicker } from 'react-color';
import useRoute from '@/Hooks/useRoute';

interface Project {
  id: number | string;
  name: string;
}

interface Board {
  id: number;
  name: string;
}

interface Props {
  auth: { user: any };
  project: Project;
  boards: Board[];
}

export default function CreateEpic({ auth, project, boards = [] }: Props) {
  const route = useRoute();
  const defaultBoardId = boards?.[0]?.id ? String(boards[0].id) : '';
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
    color: '#7c3aed',
    start_date: '',
    end_date: '',
    board_id: defaultBoardId,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('agile.epics.store', project.id));
  };

  return (
    <AppLayout auth={auth} title="Create Epic">
      <Head title="Create Epic" />
      <div className="max-w-2xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Create Epic</CardTitle>
            <CardDescription>Define a new epic for this project.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={e => setData('name', e.target.value)}
                  required
                  autoFocus
                  className="mt-1"
                />
                {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={e => setData('description', e.target.value)}
                  className="mt-1"
                />
                {errors.description && <div className="text-red-500 text-xs mt-1">{errors.description}</div>}
              </div>
              <div>
                <Label htmlFor="color">Color *</Label>
                <div className="flex items-center gap-4 mt-1">
                  <Input
                    id="color"
                    type="color"
                    value={data.color}
                    onChange={e => setData('color', e.target.value)}
                    className="w-12 h-10 p-0 border-none bg-transparent"
                  />
                  <span className="ml-2">{data.color}</span>
                </div>
                {errors.color && <div className="text-red-500 text-xs mt-1">{errors.color}</div>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={data.start_date}
                    onChange={e => setData('start_date', e.target.value)}
                  />
                  {errors.start_date && <div className="text-red-500 text-xs mt-1">{errors.start_date}</div>}
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={data.end_date}
                    onChange={e => setData('end_date', e.target.value)}
                  />
                  {errors.end_date && <div className="text-red-500 text-xs mt-1">{errors.end_date}</div>}
                </div>
              </div>
              <div>
                <Label htmlFor="board_id">Board *</Label>
                <select
                  id="board_id"
                  value={data.board_id}
                  onChange={e => setData('board_id', e.target.value)}
                  className="w-full border rounded px-3 py-2 mt-1"
                  required
                >
                  {boards.map(board => (
                    <option key={board.id} value={board.id}>{board.name}</option>
                  ))}
                </select>
                {errors.board_id && <div className="text-red-500 text-xs mt-1">{errors.board_id}</div>}
              </div>
              <div className="flex justify-end gap-2">
                <Link href={route('agile.epics.index', project.id)} className="btn btn-secondary">Cancel</Link>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Creating...' : 'Create Epic'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
