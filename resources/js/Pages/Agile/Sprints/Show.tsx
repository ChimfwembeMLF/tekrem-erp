import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Play, CheckCircle, Trash2, Calendar, Target, TrendingUp } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Sprint {
  id: number;
  name: string;
  goal?: string;
  start_date?: string;
  end_date?: string;
  status: 'planned' | 'active' | 'completed';
  capacity?: number;
  velocity?: number;
  board: any;
  cards?: any[];
}

interface SprintShowProps {
  auth: { user: any };
  sprint: Sprint;
  project: any;
  stats?: {
    total_cards: number;
    completed_cards: number;
    total_points: number;
    completed_points: number;
  };
}

export default function SprintShow({ auth, sprint, project, stats }: SprintShowProps) {
  const route = useRoute();

  const getStatusColor = (status: string) => {
    const colors = {
      planned: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return colors[status as keyof typeof colors];
  };

  const handleStart = () => {
    router.post(route('agile.sprints.start', sprint.id));
  };

  const handleComplete = () => {
    if (confirm('Complete this sprint? Incomplete cards will be moved back to backlog.')) {
      router.post(route('agile.sprints.complete', sprint.id));
    }
  };

  const handleDelete = () => {
    if (confirm('Delete this sprint?')) {
      router.delete(route('agile.sprints.destroy', sprint.id));
    }
  };

  return (
    <AppLayout
      title={sprint.name}
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-xl text-gray-800 leading-tight">{sprint.name}</h2>
            <p className="text-sm text-gray-600 mt-1">
              <Link href={route('projects.show', project.id)} className="hover:underline">
                {project.name}
              </Link>
            </p>
          </div>
          <div className="flex gap-2">
            {sprint.status === 'planned' && (
              <Button onClick={handleStart}>
                <Play className="h-4 w-4 mr-2" />
                Start Sprint
              </Button>
            )}
            {sprint.status === 'active' && (
              <Button onClick={handleComplete}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Sprint
              </Button>
            )}
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      )}
    >
      <Head title={sprint.name} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={getStatusColor(sprint.status)}>
                  {sprint.status}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sprint.start_date && sprint.end_date ? (
                  <div className="text-sm">
                    <p>{new Date(sprint.start_date).toLocaleDateString()}</p>
                    <p className="text-gray-500">to</p>
                    <p>{new Date(sprint.end_date).toLocaleDateString()}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Not scheduled</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Capacity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {sprint.capacity || 'Not set'}
                  {sprint.capacity && <span className="text-sm font-normal text-gray-500"> pts</span>}
                </p>
              </CardContent>
            </Card>
          </div>

          {stats && (
            <div className="grid grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total Cards</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.total_cards}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">{stats.completed_cards}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.total_points}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Points Done</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">{stats.completed_points}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {sprint.velocity && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Velocity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{sprint.velocity}</p>
                <p className="text-sm text-gray-500 mt-1">Story points completed</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Sprint Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {sprint.goal || 'No goal set for this sprint'}
              </p>
            </CardContent>
          </Card>

          {sprint.cards && sprint.cards.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Cards in Sprint ({sprint.cards.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sprint.cards.map((card: any) => (
                    <Link
                      key={card.id}
                      href={route('agile.cards.show', card.id)}
                      className="block p-3 border rounded hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{card.title}</p>
                          <p className="text-sm text-gray-500">{card.type}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {card.story_points && (
                            <Badge variant="outline">{card.story_points} pts</Badge>
                          )}
                          <Badge variant="outline">{card.column.name}</Badge>
                        </div>
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
