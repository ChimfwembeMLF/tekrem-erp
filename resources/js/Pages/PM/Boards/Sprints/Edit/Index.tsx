import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { 
  ArrowLeft, 
  Calendar, 
  Target, 
  Clock, 
  Trash2,
  Archive,
  AlertTriangle
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import useTranslate from '@/Hooks/useTranslate';
import { Link } from '@inertiajs/react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/Components/ui/alert-dialog';

interface Sprint {
  id: number;
  name: string;
  goal: string | null;
  start_date: string | null;
  end_date: string | null;
  status: 'planned' | 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

interface Project {
  id: number;
  name: string;
}

interface Board {
  id: number;
  name: string;
  type: string;
}

interface Props {
  project: Project;
  board: Board;
  sprint: Sprint;
}

export default function Edit({ project, board, sprint }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const { data, setData, put, processing, errors } = useForm({
    name: sprint.name || '',
    goal: sprint.goal || '',
    start_date: sprint.start_date || '',
    end_date: sprint.end_date || '',
    status: sprint.status,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('pm.boards.sprints.update', [board.id, sprint.id]));
  };

  const handleDelete = () => {
    router.delete(route('pm.boards.sprints.destroy', [board.id, sprint.id]));
  };

  const handleArchive = () => {
    setData('status', 'archived');
    put(route('pm.boards.sprints.update', [board.id, sprint.id]));
  };

  const statusOptions = [
    { value: 'planned', label: 'Planned', description: 'Sprint is being planned' },
    { value: 'active', label: 'Active', description: 'Sprint is currently running' },
    { value: 'completed', label: 'Completed', description: 'Sprint has been completed' },
    { value: 'archived', label: 'Archived', description: 'Sprint has been archived' },
  ];

  return (
    <AppLayout
      title={`Edit ${sprint.name} - ${board.name}`}
      renderHeader={() => (
        <div className="flex items-center gap-4">
          <Link href={route('pm.boards.sprints.show', [board.id, sprint.id])}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sprint
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {t('pm.sprints.edit', 'Edit Sprint')}
            </h2>
            <p className="text-sm text-gray-600">
              {project.name} / {board.name} / {sprint.name}
            </p>
          </div>
        </div>
      )}
    >
      <Head title={`Edit ${sprint.name} - ${board.name}`} />

      <div className="py-6">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {t('pm.sprints.edit', 'Edit Sprint')}
              </CardTitle>
              <CardDescription>
                {t('pm.sprints.edit_desc', 'Update sprint details and settings')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sprint Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    {t('pm.sprints.name', 'Sprint Name')} *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder={t('pm.sprints.name_placeholder', 'e.g., Sprint 1, Q1 Sprint, Feature Release')}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Sprint Goal */}
                <div className="space-y-2">
                  <Label htmlFor="goal">
                    {t('pm.sprints.goal', 'Sprint Goal')}
                  </Label>
                  <Textarea
                    id="goal"
                    value={data.goal}
                    onChange={(e) => setData('goal', e.target.value)}
                    placeholder={t('pm.sprints.goal_placeholder', 'What do you want to achieve in this sprint?')}
                    rows={3}
                    className={errors.goal ? 'border-red-500' : ''}
                  />
                  {errors.goal && (
                    <p className="text-sm text-red-600">{errors.goal}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {t('pm.sprints.goal_help', 'A clear, concise statement of what the team plans to achieve during the sprint')}
                  </p>
                </div>

                {/* Sprint Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">
                    {t('pm.sprints.status', 'Status')} *
                  </Label>
                  <Select value={data.status} onValueChange={(value) => setData('status', value as any)}>
                    <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                      <SelectValue placeholder={t('pm.sprints.status_placeholder', 'Select sprint status')} />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-500">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-600">{errors.status}</p>
                  )}
                </div>

                {/* Sprint Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {t('pm.sprints.start_date', 'Start Date')}
                    </Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={data.start_date}
                      onChange={(e) => setData('start_date', e.target.value)}
                      className={errors.start_date ? 'border-red-500' : ''}
                    />
                    {errors.start_date && (
                      <p className="text-sm text-red-600">{errors.start_date}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {t('pm.sprints.end_date', 'End Date')}
                    </Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={data.end_date}
                      onChange={(e) => setData('end_date', e.target.value)}
                      min={data.start_date || undefined}
                      className={errors.end_date ? 'border-red-500' : ''}
                    />
                    {errors.end_date && (
                      <p className="text-sm text-red-600">{errors.end_date}</p>
                    )}
                  </div>
                </div>

                {/* Sprint Duration Info */}
                {data.start_date && data.end_date && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Sprint Duration</span>
                    </div>
                    <p className="text-blue-700 mt-1">
                      {(() => {
                        const start = new Date(data.start_date);
                        const end = new Date(data.end_date);
                        const diffTime = Math.abs(end.getTime() - start.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
                      })()}
                    </p>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <div className="flex items-center gap-2">
                    {sprint.status !== 'archived' && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleArchive}
                        disabled={processing}
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Archive Sprint
                      </Button>
                    )}
                    
                    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                      <AlertDialogTrigger asChild>
                        <Button type="button" variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            Delete Sprint
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{sprint.name}"? This action cannot be undone.
                            All cards associated with this sprint will be moved to the backlog.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Sprint
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link href={route('pm.boards.sprints.show', [board.id, sprint.id])}>
                      <Button type="button" variant="outline">
                        {t('common.cancel', 'Cancel')}
                      </Button>
                    </Link>
                    <Button type="submit" disabled={processing}>
                      {processing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {t('common.saving', 'Saving...')}
                        </>
                      ) : (
                        <>
                          <Target className="h-4 w-4 mr-2" />
                          {t('pm.sprints.save', 'Save Changes')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
