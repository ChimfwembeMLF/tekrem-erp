import React from 'react';
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
  Save, 
  LayoutGrid, 
  Calendar,
  Users,
  Settings,
  Trash2,
  Archive
} from 'lucide-react';
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
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Board {
  id: number;
  name: string;
  description: string | null;
  type: 'kanban' | 'scrum';
  visibility: string;
  owner: User;
}

interface Project {
  id: number;
  name: string;
  description: string | null;
  status: string;
}

interface BoardEditProps {
  project: Project;
  board: Board;
}

export default function BoardEdit({ project, board }: BoardEditProps) {
  const { t } = useTranslate();
  const route = useRoute();

  const { data, setData, put, processing, errors } = useForm({
    name: board.name,
    description: board.description || '',
    type: board.type,
    visibility: board.visibility,
  });

  const { delete: deleteBoard, processing: deleting } = useForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('pm.boards.update', board.id));
  };

  const handleDelete = () => {
    deleteBoard(route('pm.boards.destroy', board.id));
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
      title={t('pm.edit_board', 'Edit Board')}
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
                {t('pm.edit_board', 'Edit Board')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {t('pm.edit_board_description', 'Modify board settings and configuration')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Archive className="h-4 w-4 mr-2" />
              {t('pm.archive_board', 'Archive')}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('pm.delete_board', 'Delete')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('pm.delete_board_confirm', 'Delete Board')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('pm.delete_board_warning', 'Are you sure you want to delete this board? This action cannot be undone and will permanently delete all cards, columns, and associated data.')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {deleting ? t('pm.deleting', 'Deleting...') : t('pm.delete_board', 'Delete Board')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
    >
      <Head title={t('pm.edit_board', 'Edit Board')} />

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
                  {t('pm.board_type_edit_warning', 'Changing board type may affect existing workflows and data')}
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

            {/* Board Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t('pm.board_information', 'Board Information')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-500">{t('pm.board_owner', 'Owner')}</Label>
                    <p className="font-medium">{board.owner.name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">{t('pm.project', 'Project')}</Label>
                    <p className="font-medium">{project.name}</p>
                  </div>
                </div>
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
                <Save className="h-4 w-4 mr-2" />
                {processing 
                  ? t('pm.saving_changes', 'Saving Changes...') 
                  : t('pm.save_changes', 'Save Changes')
                }
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
