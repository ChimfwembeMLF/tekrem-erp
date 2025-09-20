import React from 'react'
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function EditTeam({ team }) {
  const route = useRoute();
  const { data, setData, put, processing, errors } = useForm({
    name: team.name || '',
    description: team.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('hr.teams.update', team.id));
  };

  return (
    <AppLayout
      title="Edit Team"
      renderHeader={() => (
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <a href={route('hr.teams.index')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Teams
            </a>
          </Button>
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Edit Team
          </h2>
        </div>
      )}
    >
      <Head title="Edit Team" />
      <div className="py-6">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Team Name *</Label>
                  <Input id="name" value={data.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)} className={errors.name ? 'border-red-500' : ''} />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={data.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)} className={errors.description ? 'border-red-500' : ''} />
                  {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <a href={route('hr.teams.index')}>Cancel</a>
              </Button>
              <Button type="submit" disabled={processing}>
                <Save className="h-4 w-4 mr-2" />
                {processing ? 'Updating...' : 'Update Team'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
