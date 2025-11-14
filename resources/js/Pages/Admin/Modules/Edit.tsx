import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface ModuleEditProps {
  module: {
    id: number;
    name: string;
    description: string;
  };
}

export default function Edit({ module }: ModuleEditProps) {
  const { t } = useTranslate();
  const route = useRoute();
  const { data, setData, put, processing, errors } = useForm({
    name: module.name || '',
    description: module.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('admin.modules.update', module.id));
  };

  return (
    <AppLayout
      title={t('admin.edit_module', 'Edit Module')}
      renderHeader={() => (
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <a href={route('admin.modules.index')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('admin.back_to_modules', 'Back to Modules')}
            </a>
          </Button>
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {t('admin.edit_module', 'Edit Module')}
          </h2>
        </div>
      )}
    >
      <Head title={t('admin.edit_module', 'Edit Module')} />
      <div className="py-6">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.module_details', 'Module Details')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">{t('admin.name', 'Name')}</Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    required
                  />
                  {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                </div>
                <div>
                  <Label htmlFor="description">{t('admin.description', 'Description')}</Label>
                  <Input
                    id="description"
                    value={data.description}
                    onChange={e => setData('description', e.target.value)}
                  />
                  {errors.description && <div className="text-red-500 text-xs mt-1">{errors.description}</div>}
                </div>
                <Button type="submit" disabled={processing}>
                  <Save className="h-4 w-4 mr-2" />
                  {t('admin.save', 'Save')}
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
