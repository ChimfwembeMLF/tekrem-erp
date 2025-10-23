import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  Users, 
  Target, 
  MessageSquare,
  Paperclip,
  Clock,
  BarChart3,
  Copy,
  Archive,
  Trash2,
  MoreHorizontal
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
  sprint?: {
    id: number;
    name: string;
    status: string;
  };
  epic?: {
    id: number;
    name: string;
    color: string;
  };
  labels: string[];
  created_at: string;
  updated_at: string;
  comments?: Comment[];
  attachments?: Attachment[];
}

interface Comment {
  id: number;
  content: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
}

interface Attachment {
  id: number;
  filename: string;
  size: number;
  mime_type: string;
  created_at: string;
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
  card: BoardCard;
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

export default function Show({ project, board, card }: Props) {
  const { t } = useTranslate();
  const route = useRoute();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <AppLayout
      title={`${card.title} - ${board.name}`}
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
                {card.title}
              </h2>
              <p className="text-sm text-gray-600">
                {project.name} / {board.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={route('pm.boards.cards.edit', [board.id, card.id])}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    >
      <Head title={`${card.title} - ${board.name}`} />

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Card Overview */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
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
                      <CardTitle className="text-2xl">{card.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                {card.description && (
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">{card.description}</p>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Tabs for Comments, Attachments, etc. */}
              <Tabs defaultValue="comments" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="comments" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Comments ({card.comments?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="attachments" className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    Attachments ({card.attachments?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Activity
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="comments" className="space-y-4">
                  {card.comments && card.comments.length > 0 ? (
                    <div className="space-y-4">
                      {card.comments.map((comment) => (
                        <Card key={comment.id}>
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{getInitials(comment.user.name)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium text-sm">{comment.user.name}</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(comment.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-gray-700 text-sm">{comment.content}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <MessageSquare className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-500">No comments yet</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="attachments" className="space-y-4">
                  {card.attachments && card.attachments.length > 0 ? (
                    <div className="space-y-2">
                      {card.attachments.map((attachment) => (
                        <Card key={attachment.id}>
                          <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                              <Paperclip className="h-4 w-4 text-gray-400" />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{attachment.filename}</p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(attachment.size)} • {new Date(attachment.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Button variant="ghost" size="sm">
                                Download
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <Paperclip className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-500">No attachments</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="activity">
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <Clock className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-gray-500">Activity log coming soon</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Card Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    <p className="mt-1 text-sm">{card.status}</p>
                  </div>

                  {card.assignee && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Assignee</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">{getInitials(card.assignee.name)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{card.assignee.name}</span>
                      </div>
                    </div>
                  )}

                  {card.reporter && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Reporter</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">{getInitials(card.reporter.name)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{card.reporter.name}</span>
                      </div>
                    </div>
                  )}

                  {card.sprint && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Sprint</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Target className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{card.sprint.name}</span>
                      </div>
                    </div>
                  )}

                  {card.epic && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Epic</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: card.epic.color }}
                        />
                        <span className="text-sm">{card.epic.name}</span>
                      </div>
                    </div>
                  )}

                  {card.due_date && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Due Date</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{new Date(card.due_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Created</Label>
                    <p className="mt-1 text-sm">{new Date(card.created_at).toLocaleDateString()}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">Updated</Label>
                    <p className="mt-1 text-sm">{new Date(card.updated_at).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Labels */}
              {card.labels && card.labels.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Labels</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {card.labels.map((label, index) => (
                        <Badge key={index} variant="outline">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
