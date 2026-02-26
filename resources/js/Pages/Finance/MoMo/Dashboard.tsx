import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import {
  DollarSign,
  Smartphone,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Eye,
  BarChart3,
  Users,
  Calendar
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface MomoTransaction {
  id: number;
  transaction_number: string;
  amount: number;
  fee_amount: number;
  phone_number: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  type: 'collection' | 'disbursement';
  description?: string;
  created_at: string;
  provider: {
    id: number;
    display_name: string;
    code: string;
  };
  user: {
    id: number;
    name: string;
  };
}

interface DashboardStats {
  today: {
    transactions: number;
    amount: number;
    successful: number;
  };
  this_week: {
    transactions: number;
    amount: number;
    successful: number;
  };
  this_month: {
    transactions: number;
    amount: number;
    successful: number;
  };
}

interface ProviderStats {
  [key: string]: {
    name: string;
    count: number;
    amount: number;
    success_rate: number;
  };
}

interface Props {
  stats: DashboardStats;
  recentTransactions: MomoTransaction[];
  providerStats: ProviderStats;
  pendingTransactions: MomoTransaction[];
}

export default function Dashboard({
  stats,
  recentTransactions,
  providerStats,
  pendingTransactions
}: Props) {
  const { t } = useTranslate();
  const route = useRoute();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
      case 'cancelled':
        return 'destructive';
      case 'pending':
      case 'processing':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const calculateSuccessRate = (successful: number, total: number) => {
    return total > 0 ? ((successful / total) * 100).toFixed(1) : '0.0';
  };

  return (
    <AppLayout
      title={t('Mobile Money Dashboard')}
      renderHeader={() => (
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          {t('Mobile Money Dashboard')}
        </h2>
      )}
    >
      <Head title={t('Mobile Money Dashboard')} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          {/* Quick Actions */}
          <div className="flex gap-4 mb-6">
            <Link href={route('finance.momo.create')}>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {t('New Payment')}
              </Button>
            </Link>
            <Link href={route('finance.momo.index')}>
              <Button variant="outline" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                {t('All Transactions')}
              </Button>
            </Link>
            <Link href={route('finance.momo.statistics')}>
              <Button variant="outline" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {t('Statistics')}
              </Button>
            </Link>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Today Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('Today')}</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.today.amount)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.today.transactions} {t('transactions')} • {calculateSuccessRate(stats.today.successful, stats.today.transactions)}% {t('success rate')}
                </p>
              </CardContent>
            </Card>

            {/* This Week Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('This Week')}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.this_week.amount)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.this_week.transactions} {t('transactions')} • {calculateSuccessRate(stats.this_week.successful, stats.this_week.transactions)}% {t('success rate')}
                </p>
              </CardContent>
            </Card>

            {/* This Month Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('This Month')}</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.this_month.amount)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.this_month.transactions} {t('transactions')} • {calculateSuccessRate(stats.this_month.successful, stats.this_month.transactions)}% {t('success rate')}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  {t('Pending Transactions')}
                </CardTitle>
                <CardDescription>
                  {t('Transactions that require attention')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {pendingTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(transaction.status)}
                          <div>
                            <p className="font-medium">{transaction.transaction_number}</p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.phone_number} • {transaction.provider.display_name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(transaction.amount)}</p>
                          <Badge variant={getStatusVariant(transaction.status)}>
                            {t(transaction.status)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <Link href={route('finance.momo.index', { status: 'pending' })}>
                      <Button variant="outline" className="w-full">
                        {t('View All Pending')}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>{t('No pending transactions')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Provider Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  {t('Provider Performance')}
                </CardTitle>
                <CardDescription>
                  {t('Monthly performance by provider')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(providerStats).map(([code, stats]) => (
                    <div key={code} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{stats.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {stats.count} {t('transactions')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(stats.amount)}</p>
                        <p className="text-sm text-green-600">
                          {stats.success_rate}% {t('success')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {Object.keys(providerStats).length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2" />
                      <p>{t('No provider data available')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>{t('Recent Transactions')}</CardTitle>
              <CardDescription>
                {t('Latest 10 mobile money transactions')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentTransactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('Transaction')}</TableHead>
                      <TableHead>{t('Phone Number')}</TableHead>
                      <TableHead>{t('Provider')}</TableHead>
                      <TableHead>{t('Amount')}</TableHead>
                      <TableHead>{t('Status')}</TableHead>
                      <TableHead>{t('Date')}</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          {transaction.transaction_number}
                        </TableCell>
                        <TableCell>{transaction.phone_number}</TableCell>
                        <TableCell>{transaction.provider.display_name}</TableCell>
                        <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(transaction.status)}>
                            {t(transaction.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Link href={route('finance.momo.show', transaction.id)}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Smartphone className="h-8 w-8 mx-auto mb-2" />
                  <p>{t('No transactions found')}</p>
                </div>
              )}
              <div className="mt-4">
                <Link href={route('finance.momo.index')}>
                  <Button variant="outline" className="w-full">
                    {t('View All Transactions')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}