import React, { useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { 
  ArrowLeft, 
  Plus, 
  LayoutGrid, 
  Calendar,
  Users,
  Settings
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Project {
  id: number;
  name: string;
  description: string | null;
  status: string;
}

interface BoardCreateProps {
  project: Project;
}

export default function BoardCreate({ project }: BoardCreateProps) {
  const { t } = useTranslate();
  const route = useRoute();



  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
    type: 'kanban' as 'kanban' | 'scrum',
    visibility: 'private',
    project_id: null,
  });

  useEffect(() => {
    if (project?.id) {
      setData('project_id', project.id);
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('pm.boards.store'));
  };

  const boardTypes = [
    {
      value: 'kanban',
      label: t('pm.kanban_board', 'Kanban Board'),
      description: t('pm.kanban_description', 'Visualize work with columns and cards'),
      icon: <LayoutGrid className="h-6 w-6" />,
      features: [
        t('pm.kanban_feature_1', 'Continuous flow'),
        t('pm.kanban_feature_2', 'Work in progress limits'),
        t('pm.kanban_feature_3', 'Visual workflow'),
      ]
    },
    {
      value: 'scrum',
      label: t('pm.scrum_board', 'Scrum Board'),
      description: t('pm.scrum_description', 'Sprint-based development with time-boxed iterations'),
      icon: <Calendar className="h-6 w-6" />,
      features: [
        t('pm.scrum_feature_1', 'Sprint planning'),
        t('pm.scrum_feature_2', 'Sprint reviews'),
        t('pm.scrum_feature_3', 'Velocity tracking'),
      ]
    }
  ];

  return (
    <AppLayout
      title={t('pm.create_board', 'Create Board')}
      renderHeader={() => (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back', 'Back')}
            </Button>
            <div>
              <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                {t('pm.create_board', 'Create Board')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {t('pm.create_board_for_project', 'Create a new board for {project}', { project: project.name })}
              </p>
            </div>
          </div>
        </div>
      )}
    >
      <Head title={t('pm.create_board', 'Create Board')} />

      <div className="py-6">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {t('pm.board_details', 'Board Details')}
                </CardTitle>
                <CardDescription>
                  {t('pm.board_details_description', 'Basic information about your board')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">{t('pm.board_name', 'Board Name')}</Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder={t('pm.board_name_placeholder', 'Enter board name...')}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">{t('pm.board_description', 'Description')} ({t('common.optional', 'Optional')})</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder={t('pm.board_description_placeholder', 'Describe the purpose of this board...')}
                    rows={3}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="visibility">{t('pm.board_visibility', 'Visibility')}</Label>
                  <Select value={data.visibility} onValueChange={(value) => setData('visibility', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          {t('pm.private_board', 'Private - Only team members')}
                        </div>
                      </SelectItem>
                      <SelectItem value="public">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          {t('pm.public_board', 'Public - Anyone in organization')}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Board Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutGrid className="h-5 w-5" />
                  {t('pm.board_type', 'Board Type')}
                </CardTitle>
                <CardDescription>
                  {t('pm.board_type_description', 'Choose the methodology that best fits your workflow')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={data.type} 
                  onValueChange={(value) => setData('type', value as 'kanban' | 'scrum')}
                  className="space-y-4"
                >
                  {boardTypes.map((type) => (
                    <div key={type.value} className="flex items-start space-x-3">
                      <RadioGroupItem value={type.value} id={type.value} className="mt-1" />
                      <div className="flex-1">
                        <Label 
                          htmlFor={type.value} 
                          className="flex items-center space-x-3 cursor-pointer"
                        >
                          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            {type.icon}
                          </div>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {type.description}
                            </div>
                          </div>
                        </Label>
                        <div className="mt-2 ml-14">
                          <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                            {type.features.map((feature, index) => (
                              <li key={index} className="flex items-center">
                                <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
                {errors.type && (
                  <p className="text-sm text-red-600 mt-2">{errors.type}</p>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => window.history.back()}
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button type="submit" disabled={processing}>
                <Plus className="h-4 w-4 mr-2" />
                {processing 
                  ? t('pm.creating_board', 'Creating Board...') 
                  : t('pm.create_board', 'Create Board')
                }
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
