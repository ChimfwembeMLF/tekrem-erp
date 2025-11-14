import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Plus, Search, Edit, Trash2, Filter, LayoutGrid } from 'lucide-react';
import { useTranslate } from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Module {
  id: number;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

interface PaginationLinks {
  url: string | null;
  label: string;
  active: boolean;
}

interface ModulesPaginated {
  data: Module[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  links: PaginationLinks[];
}

interface Filters {
  search?: string;
}

interface Props {
  modules: ModulesPaginated;
  filters: Filters;
}

export default function ModulesIndex({ modules, filters }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [search, setSearch] = useState(filters.search || '');

  const handleSearch = () => {
    router.get(route('admin.modules.index'), {
      search: search || undefined,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const clearFilters = () => {
    setSearch('');
    router.get(route('admin.modules.index'), {}, {
      preserveState: true,
      replace: true,
    });
  };

  return (
    <AppLayout
      title={t('admin.modules', 'Module Management')}
      renderHeader={() => (
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {t('admin.modules', 'Module Management')}
          </h2>
          <Link href={route('admin.modules.create')}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('admin.add_module', 'Add Module')}
            </Button>
          </Link>
        </div>
      )}
    >
      <Head title={t('admin.modules', 'Module Management')} />

      <div className="py-12">
        <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5" />
                {t('admin.modules', 'System Modules')}
              </CardTitle>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={t('admin.search_modules', 'Search modules...')}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSearch} variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    {t('admin.filter', 'Filter')}
                  </Button>
                  <Button onClick={clearFilters} variant="outline">
                    {t('admin.clear', 'Clear')}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.name', 'Name')}</TableHead>
                      <TableHead>{t('admin.description', 'Description')}</TableHead>
                      <TableHead>{t('admin.created', 'Created')}</TableHead>
                      <TableHead className="text-right">{t('admin.actions', 'Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modules.data.map((module) => (
                      <TableRow key={module.id}>
                        <TableCell>{module.name}</TableCell>
                        <TableCell>{module.description}</TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">
                            {module.created_at ? new Date(module.created_at).toLocaleDateString() : ''}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={route('admin.modules.edit', module.id)}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => {
                                if (confirm(t('admin.delete_confirm', 'Are you sure you want to delete this module?'))) {
                                  router.delete(route('admin.modules.destroy', module.id));
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {modules.data.length === 0 && (
                <div className="text-center py-12">
                  <LayoutGrid className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t('admin.no_modules', 'No modules found')}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {filters.search
                      ? t('admin.no_modules_search', 'Try adjusting your search criteria.')
                      : t('admin.no_modules_create', 'Get started by creating a new module.')}
                  </p>
                  {!filters.search && (
                    <div className="mt-6">
                      <Link href={route('admin.modules.create')}>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          {t('admin.add_module', 'Add Module')}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Pagination */}
              {modules.last_page > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {t('admin.showing', 'Showing')} {modules.from} {t('admin.to', 'to')} {modules.to} {t('admin.of', 'of')} {modules.total} {t('admin.results', 'results')}
                  </div>
                  <div className="flex gap-2">
                    {modules.links.map((link, index) => (
                      <Button
                        key={index}
                        variant={link.active ? 'default' : 'outline'}
                        size="sm"
                        disabled={!link.url}
                        onClick={() => link.url && router.get(link.url)}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
