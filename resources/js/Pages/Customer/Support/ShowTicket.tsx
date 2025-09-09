import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Textarea } from '@/Components/ui/textarea';
import { Separator } from '@/Components/ui/separator';
import { Alert, AlertDescription } from '@/Components/ui/alert';
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

export default function ShowTicket({ ticket }: Props) {
    const route = useRoute();
    const [showCloseForm, setShowCloseForm] = useState(false);
    const [showReopenForm, setShowReopenForm] = useState(false);

    const { data: commentData, setData: setCommentData, post: postComment, processing: commentProcessing, reset: resetComment } = useForm({
        content: '',
    });

    const { data: closeData, setData: setCloseData, post: postClose, processing: closeProcessing } = useForm({
        satisfaction_rating: 5,
        satisfaction_feedback: '',
    });

    const { data: reopenData, setData: setReopenData, post: postReopen, processing: reopenProcessing } = useForm({
        reason: '',
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return <Badge variant="destructive">Open</Badge>;
            case 'in_progress':
                return <Badge variant="default" className="bg-blue-100 text-blue-800">In Progress</Badge>;
            case 'resolved':
                return <Badge variant="default" className="bg-green-100 text-green-800">Resolved</Badge>;
            case 'closed':
                return <Badge variant="secondary">Closed</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return <Badge variant="destructive">Urgent</Badge>;
            case 'high':
                return <Badge variant="destructive" className="bg-orange-100 text-orange-800">High</Badge>;
            case 'medium':
                return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
            case 'low':
                return <Badge variant="secondary">Low</Badge>;
            default:
                return <Badge variant="outline">{priority}</Badge>;
        }
    };

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        postComment(route('customer.support.tickets.comments.store', ticket.id), {
            onSuccess: () => {
                resetComment();
            },
        });
    };

    const handleCloseTicket = (e: React.FormEvent) => {
        e.preventDefault();
        postClose(route('customer.support.tickets.close', ticket.id));
    };

    const handleReopenTicket = (e: React.FormEvent) => {
        e.preventDefault();
        postReopen(route('customer.support.tickets.reopen', ticket.id));
    };

    const canClose = ['resolved'].includes(ticket.status);
    const canReopen = ['closed'].includes(ticket.status);
    const canComment = !['closed'].includes(ticket.status);

    return (
        <CustomerLayout>
            <Head title={`Ticket #${ticket.ticket_number}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('customer.support.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Support
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold tracking-tight">
                                    Ticket #{ticket.ticket_number}
                                </h1>
                                {getStatusBadge(ticket.status)}
                                {getPriorityBadge(ticket.priority)}
                            </div>
                            <p className="text-muted-foreground">{ticket.title}</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {canClose && (
                            <Button 
                                variant="outline" 
                                onClick={() => setShowCloseForm(true)}
                                className="text-green-600 hover:text-green-700"
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Close Ticket
                            </Button>
                        )}
                        {canReopen && (
                            <Button 
                                variant="outline" 
                                onClick={() => setShowReopenForm(true)}
                                className="text-blue-600 hover:text-blue-700"
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reopen Ticket
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Ticket Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Description
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-sm max-w-none">
                                    <p className="whitespace-pre-wrap">{ticket.description}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Comments */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Comments ({ticket.comments.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {ticket.comments.length > 0 ? (
                                    <div className="space-y-4">
                                        {ticket.comments.map((comment) => (
                                            <div key={comment.id} className="border rounded-lg p-4">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                                                        <User className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-sm">{comment.user.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {formatDate(comment.created_at)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="prose prose-sm max-w-none">
                                                    <p className="whitespace-pre-wrap">{comment.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <MessageSquare className="mx-auto h-8 w-8 mb-2" />
                                        <p>No comments yet</p>
                                    </div>
                                )}

                                {/* Add Comment Form */}
                                {canComment && (
                                    <form onSubmit={handleAddComment} className="space-y-4 pt-4 border-t">
                                        <div>
                                            <Textarea
                                                placeholder="Add a comment..."
                                                value={commentData.content}
                                                onChange={(e) => setCommentData('content', e.target.value)}
                                                rows={4}
                                                required
                                            />
                                        </div>
                                        <Button type="submit" disabled={commentProcessing || !commentData.content.trim()}>
                                            <Send className="h-4 w-4 mr-2" />
                                            {commentProcessing ? 'Sending...' : 'Add Comment'}
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Ticket Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Ticket Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Status</div>
                                    <div className="mt-1">{getStatusBadge(ticket.status)}</div>
                                </div>

                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Priority</div>
                                    <div className="mt-1">{getPriorityBadge(ticket.priority)}</div>
                                </div>

                                {ticket.category && (
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Category</div>
                                        <div className="mt-1">
                                            <Badge variant="outline" style={{ backgroundColor: ticket.category.color + '20', color: ticket.category.color }}>
                                                {ticket.category.name}
                                            </Badge>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Created</div>
                                    <div className="text-sm mt-1 flex items-center gap-2">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(ticket.created_at)}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
                                    <div className="text-sm mt-1 flex items-center gap-2">
                                        <Clock className="h-3 w-3" />
                                        {formatDate(ticket.updated_at)}
                                    </div>
                                </div>

                                {ticket.closed_at && (
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Closed</div>
                                        <div className="text-sm mt-1 flex items-center gap-2">
                                            <XCircle className="h-3 w-3" />
                                            {formatDate(ticket.closed_at)}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Views</div>
                                    <div className="text-sm mt-1 flex items-center gap-2">
                                        <Eye className="h-3 w-3" />
                                        {ticket.view_count}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Assigned To */}
                        {ticket.assignedTo && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Assigned To</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-medium">{ticket.assignedTo.name}</div>
                                            <div className="text-sm text-muted-foreground">{ticket.assignedTo.email}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Satisfaction Rating */}
                        {ticket.satisfaction_rating && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Your Rating</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-1 mb-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`h-4 w-4 ${
                                                    star <= ticket.satisfaction_rating!
                                                        ? 'text-yellow-400 fill-current'
                                                        : 'text-gray-300'
                                                }`}
                                            />
                                        ))}
                                        <span className="ml-2 text-sm text-muted-foreground">
                                            {ticket.satisfaction_rating}/5
                                        </span>
                                    </div>
                                    {ticket.satisfaction_feedback && (
                                        <p className="text-sm text-muted-foreground">
                                            "{ticket.satisfaction_feedback}"
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Close Ticket Modal */}
                {showCloseForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <Card className="w-full max-w-md">
                            <CardHeader>
                                <CardTitle>Close Ticket</CardTitle>
                                <CardDescription>
                                    Please rate your experience and provide feedback
                                </CardDescription>
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
                                                    className="p-1"
                                                >
                                                    <Star
                                                        className={`h-6 w-6 ${
                                                            star <= closeData.satisfaction_rating
                                                                ? 'text-yellow-400 fill-current'
                                                                : 'text-gray-300'
                                                        }`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">Feedback (Optional)</label>
                                        <Textarea
                                            placeholder="Tell us about your experience..."
                                            value={closeData.satisfaction_feedback}
                                            onChange={(e) => setCloseData('satisfaction_feedback', e.target.value)}
                                            rows={3}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <Button type="submit" disabled={closeProcessing} className="flex-1">
                                            {closeProcessing ? 'Closing...' : 'Close Ticket'}
                                        </Button>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={() => setShowCloseForm(false)}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Reopen Ticket Modal */}
                {showReopenForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <Card className="w-full max-w-md">
                            <CardHeader>
                                <CardTitle>Reopen Ticket</CardTitle>
                                <CardDescription>
                                    Please provide a reason for reopening this ticket
                                </CardDescription>
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

                                    <div className="flex gap-2 pt-4">
                                        <Button type="submit" disabled={reopenProcessing || !reopenData.reason.trim()} className="flex-1">
                                            {reopenProcessing ? 'Reopening...' : 'Reopen Ticket'}
                                        </Button>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={() => setShowReopenForm(false)}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
