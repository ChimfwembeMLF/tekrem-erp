import React from 'react';
import {  useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { AdminFormShell } from '@/Components/Module/moduleFormWrappers';

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
    <AdminFormShell
      title={"Edit Module"}
      backHref={route('admin.modules.index')}
      backLabel="Back"
      onSubmit={handleSubmit}
      processing={processing}
      submitLabel="Save"
      maxWidth="4xl"
    >

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
          
</AdminFormShell>
  );
}
