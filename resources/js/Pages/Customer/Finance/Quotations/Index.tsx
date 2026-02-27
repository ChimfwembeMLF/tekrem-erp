import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { 
    FileText, 
    Search,
    Eye,
    Download,
    ArrowLeft,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Quotation {
    id: number;
    quotation_number: string;
    quotation_date: string;
    valid_until: string;
    status: string;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    description?: string;
    created_at: string;
}

interface PaginationData {
    data: Quotation[];
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

interface Filters {
    status?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
}

interface Props {
    quotations: PaginationData;
    filters: Filters;
}

export default function Index({ quotations, filters }: Props) {
    const route = useRoute();

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const search = formData.get('search') as string;

        router.get(route('customer.finance.quotations'), {
            ...filters,
            search: search || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleStatusFilter = (status: string) => {
        router.get(route('customer.finance.quotations'), {
            ...filters,
            status: status === 'all' ? undefined : status,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'accepted':
                return <CheckCircle className="h-4 w-4" />;
            case 'pending':
                return <Clock className="h-4 w-4" />;
            case 'rejected':
                return <XCircle className="h-4 w-4" />;
            case 'expired':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'accepted':
                return 'secondary';
            case 'pending':
                return 'default';
            case 'rejected':
                return 'destructive';
            case 'expired':
                return 'outline';
            default:
                return 'outline';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZM', {
            style: 'currency',
            currency: 'ZMW',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const isExpired = (validUntil: string, status: string) => {
        return status === 'pending' && new Date(validUntil) < new Date();
    };

    const handleAcceptQuotation = (quotationId: number) => {
        router.post(route('customer.finance.quotations.accept', quotationId), {}, {
            preserveScroll: true,
        });
    };

    return (
        <CustomerLayout>
            <Head title="My Quotations" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('customer.finance.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Finance
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">My Quotations</h1>
                            <p className="text-muted-foreground">
                                View and manage your quotation requests
                            </p>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Quotations</CardTitle>
                        <CardDescription>Complete list of your quotations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <form onSubmit={handleSearch} className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        name="search"
                                        placeholder="Search quotations..."
                                        defaultValue={filters.search || ''}
                                        className="pl-10"
                                    />
                                </div>
                            </form>
                            <Select
                                value={filters.status || 'all'}
                                onValueChange={handleStatusFilter}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="accepted">Accepted</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Quotations List */}
                        <div className="space-y-4">
                            {quotations.data.length > 0 ? (
                                quotations.data.map((quotation) => (
                                    <div key={quotation.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-secondary rounded-lg">
                                                {getStatusIcon(quotation.status)}
                                            </div>
                                            <div>
                                                <div className="font-medium">{quotation.quotation_number}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Valid until: {formatDate(quotation.valid_until)}
                                                    {isExpired(quotation.valid_until, quotation.status) && (
                                                        <span className="text-destructive ml-2">(Expired)</span>
                                                    )}
                                                </div>
                                                {quotation.description && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {quotation.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="font-medium">{formatCurrency(quotation.total_amount)}</div>
                                                <Badge variant={getStatusVariant(quotation.status)}>
                                                    {quotation.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {quotation.status === 'pending' && !isExpired(quotation.valid_until, quotation.status) && (
                                                    <Button 
                                                        size="sm"
                                                        onClick={() => handleAcceptQuotation(quotation.id)}
                                                    >
                                                        Accept
                                                    </Button>
                                                )}
                                                <Link href={route('customer.finance.quotations.show', quotation.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={route('customer.finance.quotations.download', quotation.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <FileText className="mx-auto h-8 w-8 mb-2" />
                                    <p>No quotations found</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {quotations.data.length > 0 && quotations.last_page > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <div className="text-sm text-muted-foreground">
                                    Showing {quotations.from} to {quotations.to} of {quotations.total} quotations
                                </div>
                                <div className="flex items-center space-x-2">
                                    {quotations.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </CustomerLayout>
    );
}
