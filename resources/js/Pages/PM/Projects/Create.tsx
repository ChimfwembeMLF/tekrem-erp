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
import { Textarea } from '@/Components/ui/textarea';
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
      <div className="py-4 sm:py-8">
        <div className="max-w-2xl mx-auto px-3 sm:px-6 lg:px-8">
          <Link
            href={route('pm.projects.index')}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 sm:mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('common.back', 'Back')}
          </Link>

          <Card className="shadow-sm border-0 sm:border">
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                {t('pm.create_project', 'Create Project')}
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                {t('pm.create_project_desc', 'Start a new project to manage boards, sprints, and tasks.')}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('pm.project_name', 'Project Name')}
                  </label>
                  <Input 
                    name="name" 
                    value={form.name} 
                    onChange={handleChange} 
                    required 
                    className="text-base sm:text-sm h-11 sm:h-10"
                    placeholder="Enter project name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('pm.description', 'Description')}
                  </label>
                  <Textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="min-h-[100px] sm:min-h-[120px] text-base sm:text-sm resize-none"
                    placeholder="Describe your project goals and scope"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      {t('pm.start_date', 'Start Date')}
                    </label>
                    <Input 
                      type="date" 
                      name="start_date" 
                      value={form.start_date} 
                      onChange={handleChange}
                      className="text-base sm:text-sm h-11 sm:h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      {t('pm.end_date', 'End Date')}
                    </label>
                    <Input 
                      type="date" 
                      name="end_date" 
                      value={form.end_date} 
                      onChange={handleChange}
                      className="text-base sm:text-sm h-11 sm:h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('pm.status', 'Status')}
                  </label>
                  <Select
                    value={form.status}
                    onValueChange={(value: string) => setForm(f => ({ ...f, status: value }))}
                  >
                    <SelectTrigger className="w-full h-11 sm:h-10 text-base sm:text-sm">
                      <SelectValue placeholder={t('pm.status', 'Status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                  <Link href={route('pm.projects.index')} className="w-full sm:w-auto">
                    <Button type="button" variant="outline" className="w-full sm:w-auto h-11 sm:h-10">
                      {t('common.cancel', 'Cancel')}
                    </Button>
                  </Link>
                  <Button 
                    type="submit" 
                    disabled={submitting} 
                    className="w-full sm:w-auto h-11 sm:h-10"
                  >
                    {submitting ? 'Creating...' : t('pm.create_project', 'Create Project')}
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
