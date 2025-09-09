import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import { 
    ArrowLeft,
    Mail,
    Phone,
    MessageSquare,
    Calendar,
    User,
    Clock,
    Paperclip,
    Download,
    Building
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Communication {
    id: number;
    type: string;
    subject: string;
    content: string;
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
    communicable_type: string;
    communicable_id: number;
    communicable?: {
        id: number;
        name: string;
        email: string;
        company?: string;
    };
    attachments?: Array<{
        id: number;
        filename: string;
        original_name: string;
        size: number;
        mime_type: string;
        created_at: string;
    }>;
}

interface Client {
    id: number;
    name: string;
    email: string;
    company?: string;
    status: string;
}

interface Props {
    communication: Communication;
    client: Client | null;
}

export default function ShowCommunication({ communication, client }: Props) {
    const route = useRoute();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getCommunicationTypeIcon = (type: string) => {
        switch (type) {
            case 'email':
                return <Mail className="h-5 w-5" />;
            case 'phone':
                return <Phone className="h-5 w-5" />;
            case 'meeting':
                return <Calendar className="h-5 w-5" />;
            default:
                return <MessageSquare className="h-5 w-5" />;
        }
    };

    const getCommunicationTypeBadge = (type: string) => {
        switch (type) {
            case 'email':
                return <Badge variant="secondary">Email</Badge>;
            case 'phone':
                return <Badge variant="outline">Phone</Badge>;
            case 'meeting':
                return <Badge variant="default">Meeting</Badge>;
            default:
                return <Badge variant="secondary">{type}</Badge>;
        }
    };

    return (
        <CustomerLayout>
            <Head title={`Communication: ${communication.subject}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Link href={route('customer.crm.communications')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Communications
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Communication Details</h1>
                        <p className="text-muted-foreground">
                            View communication information and content
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Communication Content */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-secondary rounded-lg">
                                            {getCommunicationTypeIcon(communication.type)}
                                        </div>
                                        <div>
                                            <CardTitle>{communication.subject}</CardTitle>
                                            <CardDescription>
                                                {formatDate(communication.created_at)}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    {getCommunicationTypeBadge(communication.type)}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="prose max-w-none">
                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                        {communication.content}
                                    </div>
                                </div>

                                {communication.attachments && communication.attachments.length > 0 && (
                                    <>
                                        <Separator className="my-6" />
                                        <div>
                                            <h4 className="font-medium mb-3 flex items-center gap-2">
                                                <Paperclip className="h-4 w-4" />
                                                Attachments ({communication.attachments.length})
                                            </h4>
                                            <div className="space-y-2">
                                                {communication.attachments.map((attachment) => (
                                                    <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-secondary rounded">
                                                                <Paperclip className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-sm">{attachment.original_name}</div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {formatFileSize(attachment.size)} • {attachment.mime_type}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button variant="outline" size="sm">
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Communication Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Communication Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Type</div>
                                    <div className="mt-1">
                                        {getCommunicationTypeBadge(communication.type)}
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Created</div>
                                    <div className="text-sm mt-1">{formatDate(communication.created_at)}</div>
                                </div>

                                {communication.updated_at !== communication.created_at && (
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
                                        <div className="text-sm mt-1">{formatDate(communication.updated_at)}</div>
                                    </div>
                                )}

                                <Separator />

                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Staff Member</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                                            <User className="h-3 w-3" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">{communication.user.name}</div>
                                            <div className="text-xs text-muted-foreground">{communication.user.email}</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Client Info */}
                        {client && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Client Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-medium">{client.name}</div>
                                            <div className="text-sm text-muted-foreground">{client.email}</div>
                                        </div>
                                    </div>

                                    {client.company && (
                                        <>
                                            <Separator />
                                            <div className="flex items-center gap-2">
                                                <Building className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">{client.company}</span>
                                            </div>
                                        </>
                                    )}

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Status</span>
                                        <Badge variant="secondary">{client.status}</Badge>
                                    </div>

                                    <div className="pt-2">
                                        <Link href={route('customer.crm.profile')}>
                                            <Button variant="outline" size="sm" className="w-full">
                                                View Profile
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Related Communication */}
                        {communication.communicable && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5" />
                                        Related To
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                                            {communication.communicable_type.includes('Client') ? (
                                                <Building className="h-4 w-4" />
                                            ) : (
                                                <User className="h-4 w-4" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">{communication.communicable.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {communication.communicable_type.includes('Client') ? 'Client' : 'User'}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
