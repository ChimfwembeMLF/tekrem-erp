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
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {t('pm.projects', 'Projects')}
                  </CardTitle>
                  <CardDescription>
                    {t('pm.manage_projects', 'Manage all your projects and boards.')}
                  </CardDescription>
                </div>
                <Link href={route('pm.projects.create')}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('pm.create_project', 'Create Project')}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    name="search"
                    placeholder={t('pm.search_projects', 'Search projects...')}
                    value={search}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder={t('pm.select_status', 'Select Status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all_statuses', 'All Statuses')}</SelectItem>
                    <SelectItem value="active">{t('pm.active', 'Active')}</SelectItem>
                    <SelectItem value="completed">{t('pm.completed', 'Completed')}</SelectItem>
                    <SelectItem value="archived">{t('pm.archived', 'Archived')}</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              {/* Projects Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('pm.name', 'Name')}</TableHead>
                      <TableHead>{t('pm.owner', 'Owner')}</TableHead>
                      <TableHead>{t('pm.status', 'Status')}</TableHead>
                      <TableHead>{t('pm.boards', 'Boards')}</TableHead>
                      <TableHead>{t('pm.dates', 'Dates')}</TableHead>
                      <TableHead>{t('pm.description', 'Description')}</TableHead>
                      <TableHead className="text-right">{t('common.actions', 'Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          {t('pm.no_projects_found', 'No projects found.')}
                        </TableCell>
                      </TableRow>
                    )}
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
                        <TableCell>
                          {project.start_date} - {project.end_date}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {project.description}
                        </TableCell>
                        <TableCell className="text-right">
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
