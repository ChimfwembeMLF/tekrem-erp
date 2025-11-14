import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { ArrowLeft, Save, Filter } from 'lucide-react';
import { useTranslate } from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Account {
  id: number;
  name: string;
  account_code?: string;
  balance?: string;
}

interface BankStatement {
  id: number;
  statement_number: string;
  statement_date: string;
  opening_balance: number;
  closing_balance: number;
}

interface Props {
  accounts: Account[];
  selectedAccount?: Account | null;
  bankStatements: BankStatement[];
}

export default function CreateBankReconciliation({ accounts, selectedAccount = null, bankStatements }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
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
  const [search, setSearch] = useState('');

  const handleSubmit = (e: any) => {
    e.preventDefault();
    post(route('finance.bank-reconciliation.store'));
  };

  const handleSearch = () => {
    // Placeholder for search/filter logic
  };

  return (
    <AppLayout
      title={t('finance.create_bank_reconciliation', 'Create Bank Reconciliation')}
      renderHeader={() => (
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <a href={route('finance.bank-reconciliation.index')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('finance.back_to_reconciliations', 'Back to Reconciliations')}
            </a>
          </Button>
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {t('finance.create_bank_reconciliation', 'Create Bank Reconciliation')}
          </h2>
        </div>
      )}
    >
      <Head title={t('finance.create_bank_reconciliation', 'Create Bank Reconciliation')} />
      <div className="py-12">
        <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>{t('finance.bank_reconciliation_details', 'Bank Reconciliation Details')}</CardTitle>
              {/* Optional: Add a filter/search bar for transactions */}
              <div className="flex gap-2 pt-4">
                <Input
                  placeholder={t('finance.search_transactions', 'Search transactions...')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
                <Button onClick={handleSearch} variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  {t('finance.filter', 'Filter')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Bank Statement Select */}
                <div>
                  <label htmlFor="bank_statement_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('finance.bank_statement', 'Bank Statement')}
                  </label>
                  <Select
                    value={data.bank_statement_id}
                    onValueChange={value => setData('bank_statement_id', value)}
                  >
                    <SelectTrigger id="bank_statement_id">
                      <SelectValue placeholder={t('finance.select_bank_statement', 'Select a bank statement')} />
                    </SelectTrigger>
                    <SelectContent>
                      {bankStatements.map((statement) => (
                        <SelectItem key={statement.id} value={String(statement.id)}>
                          {statement.statement_number} - {statement.statement_date}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.bank_statement_id && <div className="text-red-500 text-xs mt-1">{errors.bank_statement_id}</div>}
                </div>
                {/* Account Select */}
                <div>
                  <label htmlFor="account_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('finance.bank_account', 'Bank Account')}
                  </label>
                  <Select
                    value={data.account_id}
                    onValueChange={value => setData('account_id', value)}
                  >
                    <SelectTrigger id="account_id">
                      <SelectValue placeholder={t('finance.select_account', 'Select a bank account')} />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={String(account.id)}>
                          {account.name} {account.account_code ? `(${account.account_code})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.account_id && <div className="text-red-500 text-xs mt-1">{errors.account_id}</div>}
                </div>
                {/* Reconciliation Date */}
                <div>
                  <label htmlFor="reconciliation_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('finance.reconciliation_date', 'Reconciliation Date')}
                  </label>
                  <Input
                    id="reconciliation_date"
                    type="date"
                    value={data.reconciliation_date}
                    onChange={e => setData('reconciliation_date', e.target.value)}
                    required
                  />
                  {errors.reconciliation_date && <div className="text-red-500 text-xs mt-1">{errors.reconciliation_date}</div>}
                </div>
                {/* Period Start/End */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label htmlFor="period_start" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('finance.period_start', 'Period Start')}
                    </label>
                    <Input
                      id="period_start"
                      type="date"
                      value={data.period_start}
                      onChange={e => setData('period_start', e.target.value)}
                      required
                    />
                    {errors.period_start && <div className="text-red-500 text-xs mt-1">{errors.period_start}</div>}
                  </div>
                  <div className="flex-1">
                    <label htmlFor="period_end" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('finance.period_end', 'Period End')}
                    </label>
                    <Input
                      id="period_end"
                      type="date"
                      value={data.period_end}
                      onChange={e => setData('period_end', e.target.value)}
                      required
                    />
                    {errors.period_end && <div className="text-red-500 text-xs mt-1">{errors.period_end}</div>}
                  </div>
                </div>
                {/* Statement Balances */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label htmlFor="statement_opening_balance" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('finance.statement_opening_balance', 'Statement Opening Balance')}
                    </label>
                    <Input
                      id="statement_opening_balance"
                      type="number"
                      value={data.statement_opening_balance}
                      onChange={e => setData('statement_opening_balance', e.target.value)}
                      required
                    />
                    {errors.statement_opening_balance && <div className="text-red-500 text-xs mt-1">{errors.statement_opening_balance}</div>}
                  </div>
                  <div className="flex-1">
                    <label htmlFor="statement_closing_balance" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('finance.statement_closing_balance', 'Statement Closing Balance')}
                    </label>
                    <Input
                      id="statement_closing_balance"
                      type="number"
                      value={data.statement_closing_balance}
                      onChange={e => setData('statement_closing_balance', e.target.value)}
                      required
                    />
                    {errors.statement_closing_balance && <div className="text-red-500 text-xs mt-1">{errors.statement_closing_balance}</div>}
                  </div>
                </div>
                {/* Book Balances */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label htmlFor="book_opening_balance" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('finance.book_opening_balance', 'Book Opening Balance')}
                    </label>
                    <Input
                      id="book_opening_balance"
                      type="number"
                      value={data.book_opening_balance}
                      onChange={e => setData('book_opening_balance', e.target.value)}
                      required
                    />
                    {errors.book_opening_balance && <div className="text-red-500 text-xs mt-1">{errors.book_opening_balance}</div>}
                  </div>
                  <div className="flex-1">
                    <label htmlFor="book_closing_balance" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('finance.book_closing_balance', 'Book Closing Balance')}
                    </label>
                    <Input
                      id="book_closing_balance"
                      type="number"
                      value={data.book_closing_balance}
                      onChange={e => setData('book_closing_balance', e.target.value)}
                      required
                    />
                    {errors.book_closing_balance && <div className="text-red-500 text-xs mt-1">{errors.book_closing_balance}</div>}
                  </div>
                </div>
                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('finance.notes', 'Notes')}
                  </label>
                  <Input
                    id="notes"
                    value={data.notes}
                    onChange={e => setData('notes', e.target.value)}
                  />
                  {errors.notes && <div className="text-red-500 text-xs mt-1">{errors.notes}</div>}
                </div>
                <Button type="submit" disabled={processing}>
                  <Save className="h-4 w-4 mr-2" />
                  {t('finance.save', 'Save')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
