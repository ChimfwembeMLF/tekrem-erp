import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from '@/Components/ui/select';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Plus, ArrowLeft } from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

export default function Create() {
  const { t } = useTranslate();
  const route = useRoute();
  const [form, setForm] = React.useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'active',
  });
  const [submitting, setSubmitting] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    router.post(route('pm.projects.store'), form, {
      onFinish: () => setSubmitting(false),
    });
  };

  return (
    <AppLayout title={t('pm.create_project', 'Create Project')}>
      <Head title={t('pm.create_project', 'Create Project')} />
      <div className="py-6">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    {t('pm.create_project', 'Create Project')}
                  </CardTitle>
                  <CardDescription>
                    {t('pm.create_project_desc', 'Start a new project to manage boards, sprints, and tasks.')}
                  </CardDescription>
                </div>
                <Link href={route('pm.projects.index')} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  {t('common.back', 'Back')}
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block mb-1 font-medium">{t('pm.project_name', 'Project Name')}</label>
                  <Input name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block mb-1 font-medium">{t('pm.description', 'Description')}</label>
                  <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded p-2 min-h-[80px]" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block mb-1 font-medium">{t('pm.start_date', 'Start Date')}</label>
                    <Input type="date" name="start_date" value={form.start_date} onChange={handleChange} />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1 font-medium">{t('pm.end_date', 'End Date')}</label>
                    <Input type="date" name="end_date" value={form.end_date} onChange={handleChange} />
                  </div>
                </div>
                <div>
                  <label className="block mb-1 font-medium">{t('pm.status', 'Status')}</label>
                  <Select value={form.status} onValueChange={value => setForm(f => ({ ...f, status: value }))}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('pm.status', 'Status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="submit" disabled={submitting}>
                    {t('pm.create_project', 'Create Project')}
                  </Button>
                  <Link href={route('pm.projects.index')}>
                    <Button type="button" variant="outline">
                      {t('common.cancel', 'Cancel')}
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
