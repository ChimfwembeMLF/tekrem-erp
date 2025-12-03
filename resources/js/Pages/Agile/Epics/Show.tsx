import React from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Edit, Trash2, Save, X } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Epic {
  id: number;
  name: string;
  description?: string;
  color?: string;
  status: string;
  cards?: any[];
  releases?: any[];
}

interface EpicShowProps {
  auth: { user: any };
  project: any;
  epic: Epic;
  stats?: {
    total_cards: number;
    completed_cards: number;
    total_points: number;
    completed_points: number;
  };
}

export default function EpicShow({ auth, project, epic, stats }: EpicShowProps) {
  const route = useRoute();
  const [isEditing, setIsEditing] = React.useState(false);

  const { data, setData, put, processing, errors } = useForm({
    name: epic.name,
    description: epic.description || '',
    color: epic.color || '#3b82f6',
    status: epic.status,
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('agile.epics.update', epic.id), {
      onSuccess: () => setIsEditing(false),
    });
  };

  const handleDelete = () => {
    if (confirm('Delete this epic? Cards will not be deleted.')) {
      router.delete(route('agile.epics.destroy', epic.id));
    }
  };

  const completionPercentage = stats && stats.total_cards > 0
    ? Math.round((stats.completed_cards / stats.total_cards) * 100)
    : 0;

  return (
    <AppLayout
      title={epic.name}
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              {epic.color && (
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: epic.color }}
                />
              )}
              <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                {epic.name}
              </h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              <Link href={route('projects.show', project.id)} className="hover:underline">
                {project.name}
              </Link>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      )}
    >
      <Head title={epic.name} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Epic</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Epic Name *</Label>
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
                        />
                      </div>
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
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={processing}>
                      <Save className="h-4 w-4 mr-2" />
                      {processing ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {epic.description || 'No description provided'}
                </p>
              </CardContent>
            </Card>
          )}

          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{completionPercentage}%</span>
                  <span className="text-sm text-gray-600">
                    {stats.completed_cards} of {stats.total_cards} cards completed
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Cards</p>
                    <p className="text-2xl font-bold">{stats.total_cards}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Story Points</p>
                    <p className="text-2xl font-bold">
                      {stats.completed_points} / {stats.total_points}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {epic.cards && epic.cards.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Cards ({epic.cards.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {epic.cards.map((card: any) => (
                    <Link
                      key={card.id}
                      href={route('agile.cards.show', card.id)}
                      className="block p-3 border rounded hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{card.title}</p>
                          <p className="text-sm text-gray-500 capitalize">{card.type}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {card.story_points && (
                            <Badge variant="outline">{card.story_points} pts</Badge>
                          )}
                          <Badge variant="outline" className="capitalize">
                            {card.priority}
                          </Badge>
                          <Badge variant="outline">{card.column?.name}</Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {epic.releases && epic.releases.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Releases ({epic.releases.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {epic.releases.map((release: any) => (
                    <Link
                      key={release.id}
                      href={route('agile.releases.show', release.id)}
                      className="block p-3 border rounded hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{release.name}</p>
                          <p className="text-sm text-gray-500">v{release.version}</p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {release.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
