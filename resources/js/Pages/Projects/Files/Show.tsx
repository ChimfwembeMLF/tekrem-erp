import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import {
  ArrowLeft,
  Download,
  Trash2,
  FileText,
  Calendar,
  User,
  FolderOpen,
  Shield,
  Clock,
  Upload,
} from 'lucide-react';
import { Project, ProjectFile } from '@/types';
import useRoute from '@/Hooks/useRoute';

interface Props {
  project: Project;
  file: ProjectFile & {
    uploader?: { id: number; name: string };
    milestone?: { id: number; name: string };
    versions?: Array<{
      id: number;
      version: number;
      file_path: string;
      file_size: number;
      uploaded_by: number;
      created_at: string;
    }>;
  };
}

export default function Show({ project, file }: Props) {
  const route = useRoute();
  const getCategoryBadge = (category?: string) => {
    const categoryColors: Record<string, string> = {
      document: 'bg-blue-100 text-blue-800',
      image: 'bg-green-100 text-green-800',
      contract: 'bg-purple-100 text-purple-800',
      design: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800',
    };

    return (
      <Badge className={categoryColors[category || 'other'] || 'bg-gray-100 text-gray-800'}>
        {category || 'other'}
      </Badge>
    );
  };

  const getAccessBadge = (accessLevel?: string) => {
    const accessColors: Record<string, string> = {
      public: 'bg-green-100 text-green-800',
      team: 'bg-blue-100 text-blue-800',
      managers: 'bg-yellow-100 text-yellow-800',
      private: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={accessColors[accessLevel || 'team'] || 'bg-gray-100 text-gray-800'}>
        {accessLevel || 'team'}
      </Badge>
    );
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      router.delete(route('projects.files.destroy', [project.id, file.id]), {
        onSuccess: () => {
          router.visit(route('projects.files.index', project.id));
        },
      });
    }
  };

  const isImage = file.mime_type?.startsWith('image/');
  const isPDF = file.mime_type === 'application/pdf';

  return (
    <AppLayout title={`${file.name} - ${project.name}`} >

      <div className="">
        <div className="mx-auto max-w-full sm:px-6">
          <div className="flex items-center justify-between">
            <Link href={route('projects.files.index', project.id)}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Files
              </Button>
            </Link>

            <div className="flex gap-2">
              <Link href={route('projects.files.download', [project.id, file.id])}>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </Link>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* File Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>{file.name}</CardTitle>
                  <CardDescription>{file.original_name}</CardDescription>
                </CardHeader>
                <CardContent>
                  {isImage && file.file_url ? (
                    <img
                      src={file.file_url}
                      alt={file.name}
                      className="w-full rounded-lg border"
                    />
                  ) : isPDF && file.file_url ? (
                    <div className="w-full h-96 border rounded-lg">
                      <iframe
                        src={file.file_url}
                        className="w-full h-full rounded-lg"
                        title={file.name}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-gray-50">
                      <FileText className="h-16 w-16 text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">Preview not available</p>
                      <Link href={route('projects.files.download', [project.id, file.id])}>
                        <Button>
                          <Download className="mr-2 h-4 w-4" />
                          Download File
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Description */}
              {file.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <FileText className="mr-2 h-5 w-5" />
                      Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-gray-700">{file.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* File Versions */}
              {file.versions && file.versions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Clock className="mr-2 h-5 w-5" />
                      Version History
                    </CardTitle>
                    <CardDescription>
                      {file.versions.length} version{file.versions.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {file.versions.map((version, index) => (
                        <div
                          key={version.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">
                              Version {version.version}
                              {index === 0 && (
                                <Badge className="ml-2 bg-green-100 text-green-800">
                                  Current
                                </Badge>
                              )}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(version.file_size)} •{' '}
                              {new Date(version.created_at).toLocaleString()}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* File Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">File Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Category</span>
                    {getCategoryBadge(file.category)}
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Access Level</span>
                    {getAccessBadge(file.access_level)}
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Size</span>
                    <span className="font-medium">{formatFileSize(file.file_size)}</span>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Type</span>
                    <span className="font-medium text-xs">
                      {file.mime_type || 'Unknown'}
                    </span>
                  </div>

                  {file.version && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Version</span>
                        <span className="font-medium">{file.version}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Project & Milestone */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Related</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <FolderOpen className="mr-2 h-4 w-4" />
                      Project
                    </div>
                    <Link href={route('projects.show', project.id)}>
                      <Button variant="link" className="p-0 h-auto font-semibold">
                        {project.name}
                      </Button>
                    </Link>
                  </div>

                  {file.milestone && (
                    <>
                      <Separator />
                      <div>
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <Calendar className="mr-2 h-4 w-4" />
                          Milestone
                        </div>
                        <p className="font-semibold">{file.milestone.name}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Upload Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upload Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <User className="mr-2 h-4 w-4" />
                      Uploaded By
                    </div>
                    <p className="font-semibold">{file.uploader?.name || 'Unknown'}</p>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <Upload className="mr-2 h-4 w-4" />
                      Uploaded On
                    </div>
                    <p className="font-semibold">
                      {file.created_at
                        ? new Date(file.created_at).toLocaleString('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : 'N/A'}
                    </p>
                  </div>

                  {file.updated_at && file.updated_at !== file.created_at && (
                    <>
                      <Separator />
                      <div>
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <Clock className="mr-2 h-4 w-4" />
                          Last Updated
                        </div>
                        <p className="font-semibold">
                          {new Date(file.updated_at).toLocaleString('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link
                    href={route('projects.files.download', [project.id, file.id])}
                    className="block"
                  >
                    <Button className="w-full" variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download File
                    </Button>
                  </Link>
                  <Button className="w-full" variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New Version
                  </Button>
                  <Button
                    className="w-full"
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete File
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
