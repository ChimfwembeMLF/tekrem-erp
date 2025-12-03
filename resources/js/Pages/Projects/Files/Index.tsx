import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import {
  Plus,
  Search,
  Filter,
  File,
  FileText,
  Image,
  FileCode,
  Download,
  Eye,
  Grid,
  List,
} from 'lucide-react';
import { Project, ProjectFile } from '@/types';
import useRoute from '@/Hooks/useRoute';

interface Props {
  project: Project;
  files: {
    data: (ProjectFile & { uploader?: { id: number; name: string } })[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters: {
    search?: string;
    category?: string;
  };
}

export default function Index({ project, files, filters }: Props) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const route = useRoute();

  const handleFilter = () => {
    router.get(
      route('projects.files.index', project.id),
      {
        search: searchTerm,
        category: selectedCategory,
      },
      { preserveState: true }
    );
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCategory('');
    router.get(route('projects.files.index', project.id));
  };

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <File className="h-8 w-8" />;
    
    if (mimeType.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />;
    if (mimeType.startsWith('text/') || mimeType.includes('document'))
      return <FileText className="h-8 w-8 text-green-500" />;
    if (mimeType.includes('code') || mimeType.includes('script'))
      return <FileCode className="h-8 w-8 text-purple-500" />;
    
    return <File className="h-8 w-8 text-gray-500" />;
  };

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

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const totalSize = files.data.reduce((sum, file) => sum + (file.file_size || 0), 0);

  return (
    <AppLayout title={`Files - ${project.name}`} >

      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Project Files</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage files for {project.name}
              </p>
            </div>
            <Link href={route('projects.files.create', project.id)}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Upload File
              </Button>
            </Link>
          </div>

          {/* Summary Cards */}
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Files</CardTitle>
                <File className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{files.total}</div>
                <p className="text-xs text-muted-foreground">Uploaded files</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Size</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatFileSize(totalSize)}</div>
                <p className="text-xs text-muted-foreground">Storage used</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <Grid className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(files.data.map((f) => f.category)).size}
                </div>
                <p className="text-xs text-muted-foreground">File categories</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg">
                  <Filter className="mr-2 h-5 w-5" />
                  Filters
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Categories</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4 flex gap-2">
                <Button onClick={handleFilter}>Apply Filters</Button>
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Files Grid/List */}
          {files.data.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <File className="mb-4 h-16 w-16 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">No files found</h3>
                <p className="mb-4 text-sm text-gray-600">
                  Start by uploading your first file.
                </p>
                <Link href={route('projects.files.create', project.id)}>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Upload File
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {files.data.map((file) => (
                <Card key={file.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center space-y-3">
                      {file.mime_type?.startsWith('image/') && file.file_url ? (
                        <img
                          src={file.file_url}
                          alt={file.name}
                          className="h-32 w-full rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-32 w-full items-center justify-center rounded bg-gray-100">
                          {getFileIcon(file.mime_type)}
                        </div>
                      )}

                      <div className="w-full space-y-2">
                        <h3 className="truncate font-semibold text-sm" title={file.name}>
                          {file.name}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{formatFileSize(file.file_size)}</span>
                          {getCategoryBadge(file.category)}
                        </div>
                        <p className="text-xs text-gray-500">
                          by {file.uploader?.name || 'Unknown'}
                        </p>

                        <div className="flex gap-2 pt-2">
                          <Link
                            href={route('projects.files.show', [project.id, file.id])}
                            className="flex-1"
                          >
                            <Button variant="outline" size="sm" className="w-full">
                              <Eye className="mr-1 h-3 w-3" />
                              View
                            </Button>
                          </Link>
                          <Link
                            href={route('projects.files.download', [project.id, file.id])}
                            className="flex-1"
                          >
                            <Button variant="outline" size="sm" className="w-full">
                              <Download className="mr-1 h-3 w-3" />
                              Download
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {files.data.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        {getFileIcon(file.mime_type)}
                        <div>
                          <h3 className="font-semibold">{file.name}</h3>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(file.file_size)} • Uploaded by{' '}
                            {file.uploader?.name || 'Unknown'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {getCategoryBadge(file.category)}
                        <Link href={route('projects.files.show', [project.id, file.id])}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={route('projects.files.download', [project.id, file.id])}>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {files.last_page > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: files.last_page }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={route('projects.files.index', {
                    ...filters,
                    page,
                    project: project.id,
                  })}
                  preserveState
                >
                  <Button
                    variant={page === files.current_page ? 'default' : 'outline'}
                    size="sm"
                  >
                    {page}
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
