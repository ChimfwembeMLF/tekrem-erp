import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import useRoute from '@/Hooks/useRoute';
import {
    ArrowLeft,
    Download,
    CreditCard,
    Calendar,
    FileText,
    DollarSign,
    Building,
    User,
    Mail,
    Phone,
} from 'lucide-react';

interface InvoiceItem {
    id: number;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number; // fixed: was "total"
}

interface Company {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    logo?: string;
}

interface Payment {
    id: number;
    amount: number | string;
    payment_date: string;
    payment_method: string;
    reference_number?: string;
    reference?: string;
    account_type?: string;
    account_name?: string;
    account?: {
        name: string;
        type: string;
    };
}

interface Invoice {
    id: number;
    invoice_number: string;
    status: string;
    issue_date: string;
    due_date: string;
    subtotal: number | string;
    tax_amount: number | string;
    discount_amount?: number | string;
    total_amount: number | string;
    paid_amount: number | string;
    balance?: number | string;
    currency?: string;
    notes?: string;
    terms?: string;
    client: {
        name: string;
        email: string;
        phone?: string;
        address?: string;
        city?: string;
        state?: string;
        zip?: string;
        country?: string;
    };
    items: InvoiceItem[];
    payments: Payment[];
}

interface Props {
    invoice: Invoice;
    company: Company;
}

export default function Show({ invoice, company }: Props) {
    const route = useRoute();

    const safeNumber = (val: any): number => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') return parseFloat(val) || 0;
        return 0;
    };

    // Compute balance in case the backend doesn't send it
    const balance =
        safeNumber(invoice.balance) ||
        safeNumber(invoice.total_amount) - safeNumber(invoice.paid_amount);

    const formatCurrency = (amount: number | string) =>
        new Intl.NumberFormat('en-ZM', {
            style: 'currency',
            currency: invoice.currency || 'ZMW',
        }).format(safeNumber(amount));

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'paid':     return 'secondary';
            case 'pending':  return 'default';
            case 'overdue':  return 'destructive';
            case 'draft':    return 'outline';
            default:         return 'outline';
        }
    };

    // const handleDownloadPDF = () => {
    //     window.open(route('customer.finance.invoices.download', invoice.id), '_blank');
    // };

    const handlePrintInvoice = () => {
        window.open(route('customer.finance.invoices.print', invoice.id), '_blank');
    };

    const handlePayNow = () => {
        router.visit(route('customer.finance.invoices.pay', invoice.id));
    };

    const lightPageStyle: React.CSSProperties = {
        ['--background' as any]: '0 0% 100%',
        ['--foreground' as any]: '240 10% 3.9%',
        ['--card' as any]: '0 0% 100%',
        ['--card-foreground' as any]: '240 10% 3.9%',
        ['--popover' as any]: '0 0% 100%',
        ['--popover-foreground' as any]: '240 10% 3.9%',
        ['--muted' as any]: '240 4.8% 95.9%',
        ['--muted-foreground' as any]: '240 3.8% 46.1%',
        ['--border' as any]: '240 5.9% 90%',
        ['--input' as any]: '240 5.9% 90%',
    };

    return (
        <CustomerLayout>
            <Head title={`Invoice ${invoice.invoice_number}`} />

            <div className="space-y-6">

                {/* ── PAGE HEADER ── */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('customer.finance.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Finance
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold tracking-tight">
                                    Invoice {invoice.invoice_number}
                                </h1>
                                <Badge variant={getStatusVariant(invoice.status)}>
                                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground">
                                Issued on {formatDate(invoice.issue_date)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handlePrintInvoice}>
                            <FileText className="h-4 w-4 mr-2" />
                            Print View
                        </Button>
                        {/* <Button variant="outline" onClick={handleDownloadPDF}>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                        </Button> */}
                        {invoice.status !== 'paid' && balance > 0 && (
                            <Button onClick={handlePayNow}>
                                <CreditCard className="h-4 w-4 mr-2" />
                                Pay Now
                            </Button>
                        )}
                    </div>
                </div>

                {/* ── OVERVIEW CARDS ── */}
                <div className="grid gap-6 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(invoice.total_amount)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(invoice.paid_amount)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Balance Due</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Due Date</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold">{formatDate(invoice.due_date)}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">

                    {/* ── MAIN CONTENT ── */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    {company.logo && (
                                        <img
                                            src={company.logo}
                                            alt={company.name || 'Company Logo'}
                                            className="h-16 w-auto"
                                        />
                                    )}
                                    <div className="text-right">
                                        <CardTitle>Invoice Details</CardTitle>
                                        <CardDescription>
                                            Complete breakdown of charges and services
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                {/* From / Bill To */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                                            <Building className="h-4 w-4" />
                                            From
                                        </h4>
                                        <div className="text-sm space-y-1">
                                            <p className="font-medium">{company.name}</p>
                                            {company.address && <p>{company.address}</p>}
                                            {(company.city || company.state || company.zip) && (
                                                <p>{[company.city, company.state, company.zip].filter(Boolean).join(', ')}</p>
                                            )}
                                            {company.country && <p>{company.country}</p>}
                                            {company.email && (
                                                <p className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    {company.email}
                                                </p>
                                            )}
                                            {company.phone && (
                                                <p className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {company.phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Bill To
                                        </h4>
                                        <div className="text-sm space-y-1">
                                            <p className="font-medium">{invoice.client?.name || 'No client'}</p>
                                            {invoice.client?.address && <p>{invoice.client.address}</p>}
                                            {(invoice.client?.city || invoice.client?.state || invoice.client?.zip) && (
                                                <p>
                                                    {[invoice.client?.city, invoice.client?.state, invoice.client?.zip]
                                                        .filter(Boolean).join(', ')}
                                                </p>
                                            )}
                                            {invoice.client?.country && <p>{invoice.client.country}</p>}
                                            <p className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {invoice.client?.email || 'No email'}
                                            </p>
                                            {invoice.client?.phone && (
                                                <p className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {invoice.client.phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <Separator className="my-6" />

                                {/* Items table */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold">Items</h4>
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-muted">
                                                <tr>
                                                    <th className="text-left p-3 font-medium">Description</th>
                                                    <th className="text-right p-3 font-medium">Qty</th>
                                                    <th className="text-right p-3 font-medium">Unit Price</th>
                                                    <th className="text-right p-3 font-medium">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invoice.items.map((item) => (
                                                    <tr key={item.id} className="border-t">
                                                        <td className="p-3">{item.description}</td>
                                                        <td className="p-3 text-right">{item.quantity}</td>
                                                        <td className="p-3 text-right">{formatCurrency(item.unit_price)}</td>
                                                        <td className="p-3 text-right font-medium">
                                                            {formatCurrency(item.total_price)} {/* fixed */}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Totals */}
                                    <div className="flex justify-end">
                                        <div className="w-64 space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Subtotal</span>
                                                <span>{formatCurrency(invoice.subtotal)}</span>
                                            </div>
                                            {safeNumber(invoice.tax_amount) > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">VAT (16%)</span>
                                                    <span>{formatCurrency(invoice.tax_amount)}</span>
                                                </div>
                                            )}
                                            {safeNumber(invoice.discount_amount) > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Discount</span>
                                                    <span>-{formatCurrency(invoice.discount_amount!)}</span>
                                                </div>
                                            )}
                                            <Separator />
                                            <div className="flex justify-between font-bold text-base">
                                                <span>Total</span>
                                                <span>{formatCurrency(invoice.total_amount)}</span>
                                            </div>
                                            {safeNumber(invoice.paid_amount) > 0 && (
                                                <>
                                                    <div className="flex justify-between text-green-600">
                                                        <span>Paid</span>
                                                        <span>-{formatCurrency(invoice.paid_amount)}</span>
                                                    </div>
                                                    <Separator />
                                                    <div className="flex justify-between font-bold text-base">
                                                        <span>Balance Due</span>
                                                        <span className={balance <= 0 ? 'text-green-600' : 'text-destructive'}>
                                                            {formatCurrency(balance)}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Notes & Terms */}
                                {(invoice.notes || invoice.terms) && (
                                    <>
                                        <Separator className="my-6" />
                                        <div className="space-y-4">
                                            {invoice.notes && (
                                                <div>
                                                    <h4 className="font-semibold mb-2">Notes</h4>
                                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                        {invoice.notes}
                                                    </p>
                                                </div>
                                            )}
                                            {invoice.terms && (
                                                <div>
                                                    <h4 className="font-semibold mb-2">Terms & Conditions</h4>
                                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                        {invoice.terms}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* ── SIDEBAR ── */}
                    <div className="space-y-6">

                        {/* Payment History */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment History</CardTitle>
                                <CardDescription>All payments made for this invoice</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {invoice.payments.length > 0 ? (
                                        invoice.payments.map((payment) => (
                                            <div key={payment.id} className="p-3 border rounded-lg">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-medium">{formatCurrency(payment.amount)}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {formatDate(payment.payment_date)}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-muted-foreground space-y-0.5">
                                                    <p>Method: {payment.payment_method}</p>
                                                    {(payment.account_type ?? payment.account?.type) && (
                                                        <p>Account Type: {payment.account_type ?? payment.account?.type}</p>
                                                    )}
                                                    {(payment.account_name ?? payment.account?.name) && (
                                                        <p>Account: {payment.account_name ?? payment.account?.name}</p>
                                                    )}
                                                    {(payment.reference_number ?? payment.reference) && (
                                                        <p>Ref: {payment.reference_number ?? payment.reference}</p>
                                                    )}
                                                </div>
                                                <Link href={route('customer.finance.payments.show', payment.id)}>
                                                    <Button variant="outline" size="sm" className="mt-2 w-full">
                                                        View Payment
                                                    </Button>
                                                </Link>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-muted-foreground py-4">
                                            No payments recorded yet.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {/* <Button variant="outline" className="w-full justify-start" onClick={handleDownloadPDF}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download PDF
                                </Button> */}
                                <Link href={route('customer.communications.create')} className="block">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Mail className="mr-2 h-4 w-4" />
                                        Contact Support
                                    </Button>
                                </Link>
                                <Link href={route('customer.support.create')} className="block">
                                    <Button variant="outline" className="w-full justify-start">
                                        <FileText className="mr-2 h-4 w-4" />
                                        Report Issue
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}