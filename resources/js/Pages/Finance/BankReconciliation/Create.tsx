import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Filter, Save } from 'lucide-react';
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
  accounts: Account[];
  selectedAccount?: Account | null;
  bankStatements: BankStatement[];
}

export default function CreateBankReconciliation({
  accounts,
  selectedAccount = null,
  bankStatements,
}: Props) {
  const { t } = useTranslate();
  const route = useRoute();

  const [search, setSearch] = useState('');

  const { data, setData, post, processing, errors } = useForm({
    bank_statement_id: '',
    reconciliation_date: '',
    period_start: '',
    period_end: '',
    statement_opening_balance: '',
    statement_closing_balance: '',
    book_opening_balance: '',
    book_closing_balance: '',
    account_id: selectedAccount?.id ? String(selectedAccount.id) : '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('finance.bank-reconciliation.store'));
  };

  return (
    <FinanceFormShell
      title="Create Bank Reconciliation"
      backHref={route('finance.bank-reconciliation.index')}
      backLabel="Back"
      onSubmit={handleSubmit}
      processing={processing}
      submitLabel="Save"
      maxWidth="4xl"
    >
      <Card>
        <CardHeader>
          <CardTitle>
            {t('finance.bank_reconciliation_details', 'Bank Reconciliation Details')}
          </CardTitle>

          <div className="flex gap-2 pt-4">
            <Input
              placeholder={t('finance.search_transactions', 'Search transactions...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Button type="button" variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              {t('finance.filter', 'Filter')}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* Bank Statement */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('finance.bank_statement', 'Bank Statement')}
            </label>

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
              <p className="text-sm text-red-600">{errors.bank_statement_id}</p>
            )}
          </div>

          {/* Account */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('finance.bank_account', 'Bank Account')}
            </label>

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
              <p className="text-sm text-red-600">{errors.account_id}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="date"
              value={data.reconciliation_date}
              onChange={(e) => setData('reconciliation_date', e.target.value)}
            />

            <Input
              type="date"
              value={data.period_start}
              onChange={(e) => setData('period_start', e.target.value)}
            />

            <Input
              type="date"
              value={data.period_end}
              onChange={(e) => setData('period_end', e.target.value)}
            />
          </div>

          {/* Statement balances */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Statement Opening"
              type="number"
              value={data.statement_opening_balance}
              onChange={(e) => setData('statement_opening_balance', e.target.value)}
            />

            <Input
              placeholder="Statement Closing"
              type="number"
              value={data.statement_closing_balance}
              onChange={(e) => setData('statement_closing_balance', e.target.value)}
            />
          </div>

          {/* Book balances */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Book Opening"
              type="number"
              value={data.book_opening_balance}
              onChange={(e) => setData('book_opening_balance', e.target.value)}
            />

            <Input
              placeholder="Book Closing"
              type="number"
              value={data.book_closing_balance}
              onChange={(e) => setData('book_closing_balance', e.target.value)}
            />
          </div>

          {/* Notes */}
          <Input
            placeholder="Notes"
            value={data.notes}
            onChange={(e) => setData('notes', e.target.value)}
          />

        </CardContent>
      </Card>
    </FinanceFormShell>
  );
}