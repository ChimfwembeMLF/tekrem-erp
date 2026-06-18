import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { ProjectShowSheet } from '@/Components/Projects/ProjectShowSheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import useRoute from '@/Hooks/useRoute';

interface BoardCreateProps {
  auth: {
    user: any;
  };
  project: {
    id: number;
    name: string;
  };
}

export default function BoardCreate({ auth, project }: BoardCreateProps) {
  const route = useRoute();
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
    type: 'kanban' as 'kanban' | 'scrum',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('agile.boards.store', { project: project.id }));
  };

  return (
    <>
      <Head title={`Create Board - ${project.name}`} />
      <ProjectShowSheet backUrl={route('projects.show', project.id)} size="lg">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Create New Board — {project.name}
          </h2>
        </div>

        <Card>
            <CardHeader>
              <CardTitle>Board Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Board Name *</Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="e.g., Development Board"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Describe the purpose of this board"
                    rows={4}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Board Type *</Label>
                  <Select
                    value={data.type}
                    onValueChange={(value: 'kanban' | 'scrum') => setData('type', value)}
                  >
                    <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select board type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kanban">Kanban (Continuous Flow)</SelectItem>
                      <SelectItem value="scrum">Scrum (Sprint-based)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-red-500">{errors.type}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Kanban for continuous workflow, Scrum for sprint-based development
                  </p>
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
                    {processing ? 'Creating...' : 'Create Board'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
      </ProjectShowSheet>
    </>
  );
}
