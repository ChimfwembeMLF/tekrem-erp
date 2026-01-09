import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import { 
    CreditCard, 
    ArrowLeft,
    FileText,
    Calendar,
    DollarSign,
    Hash,
    CheckCircle,
    Clock,
    XCircle
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Payment {
    id: number;
    amount: number;
    payment_date: string;
    payment_method: string;
    reference_number?: string;
    status: string;
    notes?: string;
    invoice?: {
        id: number;
        invoice_number: string;
        total_amount: number;
    };
    payment_method_details?: {
        type: string;
        last_four?: string;
        brand?: string;
    };
    created_at: string;
    updated_at: string;
}

interface Props {
    payment: Payment;
}

export default function Show({ payment }: Props) {
    const route = useRoute();

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'pending':
                return <Clock className="h-5 w-5 text-yellow-600" />;
            case 'failed':
                return <XCircle className="h-5 w-5 text-red-600" />;
            default:
                return <CreditCard className="h-5 w-5" />;
        }
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
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'ZMW',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatPaymentMethod = (method: string) => {
        return method.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    return (
        <CustomerLayout>
            <Head title={`Payment #${payment.id}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('customer.finance.payments')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Payments
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Payment Details</h1>
                            <p className="text-muted-foreground">
                                Payment #{payment.id}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <Badge variant={getStatusVariant(payment.status)}>
                            {payment.status}
                        </Badge>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Payment Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Payment Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Amount</label>
                                    <div className="text-2xl font-bold">{formatCurrency(payment.amount)}</div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                                    <div className="mt-1">
                                        <Badge variant={getStatusVariant(payment.status)}>
                                            {payment.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Payment Date
                                    </span>
                                    <span>{formatDate(payment.payment_date)}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <CreditCard className="h-4 w-4" />
                                        Payment Method
                                    </span>
                                    <span>{formatPaymentMethod(payment.payment_method)}</span>
                                </div>

                                {payment.reference_number && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <Hash className="h-4 w-4" />
                                            Reference Number
                                        </span>
                                        <span className="font-mono text-sm">{payment.reference_number}</span>
                                    </div>
                                )}

                                {payment.payment_method_details && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-muted-foreground">
                                            Card Details
                                        </span>
                                        <span>
                                            {payment.payment_method_details.brand} ****{payment.payment_method_details.last_four}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {payment.notes && (
                                <>
                                    <Separator />
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Notes</label>
                                        <p className="mt-1 text-sm">{payment.notes}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Related Invoice */}
                    {payment.invoice && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Related Invoice
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <div className="font-medium">{payment.invoice.invoice_number}</div>
                                        <div className="text-sm text-muted-foreground">
                                            Total: {formatCurrency(payment.invoice.total_amount)}
                                        </div>
                                    </div>
                                    <Link href={route('customer.finance.invoices.show', payment.invoice.id)}>
                                        <Button variant="outline" size="sm">
                                            View Invoice
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Payment Timeline */}
                    <Card className={payment.invoice ? '' : 'lg:col-span-2'}>
                        <CardHeader>
                            <CardTitle>Payment Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-secondary rounded-full">
                                        <CheckCircle className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="font-medium">Payment Created</div>
                                        <div className="text-sm text-muted-foreground">
                                            {formatDate(payment.created_at)}
                                        </div>
                                    </div>
                                </div>

                                {payment.status === 'completed' && (
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 rounded-full">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium">Payment Completed</div>
                                            <div className="text-sm text-muted-foreground">
                                                {formatDate(payment.payment_date)}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {payment.status === 'failed' && (
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-100 rounded-full">
                                            <XCircle className="h-4 w-4 text-red-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium">Payment Failed</div>
                                            <div className="text-sm text-muted-foreground">
                                                {formatDate(payment.updated_at)}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </CustomerLayout>
    );
}
