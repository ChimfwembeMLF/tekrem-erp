import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { 
  ArrowLeft, 
  Calendar, 
  Target, 
  Users, 
  BarChart3,
  Play,
  Square,
  CheckCircle,
  Archive,
  Edit,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import useTranslate from '@/Hooks/useTranslate';

interface Sprint {
  id: number;
  name: string;
  goal: string | null;
  start_date: string | null;
  end_date: string | null;
  status: 'planned' | 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
  cards?: BoardCard[];
}

interface BoardCard {
  id: number;
  title: string;
  type: string;
  priority: string;
  status: string;
  assignee?: {
    id: number;
    name: string;
    email: string;
  };
}

interface Project {
  id: number;
  name: string;
}

interface Board {
  id: number;
  name: string;
  type: string;
}

interface Props {
  project: Project;
  board: Board;
  sprint: Sprint;
}

const statusConfig = {
  planned: { label: 'Planned', color: 'bg-gray-100 text-gray-800', icon: Calendar },
  active: { label: 'Active', color: 'bg-blue-100 text-blue-800', icon: Play },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  archived: { label: 'Archived', color: 'bg-gray-100 text-gray-600', icon: Archive },
};

const priorityConfig = {
  low: { label: 'Low', color: 'bg-green-100 text-green-800' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
  critical: { label: 'Critical', color: 'bg-red-100 text-red-800' },
};

export default function Show({ project, board, sprint }: Props) {
  const { t } = useTranslate();
  const route = useRoute();

  const StatusIcon = statusConfig[sprint.status].icon;
  const cards = sprint.cards || [];
  const completedCards = cards.filter(card => card.status === 'done' || card.status === 'completed');
  const progress = cards.length > 0 ? Math.round((completedCards.length / cards.length) * 100) : 0;

  const getSprintDuration = () => {
    if (!sprint.start_date || !sprint.end_date) return null;
    const start = new Date(sprint.start_date);
    const end = new Date(sprint.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysRemaining = () => {
    if (!sprint.end_date) return null;
    const end = new Date(sprint.end_date);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const duration = getSprintDuration();
  const daysRemaining = getDaysRemaining();

  const cardsByStatus = cards.reduce((acc, card) => {
    const status = card.status || 'todo';
    if (!acc[status]) acc[status] = [];
    acc[status].push(card);
    return acc;
  }, {} as Record<string, BoardCard[]>);

  return (
    <AppLayout
      title={`${sprint.name} - ${board.name}`}
      renderHeader={() => (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={route('pm.boards.sprints.index', [board.id])}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sprints
              </Button>
            </Link>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {sprint.name}
              </h2>
              <p className="text-sm text-gray-600">
                {project.name} / {board.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusConfig[sprint.status].color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig[sprint.status].label}
            </Badge>
            <Link href={route('pm.boards.sprints.edit', [board.id, sprint.id])}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Sprint
              </Button>
            </Link>
          </div>
        </div>
      )}
    >
      <Head title={`${sprint.name} - ${board.name}`} />

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Sprint Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Sprint Info */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Sprint Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sprint.goal && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Sprint Goal</h4>
                    <p className="text-gray-700">{sprint.goal}</p>
                  </div>
                )}

                {(sprint.start_date || sprint.end_date) && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Timeline</h4>
                    <div className="flex items-center gap-4 text-sm">
                      {sprint.start_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>Start: {new Date(sprint.start_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {sprint.end_date && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>End: {new Date(sprint.end_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {duration && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">•</span>
                          <span>{duration} days</span>
                        </div>
                      )}
                    </div>
                    {daysRemaining !== null && sprint.status === 'active' && (
                      <div className="mt-2">
                        {daysRemaining > 0 ? (
                          <div className="flex items-center gap-2 text-sm text-blue-600">
                            <TrendingUp className="h-4 w-4" />
                            <span>{daysRemaining} days remaining</span>
                          </div>
                        ) : daysRemaining === 0 ? (
                          <div className="flex items-center gap-2 text-sm text-orange-600">
                            <AlertCircle className="h-4 w-4" />
                            <span>Sprint ends today</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            <span>Sprint overdue by {Math.abs(daysRemaining)} days</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sprint Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Completion</span>
                    <span className="text-sm text-gray-600">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <span>{completedCards.length} completed</span>
                    <span>{cards.length} total</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{cards.length}</div>
                    <div className="text-xs text-gray-500">Total Cards</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{completedCards.length}</div>
                    <div className="text-xs text-gray-500">Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sprint Content */}
          <Tabs defaultValue="cards" className="space-y-6">
            <TabsList>
              <TabsTrigger value="cards">Cards ({cards.length})</TabsTrigger>
              <TabsTrigger value="burndown">Burndown Chart</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="cards" className="space-y-6">
              {cards.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Target className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No cards in this sprint
                    </h3>
                    <p className="text-gray-600 text-center mb-4">
                      Add cards to this sprint to start tracking progress
                    </p>
                    <Link href={route('pm.projects.boards.show', [project.id, board.id])}>
                      <Button>
                        View Board
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cards.map((card) => (
                    <Card key={card.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-sm font-medium">
                            {card.title}
                          </CardTitle>
                          <Badge className={priorityConfig[card.priority as keyof typeof priorityConfig]?.color || 'bg-gray-100 text-gray-800'}>
                            {priorityConfig[card.priority as keyof typeof priorityConfig]?.label || card.priority}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Type: {card.type}</span>
                            <span className="text-gray-500">Status: {card.status}</span>
                          </div>
                          {card.assignee && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Users className="h-3 w-3" />
                              <span>{card.assignee.name}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="burndown">
              <Card>
                <CardHeader>
                  <CardTitle>Burndown Chart</CardTitle>
                  <CardDescription>
                    Track sprint progress over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-12 text-gray-500">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                      <p>Burndown chart coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Sprint Reports</CardTitle>
                  <CardDescription>
                    Sprint retrospective and performance reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-12 text-gray-500">
                    <div className="text-center">
                      <Target className="h-12 w-12 mx-auto mb-4" />
                      <p>Sprint reports coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
