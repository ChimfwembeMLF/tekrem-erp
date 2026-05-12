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
  FileText,
  Eye
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
  attachments?: TicketAttachment[];
}

interface TicketAttachment {
  name: string;
  path: string;
  size: number;
  type: string;
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

  // ─── Attachments Preview Component ───────────────────────────────────────────
  function AttachmentsPreview({ attachments }: { attachments: TicketAttachment[] }) {
    const [lightbox, setLightbox] = useState<string | null>(null);

    const getFileUrl = (path: string) =>
      path.startsWith('http') ? path : `/storage/${path}`;

    const getExt = (name: string) =>
      name.split('.').pop()?.toUpperCase() ?? 'FILE';

    const formatSize = (bytes: number) => {
      if (!bytes) return '';
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const images = attachments.filter(f => f.type?.startsWith('image/'));
    const files = attachments.filter(f => !f.type?.startsWith('image/'));

    return (
      <>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Paperclip className="h-4 w-4" />
              Attachments
              <Badge variant="secondary" className="ml-1 text-xs">
                {attachments.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {images.map((file, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setLightbox(getFileUrl(file.path))}
                    className="group relative aspect-video rounded-lg overflow-hidden border bg-muted hover:ring-2 hover:ring-primary transition-all"
                  >
                    <img src={getFileUrl(file.path)} alt={file.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <Eye className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 translate-y-full group-hover:translate-y-0 transition-transform">
                      <p className="text-[10px] text-white truncate">{file.name}</p>
                      <p className="text-[9px] text-white/70">{formatSize(file.size)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {files.length > 0 && (
              <div className="space-y-1.5">
                {files.map((file, idx) => (
                  <a key={idx} href={getFileUrl(file.path)} target="_blank" rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-lg border bg-muted/40 hover:bg-muted p-2.5 transition-colors">
                    <div className="flex-shrink-0 h-9 w-9 rounded-md bg-background border flex items-center justify-center">
                      <span className="text-[9px] font-bold text-muted-foreground leading-none">{getExt(file.name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{file.name}</p>
                      <p className="text-[10px] text-muted-foreground">{formatSize(file.size)}</p>
                    </div>
                    <Eye className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity" />
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        {lightbox && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
            <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
              <button onClick={() => setLightbox(null)} className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors flex items-center gap-1.5 text-sm">
                <XCircle className="h-5 w-5" /> Close
              </button>
              <img src={lightbox} alt="Preview" className="w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" />
              <a href={lightbox} target="_blank" rel="noopener noreferrer"
                className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/70 hover:text-white text-sm flex items-center gap-1.5 transition-colors whitespace-nowrap"
                onClick={e => e.stopPropagation()}>
                <Eye className="h-4 w-4" /> Open original
              </a>
            </div>
          </div>
        )}
      </>
    );
  }

  const isOverdue = () => {
    return ticket.due_date && new Date(ticket.due_date) < new Date() &&
      !['resolved', 'closed'].includes(ticket.status);
  };

  const removeAttachment = (index: number) => {
    setMediaAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();

    // Separate new uploads (with .file) and CMS/media files (without .file)
    const newFiles = mediaAttachments.filter(m => m.file);
    const cmsFiles = mediaAttachments.filter(m => !m.file);

    // Map CMS/media files to metadata
    const mappedCMS = cmsFiles.map(m => ({
      name: m.name || m.original_name,
      path: m.file_path || m.path || m.url || '',
      size: m.file_size || m.size || 0,
      type: m.mime_type || m.type || '',
    }));

    // Build FormData
    const formData = new FormData();
    formData.append('content', data.content);
    formData.append('is_internal', data.is_internal ? '1' : '0');
    formData.append('is_solution', data.is_solution ? '1' : '0');
    if (data.time_spent_minutes) formData.append('time_spent_minutes', data.time_spent_minutes);
    mappedCMS.forEach((att, idx) => {
      formData.append(`existing_attachments[${idx}][name]`, att.name);
      formData.append(`existing_attachments[${idx}][path]`, att.path);
      formData.append(`existing_attachments[${idx}][size]`, att.size.toString());
      formData.append(`existing_attachments[${idx}][type]`, att.type);
    });
    newFiles.forEach((m, idx) => {
      formData.append('attachments[]', m.file, m.name);
    });

    router.post(route('support.tickets.comments.store', ticket.id), formData, {
      forceFormData: true,
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

            {ticket.attachments && ticket.attachments.length > 0 && (
              <AttachmentsPreview attachments={ticket.attachments} />
            )}
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
                        <AttachmentsPreview attachments={comment.attachments} />
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
                    <Textarea
                      value={data.content}
                      onChange={(e) => setData('content', e.target.value)}
                      placeholder={t('support.comment_placeholder', 'Add your comment...')}
                      rows={4}
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
                      {/* Dropbox-style drag-and-drop area */}
                      <div
                        className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer relative"
                        onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          const files = Array.from(e.dataTransfer.files);
                          files.forEach(file => {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              setMediaAttachments(prev => [
                                ...prev,
                                {
                                  id: Math.random().toString(36).substr(2, 9),
                                  name: file.name,
                                  url: ev.target?.result,
                                  mime_type: file.type,
                                  file_size: file.size,
                                  file,
                                }
                              ]);
                            };
                            reader.readAsDataURL(file);
                          });
                        }}
                        onClick={() => setShowMediaPicker(true)}
                      >
                        <Upload className="h-8 w-8 mb-2 text-primary" />
                        <span className="font-medium text-sm mb-1">{t('support.drag_drop_files', 'Drag & drop files here or click to select')}</span>
                        <span className="text-xs text-muted-foreground">{t('support.file_types_media', 'Select files via the CMS Media Library to attach them to this comment.')}</span>
                      </div>
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
                    </div>

                    {mediaAttachments.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        {mediaAttachments.map((file, index) => {
                          const isImage = file.mime_type?.startsWith('image/');
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


