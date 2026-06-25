import React from 'react';
import { useForm } from '@inertiajs/react';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from '@/Components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { FinanceFormShell } from '@/Components/Module/moduleFormWrappers';

interface Account {
    id: number;
    name: string;
    account_code?: string;
}

interface BankStatement {
    id: number;
    statement_number: string;
    statement_date: string;
}

interface Props {
    reconciliation: any;
    accounts: Account[];
    bankStatements: BankStatement[];
}

export default function EditBankReconciliation({
    reconciliation,
    accounts,
    bankStatements,
}: Props) {
    const route = useRoute();
    const { t } = useTranslate();

    const { data, setData, put, processing, errors } = useForm({
        bank_statement_id: reconciliation.bank_statement_id || '',
        reconciliation_date: reconciliation.reconciliation_date || '',
        period_start: reconciliation.period_start || '',
        period_end: reconciliation.period_end || '',
        statement_opening_balance: reconciliation.statement_opening_balance || '',
        statement_closing_balance: reconciliation.statement_closing_balance || '',
        book_opening_balance: reconciliation.book_opening_balance || '',
        book_closing_balance: reconciliation.book_closing_balance || '',
        account_id: reconciliation.account_id || '',
        notes: reconciliation.notes || '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(route('finance.bank-reconciliations.update', reconciliation.id));
    }

    return (
        <FinanceFormShell
            title="Edit Bank Reconciliation"
            backHref={route('finance.bank-reconciliations.index')}
            backLabel="Back"
            onSubmit={handleSubmit}
            processing={processing}
            submitLabel="Update"
            maxWidth="4xl"
        >
            <Card>
                <CardHeader>
                    <CardTitle>Bank Reconciliation</CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div className="space-y-2">
                            <label className="text-sm">Bank Statement</label>
                            <Select
                                value={data.bank_statement_id}
                                onValueChange={(v) => setData('bank_statement_id', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select statement" />
                                </SelectTrigger>
                                <SelectContent>
                                    {bankStatements.map((s) => (
                                        <SelectItem key={s.id} value={String(s.id)}>
                                            {s.statement_number} - {s.statement_date}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.bank_statement_id && (
                                <p className="text-red-500 text-xs">{errors.bank_statement_id}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm">Account</label>
                            <Select
                                value={data.account_id}
                                onValueChange={(v) => setData('account_id', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map((a) => (
                                        <SelectItem key={a.id} value={String(a.id)}>
                                            {a.name} {a.account_code ? `(${a.account_code})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.account_id && (
                                <p className="text-red-500 text-xs">{errors.account_id}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm">Reconciliation Date</label>
                            <Input
                                type="date"
                                value={data.reconciliation_date}
                                onChange={(e) => setData('reconciliation_date', e.target.value)}
                            />
                            {errors.reconciliation_date && (
                                <p className="text-red-500 text-xs">{errors.reconciliation_date}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-sm">Period Start</label>
                                <Input
                                    type="date"
                                    value={data.period_start}
                                    onChange={(e) => setData('period_start', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-sm">Period End</label>
                                <Input
                                    type="date"
                                    value={data.period_end}
                                    onChange={(e) => setData('period_end', e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm">Statement Opening</label>
                            <Input
                                type="number"
                                value={data.statement_opening_balance}
                                onChange={(e) => setData('statement_opening_balance', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-sm">Statement Closing</label>
                            <Input
                                type="number"
                                value={data.statement_closing_balance}
                                onChange={(e) => setData('statement_closing_balance', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-sm">Book Opening</label>
                            <Input
                                type="number"
                                value={data.book_opening_balance}
                                onChange={(e) => setData('book_opening_balance', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-sm">Book Closing</label>
                            <Input
                                type="number"
                                value={data.book_closing_balance}
                                onChange={(e) => setData('book_closing_balance', e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm">Notes</label>
                        <Input
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                        />
                    </div>

                </CardContent>
            </Card>
        </FinanceFormShell>
    );
}