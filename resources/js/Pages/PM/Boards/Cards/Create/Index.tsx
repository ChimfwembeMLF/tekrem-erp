import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { ArrowLeft, FileText, Users, Calendar, Target } from 'lucide-react';
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
  columns: BoardColumn[];
}

interface BoardColumn {
  id: number;
  name: string;
  order: number;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Sprint {
  id: number;
  name: string;
  status: string;
}

interface Epic {
  id: number;
  name: string;
  color: string;
}

interface Props {
  project: Project;
  board: Board;
  users?: User[];
  sprints?: Sprint[];
  epics?: Epic[];
}

export default function Create({ project, board, users = [], sprints = [], epics = [] }: Props) {
  const { t } = useTranslate();
  const route = useRoute();

  const { data, setData, post, processing, errors } = useForm({
    title: '',
    description: '',
    type: 'task',
    priority: 'medium',
    assignee_id: '',
    reporter_id: '',
    epic_id: '',
    sprint_id: '',
    story_points: '',
    due_date: '',
    column_id: board.columns?.[0]?.id || '',
  });

  React.useEffect(() => {
    if (board.columns && board.columns.length > 0 && !data.column_id) {
      setData('column_id', board.columns[0].id);
    }
  }, [board.columns]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('pm.boards.cards.store', [board.id, data.column_id]));
  };

  const typeOptions = [
    { value: 'task', label: 'Task', description: 'A piece of work to be done' },
    { value: 'bug', label: 'Bug', description: 'An issue that needs to be fixed' },
    { value: 'story', label: 'Story', description: 'A user story or feature' },
    { value: 'epic', label: 'Epic', description: 'A large feature or initiative' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', description: 'Nice to have' },
    { value: 'medium', label: 'Medium', description: 'Should have' },
    { value: 'high', label: 'High', description: 'Must have' },
    { value: 'critical', label: 'Critical', description: 'Urgent and important' },
  ];

  return (
    <AppLayout
      title={`Create Card - ${board.name}`}
      renderHeader={() => (
        <div className="flex items-center gap-4">
          <Link href={route('pm.projects.boards.show', [project.id, board.id])}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Board
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {t('pm.cards.create', 'Create Card')}
            </h2>
            <p className="text-sm text-gray-600">
              {project.name} / {board.name}
            </p>
          </div>
        </div>
      )}
    >
      <Head title={`Create Card - ${board.name}`} />

      <div className="py-6">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('pm.cards.create', 'Create Card')}
              </CardTitle>
              <CardDescription>
                {t('pm.cards.create_desc', 'Create a new card to track work items on your board')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Card Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    {t('pm.cards.title', 'Title')} *
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    placeholder={t('pm.cards.title_placeholder', 'Enter a descriptive title for this card')}
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                {/* Card Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    {t('pm.cards.description', 'Description')}
                  </Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder={t('pm.cards.description_placeholder', 'Provide details about this work item...')}
                    rows={4}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                {/* Card Type and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">
                      {t('pm.cards.type', 'Type')} *
                    </Label>
                    <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                      <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                        <SelectValue placeholder={t('pm.cards.type_placeholder', 'Select card type')} />
                      </SelectTrigger>
                      <SelectContent>
                        {typeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-sm text-gray-500">{option.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <p className="text-sm text-red-600">{errors.type}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">
                      {t('pm.cards.priority', 'Priority')} *
                    </Label>
                    <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                      <SelectTrigger className={errors.priority ? 'border-red-500' : ''}>
                        <SelectValue placeholder={t('pm.cards.priority_placeholder', 'Select priority')} />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-sm text-gray-500">{option.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.priority && (
                      <p className="text-sm text-red-600">{errors.priority}</p>
                    )}
                  </div>
                </div>

                {/* Column Selection */}
                {board.columns && board.columns.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="column_id">
                      {t('pm.cards.column', 'Column')} *
                    </Label>
                    <Select value={data.column_id.toString()} onValueChange={(value) => setData('column_id', parseInt(value))}>
                      <SelectTrigger className={errors.column_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder={t('pm.cards.column_placeholder', 'Select column')} />
                      </SelectTrigger>
                      <SelectContent>
                        {board.columns.map((column) => (
                          <SelectItem key={column.id} value={column.id.toString()}>
                            {column.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.column_id && (
                      <p className="text-sm text-red-600">{errors.column_id}</p>
                    )}
                  </div>
                )}

                {/* Assignee and Reporter */}
                {users.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="assignee_id" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {t('pm.cards.assignee', 'Assignee')}
                      </Label>
                      <Select value={data.assignee_id} onValueChange={(value) => setData('assignee_id', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('pm.cards.assignee_placeholder', 'Select assignee')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No assignee</SelectItem>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reporter_id">
                        {t('pm.cards.reporter', 'Reporter')}
                      </Label>
                      <Select value={data.reporter_id} onValueChange={(value) => setData('reporter_id', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('pm.cards.reporter_placeholder', 'Select reporter')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No reporter</SelectItem>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Sprint and Epic */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sprints.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="sprint_id" className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        {t('pm.cards.sprint', 'Sprint')}
                      </Label>
                      <Select value={data.sprint_id} onValueChange={(value) => setData('sprint_id', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('pm.cards.sprint_placeholder', 'Select sprint')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No sprint</SelectItem>
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
                      <Label htmlFor="epic_id">
                        {t('pm.cards.epic', 'Epic')}
                      </Label>
                      <Select value={data.epic_id} onValueChange={(value) => setData('epic_id', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('pm.cards.epic_placeholder', 'Select epic')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No epic</SelectItem>
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

                {/* Story Points and Due Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="story_points">
                      {t('pm.cards.story_points', 'Story Points')}
                    </Label>
                    <Input
                      id="story_points"
                      type="number"
                      min="0"
                      max="100"
                      value={data.story_points}
                      onChange={(e) => setData('story_points', e.target.value)}
                      placeholder="0"
                      className={errors.story_points ? 'border-red-500' : ''}
                    />
                    {errors.story_points && (
                      <p className="text-sm text-red-600">{errors.story_points}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="due_date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {t('pm.cards.due_date', 'Due Date')}
                    </Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={data.due_date}
                      onChange={(e) => setData('due_date', e.target.value)}
                      className={errors.due_date ? 'border-red-500' : ''}
                    />
                    {errors.due_date && (
                      <p className="text-sm text-red-600">{errors.due_date}</p>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t">
                  <Link href={route('pm.projects.boards.show', [project.id, board.id])}>
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
                        <FileText className="h-4 w-4 mr-2" />
                        {t('pm.cards.create', 'Create Card')}
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
