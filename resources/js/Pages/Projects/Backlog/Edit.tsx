import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
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

interface Sprint {
  id: number;
  name: string;
}
interface Epic {
  id: number;
  name: string;
  color?: string;
}
interface User {
  id: number;
  name: string;
}

interface EditBacklogProps {
  auth: { user: any };
  project: { id: number; name: string };
  backlog: any;
  sprints?: Sprint[];
  epics?: Epic[];
  users?: User[];
}

export default function EditBacklog({
  auth,
  project,
  backlog,
  sprints = [],
  epics = [],
  users = [],
}: EditBacklogProps) {
  const route = useRoute();

  const { data, setData, put, processing, errors } = useForm({
    title: backlog?.title ?? '',
    description: backlog?.description ?? '',
    priority: (backlog?.priority ?? 'medium') as 'low' | 'medium' | 'high' | 'critical',
    type: (backlog?.type ?? 'product') as 'product' | 'sprint',
    story_points: backlog?.story_points != null ? String(backlog.story_points) : '',
    status: (backlog?.status ?? 'new') as 'new' | 'ready' | 'in_progress' | 'done' | 'removed',
    sprint_id: backlog?.sprint_id ? String(backlog.sprint_id) : 'no',
    epic_id: backlog?.epic_id ? String(backlog.epic_id) : 'no',
    assigned_to:
      (backlog?.assigned_user_id ?? backlog?.assignedUser?.id ?? backlog?.assigned_user?.id)
        ? String(backlog.assigned_user_id ?? backlog.assignedUser?.id ?? backlog.assigned_user?.id)
        : 'no',
    order: backlog?.order != null ? String(backlog.order) : '0',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...data,
      story_points: data.story_points ? parseInt(data.story_points) : null,
      sprint_id: data.sprint_id && data.sprint_id !== 'no' ? data.sprint_id : null,
      epic_id: data.epic_id && data.epic_id !== 'no' ? data.epic_id : null,
      assigned_to: data.assigned_to && data.assigned_to !== 'no' ? data.assigned_to : null,
      order: data.order ? parseInt(data.order) : 0,
    };

    put(route('agile.backlog.update', backlog.id), {
      data: submitData,
      preserveScroll: true,
    });
  };

  return (
    <AppLayout
      title={`Edit Backlog Item - ${project.name}`}
      renderHeader={() => (
        <div>
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Edit Backlog Item
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <Link href={route('projects.show', project.id)} className="hover:underline">
              {project.name}
            </Link>{' '}
            - Backlog
          </p>
        </div>
      )}
    >
      <Head title={`Edit Backlog Item - ${project.name}`} />

      <div className="max-w-full mx-auto sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Backlog Item Details</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  placeholder="What needs to be done?"
                  className={errors.title ? 'border-red-500' : ''}
                  required
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  placeholder="Add acceptance criteria, context, notes..."
                  rows={6}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>

              {/* Type + Status */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select value={data.type} onValueChange={(v: any) => setData('type', v)}>
                    <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="sprint">Sprint</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={data.status} onValueChange={(v: any) => setData('status', v)}>
                    <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                      <SelectItem value="removed">Removed</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                </div>
              </div>

              {/* Priority + Story Points */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority *</Label>
                  <Select value={data.priority} onValueChange={(v: any) => setData('priority', v)}>
                    <SelectTrigger className={errors.priority ? 'border-red-500' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.priority && <p className="text-sm text-red-500">{errors.priority}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="story_points">Story Points</Label>
                  <Input
                    id="story_points"
                    type="number"
                    min={0}
                    max={100}
                    value={data.story_points}
                    onChange={(e) => setData('story_points', e.target.value)}
                    placeholder="e.g., 3, 5, 8"
                    className={errors.story_points ? 'border-red-500' : ''}
                  />
                  {errors.story_points && <p className="text-sm text-red-500">{errors.story_points}</p>}
                </div>
              </div>

              {/* Sprint */}
              {sprints.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="sprint_id">Sprint</Label>
                  <Select value={data.sprint_id} onValueChange={(v) => setData('sprint_id', v)}>
                    <SelectTrigger className={errors.sprint_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="No sprint" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No sprint</SelectItem>
                      {sprints.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.sprint_id && <p className="text-sm text-red-500">{errors.sprint_id}</p>}
                </div>
              )}

              {/* Epic */}
              {epics.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="epic_id">Epic</Label>
                  <Select value={data.epic_id} onValueChange={(v) => setData('epic_id', v)}>
                    <SelectTrigger className={errors.epic_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="No epic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No epic</SelectItem>
                      {epics.map((ep) => (
                        <SelectItem key={ep.id} value={String(ep.id)}>
                          {ep.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.epic_id && <p className="text-sm text-red-500">{errors.epic_id}</p>}
                </div>
              )}

              {/* Assignee */}
              {users.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="assigned_to">Assign To</Label>
                  <Select value={data.assigned_to} onValueChange={(v) => setData('assigned_to', v)}>
                    <SelectTrigger className={errors.assigned_to ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">Unassigned</SelectItem>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.assigned_to && <p className="text-sm text-red-500">{errors.assigned_to}</p>}
                </div>
              )}

              {/* Order */}
              <div className="space-y-2">
                <Label htmlFor="order">Order</Label>
                <Input
                  id="order"
                  type="number"
                  min={0}
                  value={data.order}
                  onChange={(e) => setData('order', e.target.value)}
                  className={errors.order ? 'border-red-500' : ''}
                />
                {errors.order && <p className="text-sm text-red-500">{errors.order}</p>}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Updating...' : 'Update Item'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}   