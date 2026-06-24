import React, { useEffect } from 'react';
import { router, useForm } from '@inertiajs/react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/Components/ui/sheet';
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
import { Loader2 } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface BoardColumn {
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
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board: {
    id: number;
    name: string;
    columns: BoardColumn[];
  };
  projectName?: string;
  defaultColumnId?: number;
  sprints?: Sprint[];
  epics?: Epic[];
  onSuccess?: () => void;
}

export default function CreateCardSheet({
  open,
  onOpenChange,
  board,
  projectName,
  defaultColumnId,
  sprints = [],
  epics = [],
  onSuccess,
}: Props) {
  const route = useRoute();
  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    column_id: '',
    type: 'story' as 'story' | 'task' | 'bug' | 'epic',
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    story_points: '',
    due_date: '',
    sprint_id: '',
    epic_id: '',
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    clearErrors();
    setData((current) => ({
      ...current,
      column_id: defaultColumnId?.toString() || board.columns[0]?.id?.toString() || '',
      title: '',
      description: '',
      type: 'story',
      priority: 'medium',
      story_points: '',
      due_date: '',
      sprint_id: '',
      epic_id: '',
    }));
  }, [open, defaultColumnId, board.columns, clearErrors, setData]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    post(route('agile.cards.store', board.id), {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        onOpenChange(false);
        onSuccess?.();
      },
      transform: (formData) => ({
        column_id: parseInt(formData.column_id, 10),
        type: formData.type,
        title: formData.title,
        description: formData.description || null,
        priority: formData.priority,
        story_points: formData.story_points ? parseInt(formData.story_points, 10) : null,
        due_date: formData.due_date || null,
        sprint_id: formData.sprint_id && formData.sprint_id !== 'none' ? parseInt(formData.sprint_id, 10) : null,
        epic_id: formData.epic_id && formData.epic_id !== 'none' ? parseInt(formData.epic_id, 10) : null,
      }),
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b px-4 py-4 text-left">
          <SheetTitle>Create card</SheetTitle>
          <SheetDescription>
            {board.name}
            {projectName ? ` · ${projectName}` : ''}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={data.type} onValueChange={(value: typeof data.type) => setData('type', value)}>
                  <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="story">Story</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
              </div>

              <div className="space-y-2">
                <Label>Column</Label>
                <Select value={data.column_id} onValueChange={(value) => setData('column_id', value)}>
                  <SelectTrigger className={errors.column_id ? 'border-destructive' : ''}>
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
                {errors.column_id && <p className="text-sm text-destructive">{errors.column_id}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="card-title">Title</Label>
              <Input
                id="card-title"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                placeholder="Brief description of the work"
                className={errors.title ? 'border-destructive' : ''}
                required
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="card-description">Description</Label>
              <Textarea
                id="card-description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="Acceptance criteria, notes..."
                rows={4}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={data.priority} onValueChange={(value: typeof data.priority) => setData('priority', value)}>
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
                <Label htmlFor="card-points">Story points</Label>
                <Input
                  id="card-points"
                  type="number"
                  min={0}
                  value={data.story_points}
                  onChange={(e) => setData('story_points', e.target.value)}
                  placeholder="e.g. 3, 5, 8"
                />
              </div>
            </div>

            {(sprints.length > 0 || epics.length > 0) && (
              <div className="grid gap-4 sm:grid-cols-2">
                {sprints.length > 0 && (
                  <div className="space-y-2">
                    <Label>Sprint</Label>
                    <Select value={data.sprint_id || 'none'} onValueChange={(value) => setData('sprint_id', value === 'none' ? '' : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="No sprint" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No sprint</SelectItem>
                        {sprints.map((sprint) => (
                          <SelectItem key={sprint.id} value={sprint.id.toString()}>
                            {sprint.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {epics.length > 0 && (
                  <div className="space-y-2">
                    <Label>Epic</Label>
                    <Select value={data.epic_id || 'none'} onValueChange={(value) => setData('epic_id', value === 'none' ? '' : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="No epic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No epic</SelectItem>
                        {epics.map((epic) => (
                          <SelectItem key={epic.id} value={epic.id.toString()}>
                            {epic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="card-due-date">Due date</Label>
              <Input
                id="card-due-date"
                type="date"
                value={data.due_date}
                onChange={(e) => setData('due_date', e.target.value)}
              />
            </div>
          </div>

          <SheetFooter className="border-t px-4 py-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
              Cancel
            </Button>
            <Button type="submit" disabled={processing || !data.title.trim() || !data.column_id}>
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create card'
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
