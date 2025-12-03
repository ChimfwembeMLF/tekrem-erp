import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { 
  Plus,
  Zap,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  Edit,
  Play,
  Square
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Sprint {
  id: number;
  board_id: number;
  name: string;
  goal?: string;
  start_date?: string;
  end_date?: string;
  status: 'planning' | 'active' | 'completed';
  planned_story_points: number;
  completed_story_points: number;
  velocity: number;
  team_capacity?: number;
  daily_progress?: Record<string, number>;
}

interface SprintStats {
  total_cards: number;
  completed_cards: number;
  in_progress_cards: number;
  todo_cards: number;
  total_story_points: number;
  completed_story_points: number;
}

interface SprintsProps {
  auth: {
    user: any;
  };
  project: {
    id: number;
    name: string;
  };
  board: {
    id: number;
    name: string;
  };
  sprints: Sprint[];
  activeSprint?: Sprint & { stats: SprintStats };
  completedSprints: Sprint[];
}

export default function Sprints({ 
  auth, 
  project, 
  board,
  sprints = [], 
  activeSprint,
  completedSprints = []
}: SprintsProps) {
  const route = useRoute();

  const getSprintStatus = (sprint: Sprint) => {
    switch (sprint.status) {
      case 'planning':
        return { color: 'bg-blue-100 text-blue-800', label: 'Planning' };
      case 'active':
        return { color: 'bg-green-100 text-green-800', label: 'Active' };
      case 'completed':
        return { color: 'bg-gray-100 text-gray-800', label: 'Completed' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
    }
  };

  const getDaysRemaining = (endDate?: string) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const calculateProgress = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const isSprintOnTrack = (sprint: Sprint & { stats?: SprintStats }) => {
    if (!sprint.start_date || !sprint.end_date || !sprint.stats) return true;
    
    const start = new Date(sprint.start_date).getTime();
    const end = new Date(sprint.end_date).getTime();
    const now = new Date().getTime();
    
    const totalDuration = end - start;
    const elapsed = now - start;
    const elapsedPercentage = (elapsed / totalDuration) * 100;
    
    const completionPercentage = calculateProgress(sprint.completed_story_points, sprint.planned_story_points);
    
    // On track if completion is within 10% of elapsed time
    return completionPercentage >= (elapsedPercentage - 10);
  };

  return (
    <AppLayout
      title={`Sprints - ${project.name}`}
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
              Sprint Management
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              <Link href={route('projects.show', project.id)} className="hover:underline">
                {project.name}
              </Link>
              {' / '}
              <Link href={route('agile.board.show', board.id)} className="hover:underline">
                {board.name}
              </Link>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.visit(route('agile.backlog.index', project.id))}>
              <Target className="h-4 w-4 mr-2" />
              View Backlog
            </Button>
            <Button onClick={() => router.visit(route('agile.sprints.create', board.id))}>
              <Plus className="h-4 w-4 mr-2" />
              Create Sprint
            </Button>
          </div>
        </div>
      )}
    >
      <Head title={`Sprints - ${project.name}`} />

      <div className="space-y-6 p-6">
        <Tabs defaultValue="active" className="w-full">
          <TabsList>
            <TabsTrigger value="active">
              <Zap className="h-4 w-4 mr-2" />
              Active Sprint
            </TabsTrigger>
            <TabsTrigger value="planned">
              <Calendar className="h-4 w-4 mr-2" />
              Planned Sprints
            </TabsTrigger>
            <TabsTrigger value="completed">
              <CheckCircle className="h-4 w-4 mr-2" />
              Completed Sprints
            </TabsTrigger>
          </TabsList>

          {/* Active Sprint */}
          <TabsContent value="active" className="space-y-6">
            {activeSprint ? (
              <>
                {/* Sprint Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-2xl">{activeSprint.name}</CardTitle>
                          <Badge variant="outline" className={getSprintStatus(activeSprint).color}>
                            {getSprintStatus(activeSprint).label}
                          </Badge>
                        </div>
                        {activeSprint.goal && (
                          <CardDescription className="mt-2 text-base">
                            <strong>Goal:</strong> {activeSprint.goal}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.visit(route('agile.sprints.edit', activeSprint.id))}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" onClick={() => router.visit(route('agile.sprints.complete', activeSprint.id))}>
                          <Square className="h-4 w-4 mr-2" />
                          Complete Sprint
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="text-lg font-semibold">
                          {formatDate(activeSprint.start_date)} - {formatDate(activeSprint.end_date)}
                        </p>
                        {getDaysRemaining(activeSprint.end_date) !== null && (
                          <p className="text-xs text-gray-500">
                            {getDaysRemaining(activeSprint.end_date)! > 0 
                              ? `${getDaysRemaining(activeSprint.end_date)} days remaining`
                              : 'Sprint ended'
                            }
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">Velocity</p>
                        <p className="text-lg font-semibold flex items-center gap-2">
                          {activeSprint.velocity.toFixed(1)} pts/day
                          {activeSprint.velocity > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-gray-400" />
                          )}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">Team Capacity</p>
                        <p className="text-lg font-semibold">
                          {activeSprint.team_capacity || 'Not set'} pts
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">Status</p>
                        <div className="flex items-center gap-2">
                          {isSprintOnTrack(activeSprint) ? (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <span className="text-lg font-semibold text-green-600">On Track</span>
                            </>
                          ) : (
                            <>
                              <Activity className="h-5 w-5 text-orange-600" />
                              <span className="text-lg font-semibold text-orange-600">At Risk</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sprint Progress */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Story Points Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Completed</span>
                          <span className="font-semibold">
                            {activeSprint.completed_story_points} / {activeSprint.planned_story_points} pts
                          </span>
                        </div>
                        <Progress 
                          value={calculateProgress(activeSprint.completed_story_points, activeSprint.planned_story_points)} 
                          className="h-3"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {calculateProgress(activeSprint.completed_story_points, activeSprint.planned_story_points)}% complete
                        </p>
                      </div>

                      {activeSprint.stats && (
                        <div className="space-y-2 pt-4 border-t">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Cards</span>
                            <span className="font-semibold">{activeSprint.stats.total_cards}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Completed</span>
                            <span className="font-semibold text-green-600">{activeSprint.stats.completed_cards}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">In Progress</span>
                            <span className="font-semibold text-blue-600">{activeSprint.stats.in_progress_cards}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">To Do</span>
                            <span className="font-semibold text-gray-600">{activeSprint.stats.todo_cards}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Burndown Chart
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">Burndown chart visualization</p>
                          <p className="text-xs">Coming soon</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Zap className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold mb-2">No Active Sprint</h3>
                  <p className="text-gray-600 mb-6">
                    Start a new sprint to begin tracking your team's progress
                  </p>
                  <Button onClick={() => router.visit(route('agile.sprints.create', board.id))}>
                    <Play className="h-4 w-4 mr-2" />
                    Start New Sprint
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Planned Sprints */}
          <TabsContent value="planned" className="space-y-4">
            {sprints.filter(s => s.status === 'planning').length > 0 ? (
              <div className="space-y-4">
                {sprints.filter(s => s.status === 'planning').map((sprint) => (
                  <Card key={sprint.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{sprint.name}</h3>
                            <Badge variant="outline" className={getSprintStatus(sprint).color}>
                              {getSprintStatus(sprint).label}
                            </Badge>
                          </div>
                          {sprint.goal && (
                            <p className="text-sm text-gray-600 mb-3">{sprint.goal}</p>
                          )}
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              <span>{sprint.planned_story_points} story points</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline"
                            onClick={() => router.visit(route('agile.sprints.edit', sprint.id))}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button onClick={() => router.visit(route('agile.sprints.start', sprint.id))}>
                            <Play className="h-4 w-4 mr-2" />
                            Start Sprint
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold mb-2">No Planned Sprints</h3>
                  <p className="text-gray-600 mb-6">
                    Create a sprint to plan your upcoming work
                  </p>
                  <Button onClick={() => router.visit(route('agile.sprints.create', board.id))}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Sprint
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Completed Sprints */}
          <TabsContent value="completed" className="space-y-4">
            {completedSprints.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedSprints.map((sprint) => (
                  <Card key={sprint.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{sprint.name}</CardTitle>
                        <Badge variant="outline" className={getSprintStatus(sprint).color}>
                          {getSprintStatus(sprint).label}
                        </Badge>
                      </div>
                      {sprint.goal && (
                        <CardDescription>{sprint.goal}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Story Points</span>
                          <span className="font-semibold">
                            {sprint.completed_story_points} / {sprint.planned_story_points}
                          </span>
                        </div>
                        <Progress 
                          value={calculateProgress(sprint.completed_story_points, sprint.planned_story_points)} 
                          className="h-2"
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Velocity</span>
                        <span className="font-semibold">{sprint.velocity.toFixed(1)} pts/day</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Duration</span>
                        <span className="text-gray-500">
                          {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}
                        </span>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full mt-2"
                        onClick={() => router.visit(route('agile.sprints.show', sprint.id))}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold mb-2">No Completed Sprints</h3>
                  <p className="text-gray-600">
                    Completed sprints will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
