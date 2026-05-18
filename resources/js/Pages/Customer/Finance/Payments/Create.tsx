import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { ArrowLeft, CreditCard, FileText } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Account {
    id: number;
    name: string;
    currency: string;
    type: string;
}

interface InvoiceSummary {
    id: number;
    invoice_number: string;
    currency: string;
    total_amount: number;
    paid_amount: number;
    balance_due: number;
    client_name?: string;
}

interface Props {
    invoice: InvoiceSummary;
    accounts: Account[];
    defaultAccountId?: number | null;
    paymentMethods: Record<string, string>;
}

export default function Create({ invoice, accounts, defaultAccountId = null, paymentMethods }: Props) {
    const route = useRoute();

    const { data, setData, post, processing, errors } = useForm({
        account_id: defaultAccountId ? String(defaultAccountId) : '',
        amount: invoice.balance_due.toFixed(2),
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: '',
        reference_number: '',
        notes: '',
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZM', {
            style: 'currency',
            currency: invoice.currency || 'ZMW',
        }).format(amount);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('customer.finance.invoices.pay.store', invoice.id));
    };

    return (
        <CustomerLayout>
            <Head title={`Pay Invoice ${invoice.invoice_number}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('customer.finance.invoices.show', invoice.id)}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Invoice
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Pay Invoice {invoice.invoice_number}</h1>
                        <p className="text-muted-foreground">Submit a payment request for this invoice.</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Invoice Summary
                            </CardTitle>
                            <CardDescription>Review invoice amounts before submitting payment.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Invoice</span>
                                <span className="font-medium">{invoice.invoice_number}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Customer</span>
                                <span className="font-medium">{invoice.client_name || 'Client'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Total</span>
                                <span>{formatCurrency(invoice.total_amount)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Paid</span>
                                <span>{formatCurrency(invoice.paid_amount)}</span>
                            </div>
                            <div className="flex items-center justify-between border-t pt-2 text-base font-bold">
                                <span>Balance Due</span>
                                <span>{formatCurrency(invoice.balance_due)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Payment Details
                            </CardTitle>
                            <CardDescription>Payment will be created as pending for confirmation.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="account_id">Receive Account</Label>
                                    <Select value={data.account_id} onValueChange={(value) => setData('account_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select account" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accounts.map((account) => (
                                                <SelectItem key={account.id} value={account.id.toString()}>
                                                    {account.name} ({account.type})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.account_id ? <p className="text-sm text-red-600">{errors.account_id}</p> : null}
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Amount</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={data.amount}
                                            onChange={(e) => setData('amount', e.target.value)}
                                        />
                                        {errors.amount ? <p className="text-sm text-red-600">{errors.amount}</p> : null}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="payment_date">Payment Date</Label>
                                        <Input
                                            id="payment_date"
                                            type="date"
                                            value={data.payment_date}
                                            onChange={(e) => setData('payment_date', e.target.value)}
                                        />
                                        {errors.payment_date ? <p className="text-sm text-red-600">{errors.payment_date}</p> : null}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="payment_method">Payment Method</Label>
                                    <Select value={data.payment_method} onValueChange={(value) => setData('payment_method', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select payment method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(paymentMethods).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.payment_method ? <p className="text-sm text-red-600">{errors.payment_method}</p> : null}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reference_number">Reference Number</Label>
                                    <Input
                                        id="reference_number"
                                        value={data.reference_number}
                                        onChange={(e) => setData('reference_number', e.target.value)}
                                        placeholder="Optional transaction reference"
                                    />
                                    {errors.reference_number ? <p className="text-sm text-red-600">{errors.reference_number}</p> : null}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Optional note for finance team"
                                        rows={3}
                                    />
                                    {errors.notes ? <p className="text-sm text-red-600">{errors.notes}</p> : null}
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <Link href={route('customer.finance.invoices.show', invoice.id)}>
                                        <Button type="button" variant="outline">Cancel</Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Submitting...' : 'Submit Payment Request'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </CustomerLayout>
    );
}
