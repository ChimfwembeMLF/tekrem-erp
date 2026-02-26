
import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import { useRoute } from 'ziggy-js';
// test ci-cd
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
  reconciliation: any;
  account: Account;
  bankStatement: BankStatement;
}

export default function ShowBankReconciliation({ reconciliation, account, bankStatement }: Props) {
  const { t } = useTranslate();
  const route = useRoute();

  return (
    <AppLayout
      title={t('finance.bank_reconciliation_details', 'Bank Reconciliation Details')}
      >
      <Head title={t('finance.bank_reconciliation_details', 'Bank Reconciliation Details')} />

      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" asChild>
            <Link href={route('finance.bank-reconciliations.index')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back', 'Back')}
            </Link>
          </Button>
          <Button asChild>
            <Link href={route('finance.bank-reconciliations.edit', reconciliation.id)}>
              <Edit className="h-4 w-4 mr-2" />
              {t('common.edit', 'Edit')}
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('finance.bank_reconciliation_details', 'Bank Reconciliation Details')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>{t('finance.bank_account', 'Bank Account')}:</strong> {account.name} {account.account_code ? `(${account.account_code})` : ''}
            </div>
            <div>
              <strong>{t('finance.bank_statement', 'Bank Statement')}:</strong> {bankStatement.statement_number} - {bankStatement.statement_date}
            </div>
            <div>
              <strong>{t('finance.reconciliation_date', 'Reconciliation Date')}:</strong> {reconciliation.reconciliation_date}
            </div>
            <div>
              <strong>{t('finance.period_start', 'Period Start')}:</strong> {reconciliation.period_start}
            </div>
            <div>
              <strong>{t('finance.period_end', 'Period End')}:</strong> {reconciliation.period_end}
            </div>
            <div>
              <strong>{t('finance.statement_opening_balance', 'Statement Opening Balance')}:</strong> {reconciliation.statement_opening_balance}
            </div>
            <div>
              <strong>{t('finance.statement_closing_balance', 'Statement Closing Balance')}:</strong> {reconciliation.statement_closing_balance}
            </div>
            <div>
              <strong>{t('finance.book_opening_balance', 'Book Opening Balance')}:</strong> {reconciliation.book_opening_balance}
            </div>
            <div>
              <strong>{t('finance.book_closing_balance', 'Book Closing Balance')}:</strong> {reconciliation.book_closing_balance}
            </div>
            <div>
              <strong>{t('finance.notes', 'Notes')}:</strong> {reconciliation.notes}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
