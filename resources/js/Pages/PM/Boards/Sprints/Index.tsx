import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { 
  Plus, 
  Search, 
  Calendar, 
  Target, 
  Users, 
  BarChart3,
  Play,
  Square,
  CheckCircle,
  Archive
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
  cards_count?: number;
  completed_cards_count?: number;
  created_at: string;
  updated_at: string;
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
  sprints: Sprint[];
}

const statusConfig = {
  planned: { label: 'Planned', color: 'bg-gray-100 text-gray-800', icon: Calendar },
  active: { label: 'Active', color: 'bg-blue-100 text-blue-800', icon: Play },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  archived: { label: 'Archived', color: 'bg-gray-100 text-gray-600', icon: Archive },
};

export default function Index({ project, board, sprints }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredSprints = sprints.filter(sprint =>
    sprint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sprint.goal?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSprintProgress = (sprint: Sprint) => {
    if (!sprint.cards_count || sprint.cards_count === 0) return 0;
    return Math.round(((sprint.completed_cards_count || 0) / sprint.cards_count) * 100);
  };

  const getSprintDuration = (sprint: Sprint) => {
    if (!sprint.start_date || !sprint.end_date) return null;
    const start = new Date(sprint.start_date);
    const end = new Date(sprint.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  };

  return (
    <AppLayout
      title={`Sprints - ${board.name}`}
      renderHeader={() => (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {t('pm.sprints.title', 'Sprints')}
            </h2>
            <p className="text-sm text-gray-600">
              {project.name} / {board.name}
            </p>
          </div>
          <Link href={route('pm.boards.sprints.create', [board.id])}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('pm.sprints.create', 'Create Sprint')}
            </Button>
          </Link>
        </div>
      )}
    >
      <Head title={`Sprints - ${board.name}`} />

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search and Filters */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder={t('pm.sprints.search', 'Search sprints...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Sprints Grid */}
          {filteredSprints.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm 
                    ? t('pm.sprints.no_results', 'No sprints found')
                    : t('pm.sprints.empty', 'No sprints yet')
                  }
                </h3>
                <p className="text-gray-600 text-center mb-4">
                  {searchTerm
                    ? t('pm.sprints.no_results_desc', 'Try adjusting your search terms')
                    : t('pm.sprints.empty_desc', 'Create your first sprint to start organizing your work into time-boxed iterations')
                  }
                </p>
                {!searchTerm && (
                  <Link href={route('pm.boards.sprints.create', [board.id])}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('pm.sprints.create', 'Create Sprint')}
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSprints.map((sprint) => {
                const StatusIcon = statusConfig[sprint.status].icon;
                const progress = getSprintProgress(sprint);
                const duration = getSprintDuration(sprint);

                return (
                  <Card key={sprint.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">
                            <Link 
                              href={route('pm.boards.sprints.show', [board.id, sprint.id])}
                              className="hover:text-blue-600 transition-colors"
                            >
                              {sprint.name}
                            </Link>
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge className={statusConfig[sprint.status].color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig[sprint.status].label}
                            </Badge>
                            {duration && (
                              <span className="text-xs text-gray-500">
                                {duration}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {sprint.goal && (
                        <CardDescription className="mt-2">
                          {sprint.goal}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Progress */}
                        {sprint.cards_count && sprint.cards_count > 0 && (
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-medium">{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                              <span>{sprint.completed_cards_count || 0} completed</span>
                              <span>{sprint.cards_count} total cards</span>
                            </div>
                          </div>
                        )}

                        {/* Dates */}
                        {(sprint.start_date || sprint.end_date) && (
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {sprint.start_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(sprint.start_date).toLocaleDateString()}</span>
                              </div>
                            )}
                            {sprint.end_date && (
                              <div className="flex items-center gap-1">
                                <span>→</span>
                                <span>{new Date(sprint.end_date).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-2">
                            <Link href={route('pm.boards.sprints.show', [board.id, sprint.id])}>
                              <Button variant="ghost" size="sm">
                                <BarChart3 className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            <Link href={route('pm.boards.sprints.edit', [board.id, sprint.id])}>
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            </Link>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(sprint.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
