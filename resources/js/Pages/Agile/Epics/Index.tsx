import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Epic {
  id: number;
  name: string;
  description?: string;
  color?: string;
  status: string;
  cards_count?: number;
}

interface EpicIndexProps {
  auth: { user: any };
  project: any;
  epics: Epic[];
}

export default function EpicIndex({ auth, project, epics }: EpicIndexProps) {
  const route = useRoute();
  const [isCreating, setIsCreating] = React.useState(false);
  
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    description: '',
    color: '#3b82f6',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('agile.epics.store', project.id), {
      onSuccess: () => {
        reset();
        setIsCreating(false);
      },
    });
  };

  const handleDelete = (epicId: number) => {
    if (confirm('Delete this epic? Cards will not be deleted.')) {
      router.delete(route('agile.epics.destroy', epicId));
    }
  };

  return (
    <AppLayout
      title="Epics"
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-xl text-gray-800 leading-tight">Epics</h2>
            <p className="text-sm text-gray-600 mt-1">
              <Link href={route('projects.show', project.id)} className="hover:underline">
                {project.name}
              </Link>
            </p>
          </div>
          <Button onClick={() => setIsCreating(!isCreating)}>
            <Plus className="h-4 w-4 mr-2" />
            New Epic
          </Button>
        </div>
      )}
    >
      <Head title="Epics" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          {isCreating && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Epic</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Epic Name *</Label>
                      <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="User Authentication"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="color"
                          type="color"
                          value={data.color}
                          onChange={(e) => setData('color', e.target.value)}
                          className="w-20 h-10"
                        />
                        <Input
                          type="text"
                          value={data.color}
                          onChange={(e) => setData('color', e.target.value)}
                          placeholder="#3b82f6"
                        />
                      </div>
                      {errors.color && (
                        <p className="text-sm text-red-500">{errors.color}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      rows={3}
                      placeholder="Describe the epic scope and goals"
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500">{errors.description}</p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreating(false);
                        reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={processing}>
                      {processing ? 'Creating...' : 'Create Epic'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {epics.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">No epics yet. Create one to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {epics.map((epic) => (
                <Card key={epic.id} className="hover:shadow-lg transition">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <Link
                        href={route('agile.epics.show', epic.id)}
                        className="flex-1"
                      >
                        <div className="flex items-center gap-3">
                          {epic.color && (
                            <div
                              className="w-4 h-4 rounded flex-shrink-0"
                              style={{ backgroundColor: epic.color }}
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold hover:text-blue-600 transition">
                              {epic.name}
                            </h3>
                            {epic.description && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {epic.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span>{epic.cards_count || 0} cards</span>
                              <span className="capitalize">{epic.status}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(epic.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
