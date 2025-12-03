import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import useRoute from '@/Hooks/useRoute';

interface BoardColumn {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
}

interface Sprint {
  id: number;
  name: string;
}

interface Epic {
  id: number;
  name: string;
  color: string;
}

interface CardCreateProps {
  auth: {
    user: any;
  };
  board: {
    id: number;
    name: string;
    columns: BoardColumn[];
  };
  project: {
    id: number;
    name: string;
  };
  defaultColumn?: BoardColumn;
  sprints: Sprint[];
  epics: Epic[];
}

export default function CardCreate({ auth, board, project, defaultColumn, sprints, epics }: CardCreateProps) {
  const route = useRoute();
  const { data, setData, post, processing, errors } = useForm({
    column_id: defaultColumn?.id.toString() || '',
    type: 'story' as 'story' | 'task' | 'bug' | 'epic',
    title: '',
    description: '',
    assignee_id: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    story_points: '',
    due_date: '',
    sprint_id: '',
    epic_id: '',
    labels: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...data,
      column_id: parseInt(data.column_id),
      assignee_id: data.assignee_id || null,
      story_points: data.story_points ? parseInt(data.story_points) : null,
      sprint_id: data.sprint_id || null,
      epic_id: data.epic_id || null,
    };
    
    post(route('agile.cards.store', board.id), { data: submitData });
  };

  return (
    <AppLayout
      title="Create Card"
      renderHeader={() => (
        <div>
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Create New Card
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            <Link href={route('agile.board.show', board.id)} className="hover:underline">
              {board.name}
            </Link> - {project.name}
          </p>
        </div>
      )}
    >
      <Head title={`Create Card - ${board.name}`} />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Card Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="type">Card Type *</Label>
                    <Select
                      value={data.type}
                      onValueChange={(value: any) => setData('type', value)}
                    >
                      <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="story">Story</SelectItem>
                        <SelectItem value="task">Task</SelectItem>
                        <SelectItem value="bug">Bug</SelectItem>
                        <SelectItem value="epic">Epic</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="column_id">Column *</Label>
                    <Select
                      value={data.column_id}
                      onValueChange={(value) => setData('column_id', value)}
                    >
                      <SelectTrigger className={errors.column_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {board.columns.map((column) => (
                          <SelectItem key={column.id} value={column.id.toString()}>
                            {column.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.column_id && <p className="text-sm text-red-500">{errors.column_id}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    placeholder="Brief description of the work"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Detailed description, acceptance criteria, notes..."
                    rows={6}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority *</Label>
                    <Select
                      value={data.priority}
                      onValueChange={(value: any) => setData('priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="story_points">Story Points</Label>
                    <Input
                      id="story_points"
                      type="number"
                      value={data.story_points}
                      onChange={(e) => setData('story_points', e.target.value)}
                      placeholder="e.g., 3, 5, 8"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sprint_id">Sprint</Label>
                    <Select
                      value={data.sprint_id}
                      onValueChange={(value) => setData('sprint_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="No sprint" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">No sprint</SelectItem>
                        {sprints.map((sprint) => (
                          <SelectItem key={sprint.id} value={sprint.id.toString()}>
                            {sprint.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="epic_id">Epic</Label>
                    <Select
                      value={data.epic_id}
                      onValueChange={(value) => setData('epic_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="No epic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">No epic</SelectItem>
                        {epics.map((epic) => (
                          <SelectItem key={epic.id} value={epic.id.toString()}>
                            {epic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={data.due_date}
                    onChange={(e) => setData('due_date', e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Creating...' : 'Create Card'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
