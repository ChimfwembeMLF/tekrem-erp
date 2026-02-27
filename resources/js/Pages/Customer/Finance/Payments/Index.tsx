import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { 
    CreditCard, 
    Search,
    Eye,
    ArrowLeft,
    CheckCircle
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Payment {
    id: number;
    amount: number;
    payment_date: string;
    payment_method: string;
    reference_number?: string;
    status: string;
    invoice?: {
        id: number;
        invoice_number: string;
    };
    created_at: string;
}

interface PaginationData {
    data: Payment[];
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
    payment_method?: string;
    date_from?: string;
    date_to?: string;
}

interface Props {
    payments: PaginationData;
    filters: Filters;
}

export default function Index({ payments, filters }: Props) {
    const route = useRoute();

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const search = formData.get('search') as string;

        router.get(route('customer.finance.payments'), {
            ...filters,
            search: search || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleStatusFilter = (status: string) => {
        router.get(route('customer.finance.payments'), {
            ...filters,
            status: status === 'all' ? undefined : status,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleMethodFilter = (method: string) => {
        router.get(route('customer.finance.payments'), {
            ...filters,
            payment_method: method === 'all' ? undefined : method,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'completed':
                return 'secondary';
            case 'pending':
                return 'default';
            case 'failed':
                return 'destructive';
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
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <CustomerLayout>
            <Head title="Payment History" />

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
                            <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
                            <p className="text-muted-foreground">
                                View all your payment transactions
                            </p>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Payments</CardTitle>
                        <CardDescription>Complete history of your payments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <form onSubmit={handleSearch} className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        name="search"
                                        placeholder="Search payments..."
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
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.payment_method || 'all'}
                                onValueChange={handleMethodFilter}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Payment method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Methods</SelectItem>
                                    <SelectItem value="credit_card">Credit Card</SelectItem>
                                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                    <SelectItem value="paypal">PayPal</SelectItem>
                                    <SelectItem value="cash">Cash</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Payments List */}
                        <div className="space-y-4">
                            {payments.data.length > 0 ? (
                                payments.data.map((payment) => (
                                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-secondary rounded-lg">
                                                <CreditCard className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="font-medium">{formatCurrency(payment.amount)}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {payment.invoice?.invoice_number || 'Direct Payment'}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {formatDate(payment.payment_date)} • {payment.payment_method}
                                                </div>
                                                {payment.reference_number && (
                                                    <div className="text-xs text-muted-foreground">
                                                        Ref: {payment.reference_number}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge variant={getStatusVariant(payment.status)}>
                                                {payment.status}
                                            </Badge>
                                            <Link href={route('customer.finance.payments.show', payment.id)}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <CreditCard className="mx-auto h-8 w-8 mb-2" />
                                    <p>No payments found</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {payments.data.length > 0 && payments.last_page > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <div className="text-sm text-muted-foreground">
                                    Showing {payments.from} to {payments.to} of {payments.total} payments
                                </div>
                                <div className="flex items-center space-x-2">
                                    {payments.links.map((link, index) => (
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
