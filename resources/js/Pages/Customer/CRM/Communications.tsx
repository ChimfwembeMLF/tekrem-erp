import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { 
    ArrowLeft,
    Search,
    Filter,
    Eye,
    Mail,
    Phone,
    MessageSquare,
    Calendar,
    User,
    Clock,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Communication {
    id: number;
    type: string;
    subject: string;
    content: string;
    created_at: string;
    user: {
        name: string;
        email: string;
    };
    communicable_type: string;
    communicable_id: number;
    attachments_count?: number;
}

interface Client {
    id: number;
    name: string;
    email: string;
    status: string;
}

interface PaginationData {
    data: Communication[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Props {
    communications: PaginationData;
    client: Client | null;
    filters: {
        type?: string;
        search?: string;
        date_from?: string;
        date_to?: string;
    };
}

export default function Communications({ communications, client, filters }: Props) {
    const route = useRoute();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getCommunicationTypeIcon = (type: string) => {
        switch (type) {
            case 'email':
                return <Mail className="h-4 w-4" />;
            case 'phone':
                return <Phone className="h-4 w-4" />;
            case 'meeting':
                return <Calendar className="h-4 w-4" />;
            default:
                return <MessageSquare className="h-4 w-4" />;
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

    const handleFilter = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        if (!value) {
            delete newFilters[key];
        }
        router.get(route('customer.crm.communications'), newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearch = (search: string) => {
        handleFilter('search', search);
    };

    return (
        <CustomerLayout>
            <Head title="Communication History" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('customer.crm.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Account
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Communication History</h1>
                            <p className="text-muted-foreground">
                                View all your communications and interactions
                            </p>
                        </div>
                    </div>
                </div>

                {/* Client Info */}
                {client && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-medium">{client.name}</h3>
                                    <p className="text-sm text-muted-foreground">{client.email}</p>
                                </div>
                                <Badge variant="secondary" className="ml-auto">
                                    {client.status}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search communications..."
                                        value={filters.search || ''}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div>
                                <Select value={filters.type || ''} onValueChange={(value) => handleFilter('type', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Types</SelectItem>
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="phone">Phone</SelectItem>
                                        <SelectItem value="meeting">Meeting</SelectItem>
                                        <SelectItem value="note">Note</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Input
                                    type="date"
                                    placeholder="From Date"
                                    value={filters.date_from || ''}
                                    onChange={(e) => handleFilter('date_from', e.target.value)}
                                />
                            </div>

                            <div>
                                <Input
                                    type="date"
                                    placeholder="To Date"
                                    value={filters.date_to || ''}
                                    onChange={(e) => handleFilter('date_to', e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Communications List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Communications</CardTitle>
                        <CardDescription>
                            Showing {communications.from || 0} to {communications.to || 0} of {communications.total} communications
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {communications.data.length > 0 ? (
                                communications.data.map((communication) => (
                                    <div key={communication.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-secondary rounded-lg">
                                                {getCommunicationTypeIcon(communication.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-medium">{communication.subject}</h4>
                                                    {getCommunicationTypeBadge(communication.type)}
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {communication.content.substring(0, 150)}
                                                    {communication.content.length > 150 && '...'}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        {communication.user.name}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDate(communication.created_at)}
                                                    </div>
                                                    {communication.attachments_count && communication.attachments_count > 0 && (
                                                        <div className="flex items-center gap-1">
                                                            <span>{communication.attachments_count} attachment(s)</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <Link href={route('customer.crm.communications.show', communication.id)}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <MessageSquare className="mx-auto h-12 w-12 mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No Communications Found</h3>
                                    <p>No communications match your current filters.</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {communications.last_page > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <div className="text-sm text-muted-foreground">
                                    Showing {communications.from} to {communications.to} of {communications.total} results
                                </div>
                                <div className="flex items-center space-x-2">
                                    {communications.links.map((link, index) => {
                                        if (link.label === '&laquo; Previous') {
                                            return (
                                                <Button
                                                    key={index}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.get(link.url)}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                            );
                                        }
                                        if (link.label === 'Next &raquo;') {
                                            return (
                                                <Button
                                                    key={index}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.get(link.url)}
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            );
                                        }
                                        if (link.label !== '...' && !isNaN(Number(link.label))) {
                                            return (
                                                <Button
                                                    key={index}
                                                    variant={link.active ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => link.url && router.get(link.url)}
                                                >
                                                    {link.label}
                                                </Button>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </CustomerLayout>
    );
}
