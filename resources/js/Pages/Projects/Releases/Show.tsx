import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Edit, Trash2, Calendar, CheckCircle, Package } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Release {
  id: number;
  name: string;
  version: string;
  description?: string;
  planned_date?: string;
  released_date?: string;
  status: 'planned' | 'in_progress' | 'released';
  sprints?: any[];
  epics?: any[];
}

interface ReleaseShowProps {
  auth: { user: any };
  project: any;
  release: Release;
  stats?: {
    total_cards: number;
    completed_cards: number;
    total_points: number;
    completed_points: number;
  };
}

export default function ReleaseShow({ auth, project, release, stats }: ReleaseShowProps) {
  const route = useRoute();

  const getStatusColor = (status: string) => {
    const colors = {
      planned: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      released: 'bg-green-100 text-green-800',
    };
    return colors[status as keyof typeof colors];
  };

  const handlePublish = () => {
    if (confirm('Publish this release? This will mark it as released.')) {
      router.post(route('agile.releases.publish', release.id));
    }
  };

  const handleDelete = () => {
    if (confirm('Delete this release?')) {
      router.delete(route('agile.releases.destroy', release.id));
    }
  };

  const completionPercentage = stats
    ? Math.round((stats.completed_cards / stats.total_cards) * 100) || 0
    : 0;

  return (
    <AppLayout
      title={release.name}
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
              {release.name} - v{release.version}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              <Link href={route('projects.show', project.id)} className="hover:underline">
                {project.name}
              </Link>
            </p>
          </div>
          <div className="flex gap-2">
            {release.status !== 'released' && (
              <>
                <Link href={route('agile.releases.edit', release.id)}>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <Button onClick={handlePublish}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Publish Release
                </Button>
              </>
            )}
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      )}
    >
      <Head title={release.name} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={getStatusColor(release.status)}>
                  {release.status.replace('_', ' ')}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Planned Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                {release.planned_date ? (
                  <p className="text-sm">{new Date(release.planned_date).toLocaleDateString()}</p>
                ) : (
                  <p className="text-sm text-gray-500">Not scheduled</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Released Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                {release.released_date ? (
                  <p className="text-sm">{new Date(release.released_date).toLocaleDateString()}</p>
                ) : (
                  <p className="text-sm text-gray-500">Not released</p>
                )}
              </CardContent>
            </Card>
          </div>

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
                    className="bg-green-600 h-4 rounded-full transition-all"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <p className="text-sm text-gray-600">Story Points</p>
                    <p className="text-xl font-bold">
                      {stats.completed_points} / {stats.total_points}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 whitespace-pre-wrap">
                {release.description || 'No description provided'}
              </p>
            </CardContent>
          </Card>

          {release.sprints && release.sprints.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Included Sprints ({release.sprints.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {release.sprints.map((sprint: any) => (
                    <Link
                      key={sprint.id}
                      href={route('agile.sprints.show', sprint.id)}
                      className="block p-3 border rounded hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{sprint.name}</p>
                          {sprint.goal && (
                            <p className="text-sm text-gray-500">{sprint.goal}</p>
                          )}
                        </div>
                        <Badge variant="outline">{sprint.status}</Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {release.epics && release.epics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Included Epics ({release.epics.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {release.epics.map((epic: any) => (
                    <Link
                      key={epic.id}
                      href={route('agile.epics.show', epic.id)}
                      className="block p-3 border rounded hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{epic.name}</p>
                          {epic.description && (
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {epic.description}
                            </p>
                          )}
                        </div>
                        {epic.color && (
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: epic.color }}
                          />
                        )}
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
