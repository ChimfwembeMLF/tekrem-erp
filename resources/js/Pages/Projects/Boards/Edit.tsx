import React from 'react';
import {  useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import useRoute from '@/Hooks/useRoute';
import { ProjectsFormShell } from '@/Components/Module/moduleFormWrappers';

interface Board {
  id: number;
  name: string;
  description?: string;
  type: 'kanban' | 'scrum';
  project_id: number;
}

interface BoardEditProps {
  auth: {
    user: any;
  };
  board: Board;
  project: {
    id: number;
    name: string;
  };
}

export default function BoardEdit({ auth, board, project }: BoardEditProps) {
  const route = useRoute();
  const { data, setData, put, processing, errors } = useForm({
    name: board.name || '',
    description: board.description || '',
    type: board.type || 'kanban' as 'kanban' | 'scrum',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('agile.board.update', board.id));
  };

  return (
    <ProjectsFormShell
      title={"Edit Board"}
      backHref={route('agile.board.update')}
      backLabel="Back"
      onSubmit={handleSubmit}
      processing={processing}
      submitLabel="Save"
      maxWidth="4xl"
    >

<Card>
            <CardHeader>
              <CardTitle>Board Details</CardTitle>
            </CardHeader>
            <CardContent>
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
                    {processing ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
            </CardContent>
          </Card>
</ProjectsFormShell>
  );
}
