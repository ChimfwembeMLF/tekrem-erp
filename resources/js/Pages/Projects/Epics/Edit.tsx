import React from 'react';
import {  Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import useRoute from '@/Hooks/useRoute';
import { ProjectsFormShell } from '@/Components/Module/moduleFormWrappers';

interface Epic {
  id: number;
  name: string;
  description?: string;
  color?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
}

interface Project {
  id: number | string;
  name: string;
}

interface Props {
  auth: { user: any };
  epic: Epic;
  project: Project;
}

const toDateInput = (v?: string | null) => {
  if (!v) return '';
  return String(v).slice(0, 10);
};

export default function EditEpic({ auth, epic, project }: Props) {
  const route = useRoute();
  const { data, setData, put, processing, errors } = useForm({
    name: epic.name ?? '',
    description: epic.description ?? '',
    color: epic.color ?? '#7c3aed',
    start_date: toDateInput(epic.start_date),
    end_date: toDateInput(epic.end_date),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('agile.epics.update', epic.id));
  };

  return (
    <ProjectsFormShell
      title={"Form"}
      backHref={route('agile.epics.show')}
      backLabel="Back"
      onSubmit={handleSubmit}
      processing={processing}
      submitLabel="Save"
      maxWidth="4xl"
    >

<Card>
          <CardHeader>
            <CardTitle>Edit Epic</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={e => setData('name', e.target.value)}
                  required
                  autoFocus
                  className="mt-1"
                />
                {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={e => setData('description', e.target.value)}
                  className="mt-1"
                />
                {errors.description && <div className="text-red-500 text-xs mt-1">{errors.description}</div>}
              </div>
              <div>
                <Label htmlFor="color">Color *</Label>
                <div className="flex items-center gap-4 mt-1">
                  <Input
                    id="color"
                    type="color"
                    value={data.color}
                    onChange={e => setData('color', e.target.value)}
                    className="w-12 h-10 p-0 border-none bg-transparent"
                  />
                  <span className="ml-2">{data.color}</span>
                </div>
                {errors.color && <div className="text-red-500 text-xs mt-1">{errors.color}</div>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={data.start_date}
                    onChange={e => setData('start_date', e.target.value)}
                  />
                  {errors.start_date && <div className="text-red-500 text-xs mt-1">{errors.start_date}</div>}
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={data.end_date}
                    onChange={e => setData('end_date', e.target.value)}
                  />
                  {errors.end_date && <div className="text-red-500 text-xs mt-1">{errors.end_date}</div>}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Link href={route('agile.epics.show', epic.id)} className="btn btn-secondary">Cancel</Link>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
</ProjectsFormShell>
  );
}
