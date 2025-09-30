import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Users, 
  Calendar,
  BarChart3,
  Settings,
  Archive,
  Copy,
  Trash2,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Board {
  id: number;
  project_id: number;
  project_name?: string;
  name: string;
  description: string | null;
  type: 'kanban' | 'scrum';
  visibility: string;
  created_at?: string;
  updated_at?: string;
  last_updated?: string;
  owner?: User;
  members_count: number;
  cards_count: number;
  columns_count?: number;
}

interface Project {
  id: number;
  name: string;
  description: string | null;
  status: string;
}

interface BoardIndexProps {
  project?: Project | null;
  boards?: Board[];
}

export default function BoardIndex({ project, boards = [] }: BoardIndexProps) {
  const { t } = useTranslate();
  const route = useRoute();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBoards = (boards || []).filter(board =>
    board.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    board.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBoardTypeColor = (type: string) => {
    switch (type) {
      case 'kanban':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'scrum':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <AppLayout
      title={t('pm.boards', 'Boards')}
      renderHeader={() => (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
              {project
                ? `${t('pm.project_boards', 'Project Boards')} - ${project.name}`
                : t('pm.all_boards', 'All Boards')
              }
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {project
                ? t('pm.boards_description', 'Manage your project boards and workflows')
                : t('pm.all_boards_description', 'View all boards across your projects')
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {project && (
              <Link href={route('pm.projects.show', project.id)}>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  {t('pm.view_project', 'View Project')}
                </Button>
              </Link>
            )}
            <Link href={route('pm.boards.create', project ? { project_id: project.id } : {})}>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t('pm.create_board', 'Create Board')}
              </Button>
            </Link>
          </div>
        </div>
      )}
    >
      <Head title={`${t('pm.boards', 'Boards')} - ${project.name}`} />

      <div className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {t('pm.boards', 'Boards')}
                  </CardTitle>
                  <CardDescription>
                    {project
                      ? t('pm.boards_count', '{count} boards in this project', { count: (boards || []).length })
                      : t('pm.all_boards_count', '{count} boards across all projects', { count: (boards || []).length })
                    }
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder={t('pm.search_boards', 'Search boards...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Boards Grid */}
          {filteredBoards.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {searchTerm 
                    ? t('pm.no_boards_found', 'No boards found')
                    : t('pm.no_boards_yet', 'No boards yet')
                  }
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                  {searchTerm
                    ? t('pm.try_different_search', 'Try a different search term')
                    : project
                      ? t('pm.create_first_board', 'Create your first board to start organizing your project')
                      : t('pm.no_boards_access', 'You don\'t have access to any boards yet')
                  }
                </p>
                {!searchTerm && project && (
                  <Link href={route('pm.boards.create', { project_id: project.id })}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('pm.create_board', 'Create Board')}
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBoards.map((board) => (
                <Card key={board.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link href={route('pm.projects.boards.show', [board.project_id, board.id])}>
                          <CardTitle className="text-lg hover:text-primary transition-colors">
                            {board.name}
                          </CardTitle>
                        </Link>
                        {!project && board.project_name && (
                          <p className="text-sm text-gray-500 mt-1">
                            {board.project_name}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getBoardTypeColor(board.type)}>
                            {board.type.charAt(0).toUpperCase() + board.type.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={route('pm.projects.boards.show', [board.project_id, board.id])}>
                              <Eye className="h-4 w-4 mr-2" />
                              {t('pm.view_board', 'View Board')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={route('pm.boards.edit', board.id)}>
                              <Settings className="h-4 w-4 mr-2" />
                              {t('pm.edit_board', 'Edit Board')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            {t('pm.duplicate_board', 'Duplicate')}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Archive className="h-4 w-4 mr-2" />
                            {t('pm.archive_board', 'Archive')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('pm.delete_board', 'Delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {board.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {board.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {board.members_count}
                        </div>
                        <div className="flex items-center">
                          <BarChart3 className="h-4 w-4 mr-1" />
                          {board.cards_count}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(board.last_updated || board.updated_at || board.created_at || new Date()).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
