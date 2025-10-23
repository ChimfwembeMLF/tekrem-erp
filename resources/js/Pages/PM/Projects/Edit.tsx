import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { EditIcon, ArrowLeft } from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Project {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface EditProps {
  project: Project;
}

export default function Edit({ project }: EditProps) {
  const { t } = useTranslate();
  const route = useRoute();
  const [form, setForm] = React.useState({
    name: project.name || '',
    description: project.description || '',
    start_date: project.start_date || '',
    end_date: project.end_date || '',
    status: project.status || 'active',
  });
  const [submitting, setSubmitting] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    router.put(route('pm.projects.update', project.id), form, {
      onFinish: () => setSubmitting(false),
      onSuccess: () => {
        // Handle success
      },
      onError: (errors) => {
        console.error('Validation errors:', errors);
      }
    });
  };

  return (
    <AppLayout
      title={t('pm.edit_project', 'Edit Project')}
      renderHeader={() => (
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          {t('pm.edit_project', 'Edit Project')}
        </h2>
      )}
    >
      <Head title={t('pm.edit_project', 'Edit Project')} />

      <div className="py-6 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 shadow-sm border-0 sm:border sm:rounded-lg">
            <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                <EditIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                {t('pm.edit_project', 'Edit Project')}
              </div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                {t('pm.edit_project_description', 'Update your project details below')}
              </p>
            </div>

            <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-4 sm:pt-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Project Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('pm.project_name', 'Project Name')} *
                    </label>
                    <Input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder={t('pm.enter_project_name', 'Enter project name')}
                      className="w-full h-11 sm:h-10 text-base sm:text-sm"
                      required
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('pm.status', 'Status')}
                    </label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full h-11 sm:h-10 text-base sm:text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                {/* Description - Full Width */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('pm.description', 'Description')}
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder={t('pm.enter_project_description', 'Enter project description')}
                    className="w-full min-h-[100px] sm:min-h-[80px] text-base sm:text-sm resize-none px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                  />
                </div>

                {/* Date Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('pm.start_date', 'Start Date')}
                    </label>
                    <Input
                      type="date"
                      name="start_date"
                      value={form.start_date}
                      onChange={handleChange}
                      className="w-full h-11 sm:h-10 text-base sm:text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('pm.end_date', 'End Date')}
                    </label>
                    <Input
                      type="date"
                      name="end_date"
                      value={form.end_date}
                      onChange={handleChange}
                      className="w-full h-11 sm:h-10 text-base sm:text-sm"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 order-2 sm:order-1">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm px-6 sm:px-8"
                    >
                      {submitting ? t('common.saving', 'Saving...') : t('common.save_changes', 'Save Changes')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.visit(route('pm.projects.index'))}
                      className="w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm px-4 sm:px-6"
                    >
                      {t('common.cancel', 'Cancel')}
                    </Button>
                  </div>

                  <div className="flex order-1 sm:order-2 sm:ml-auto">
                    <Link
                      href={route('pm.projects.index')}
                      className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors w-full sm:w-auto justify-center sm:justify-start py-2 sm:py-0"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      {t('common.back_to_projects', 'Back to Projects')}
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
