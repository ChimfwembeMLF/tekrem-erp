import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import useRoute from '@/Hooks/useRoute';

interface Release {
  id: number;
  name: string;
  version: string;
  description?: string;
  planned_date?: string;
  released_date?: string;
  sprint_ids?: number[];
  epic_ids?: number[];
}

interface ReleaseEditProps {
  auth: { user: any };
  project: any;
  release: Release;
  sprints?: any[];
  epics?: any[];
}

export default function ReleaseEdit({ auth, project, release, sprints = [], epics = [] }: ReleaseEditProps) {
  const route = useRoute();
  const { data, setData, put, processing, errors } = useForm({
    name: release.name,
    version: release.version,
    description: release.description || '',
    planned_date: release.planned_date || '',
    sprint_ids: release.sprint_ids || [],
    epic_ids: release.epic_ids || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('agile.releases.update', release.id));
  };

  const toggleSprint = (sprintId: number) => {
    setData('sprint_ids', data.sprint_ids.includes(sprintId)
      ? data.sprint_ids.filter(id => id !== sprintId)
      : [...data.sprint_ids, sprintId]
    );
  };

  const toggleEpic = (epicId: number) => {
    setData('epic_ids', data.epic_ids.includes(epicId)
      ? data.epic_ids.filter(id => id !== epicId)
      : [...data.epic_ids, epicId]
    );
  };

  return (
    <AppLayout
      title="Edit Release"
      renderHeader={() => (
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          Edit Release - {release.name}
        </h2>
      )}
    >
      <Head title="Edit Release" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Release Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Release Name *</Label>
                    <Input
                      id="name"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="version">Version *</Label>
                    <Input
                      id="version"
                      value={data.version}
                      onChange={(e) => setData('version', e.target.value)}
                    />
                    {errors.version && (
                      <p className="text-sm text-red-500">{errors.version}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="planned_date">Planned Release Date</Label>
                  <Input
                    id="planned_date"
                    type="date"
                    value={data.planned_date}
                    onChange={(e) => setData('planned_date', e.target.value)}
                  />
                  {errors.planned_date && (
                    <p className="text-sm text-red-500">{errors.planned_date}</p>
                  )}
                </div>

                {sprints.length > 0 && (
                  <div className="space-y-2">
                    <Label>Include Sprints</Label>
                    <div className="border rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
                      {sprints.map((sprint) => (
                        <label
                          key={sprint.id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={data.sprint_ids.includes(sprint.id)}
                            onChange={() => toggleSprint(sprint.id)}
                            className="rounded border-gray-300"
                          />
                          <span>{sprint.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {epics.length > 0 && (
                  <div className="space-y-2">
                    <Label>Include Epics</Label>
                    <div className="border rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
                      {epics.map((epic) => (
                        <label
                          key={epic.id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={data.epic_ids.includes(epic.id)}
                            onChange={() => toggleEpic(epic.id)}
                            className="rounded border-gray-300"
                          />
                          <span>{epic.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Updating...' : 'Update Release'}
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
