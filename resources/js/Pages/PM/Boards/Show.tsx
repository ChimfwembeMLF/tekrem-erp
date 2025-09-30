import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { 
  Plus, 
  MoreHorizontal, 
  Users, 
  Settings,
  Filter,
  Search,
  Calendar,
  Flag,
  MessageSquare,
  Paperclip,
  ArrowLeft
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
  avatar?: string;
}

interface BoardCard {
  id: number;
  title: string;
  description: string | null;
  type: string;
  priority: string;
  story_points: number | null;
  due_date: string | null;
  assignee: User | null;
  reporter: User | null;
  labels: string[];
  comments_count: number;
  attachments_count: number;
}

interface BoardColumn {
  id: number;
  name: string;
  order: number;
  color: string | null;
  is_done_column: boolean;
  cards: BoardCard[];
}

interface Board {
  id: number;
  name: string;
  description: string | null;
  type: 'kanban' | 'scrum';
  columns: BoardColumn[];
  members: Array<{
    id: number;
    user: User;
    role: string;
  }>;
  owner: User;
}

interface Project {
  id: number;
  name: string;
  description: string | null;
  status: string;
}

interface BoardShowProps {
  project: Project;
  board: Board;
}

export default function BoardShow({ project, board }: BoardShowProps) {
  const { t } = useTranslate();
  const route = useRoute();
  const [selectedCard, setSelectedCard] = useState<BoardCard | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'highest':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'lowest':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'story':
        return '📖';
      case 'task':
        return '✅';
      case 'bug':
        return '🐛';
      case 'epic':
        return '🎯';
      default:
        return '📝';
    }
  };

  return (
    <AppLayout
      title={board.name}
      renderHeader={() => (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back', 'Back')}
            </Button>
            <div>
              <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                {board.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {project.name} • {board.type.charAt(0).toUpperCase() + board.type.slice(1)} Board
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              {t('pm.filter', 'Filter')}
            </Button>
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4 mr-2" />
              {t('pm.search', 'Search')}
            </Button>
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              {board.members.length}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  {t('pm.board_settings', 'Settings')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  {t('pm.board_settings', 'Board Settings')}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Users className="h-4 w-4 mr-2" />
                  {t('pm.manage_members', 'Manage Members')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Calendar className="h-4 w-4 mr-2" />
                  {t('pm.view_timeline', 'View Timeline')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    >
      <Head title={`${board.name} - ${project.name}`} />

      <div className="py-6">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Board Description */}
          {board.description && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <p className="text-gray-600 dark:text-gray-400">{board.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Kanban Board */}
          <div className="flex space-x-6 overflow-x-auto pb-6">
            {board.columns.map((column) => (
              <div key={column.id} className="flex-shrink-0 w-80">
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {column.color && (
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: column.color }}
                          />
                        )}
                        <CardTitle className="text-sm font-medium">
                          {column.name}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {column.cards.length}
                        </Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Plus className="h-4 w-4 mr-2" />
                            {t('pm.add_card', 'Add Card')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            {t('pm.column_settings', 'Column Settings')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {column.cards.map((card) => (
                      <Card 
                        key={card.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedCard(card)}
                      >
                        <CardContent className="p-3">
                          <div className="space-y-2">
                            {/* Card Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm">{getTypeIcon(card.type)}</span>
                                <Badge className={getPriorityColor(card.priority)} variant="secondary">
                                  {card.priority}
                                </Badge>
                              </div>
                              {card.story_points && (
                                <Badge variant="outline" className="text-xs">
                                  {card.story_points}
                                </Badge>
                              )}
                            </div>

                            {/* Card Title */}
                            <h4 className="text-sm font-medium leading-tight">
                              {card.title}
                            </h4>

                            {/* Card Description */}
                            {card.description && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                {card.description}
                              </p>
                            )}

                            {/* Card Labels */}
                            {card.labels.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {card.labels.slice(0, 3).map((label, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {label}
                                  </Badge>
                                ))}
                                {card.labels.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{card.labels.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Card Footer */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {card.comments_count > 0 && (
                                  <div className="flex items-center text-xs text-gray-500">
                                    <MessageSquare className="h-3 w-3 mr-1" />
                                    {card.comments_count}
                                  </div>
                                )}
                                {card.attachments_count > 0 && (
                                  <div className="flex items-center text-xs text-gray-500">
                                    <Paperclip className="h-3 w-3 mr-1" />
                                    {card.attachments_count}
                                  </div>
                                )}
                                {card.due_date && (
                                  <div className="flex items-center text-xs text-gray-500">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {new Date(card.due_date).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                              {card.assignee && (
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={card.assignee.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {card.assignee.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {/* Add Card Button */}
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-gray-500 hover:text-gray-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t('pm.add_card', 'Add a card')}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}

            {/* Add Column Button */}
            <div className="flex-shrink-0 w-80">
              <Button 
                variant="outline" 
                className="w-full h-20 border-dashed"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('pm.add_column', 'Add Column')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
