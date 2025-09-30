import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge.jsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select.jsx';
// ...existing code...
import { Plus, Search, Filter, Eye, Edit, Users } from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';



export default function Index({projects}: {projects: any[]}) {
  const { t } = useTranslate();
  const route = useRoute();
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('all');

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // router.get(route('pm.projects.index'), { search, status });
  };

  return (
    <AppLayout title={t('pm.projects', 'Projects')}>
      <Head title={t('pm.projects', 'Projects')} />
      <div className="py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <Card className="border-0 sm:border">
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                    {t('pm.projects', 'Projects')}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    {t('pm.manage_projects', 'Manage all your projects and boards.')}
                  </CardDescription>
                </div>
                <Link href={route('pm.projects.create')} className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto h-10 sm:h-9">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{t('pm.create_project', 'Create Project')}</span>
                    <span className="sm:hidden">Create</span>
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              {/* Search and Filters */}
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-2 mb-4 sm:mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    name="search"
                    placeholder={t('pm.search_projects', 'Search projects...')}
                    value={search}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                    className="pl-10 h-11 sm:h-10 text-base sm:text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full sm:w-48 h-11 sm:h-10 text-base sm:text-sm">
                      <SelectValue placeholder={t('pm.select_status', 'Select Status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all_statuses', 'All Statuses')}</SelectItem>
                      <SelectItem value="active">{t('pm.active', 'Active')}</SelectItem>
                      <SelectItem value="completed">{t('pm.completed', 'Completed')}</SelectItem>
                      <SelectItem value="archived">{t('pm.archived', 'Archived')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="submit" variant="outline" className="px-3 h-11 sm:h-10">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </form>
              {/* Projects - Mobile Cards & Desktop Table */}
              {projects.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">{t('pm.no_projects_found', 'No projects found')}</h3>
                  <p className="text-sm mb-4">Create your first project to get started with project management.</p>
                  <Link href={route('pm.projects.create')}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('pm.create_project', 'Create Project')}
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  {/* Mobile: Card Layout */}
                  <div className="block sm:hidden space-y-3">
                    {projects.map((project: any) => (
                      <Card key={project.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <Link href={route('pm.projects.show', project.id)} className="font-medium text-primary hover:underline text-base">
                              {project.name}
                            </Link>
                            <div className="flex items-center gap-1 ml-2">
                              <Link href={route('pm.projects.show', project.id)}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={route('pm.projects.edit', project.id)}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center justify-between">
                              <span>Owner: {project.owner?.name || '-'}</span>
                              <Badge className="text-xs">{project.status}</Badge>
                            </div>
                            <div>
                              Boards: {Array.isArray(project.boards) ? project.boards.length : 0}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Desktop: Table Layout */}
                  <div className="hidden sm:block border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('pm.name', 'Name')}</TableHead>
                          <TableHead>{t('pm.owner', 'Owner')}</TableHead>
                          <TableHead>{t('pm.status', 'Status')}</TableHead>
                          <TableHead>{t('pm.boards', 'Boards')}</TableHead>
                          <TableHead className="text-right">{t('common.actions', 'Actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {projects.map((project: any) => (
                          <TableRow key={project.id}>
                            <TableCell className="font-medium">
                              <Link href={route('pm.projects.show', project.id)} className="hover:underline text-primary">
                                {project.name}
                              </Link>
                            </TableCell>
                            <TableCell>{project.owner?.name || '-'}</TableCell>
                            <TableCell>
                              <Badge>{project.status}</Badge>
                            </TableCell>
                            <TableCell>{Array.isArray(project.boards) ? project.boards.length : 0}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Link href={route('pm.projects.show', project.id)}>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Link href={route('pm.projects.edit', project.id)}>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
