import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Calendar,
  ArrowLeft,
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Archive,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import useRoute from '@/Hooks/useRoute';
import useTranslate from '@/Hooks/useTranslate';

interface BoardCard {
  id: number;
  title: string;
  description: string | null;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  story_points: number | null;
  due_date: string | null;
  assignee?: {
    id: number;
    name: string;
    email: string;
  };
  reporter?: {
    id: number;
    name: string;
    email: string;
  };
  labels: string[];
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
  cards: BoardCard[];
}

const priorityConfig = {
  low: { label: 'Low', color: 'bg-green-100 text-green-800' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
  critical: { label: 'Critical', color: 'bg-red-100 text-red-800' },
};

const typeConfig = {
  task: { label: 'Task', color: 'bg-blue-100 text-blue-800' },
  bug: { label: 'Bug', color: 'bg-red-100 text-red-800' },
  story: { label: 'Story', color: 'bg-green-100 text-green-800' },
  epic: { label: 'Epic', color: 'bg-purple-100 text-purple-800' },
};

export default function Index({ project, board, cards }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [priorityFilter, setPriorityFilter] = React.useState('all');
  const [typeFilter, setTypeFilter] = React.useState('all');

  const filteredCards = cards.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || card.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || card.priority === priorityFilter;
    const matchesType = typeFilter === 'all' || card.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const uniqueStatuses = [...new Set(cards.map(card => card.status))];
  const uniqueTypes = [...new Set(cards.map(card => card.type))];

  return (
    <AppLayout
      title={`Cards - ${board.name}`}
      renderHeader={() => (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={route('pm.projects.boards.show', [project.id, board.id])}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Board
              </Button>
            </Link>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {t('pm.cards.title', 'Cards')}
              </h2>
              <p className="text-sm text-gray-600">
                {project.name} / {board.name}
              </p>
            </div>
          </div>
          <Link href={route('pm.boards.cards.create', [board.id])}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('pm.cards.create', 'Create Card')}
            </Button>
          </Link>
        </div>
      )}
    >
      <Head title={`Cards - ${board.name}`} />

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder={t('pm.cards.search', 'Search cards...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {uniqueStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  {Object.entries(priorityConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {typeConfig[type as keyof typeof typeConfig]?.label || type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || typeFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setPriorityFilter('all');
                    setTypeFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Cards List */}
          {filteredCards.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="h-12 w-12 text-gray-400 mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || typeFilter !== 'all'
                    ? t('pm.cards.no_results', 'No cards found')
                    : t('pm.cards.empty', 'No cards yet')
                  }
                </h3>
                <p className="text-gray-600 text-center mb-4">
                  {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || typeFilter !== 'all'
                    ? t('pm.cards.no_results_desc', 'Try adjusting your search terms or filters')
                    : t('pm.cards.empty_desc', 'Create your first card to start tracking work items')
                  }
                </p>
                {!(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || typeFilter !== 'all') && (
                  <Link href={route('pm.boards.cards.create', [board.id])}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('pm.cards.create', 'Create Card')}
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredCards.map((card) => (
                <Card key={card.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={typeConfig[card.type as keyof typeof typeConfig]?.color || 'bg-gray-100 text-gray-800'}>
                            {typeConfig[card.type as keyof typeof typeConfig]?.label || card.type}
                          </Badge>
                          <Badge className={priorityConfig[card.priority].color}>
                            {priorityConfig[card.priority].label}
                          </Badge>
                          {card.story_points && (
                            <Badge variant="outline">
                              {card.story_points} pts
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg">
                          <Link 
                            href={route('pm.boards.cards.show', [board.id, card.id])}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {card.title}
                          </Link>
                        </CardTitle>
                        {card.description && (
                          <CardDescription className="mt-2 line-clamp-2">
                            {card.description}
                          </CardDescription>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={route('pm.boards.cards.show', [board.id, card.id])}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={route('pm.boards.cards.edit', [board.id, card.id])}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Status: {card.status}</span>
                        {card.assignee && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{card.assignee.name}</span>
                          </div>
                        )}
                        {card.due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(card.due_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        Updated {new Date(card.updated_at).toLocaleDateString()}
                      </span>
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
