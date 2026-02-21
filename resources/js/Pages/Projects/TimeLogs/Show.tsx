import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { ArrowLeft, Clock, Calendar, DollarSign, User, FileText, Edit, Trash2 } from 'lucide-react';
import { Project, ProjectTimeLog } from '@/types';
import useRoute from '@/Hooks/useRoute';

interface Props {
  project: Project;
  timeLog: ProjectTimeLog & {
    user?: { id: number; name: string };
    milestone?: { id: number; name: string };
  };
}

export default function Show({ project, timeLog }: Props) {
  const route = useRoute();
  const getStatusBadge = (status?: string) => {
    const statusColors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={statusColors[status || 'draft'] || 'bg-gray-100 text-gray-800'}>
        {status || 'draft'}
      </Badge>
    );
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this time log?')) {
      router.delete(route('projects.time-logs.destroy', [project.id, timeLog.id]), {
        onSuccess: () => {
          router.visit(route('projects.time-logs.index', project.id));
        },
      });
    }
  };

  const totalAmount = timeLog.is_billable && timeLog.hourly_rate
    ? timeLog.hours * timeLog.hourly_rate
    : 0;

  return (
    <AppLayout
      title={`Time Log Details - ${project.name}`}
      renderHeader={() => (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-xl text-foreground leading-tight">
              View Time Log
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Log time spent on {project.name}
            </p>
          </div>
          <Link href={route('projects.time-logs.index', project.id)}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Time Logs
              </Button>
            </Link>
        </div>
      )}
    >

      <div className="py-12">
        <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-end">
            

            <div className="flex gap-2">
              <Link href={route('projects.time-logs.edit', [project.id, timeLog.id])}>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Time Log Details</CardTitle>
                  <CardDescription>
                    Logged on {timeLog.log_date ? new Date(timeLog.log_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </CardDescription>
                </div>
                {getStatusBadge(timeLog.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center space-x-3 rounded-lg border p-4">
                  <Clock className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Hours Logged</p>
                    <p className="text-2xl font-bold">{timeLog.hours}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-lg border p-4">
                  <Calendar className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date</p>
                    <p className="text-lg font-semibold">
                      {timeLog.log_date ? new Date(timeLog.log_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-lg border p-4">
                  <DollarSign className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {timeLog.is_billable ? 'Billable' : 'Non-Billable'}
                    </p>
                    <p className="text-2xl font-bold">
                      {timeLog.is_billable ? `$${totalAmount}` : '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-lg border p-4">
                  <User className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">User</p>
                    <p className="text-lg font-semibold">
                      {timeLog.user?.name || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <h3 className="mb-4 text-lg font-semibold">Details</h3>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Project:</span>
                      <span className="text-sm font-semibold text-gray-900">{project.name}</span>
                    </div>

                    {timeLog.milestone && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Milestone:</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {timeLog.milestone.name}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Status:</span>
                      <span>{getStatusBadge(timeLog.status)}</span>
                    </div>

                    {timeLog.is_billable && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Hourly Rate:</span>
                          <span className="text-sm font-semibold text-gray-900">
                            ${timeLog.hourly_rate || '0.00'}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Total Amount:</span>
                          <span className="text-lg font-bold text-green-600">
                            ${totalAmount}
                          </span>
                        </div>
                      </>
                    )}

                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Created:</span>
                      <span className="text-sm text-gray-900">
                        {timeLog.created_at
                          ? new Date(timeLog.created_at).toLocaleString()
                          : 'N/A'}
                      </span>
                    </div>

                    {timeLog.updated_at && timeLog.updated_at !== timeLog.created_at && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-500">Last Updated:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(timeLog.updated_at).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {timeLog.description && (
                  <div className="border-t pt-4">
                    <h3 className="mb-2 flex items-center text-lg font-semibold">
                      <FileText className="mr-2 h-5 w-5" />
                      Description
                    </h3>
                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="whitespace-pre-wrap text-sm text-gray-700">
                        {timeLog.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <Link href={route('projects.show', project.id)}>
                    <Button variant="outline">View Project</Button>
                  </Link>

                  <div className="flex gap-2">
                    {timeLog.status === 'draft' && (
                      <Button
                        onClick={() =>
                          router.patch(route('projects.time-logs.submit', [project.id, timeLog.id]))
                        }
                      >
                        Submit for Approval
                      </Button>
                    )}
                    {timeLog.status === 'submitted' && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() =>
                            router.patch(route('projects.time-logs.approve', [project.id, timeLog.id]))
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() =>
                            router.patch(route('projects.time-logs.update', [project.id, timeLog.id]), {
                              status: 'rejected',
                            })
                          }
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
