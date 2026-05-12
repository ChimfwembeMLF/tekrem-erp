import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Textarea } from '@/Components/ui/textarea';
import {
    ArrowLeft,
    MessageSquare,
    User,
    Calendar,
    Clock,
    AlertTriangle,
    CheckCircle,
    XCircle,
    RotateCcw,
    Star,
    Send,
    Paperclip,
    Eye
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface TicketComment {
    id: number;
    content: string;
    created_at: string;
    is_internal: boolean;
    user: {
        id: number;
        name: string;
        email: string;
    };
    attachments?: TicketAttachment[];
}

interface TicketAttachment {
    name: string;
    path: string;
    size: number;
    type: string;
}

interface Ticket {
    id: number;
    ticket_number: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    created_at: string;
    updated_at: string;
    closed_at?: string;
    satisfaction_rating?: number;
    satisfaction_feedback?: string;
    view_count: number;
    attachments?: TicketAttachment[];
    category?: {
        id: number;
        name: string;
        color: string;
    };
    assignedTo?: {
        id: number;
        name: string;
        email: string;
    };
    comments: TicketComment[];
}

interface Props {
    ticket: Ticket;
}

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
    const files  = attachments.filter(f => !f.type?.startsWith('image/'));

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

                    {/* Image thumbnails */}
                    {images.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {images.map((file, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setLightbox(getFileUrl(file.path))}
                                    className="group relative aspect-video rounded-lg overflow-hidden border bg-muted hover:ring-2 hover:ring-primary transition-all"
                                >
                                    <img
                                        src={getFileUrl(file.path)}
                                        alt={file.name}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
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

                    {/* Non-image files */}
                    {files.length > 0 && (
                        <div className="space-y-1.5">
                            {files.map((file, idx) => (
                                <a
                                    key={idx}
                                    href={getFileUrl(file.path)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-3 rounded-lg border bg-muted/40 hover:bg-muted p-2.5 transition-colors"
                                >
                                    <div className="flex-shrink-0 h-9 w-9 rounded-md bg-background border flex items-center justify-center">
                                        <span className="text-[9px] font-bold text-muted-foreground leading-none">
                                            {getExt(file.name)}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">
                                            {file.name}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {formatSize(file.size)}
                                        </p>
                                    </div>
                                    <Eye className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity" />
                                </a>
                            ))}
                        </div>
                    )}

                </CardContent>
            </Card>

            {/* Lightbox */}
            {lightbox && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setLightbox(null)}
                >
                    <div
                        className="relative max-w-4xl w-full"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setLightbox(null)}
                            className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors flex items-center gap-1.5 text-sm"
                        >
                            <XCircle className="h-5 w-5" />
                            Close
                        </button>
                        <img
                            src={lightbox}
                            alt="Preview"
                            className="w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                        />
                        <a
                            href={lightbox}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/70 hover:text-white text-sm flex items-center gap-1.5 transition-colors whitespace-nowrap"
                            onClick={e => e.stopPropagation()}
                        >
                            <Eye className="h-4 w-4" />
                            Open original
                        </a>
                    </div>
                </div>
            )}
        </>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────


export default function ShowTicket({ ticket }: Props) {
    // Lightbox state for comment attachments
    const [commentLightbox, setCommentLightbox] = useState<string | null>(null);
    // Get current user ID from meta or props (adjust as needed)
    const currentUserId = (window as any).userId || null;
    const route = useRoute();
    const [showCloseForm, setShowCloseForm]   = useState(false);
    const [showReopenForm, setShowReopenForm] = useState(false);

    const {
        data: commentData,
        setData: setCommentData,
        post: postComment,
        processing: commentProcessing,
        reset: resetComment,
    } = useForm<{ content: string; existing_attachments: TicketAttachment[] }>({ content: '', existing_attachments: [] });

    // Attachment state for comment form
    const [commentAttachments, setCommentAttachments] = useState<any[]>([]);

    // --- Edit comment state (moved to top level) ---
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState<string>('');
    const [editProcessing, setEditProcessing] = useState(false);
    const {
        data: editData,
        setData: setEditData,
        put: putComment,
        processing: editFormProcessing,
        reset: resetEditForm,
    } = useForm<{ content: string }>({ content: '' });

    const handleEditClick = (comment: TicketComment) => {
        setEditingCommentId(comment.id);
        setEditContent(comment.content);
        setEditData('content', comment.content);
    };

    const handleEditCancel = () => {
        setEditingCommentId(null);
        setEditContent('');
        resetEditForm();
    };

    const handleEditSubmit = (e: React.FormEvent, comment: TicketComment) => {
        e.preventDefault();
        setEditProcessing(true);
        setEditData('content', editContent);
        putComment(
            route('customer.support.tickets.comments.update', { ticket: ticket.id, comment: comment.id }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingCommentId(null);
                    setEditContent('');
                    resetEditForm();
                },
                onFinish: () => setEditProcessing(false),
            }
        );
    };

    const {
        data: closeData,
        setData: setCloseData,
        post: postClose,
        processing: closeProcessing,
    } = useForm({ satisfaction_rating: 5, satisfaction_feedback: '' });

    const {
        data: reopenData,
        setData: setReopenData,
        post: postReopen,
        processing: reopenProcessing,
    } = useForm({ reason: '' });

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':        return <Badge variant="destructive">Open</Badge>;
            case 'in_progress': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>;
            case 'resolved':    return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Resolved</Badge>;
            case 'closed':      return <Badge variant="secondary">Closed</Badge>;
            default:            return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'urgent': return <Badge variant="destructive">Urgent</Badge>;
            case 'high':   return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">High</Badge>;
            case 'medium': return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>;
            case 'low':    return <Badge variant="secondary">Low</Badge>;
            default:       return <Badge variant="outline">{priority}</Badge>;
        }
    };

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('content', commentData.content);
        commentAttachments.forEach((file: any) => {
            if (file.file instanceof File) {
                formData.append('attachments[]', file.file, file.name);
            }
        });
        router.post(
            route('customer.support.tickets.comments.store', ticket.id),
            formData,
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    resetComment();
                    setCommentAttachments([]);
                },
            }
        );
    };

    const handleCloseTicket  = (e: React.FormEvent) => { e.preventDefault(); postClose(route('customer.support.tickets.close', ticket.id)); };
    const handleReopenTicket = (e: React.FormEvent) => { e.preventDefault(); postReopen(route('customer.support.tickets.reopen', ticket.id)); };

    const canClose   = ticket.status === 'resolved';
    const canReopen  = ticket.status === 'closed';
    const canComment = ticket.status !== 'closed';

    return (
        <CustomerLayout>
            <Head title={`Ticket #${ticket.ticket_number}`} />

            <div className="space-y-6">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <Link href={route('customer.support.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h1 className="text-2xl font-bold tracking-tight">
                                    Ticket #{ticket.ticket_number}
                                </h1>
                                {getStatusBadge(ticket.status)}
                                {getPriorityBadge(ticket.priority)}
                            </div>
                            <p className="text-muted-foreground text-sm">{ticket.title}</p>
                        </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                        {canClose && (
                            <Button variant="outline" onClick={() => setShowCloseForm(true)} className="text-green-600 hover:text-green-700">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Close Ticket
                            </Button>
                        )}
                        {canReopen && (
                            <Button variant="outline" onClick={() => setShowReopenForm(true)} className="text-blue-600 hover:text-blue-700">
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reopen Ticket
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">

                    {/* ── Main Content ── */}
                    <div className="lg:col-span-2 space-y-6">


                        {/* Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <MessageSquare className="h-4 w-4" />
                                    Description
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                    {ticket.description}
                                </p>
                            </CardContent>
                        </Card>
                        
                        {/* Attachments */}
                        {Array.isArray(ticket.attachments) && ticket.attachments.length > 0 && (
                            <AttachmentsPreview attachments={ticket.attachments} />
                        )}

                        {/* Comments */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <MessageSquare className="h-4 w-4" />
                                    Comments
                                    <Badge variant="secondary" className="ml-1 text-xs">
                                        {ticket.comments.length}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">

                                {ticket.comments.length > 0 ? (
                                    <div className="space-y-4">
                                        {ticket.comments.map((comment) => (
                                            <div key={comment.id} className="flex gap-3">
                                                <div className="flex-shrink-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center mt-0.5">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 rounded-lg border bg-muted/40 p-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-sm font-medium">{comment.user.name}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDate(comment.created_at)}
                                                        </span>
                                                        {/* Edit button for own comments */}
                                                        {currentUserId && comment.user.id === currentUserId && (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                className="ml-2 px-2 py-0 text-xs h-6"
                                                                onClick={() => handleEditClick(comment)}
                                                            >
                                                                Edit
                                                            </Button>
                                                        )}
                                                    </div>
                                                    {editingCommentId === comment.id ? (
                                                        <form onSubmit={e => handleEditSubmit(e, comment)} className="space-y-2">
                                                            <Textarea
                                                                value={editContent}
                                                                onChange={e => setEditContent(e.target.value)}
                                                                rows={3}
                                                                required
                                                            />
                                                            <div className="flex gap-2">
                                                                <Button type="submit" size="sm" disabled={editProcessing || !editContent.trim()}>
                                                                    {editProcessing ? 'Saving...' : 'Save'}
                                                                </Button>
                                                                <Button type="button" size="sm" variant="outline" onClick={handleEditCancel}>
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        </form>
                                                    ) : (
                                                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                                            {comment.content}
                                                        </p>
                                                    )}
                                                    {/* Show comment attachments if present */}
                                                    {Array.isArray(comment.attachments) && comment.attachments.length > 0 && (
                                                        <div className="mt-3 border-t pt-3">
                                                            <p className="text-xs font-medium mb-2 uppercase tracking-wide text-muted-foreground">
                                                                Attachments
                                                            </p>
                                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                                                {comment.attachments.map((attachment, index) => {
                                                                    const isImage = attachment.type?.startsWith('image/');
                                                                    const url = attachment.path?.startsWith('http') || attachment.path?.startsWith('/')
                                                                        ? attachment.path
                                                                        : `/storage/${attachment.path}`;
                                                                    return isImage ? (
                                                                        <button
                                                                            key={index}
                                                                            type="button"
                                                                            className="relative group rounded-md border overflow-hidden block hover:border-primary transition-colors aspect-video w-full bg-muted flex items-center justify-center"
                                                                            onClick={() => setCommentLightbox(url)}
                                                                        >
                                                                            <img src={url} alt={attachment.name} className="w-full h-full object-cover" />
                                                                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                                                                <div className="bg-white/80 dark:bg-black/60 shadow-sm rounded-full p-1 border border-white/30 truncate max-w-[80%]">
                                                                                    <span className="text-[10px] font-medium px-2 block truncate">View</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-[9px] text-white truncate px-1.5 flex justify-between">
                                                                                <span className="truncate pr-1">{attachment.name}</span>
                                                                                <span className="shrink-0 opacity-80">{(attachment.size / 1024 / 1024).toFixed(1)}MB</span>
                                                                            </div>
                                                                        </button>
                                                                    ) : (
                                                                        <a
                                                                            key={index}
                                                                            href={url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="relative group rounded-md border overflow-hidden block hover:border-primary transition-colors"
                                                                        >
                                                                            <div className="w-full h-full bg-muted flex flex-col items-center justify-center p-2 text-center group-hover:bg-muted/80 transition-colors">
                                                                                <Paperclip className="h-5 w-5 text-muted-foreground mb-1" />
                                                                                <span className="text-[10px] text-muted-foreground truncate w-full px-1">{attachment.name}</span>
                                                                            </div>
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
                                                            {/* Lightbox for comment attachments */}
                                                            {commentLightbox && (
                                                                <div
                                                                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                                                                    onClick={() => setCommentLightbox(null)}
                                                                >
                                                                    <div
                                                                        className="relative max-w-4xl w-full"
                                                                        onClick={e => e.stopPropagation()}
                                                                    >
                                                                        <button
                                                                            onClick={() => setCommentLightbox(null)}
                                                                            className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors flex items-center gap-1.5 text-sm"
                                                                        >
                                                                            <XCircle className="h-5 w-5" />
                                                                            Close
                                                                        </button>
                                                                        <img
                                                                            src={commentLightbox}
                                                                            alt="Preview"
                                                                            className="w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                                                                        />
                                                                        <a
                                                                            href={commentLightbox}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/70 hover:text-white text-sm flex items-center gap-1.5 transition-colors whitespace-nowrap"
                                                                            onClick={e => e.stopPropagation()}
                                                                        >
                                                                            <Eye className="h-4 w-4" />
                                                                            Open original
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-muted-foreground">
                                        <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-40" />
                                        <p className="text-sm">No comments yet</p>
                                    </div>
                                )}


                                {canComment && (
                                    <form onSubmit={handleAddComment} className="space-y-3 pt-4 border-t">
                                        <Textarea
                                            placeholder="Add a comment..."
                                            value={commentData.content}
                                            onChange={(e) => setCommentData('content', e.target.value)}
                                            rows={4}
                                            required
                                        />
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
                                                        setCommentAttachments(prev => [
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
                                        >
                                            <Paperclip className="h-7 w-7 mb-2 text-primary" />
                                            <span className="font-medium text-sm mb-1">Drag & drop files here or click to select</span>
                                            <span className="text-xs text-muted-foreground">Attach screenshots, images, or documents to your comment.</span>
                                            <input
                                                type="file"
                                                multiple
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={e => {
                                                    const files = Array.from(e.target.files || []);
                                                    files.forEach(file => {
                                                        const reader = new FileReader();
                                                        reader.onload = (ev) => {
                                                            setCommentAttachments(prev => [
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
                                            />
                                        </div>
                                        {/* Attachment previews */}
                                        {commentAttachments.length > 0 && (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                                                {commentAttachments.map((file, index) => {
                                                    const isImage = file.mime_type?.startsWith('image/');
                                                    return (
                                                        <div key={index} className="relative group rounded-md border overflow-hidden">
                                                            {isImage ? (
                                                                <div className="aspect-video w-full bg-muted flex items-center justify-center overflow-hidden">
                                                                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                                                                </div>
                                                            ) : (
                                                                <div className="aspect-video w-full bg-muted flex flex-col items-center justify-center p-2 text-center">
                                                                    <Paperclip className="h-6 w-6 text-muted-foreground mb-1" />
                                                                    <span className="text-xs text-muted-foreground truncate w-full">{file.name}</span>
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    className="h-8 rounded-full px-3 shadow-md border border-white/20"
                                                                    onClick={() => setCommentAttachments(prev => prev.filter((_, i) => i !== index))}
                                                                >
                                                                    Remove
                                                                </Button>
                                                            </div>
                                                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-[10px] text-white truncate px-2">
                                                                {file.name} ({file.file_size ? (file.file_size / 1024 / 1024).toFixed(1) + ' MB' : ''})
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        <Button
                                            type="submit"
                                            disabled={commentProcessing || !commentData.content.trim()}
                                            size="sm"
                                        >
                                            <Send className="h-4 w-4 mr-2" />
                                            {commentProcessing ? 'Sending...' : 'Add Comment'}
                                        </Button>
                                    </form>
                                )}

                            </CardContent>
                        </Card>
                    </div>

                    {/* ── Sidebar ── */}
                    <div className="space-y-6">

                        {/* Ticket Details */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Ticket Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">

                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Status</span>
                                    {getStatusBadge(ticket.status)}
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Priority</span>
                                    {getPriorityBadge(ticket.priority)}
                                </div>

                                {ticket.category && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Category</span>
                                        <Badge
                                            variant="outline"
                                            style={{
                                                backgroundColor: ticket.category.color + '20',
                                                color: ticket.category.color,
                                            }}
                                        >
                                            {ticket.category.name}
                                        </Badge>
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <Calendar className="h-3 w-3" /> Created
                                    </span>
                                    <span className="text-xs text-right">{formatDate(ticket.created_at)}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <Clock className="h-3 w-3" /> Updated
                                    </span>
                                    <span className="text-xs text-right">{formatDate(ticket.updated_at)}</span>
                                </div>

                                {ticket.closed_at && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground flex items-center gap-1.5">
                                            <XCircle className="h-3 w-3" /> Closed
                                        </span>
                                        <span className="text-xs text-right">{formatDate(ticket.closed_at)}</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <Eye className="h-3 w-3" /> Views
                                    </span>
                                    <span>{ticket.view_count}</span>
                                </div>

                            </CardContent>
                        </Card>

                        {/* Assigned To */}
                        {ticket.assignedTo && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Assigned To</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{ticket.assignedTo.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{ticket.assignedTo.email}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Satisfaction Rating */}
                        {ticket.satisfaction_rating && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Your Rating</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-1 mb-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`h-4 w-4 ${
                                                    star <= ticket.satisfaction_rating!
                                                        ? 'text-yellow-400 fill-current'
                                                        : 'text-muted-foreground/30'
                                                }`}
                                            />
                                        ))}
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            {ticket.satisfaction_rating}/5
                                        </span>
                                    </div>
                                    {ticket.satisfaction_feedback && (
                                        <p className="text-xs text-muted-foreground italic">
                                            "{ticket.satisfaction_feedback}"
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                    </div>
                </div>
            </div>

            {/* ── Close Ticket Modal ── */}
            {showCloseForm && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    onClick={() => setShowCloseForm(false)}
                >
                    <Card className="w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <CardHeader>
                            <CardTitle>Close Ticket</CardTitle>
                            <CardDescription>Rate your experience before closing</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCloseTicket} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Satisfaction Rating</label>
                                    <div className="flex items-center gap-1 mt-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setCloseData('satisfaction_rating', star)}
                                                className="p-1 hover:scale-110 transition-transform"
                                            >
                                                <Star className={`h-6 w-6 ${star <= closeData.satisfaction_rating ? 'text-yellow-400 fill-current' : 'text-muted-foreground/30'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Feedback <span className="text-muted-foreground">(optional)</span></label>
                                    <Textarea
                                        placeholder="Tell us about your experience..."
                                        value={closeData.satisfaction_feedback}
                                        onChange={(e) => setCloseData('satisfaction_feedback', e.target.value)}
                                        rows={3}
                                        className="mt-2"
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button type="submit" disabled={closeProcessing} className="flex-1">
                                        {closeProcessing ? 'Closing...' : 'Close Ticket'}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setShowCloseForm(false)} className="flex-1">
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* ── Reopen Ticket Modal ── */}
            {showReopenForm && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    onClick={() => setShowReopenForm(false)}
                >
                    <Card className="w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <CardHeader>
                            <CardTitle>Reopen Ticket</CardTitle>
                            <CardDescription>Provide a reason for reopening</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleReopenTicket} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Reason</label>
                                    <Textarea
                                        placeholder="Why are you reopening this ticket?"
                                        value={reopenData.reason}
                                        onChange={(e) => setReopenData('reason', e.target.value)}
                                        rows={3}
                                        className="mt-2"
                                        required
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <Button type="submit" disabled={reopenProcessing || !reopenData.reason.trim()} className="flex-1">
                                        {reopenProcessing ? 'Reopening...' : 'Reopen Ticket'}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setShowReopenForm(false)} className="flex-1">
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

        </CustomerLayout>
    );
}