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
    DollarSign, 
    Search,
    Eye,
    Download,
    AlertCircle,
    CheckCircle,
    Clock,
    ArrowLeft
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Invoice {
    id: number;
    invoice_number: string;
    invoice_date: string;
    due_date: string;
    status: string;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    description?: string;
    created_at: string;
}

interface PaginationData {
    data: Invoice[];
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
    invoices: PaginationData;
    filters: Filters;
}

export default function Index({ invoices, filters }: Props) {
    const route = useRoute();

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const search = formData.get('search') as string;

        router.get(route('customer.finance.invoices'), {
            ...filters,
            search: search || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleStatusFilter = (status: string) => {
        router.get(route('customer.finance.invoices'), {
            ...filters,
            status: status === 'all' ? undefined : status,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid':
                return <CheckCircle className="h-4 w-4" />;
            case 'pending':
                return <Clock className="h-4 w-4" />;
            case 'overdue':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'paid':
                return 'secondary';
            case 'pending':
                return 'default';
            case 'overdue':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl\.NumberFormat\('en-ZM', {
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

    const isOverdue = (dueDate: string, status: string) => {
        return status !== 'paid' && new Date(dueDate) < new Date();
    };

    return (
        <CustomerLayout>
            <Head title="My Invoices" />

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
                            <h1 className="text-3xl font-bold tracking-tight">My Invoices</h1>
                            <p className="text-muted-foreground">
                                View and manage all your invoices
                            </p>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Invoices</CardTitle>
                        <CardDescription>Complete list of your invoices</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <form onSubmit={handleSearch} className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        name="search"
                                        placeholder="Search invoices..."
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
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="overdue">Overdue</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Invoices List */}
                        <div className="space-y-4">
                            {invoices.data.length > 0 ? (
                                invoices.data.map((invoice) => (
                                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-secondary rounded-lg">
                                                {getStatusIcon(invoice.status)}
                                            </div>
                                            <div>
                                                <div className="font-medium">{invoice.invoice_number}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Due: {formatDate(invoice.due_date)}
                                                    {isOverdue(invoice.due_date, invoice.status) && (
                                                        <span className="text-destructive ml-2">(Overdue)</span>
                                                    )}
                                                </div>
                                                {invoice.description && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {invoice.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="font-medium">{formatCurrency(invoice.total_amount)}</div>
                                                <Badge variant={getStatusVariant(invoice.status)}>
                                                    {invoice.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link href={route('customer.finance.invoices.show', invoice.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={route('customer.finance.invoices.download', invoice.id)}>
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
                                    <p>No invoices found</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {invoices.data.length > 0 && invoices.last_page > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <div className="text-sm text-muted-foreground">
                                    Showing {invoices.from} to {invoices.to} of {invoices.total} invoices
                                </div>
                                <div className="flex items-center space-x-2">
                                    {invoices.links.map((link, index) => (
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
