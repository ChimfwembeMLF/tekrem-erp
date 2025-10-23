import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Calendar, Target, Clock, ArrowLeft } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import useTranslate from '@/Hooks/useTranslate';
import { Link } from '@inertiajs/react';

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
}

export default function Create({ project, board }: Props) {
  const { t } = useTranslate();
  const route = useRoute();

  const { data, setData, post, processing, errors } = useForm({
    name: '',
    goal: '',
    start_date: '',
    end_date: '',
    status: 'planned' as 'planned' | 'active' | 'completed' | 'archived',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('pm.boards.sprints.store', [board.id]));
  };

  const statusOptions = [
    { value: 'planned', label: 'Planned', description: 'Sprint is being planned' },
    { value: 'active', label: 'Active', description: 'Sprint is currently running' },
    { value: 'completed', label: 'Completed', description: 'Sprint has been completed' },
    { value: 'archived', label: 'Archived', description: 'Sprint has been archived' },
  ];

  return (
    <AppLayout
      title={`Create Sprint - ${board.name}`}
      renderHeader={() => (
        <div className="flex items-center gap-4">
          <Link href={route('pm.boards.sprints.index', [board.id])}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sprints
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {t('pm.sprints.create', 'Create Sprint')}
            </h2>
            <p className="text-sm text-gray-600">
              {project.name} / {board.name}
            </p>
          </div>
        </div>
      )}
    >
      <Head title={`Create Sprint - ${board.name}`} />

      <div className="py-6">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {t('pm.sprints.create', 'Create Sprint')}
              </CardTitle>
              <CardDescription>
                {t('pm.sprints.create_desc', 'Create a new sprint to organize your work into time-boxed iterations')}
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
                <div className="flex items-center justify-end gap-3 pt-6 border-t">
                  <Link href={route('pm.boards.sprints.index', [board.id])}>
                    <Button type="button" variant="outline">
                      {t('common.cancel', 'Cancel')}
                    </Button>
                  </Link>
                  <Button type="submit" disabled={processing}>
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('common.creating', 'Creating...')}
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4 mr-2" />
                        {t('pm.sprints.create', 'Create Sprint')}
                      </>
                    )}
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
