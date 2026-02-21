import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import {
  Trash2,
  History,
  FolderOpen,
  Flag,
  Layers,
  Target,
  Calendar,
  User,
  Wrench,
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';

type IdLike = number | string;

type SimpleRef = { id: IdLike; name?: string; title?: string };
type UserRef = { id: IdLike; name: string };

interface Props {
  backlog: any;
  project: any;
  assignees?: UserRef[];
}

const PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
const STATUSES = ['new', 'ready', 'in_progress', 'done', 'removed'] as const;

export default function Show({ backlog, project, assignees = [] }: Props) {
  const route = useRoute();

  const priorityStyles: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
    high: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  };

  const statusStyles: Record<string, string> = {
    new: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    ready: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
    done: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
    removed: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',

    // legacy fallbacks
    todo: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    backlog: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
    blocked: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  };

  const nice = (v?: any) => (v === null || v === undefined || v === '' ? 'N/A' : String(v));
  const labelOf = (x?: SimpleRef | null) => x?.name || x?.title || 'N/A';

  const handleDelete = () => {
    if (confirm('Delete this backlog item? This cannot be undone.')) {
      router.delete(route('projects.backlog.destroy', [project.id, backlog.id]), {
        onSuccess: () => router.visit(route('agile.backlog.index', project.id)),
      });
    }
  };

  const assignTo = (assigned_user_id: string) => {
    router.patch(
      route('agile.backlog.assign', backlog.id),
      { assigned_user_id: assigned_user_id === '__none__' ? null : assigned_user_id },
      { preserveScroll: true }
    );
  };

  const updatePriority = (priority: (typeof PRIORITIES)[number]) => {
    router.patch(
      route('agile.backlog.priority', backlog.id),
      { priority },
      { preserveScroll: true }
    );
  };

  const updateStatus = (status: (typeof STATUSES)[number]) => {
    router.patch(
      route('agile.backlog.status', backlog.id),
      { status },
      { preserveScroll: true }
    );
  };

  const selectedAssignee =
    (backlog.assigned_user_id ??
      backlog.assignedUser?.id ??
      backlog.assigned_user?.id ??
      '') + '';

  const selectedAssigneeValue = selectedAssignee ? selectedAssignee : '__none__';

  const currentAssigneeName =
    backlog.assigned_user?.name || backlog.assignedUser?.name || 'Unassigned';

  return (
    <AppLayout title={`${backlog.title} - ${project?.name ?? 'Project'}`}>
      <Head title={`${backlog.title} - ${project?.name ?? 'Project'}`} />

      <div className="mx-auto max-w-full sm:px-6">
        <div className="w-full flex justify-end">
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Item
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mt-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">{backlog.title}</CardTitle>
                    <CardDescription>
                      {project?.name ? `Project: ${project.name}` : 'Backlog item details'}
                    </CardDescription>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-end">
                    <Badge className={priorityStyles[backlog.priority] || priorityStyles.low}>
                      {nice(backlog.priority)}
                    </Badge>
                    <Badge className={statusStyles[backlog.status] || statusStyles.new}>
                      {nice(backlog.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {backlog.description ? (
                  <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {backlog.description}
                  </p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No description provided.</p>
                )}

                <Separator />

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center justify-between border rounded-lg p-3">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Layers className="mr-2 h-4 w-4" />
                      Type
                    </div>
                    <span className="font-medium">{nice(backlog.type)}</span>
                  </div>

                  <div className="flex items-center justify-between border rounded-lg p-3">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Target className="mr-2 h-4 w-4" />
                      Story Points
                    </div>
                    <span className="font-medium">{nice(backlog.story_points)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Updates */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-gray-500" />
                  <CardTitle className="text-lg">Quick Updates</CardTitle>
                </div>
                <CardDescription>Assign, priority, and status updates.</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Assignee (shadcn Select) */}
                <div className="space-y-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Assign To</div>

                  <Select value={selectedAssigneeValue} onValueChange={assignTo}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Unassigned</SelectItem>
                      {assignees.map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <p className="text-xs text-gray-500 dark:text-gray-400">Current: {currentAssigneeName}</p>
                </div>

                <Separator />

                {/* Priority (shadcn Select) */}
                <div className="space-y-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Priority</div>

                  <Select
                    value={String(backlog.priority || 'low')}
                    onValueChange={(v) => updatePriority(v as (typeof PRIORITIES)[number])}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Status (shadcn Select) */}
                <div className="space-y-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>

                  <Select
                    value={String(backlog.status || 'new')}
                    onValueChange={(v) => updateStatus(v as (typeof STATUSES)[number])}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Meta */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Backlog Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Priority</span>
                  <Badge className={priorityStyles[backlog.priority] || priorityStyles.low}>
                    {nice(backlog.priority)}
                  </Badge>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                  <Badge className={statusStyles[backlog.status] || statusStyles.new}>
                    {nice(backlog.status)}
                  </Badge>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Story Points</span>
                  <span className="font-medium">{nice(backlog.story_points)}</span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Type</span>
                  <span className="font-medium">{nice(backlog.type)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Relations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Related</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Project
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <Flag className="mr-2 h-4 w-4" />
                    Epic
                  </div>
                  <p className="font-semibold">{labelOf(backlog.epic)}</p>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <Calendar className="mr-2 h-4 w-4" />
                    Sprint
                  </div>
                  <p className="font-semibold">{labelOf(backlog.sprint)}</p>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <Layers className="mr-2 h-4 w-4" />
                    Card
                  </div>
                  <p className="font-semibold">{labelOf(backlog.card)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Assignment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <User className="mr-2 h-4 w-4" />
                    Assigned To
                  </div>
                  <p className="font-semibold">{currentAssigneeName}</p>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <Calendar className="mr-2 h-4 w-4" />
                    Created
                  </div>
                  <p className="font-semibold">
                    {backlog.created_at ? new Date(backlog.created_at).toLocaleString() : 'N/A'}
                  </p>
                </div>

                {backlog.updated_at && backlog.updated_at !== backlog.created_at && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
                        <History className="mr-2 h-4 w-4" />
                        Last Updated
                      </div>
                      <p className="font-semibold">{new Date(backlog.updated_at).toLocaleString()}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}