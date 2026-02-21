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
  Package,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  FileText,
  Rocket,
  AlertCircle,
  TrendingUp,
  GitBranch,
  Tag
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Release {
  id: number;
  project_id: number;
  name: string;
  version_number: string;
  description?: string;
  release_notes?: string;
  planned_date?: string;
  released_date?: string;
  status: 'planned' | 'in_progress' | 'released' | 'cancelled';
  metadata?: Record<string, any>;
  sprints?: Sprint[];
  epics?: Epic[];
  percent_complete?: number;
  total_story_points?: number;
  completed_story_points?: number;
}

interface Sprint {
  id: number;
  name: string;
  status: string;
  completed_story_points: number;
}

interface Epic {
  id: number;
  name: string;
  color: string;
}

interface ReleasesProps {
  auth: {
    user: any;
  };
  project: {
    id: number;
    name: string;
  };
  releases: Release[];
  upcomingReleases: Release[];
  releasedVersions: Release[];
}

export default function Releases({ 
  auth, 
  project, 
  releases = [],
  upcomingReleases = [],
  releasedVersions = []
}: ReleasesProps) {
  const route = useRoute();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'planned':
        return { 
          color: 'bg-blue-100 text-blue-800', 
          icon: Clock,
          label: 'Planned' 
        };
      case 'in_progress':
        return { 
          color: 'bg-yellow-100 text-yellow-800', 
          icon: TrendingUp,
          label: 'In Progress' 
        };
      case 'released':
        return { 
          color: 'bg-green-100 text-green-800', 
          icon: CheckCircle,
          label: 'Released' 
        };
      case 'cancelled':
        return { 
          color: 'bg-red-100 text-red-800', 
          icon: AlertCircle,
          label: 'Cancelled' 
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800', 
          icon: Package,
          label: 'Unknown' 
        };
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const isOverdue = (release: Release) => {
    if (!release.planned_date || release.status === 'released') return false;
    return new Date(release.planned_date) < new Date();
  };

  const getDaysUntilRelease = (plannedDate?: string) => {
    if (!plannedDate) return null;
    const planned = new Date(plannedDate);
    const now = new Date();
    const diff = Math.ceil((planned.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <AppLayout
      title={`Releases - ${project.name}`}
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
              Release Management
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              <Link href={route('projects.show', project.id)} className="hover:underline">
                {project.name}
              </Link>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.visit(route('agile.sprints.index', project.id))}>
              <GitBranch className="h-4 w-4 mr-2" />
              View Sprints
            </Button>
            <Button onClick={() => router.visit(route('agile.releases.create', project.id))}>
              <Plus className="h-4 w-4 mr-2" />
              Create Release
            </Button>
          </div>
        </div>
      )}
    >
      <Head title={`Releases - ${project.name}`} />

      <div className="space-y-6 p-6">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList>
            <TabsTrigger value="upcoming">
              <Clock className="h-4 w-4 mr-2" />
              Upcoming ({upcomingReleases.length})
            </TabsTrigger>
            <TabsTrigger value="released">
              <CheckCircle className="h-4 w-4 mr-2" />
              Released ({releasedVersions.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              <Package className="h-4 w-4 mr-2" />
              All Releases ({releases.length})
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Releases */}
          <TabsContent value="upcoming" className="space-y-4">
            {upcomingReleases.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {upcomingReleases.map((release) => {
                  const statusConfig = getStatusConfig(release.status);
                  const daysUntil = getDaysUntilRelease(release.planned_date);
                  const overdue = isOverdue(release);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <Card 
                      key={release.id}
                      className={overdue ? 'border-red-200 bg-red-50/50' : ''}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-xl">{release.name}</CardTitle>
                              <Badge variant="outline" className="text-xs">
                                v{release.version_number}
                              </Badge>
                            </div>
                            {release.description && (
                              <CardDescription>{release.description}</CardDescription>
                            )}
                          </div>
                          <Badge variant="outline" className={statusConfig.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                        {(typeof release.percent_complete === 'number' || typeof release.completed_story_points === 'number') && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-blue-700">
                            {typeof release.percent_complete === 'number' && (
                              <span className="font-semibold">{release.percent_complete}%</span>
                            )}
                            {typeof release.completed_story_points === 'number' && typeof release.total_story_points === 'number' && (
                              <span>
                                {release.completed_story_points} / {release.total_story_points} pts
                              </span>
                            )}
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Release Date */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>Planned Release</span>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${overdue ? 'text-red-600' : ''}`}>
                              {formatDate(release.planned_date)}
                            </div>
                            {daysUntil !== null && (
                              <div className={`text-xs ${overdue ? 'text-red-600' : 'text-gray-500'}`}>
                                {overdue 
                                  ? `${Math.abs(daysUntil)} days overdue`
                                  : `${daysUntil} days remaining`
                                }
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Sprints */}
                        {release.sprints && release.sprints.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <GitBranch className="h-4 w-4" />
                              <span>Sprints ({release.sprints.length})</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {release.sprints.slice(0, 3).map(sprint => (
                                <Badge key={sprint.id} variant="secondary" className="text-xs">
                                  {sprint.name}
                                </Badge>
                              ))}
                              {release.sprints.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{release.sprints.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Epics */}
                        {release.epics && release.epics.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Tag className="h-4 w-4" />
                              <span>Epics ({release.epics.length})</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {release.epics.map(epic => (
                                <Badge 
                                  key={epic.id} 
                                  variant="outline" 
                                  className="text-xs"
                                  style={{ 
                                    backgroundColor: epic.color + '20', 
                                    borderColor: epic.color 
                                  }}
                                >
                                  {epic.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => router.visit(route('agile.releases.edit', release.id))}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => router.visit(route('agile.releases.show', release.id))}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                          {release.status === 'in_progress' && (
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => router.visit(route('agile.releases.publish', release.id))}
                            >
                              <Rocket className="h-3 w-3 mr-1" />
                              Release
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold mb-2">No Upcoming Releases</h3>
                  <p className="text-gray-600 mb-6">
                    Create a release to plan your next version
                  </p>
                  <Button onClick={() => router.visit(route('agile.releases.create', project.id))}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Release
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Released Versions */}
          <TabsContent value="released" className="space-y-4">
            {releasedVersions.length > 0 ? (
              <div className="space-y-4">
                {releasedVersions.map((release) => (
                  <Card key={release.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">{release.name}</h3>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              v{release.version_number}
                            </Badge>
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Released
                            </Badge>
                          </div>
                          
                          {release.description && (
                            <p className="text-sm text-gray-600">{release.description}</p>
                          )}

                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>Released: {formatDate(release.released_date)}</span>
                            </div>
                            {release.sprints && release.sprints.length > 0 && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <GitBranch className="h-4 w-4" />
                                <span>{release.sprints.length} sprints</span>
                              </div>
                            )}
                            {release.epics && release.epics.length > 0 && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Tag className="h-4 w-4" />
                                <span>{release.epics.length} epics</span>
                              </div>
                            )}
                          </div>

                          {release.release_notes && (
                            <div className="pt-3 border-t">
                              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <FileText className="h-4 w-4" />
                                Release Notes
                              </div>
                              <div className="text-sm text-gray-600 line-clamp-3">
                                {release.release_notes}
                              </div>
                            </div>
                          )}
                        </div>

                        <Button 
                          variant="outline"
                          onClick={() => router.visit(route('agile.releases.show', release.id))}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold mb-2">No Released Versions</h3>
                  <p className="text-gray-600">
                    Released versions will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* All Releases */}
          <TabsContent value="all" className="space-y-4">
            {releases.length > 0 ? (
              <div className="space-y-4">
                {releases.map((release) => {
                  const statusConfig = getStatusConfig(release.status);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <Card key={release.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold">{release.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                v{release.version_number}
                              </Badge>
                            </div>
                            <Badge variant="outline" className={statusConfig.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-600">
                              {release.status === 'released' 
                                ? `Released: ${formatDate(release.released_date)}`
                                : `Planned: ${formatDate(release.planned_date)}`
                              }
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => router.visit(route('agile.releases.show', release.id))}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold mb-2">No Releases Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Start by creating your first release
                  </p>
                  <Button onClick={() => router.visit(route('agile.releases.create', project.id))}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Release
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
