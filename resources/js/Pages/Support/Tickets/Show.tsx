import React, { useState } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import AISuggestions from '@/Components/Support/AISuggestions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Separator } from '@/Components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import MediaPicker from '@/Components/CMS/MediaPicker';
import MarkdownEditor from '@/Components/PM/MarkdownEditor';
import {
  ArrowLeft,
  Edit,
  MessageSquare,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RotateCcw,
  Send,
  Paperclip,
  Bot,
  Calendar,
  Building,
  Upload,
  X,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface TicketData {
  id: number;
  ticket_number: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  due_date?: string;
  resolved_at?: string;
  closed_at?: string;
  satisfaction_rating?: number;
  satisfaction_feedback?: string;
  source?: string;
  external_reference_id?: string;
  tags?: string[];
  escalation_level: number;
  category?: {
    id: number;
    name: string;
    color: string;
  };
  assigned_to?: {
    id: number;
    name: string;
  };
  created_by: {
    id: number;
    name: string;
  };
  requester?: {
    name: string;
  };
  sla_policy?: {
    id: number;
    name: string;
    response_time_hours: number;
    resolution_time_hours: number;
  };
}

interface Comment {
  id: number;
  content: string;
  is_internal: boolean;
  is_solution: boolean;
  created_at: string;
  time_spent_minutes?: number;
  user: {
    id: number;
    name: string;
  };
  attachments?: Array<{
    name: string;
    path: string;
    size: number;
    type: string;
  }>;
}

interface User {
  id: number;
  name: string;
}

interface PaginatedComments {
  data: Comment[];
  links: any;
  meta?: any;
}

interface Props {
  ticket: TicketData;
  users: User[];
  comments: PaginatedComments;
}

export default function Show({ ticket, users, comments }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const { auth } = usePage<any>().props;
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [mediaAttachments, setMediaAttachments] = useState<any[]>([]);
  const [editorKey, setEditorKey] = useState(0);

  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const { data, setData, post, processing, reset } = useForm({
    content: '',
    is_internal: false,
    is_solution: false,
    time_spent_minutes: '',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = () => {
    return ticket.due_date && new Date(ticket.due_date) < new Date() &&
      !['resolved', 'closed'].includes(ticket.status);
  };

  const removeAttachment = (index: number) => {
    setMediaAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();

    const mappedAttachments = mediaAttachments.map(m => ({
      name: m.name || m.original_name,
      path: m.file_path,
      size: m.file_size,
      type: m.mime_type,
    }));

    router.post(route('support.tickets.comments.store', ticket.id), {
      content: data.content,
      is_internal: data.is_internal,
      is_solution: data.is_solution,
      time_spent_minutes: data.time_spent_minutes,
      existing_attachments: mappedAttachments
    }, {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setMediaAttachments([]);
        localStorage.removeItem(`ticket-${ticket.id}-comment`);
        setEditorKey(prev => prev + 1);
        router.reload();
      },
    });
  };

  const handleAssign = (userId: string) => {
    router.post(route('support.tickets.assign', ticket.id), {
      assigned_to: userId,
    });
  };

  const handleStatusChange = async (status: string) => {
    if (status === 'closed') {
      const reason = prompt(t('support.close_reason', 'Please provide a reason for closing this ticket:'));
      if (reason) {
        try {
          await router.post(route('support.tickets.close', ticket.id), {
            resolution_notes: reason,
          }, {
            onSuccess: () => {
              toast.success(t('support.ticket_closed', 'Ticket closed successfully.'));
              router.reload();
            },
            onError: (errors) => {
              toast.error(errors?.message || t('support.close_error', 'Failed to close ticket.'));
            },
            preserveScroll: true,
          });
        } catch (e: any) {
          toast.error(e?.message || t('support.close_error', 'Failed to close ticket.'));
        }
      }
    } else if (status === 'reopen') {
      const reason = prompt(t('support.reopen_reason', 'Please provide a reason for reopening this ticket:'));
      if (reason) {
        try {
          await router.post(route('support.tickets.reopen', ticket.id), {
            reason: reason,
          }, {
            onSuccess: () => {
              toast.success(t('support.ticket_reopened', 'Ticket reopened successfully.'));
              router.reload();
            },
            onError: (errors) => {
              toast.error(errors?.message || t('support.reopen_error', 'Failed to reopen ticket.'));
            },
            preserveScroll: true,
          });
        } catch (e: any) {
          toast.error(e?.message || t('support.reopen_error', 'Failed to reopen ticket.'));
        }
      }
    }
  };

  const getAISuggestions = () => {
    setShowAISuggestions(true);
  };

  return (
    <AppLayout title=''>
      <Head title={`${t('support.ticket', 'Ticket')} #${ticket.ticket_number}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={route('support.tickets.index')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.back', 'Back')}
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  #{ticket.ticket_number}
                </h1>
                <Badge className={getStatusColor(ticket.status)} variant="secondary">
                  {ticket.status.replace('_', ' ')}
                </Badge>
                <Badge className={getPriorityColor(ticket.priority)} variant="secondary">
                  {ticket.priority}
                </Badge>
                {ticket.source && (
                  <Badge variant="outline" className="border-primary text-primary">
                    {ticket.source}
                  </Badge>
                )}
                {isOverdue() && (
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Overdue
                  </Badge>
                )}
              </div>
              <h2 className="text-xl text-muted-foreground">{ticket.title}</h2>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={getAISuggestions}>
              <Bot className="h-4 w-4 mr-2" />
              {t('support.ai_suggestions', 'AI Suggestions')}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={route('support.tickets.edit', ticket.id)}>
                <Edit className="h-4 w-4 mr-2" />
                {t('common.edit', 'Edit')}
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Description */}
            <Card>
              <CardHeader>
                <CardTitle>{t('support.description', 'Description')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{ticket.description}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            {showAISuggestions && (
              <AISuggestions
                ticketId={ticket.id}
                onApplySuggestion={(suggestion) => {
                  setData('content', suggestion);
                }}
              />
            )}

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {t('support.comments', 'Comments')} ({comments.data.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {comments.data.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {comment.user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{comment.user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(comment.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {comment.is_internal && (
                          <Badge variant="secondary" className="text-xs">
                            Internal
                          </Badge>
                        )}
                        {comment.is_solution && (
                          <Badge variant="default" className="text-xs">
                            Solution
                          </Badge>
                        )}
                        {auth?.user?.id === comment.user.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              setEditingContent(comment.content);
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            <Edit className="h-3 w-3 mr-1" /> {t('common.edit', 'Edit')}
                          </Button>
                        )}
                      </div>
                    </div>
                    {editingCommentId === comment.id ? (
                      <div className="mt-3">
                        <div className="rounded-md overflow-hidden mb-2 border">
                          <MarkdownEditor
                            key={`edit-${comment.id}`}
                            storageKey={`edit-comment-${comment.id}`}
                            initialValue={editingContent}
                            onChange={(val) => setEditingContent(val)}
                          // height={}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => {
                            localStorage.removeItem(`edit-comment-${comment.id}`);
                            setEditingCommentId(null);
                          }}>
                            {t('common.cancel', 'Cancel')}
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              router.put(route('support.tickets.comments.update', { ticket: ticket.id, comment: comment.id }), { content: editingContent }, {
                                preserveScroll: true,
                                onSuccess: () => {
                                  localStorage.removeItem(`edit-comment-${comment.id}`);
                                  setEditingCommentId(null);
                                }
                              });
                            }}
                          >
                            {t('common.save', 'Save')}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none mt-2 text-sm">
                        <ReactMarkdown>{comment.content}</ReactMarkdown>
                      </div>
                    )}
                    {comment.time_spent_minutes && (
                      <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {comment.time_spent_minutes} minutes
                      </div>
                    )}
                    {comment.attachments && comment.attachments.length > 0 && (
                      <div className="mt-3 border-t pt-3">
                        <p className="text-xs font-medium mb-2 uppercase tracking-wide text-muted-foreground">
                          {t('support.attachments', 'Attachments')}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {comment.attachments.map((attachment, index) => {
                            const isImage = attachment.type.startsWith('image/');
                            const url = attachment.path.startsWith('http') || attachment.path.startsWith('/')
                              ? attachment.path
                              : `/storage/${attachment.path}`;

                            return (
                              <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative group rounded-md border overflow-hidden block hover:border-primary transition-colors"
                              >
                                {isImage ? (
                                  <div className="aspect-video w-full bg-muted flex items-center justify-center overflow-hidden">
                                    <img src={url} alt={attachment.name} className="w-full h-full object-cover" />
                                  </div>
                                ) : (
                                  <div className="w-full h-full bg-muted flex flex-col items-center justify-center p-2 text-center group-hover:bg-muted/80 transition-colors">
                                    <FileText className="h-5 w-5 text-muted-foreground mb-1" />
                                    <span className="text-[10px] text-muted-foreground truncate w-full px-1">{attachment.name}</span>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                  <div className="bg-white/80 dark:bg-black/60 shadow-sm rounded-full p-1 border border-white/30 truncate max-w-[80%]">
                                    <span className="text-[10px] font-medium px-2 block truncate">View</span>
                                  </div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-[9px] text-white truncate px-1.5 flex justify-between">
                                  <span className="truncate pr-1">{attachment.name}</span>
                                  <span className="shrink-0 opacity-80">{(attachment.size / 1024 / 1024).toFixed(1)}MB</span>
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {comments.data.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('support.no_comments', 'No comments yet')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add Comment */}
            <Card>
              <CardHeader>
                <CardTitle>{t('support.add_comment', 'Add Comment')}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddComment} className="space-y-4">
                  <div className="rounded-md overflow-hidden">
                    <MarkdownEditor
                      key={editorKey}
                      storageKey={`ticket-${ticket.id}-comment`}
                      onChange={(val) => setData('content', val)}
                      placeholder={t('support.comment_placeholder', 'Add your comment (Markdown supported)...')}
                      height={250}
                    />
                  </div>

                  <div className="flex gap-4 text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={data.is_internal}
                        onChange={(e) => setData('is_internal', e.target.checked)}
                      />
                      {t('support.internal_comment', 'Internal comment')}
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={data.is_solution}
                        onChange={(e) => setData('is_solution', e.target.checked)}
                      />
                      {t('support.mark_as_solution', 'Mark as solution')}
                    </label>
                  </div>

                  <div className="space-y-4 pt-2 border-t mt-4">
                    <div>
                      <Label htmlFor="attachments" className="block mb-2">{t('support.attach_files', 'Attach Files')}</Label>
                      <Button type="button" variant="outline" onClick={() => setShowMediaPicker(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        {t('support.open_media_library', 'Open Media Library')}
                      </Button>
                      <MediaPicker
                        isOpen={showMediaPicker}
                        onSelect={(media) => {
                          setMediaAttachments(prev => {
                            if (!prev.find(m => m.id === media.id)) {
                              return [...prev, media];
                            }
                            return prev;
                          });
                        }}
                        onClose={() => setShowMediaPicker(false)}
                        multiple={true}
                        type="all"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        {t('support.file_types_media', 'Select files via the CMS Media Library to attach them to this comment.')}
                      </p>
                    </div>

                    {mediaAttachments.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        {mediaAttachments.map((file, index) => {
                          const isImage = file.mime_type.startsWith('image/');
                          return (
                            <div key={index} className="relative group rounded-md border overflow-hidden">
                              {isImage ? (
                                <div className="aspect-video w-full bg-muted flex items-center justify-center overflow-hidden">
                                  <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <div className="aspect-video w-full bg-muted flex flex-col items-center justify-center p-2 text-center">
                                  <FileText className="h-6 w-6 text-muted-foreground mb-1" />
                                  <span className="text-xs text-muted-foreground truncate w-full">{file.name}</span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="h-8 rounded-full px-3 shadow-md border border-white/20"
                                  onClick={() => removeAttachment(index)}
                                >
                                  <X className="h-4 w-4 mr-1" /> Remove
                                </Button>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-[10px] text-white truncate px-2">
                                {file.name} ({file.human_file_size || (file.file_size / 1024 / 1024).toFixed(1) + ' MB'})
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <Button type="submit" disabled={processing} className="mt-4">
                    <Send className="h-4 w-4 mr-2" />
                    {processing ? t('common.sending', 'Sending...') : t('support.add_comment', 'Add Comment')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Info */}
            <Card>
              <CardHeader>
                <CardTitle>{t('support.ticket_info', 'Ticket Information')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">{t('support.status', 'Status')}</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getStatusColor(ticket.status)} variant="secondary">
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                    {ticket.status === 'closed' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange('reopen')}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Reopen
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange('closed')}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Close
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">{t('support.assigned_to', 'Assigned To')}</Label>
                  <Select
                    value={ticket.assigned_to?.id.toString() || ''}
                    onValueChange={handleAssign}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={t('support.unassigned', 'Unassigned')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="empty">{t('support.unassigned', 'Unassigned')}</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('support.created', 'Created')}</span>
                    <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                  </div>

                  {ticket.due_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('support.due_date', 'Due Date')}</span>
                      <span className={isOverdue() ? 'text-red-600 font-medium' : ''}>
                        {new Date(ticket.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('support.created_by', 'Created By')}</span>
                    <span>{ticket.created_by.name}</span>
                  </div>

                  {ticket.requester && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('support.requester', 'Requester')}</span>
                      <span>{ticket.requester.name}</span>
                    </div>
                  )}

                  {ticket.category && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('support.category', 'Category')}</span>
                      <div className="flex items-center gap-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: ticket.category.color }}
                        />
                        <span>{ticket.category.name}</span>
                      </div>
                    </div>
                  )}

                  {ticket.sla_policy && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('support.sla', 'SLA')}</span>
                      <span>{ticket.sla_policy.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}


