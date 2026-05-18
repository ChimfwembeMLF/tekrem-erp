import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, CalendarClock, Mail, MessageSquare, Phone, User } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface CommunicationUser {
    id: number;
    name: string;
    email?: string;
}

interface CommunicationEntity {
    id: number;
    name?: string;
    title?: string;
}

interface Communication {
    id: number;
    type: string;
    subject: string;
    content: string;
    status: string;
    priority?: string;
    direction?: string;
    created_at: string;
    updated_at: string;
    communication_date?: string;
    scheduled_at?: string;
    user?: CommunicationUser;
    communicable?: CommunicationEntity;
}

interface Props {
    communication: Communication;
}

function getTypeIcon(type: string) {
    switch (type) {
        case 'email':
            return <Mail className="h-4 w-4" />;
        case 'call':
        case 'phone':
            return <Phone className="h-4 w-4" />;
        default:
            return <MessageSquare className="h-4 w-4" />;
    }
}

function formatDate(dateValue?: string) {
    if (!dateValue) return 'N/A';
    return new Date(dateValue).toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function Show({ communication }: Props) {
    const route = useRoute();

    return (
        <CustomerLayout>
            <Head title={communication.subject || 'Communication'} />

            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href={route('customer.communications.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{communication.subject}</h1>
                            <p className="text-sm text-muted-foreground">Communication details</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                            {communication.type}
                        </Badge>
                        <Badge variant="secondary" className="capitalize">
                            {communication.status?.replace('_', ' ')}
                        </Badge>
                        {communication.priority && (
                            <Badge className="capitalize">{communication.priority}</Badge>
                        )}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {getTypeIcon(communication.type)}
                            Request Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Created</p>
                                <p className="text-sm font-medium">{formatDate(communication.created_at)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Updated</p>
                                <p className="text-sm font-medium">{formatDate(communication.updated_at)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Direction</p>
                                <p className="text-sm font-medium capitalize">{communication.direction || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Scheduled</p>
                                <p className="text-sm font-medium flex items-center gap-1">
                                    <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                                    {formatDate(communication.scheduled_at || communication.communication_date)}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Message</p>
                            <div className="rounded-lg border bg-muted/40 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                                {communication.content}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Submitted By</p>
                                <p className="text-sm font-medium flex items-center gap-1">
                                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                                    {communication.user?.name || 'You'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Related Entity</p>
                                <p className="text-sm font-medium">
                                    {communication.communicable?.name || communication.communicable?.title || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </CustomerLayout>
    );
}
