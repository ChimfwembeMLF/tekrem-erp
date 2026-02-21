import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
  Edit,
  Trash2,
  Calendar,
  Target,
  Users,
  Flag,
  FolderOpen,
  MessageSquare,
  Paperclip,
  User as UserIcon,
  History,
  Layers,
  Upload,
  X,
  Send,
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { LinkedItemIndicator } from '@/Components/HybridSync';

interface BoardCard {
  id: number;
  title: string;
  description?: string;
  type: 'story' | 'task' | 'bug' | 'epic';
  priority: 'low' | 'medium' | 'high' | 'critical';
  story_points?: number;
  due_date?: string;
  created_at?: string;
  updated_at?: string;

  assignee?: any;
  reporter?: any;
  column: any;
  board: any;
  sprint?: any;
  epic?: any;
  task?: any;

  comments?: Array<{
    id: number | string;
    body?: string;
    comment?: string;
    created_at?: string;
    user?: { id: number | string; name?: string };
  }>;

  attachments?: Array<{
    id: number | string;
    name?: string;
    file_name?: string;
    file_url?: string;
    url?: string;
    path?: string;
    created_at?: string;
  }>;
}

interface CardShowProps {
  auth: { user: any };
  card: BoardCard;
  project: any;
}

export default function CardShow({ auth, card, project }: CardShowProps) {
  const route = useRoute();

  // ---------- helpers ----------
  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
    };
    return colors[priority as keyof typeof colors] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      story: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
      task: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      bug: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
      epic: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
    };
    return colors[type as keyof typeof colors] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };

  const fmtDate = (d?: string) => (d ? new Date(d).toLocaleString() : 'N/A');

  const attachmentUrl = (a: any) => a.file_url || a.url || (a.path ? `/uploads/${a.path}` : null);
  const attachmentName = (a: any) => a.name || a.file_name || 'Attachment';

  const formatFileSize = (bytes: number) => {
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  };

  const comments = card.comments ?? [];
  const attachments = card.attachments ?? [];

  // ---------- forms ----------
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const attachmentForm = useForm({
    file: null as File | null,
    name: '',
    description: '',
  });

  const commentForm = useForm({
    comment: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    attachmentForm.setData('file', file);

    if (!attachmentForm.data.name) {
      attachmentForm.setData('name', file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    attachmentForm.setData('file', null);
  };

  const submitAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    attachmentForm.post(route('agile.cards.attachments.store', card.id), {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        removeFile();
        attachmentForm.reset('name', 'description');
      },
    });
  };

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    commentForm.post(route('agile.cards.comments.store', card.id), {
      preserveScroll: true,
      onSuccess: () => commentForm.reset('comment'),
    });
  };

  // ---------- actions ----------
  const handleDelete = () => {
    if (confirm('Delete this card?')) {
      router.delete(route('agile.cards.destroy', card.id));
    }
  };

  return (
    <AppLayout
      title={card.title}
      renderHeader={() => (
        <div className="flex justify-between items-center gap-4">
          <div className="min-w-0">
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-100 leading-tight truncate">
              {card.title}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Link href={route('agile.board.show', card.board.id)} className="hover:underline inline-flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                {card.board?.name}
              </Link>
              <span className="text-gray-400">•</span>
              <span className="inline-flex items-center gap-2">
                <Flag className="h-4 w-4" />
                {card.column?.name}
              </span>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <Link href={route('agile.cards.edit', card.id)}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      )}
    >
      <Head title={card.title} />

      <div className="py-8">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main */}
            <div className="lg:col-span-2 space-y-6">
              {/* Details */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle>Details</CardTitle>
                      <CardDescription className="mt-1">Card info, description, links.</CardDescription>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                      <Badge variant="outline" className={getTypeColor(card.type)}>
                        {card.type}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(card.priority)}>
                        {card.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                      {card.description || 'No description provided'}
                    </p>
                  </div>

                  {project?.methodology === 'hybrid' && card.task && (
                    <>
                      <Separator />
                      <LinkedItemIndicator type="card" linkedItem={card.task} />
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Linked Task */}
              {card.task && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-gray-500" />
                      <CardTitle>Linked Task</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{card.task?.title ?? card.task?.name ?? 'Task'}</p>
                        {card.task?.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap mt-1">
                            {card.task.description}
                          </p>
                        )}
                      </div>
                      {card.task?.status && <Badge variant="outline">{String(card.task.status)}</Badge>}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Attachments (add + list) */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-gray-500" />
                      <CardTitle>Attachments</CardTitle>
                    </div>
                    <Badge variant="outline">{attachments.length}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Upload */}
                  <form onSubmit={submitAttachment} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="file">
                        File <span className="text-red-500">*</span>
                      </Label>

                      {!selectedFile ? (
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="file"
                            className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/40 dark:hover:bg-gray-900"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-9 h-9 mb-3 text-gray-400" />
                              <p className="mb-1 text-sm text-gray-500">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">Max size depends on server config</p>
                            </div>
                            <input id="file" type="file" className="hidden" onChange={handleFileChange} />
                          </label>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/40">
                          <div>
                            <p className="font-medium">{selectedFile.name}</p>
                            <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={removeFile}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {attachmentForm.errors.file && (
                        <p className="text-sm text-red-600">{attachmentForm.errors.file}</p>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="attach_name">Name</Label>
                        <Input
                          id="attach_name"
                          value={attachmentForm.data.name}
                          onChange={(e) => attachmentForm.setData('name', e.target.value)}
                          placeholder="Optional"
                        />
                        {attachmentForm.errors.name && (
                          <p className="text-sm text-red-600">{attachmentForm.errors.name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="attach_desc">Description</Label>
                        <Input
                          id="attach_desc"
                          value={attachmentForm.data.description}
                          onChange={(e) => attachmentForm.setData('description', e.target.value)}
                          placeholder="Optional"
                        />
                        {attachmentForm.errors.description && (
                          <p className="text-sm text-red-600">{attachmentForm.errors.description}</p>
                        )}
                      </div>
                    </div>

                    {attachmentForm.progress && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Uploading...</span>
                          <span>{attachmentForm.progress.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${attachmentForm.progress.percentage}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button type="submit" disabled={attachmentForm.processing || !selectedFile}>
                        {attachmentForm.processing ? 'Uploading...' : 'Upload'}
                      </Button>
                    </div>
                  </form>

                  <Separator />

                  {/* List */}
                  {attachments.length === 0 ? (
                    <p className="text-sm text-gray-600 dark:text-gray-300">No attachments.</p>
                  ) : (
                    <div className="space-y-2">
                      {attachments.map((a: any) => {
                        const url = attachmentUrl(a);
                        return (
                          <div key={a.id} className="flex items-center justify-between border rounded-lg p-3">
                            <div className="min-w-0">
                              <p className="font-medium truncate">{attachmentName(a)}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Added: {fmtDate(a.created_at)}
                              </p>
                            </div>
                            {url ? (
                              <a href={url} target="_blank" rel="noreferrer" className="text-sm underline">
                                Open
                              </a>
                            ) : (
                              <span className="text-xs text-gray-500">No URL</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Comments (add + list) */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-gray-500" />
                      <CardTitle>Comments</CardTitle>
                    </div>
                    <Badge variant="outline">{comments.length}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <form onSubmit={submitComment} className="space-y-2">
                    <Label htmlFor="comment">Add a comment</Label>
                    <Textarea
                      id="comment"
                      value={commentForm.data.comment}
                      onChange={(e) => commentForm.setData('comment', e.target.value)}
                      placeholder="Write something useful..."
                      rows={3}
                    />
                    {commentForm.errors.comment && (
                      <p className="text-sm text-red-600">{commentForm.errors.comment}</p>
                    )}
                    <div className="flex justify-end">
                      <Button type="submit" disabled={commentForm.processing || !commentForm.data.comment.trim()}>
                        <Send className="h-4 w-4 mr-2" />
                        {commentForm.processing ? 'Posting...' : 'Post'}
                      </Button>
                    </div>
                  </form>

                  <Separator />

                  {comments.length === 0 ? (
                    <p className="text-sm text-gray-600 dark:text-gray-300">No comments yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {comments.map((c: any) => (
                        <div key={c.id} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                              <UserIcon className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{c.user?.name || 'Unknown user'}</span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {fmtDate(c.created_at)}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">
                            {c.body ?? c.comment ?? ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-300">Story Points:</span>
                    <span className="font-medium">{card.story_points ?? 'Not set'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Flag className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-300">Status:</span>
                    <span className="font-medium">{card.column?.name ?? 'N/A'}</span>
                  </div>

                  {card.due_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-300">Due:</span>
                      <span className="font-medium">{new Date(card.due_date).toLocaleDateString()}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-300">Assignee:</span>
                      <span className="font-medium">{card.assignee?.name ?? 'Unassigned'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <UserIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-300">Reporter:</span>
                      <span className="font-medium">{card.reporter?.name ?? 'N/A'}</span>
                    </div>
                  </div>

                  <Separator />

                  {card.sprint && (
                    <div className="pt-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Sprint</span>
                      <p className="font-medium text-sm">{card.sprint?.name ?? 'N/A'}</p>
                    </div>
                  )}

                  {card.epic && (
                    <div className="pt-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Epic</span>
                      <p className="font-medium text-sm">{card.epic?.name ?? 'N/A'}</p>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <History className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-300">Created:</span>
                      <span className="font-medium">{fmtDate(card.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <History className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-300">Updated:</span>
                      <span className="font-medium">{fmtDate(card.updated_at)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Context</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Board</span>
                    <p className="font-medium text-sm">
                      <Link href={route('agile.board.show', card.board.id)} className="hover:underline">
                        {card.board?.name ?? 'N/A'}
                      </Link>
                    </p>
                  </div>

                  {project && (
                    <div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">Project</span>
                      <p className="font-medium text-sm">
                        {/* swap if your route name differs */}
                        <Link href={route('projects.show', project.id)} className="hover:underline">
                          {project?.name ?? 'Project'}
                        </Link>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}