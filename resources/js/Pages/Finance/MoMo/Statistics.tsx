import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Smartphone,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface StatisticsData {
  overview: {
    total_transactions: number;
    total_amount: number;
    successful_transactions: number;
    failed_transactions: number;
    pending_transactions: number;
    success_rate: number;
    average_transaction_amount: number;
    total_fees: number;
  };
  provider_breakdown: Array<{
    provider_id: number;
    provider_name: string;
    provider_code: string;
    transaction_count: number;
    total_amount: number;
    success_rate: number;
    average_amount: number;
    fees_collected: number;
  }>;
  daily_stats: Array<{
    date: string;
    transaction_count: number;
    total_amount: number;
    successful_count: number;
    failed_count: number;
  }>;
  transaction_types: Array<{
    type: string;
    count: number;
    amount: number;
    percentage: number;
  }>;
  top_customers: Array<{
    customer_name: string;
    phone_number: string;
    transaction_count: number;
    total_amount: number;
  }>;
  hourly_distribution: Array<{
    hour: number;
    transaction_count: number;
    success_rate: number;
  }>;
}

interface Props {
  statistics: StatisticsData;
  date_range: {
    start_date: string;
    end_date: string;
  };
  providers: Array<{
    id: number;
    display_name: string;
    provider_code: string;
  }>;
}

export default function Statistics({ statistics, date_range, providers }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedProvider, setSelectedProvider] = useState('all');

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    router.get(route('finance.momo.statistics'), {
      period: period,
      provider_id: selectedProvider === 'all' ? '' : selectedProvider,
    });
  };

  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
    router.get(route('finance.momo.statistics'), {
      period: selectedPeriod,
      provider_id: providerId === 'all' ? '' : providerId,
    });
  };

  const handleExport = () => {
    window.open(route('finance.momo.statistics.export', {
      period: selectedPeriod,
      provider_id: selectedProvider === 'all' ? '' : selectedProvider,
    }), '_blank');
  };

  const formatCurrency = (amount: number, currency: string = 'ZMW') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (current < previous) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <div className="h-4 w-4" />;
  };

  return (
    <AppLayout
      title={t('finance.momo.statistics', 'Mobile Money Statistics')}
      breadcrumbs={[
        { label: t('finance.title', 'Finance'), href: '/finance' },
        { label: t('finance.momo.title', 'Mobile Money'), href: '/finance/momo' },
        { label: t('finance.momo.statistics', 'Statistics') },
      ]}
    >
      <Head title={t('finance.momo.statistics', 'Mobile Money Statistics')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href={route('finance.momo.index')}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {t('finance.momo.statistics', 'Mobile Money Statistics')}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatDate(date_range.start_date)} - {formatDate(date_range.end_date)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4" />
              {t('common.export', 'Export')}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">{t('finance.momo.period.1d', 'Last 24 hours')}</SelectItem>
              <SelectItem value="7d">{t('finance.momo.period.7d', 'Last 7 days')}</SelectItem>
              <SelectItem value="30d">{t('finance.momo.period.30d', 'Last 30 days')}</SelectItem>
              <SelectItem value="90d">{t('finance.momo.period.90d', 'Last 90 days')}</SelectItem>
              <SelectItem value="1y">{t('finance.momo.period.1y', 'Last year')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedProvider} onValueChange={handleProviderChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('finance.momo.all_providers', 'All Providers')}</SelectItem>
              {providers.map((provider) => (
                <SelectItem key={provider.id} value={provider.id.toString()}>
                  {provider.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.momo.total_transactions', 'Total Transactions')}
              </CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.overview.total_transactions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(statistics.overview.total_amount)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.momo.success_rate', 'Success Rate')}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getSuccessRateColor(statistics.overview.success_rate)}`}>
                {formatPercentage(statistics.overview.success_rate)}
              </div>
              <p className="text-xs text-muted-foreground">
                {statistics.overview.successful_transactions} successful
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.momo.average_amount', 'Average Amount')}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(statistics.overview.average_transaction_amount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('finance.momo.per_transaction', 'per transaction')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.momo.total_fees', 'Total Fees')}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(statistics.overview.total_fees)}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage((statistics.overview.total_fees / statistics.overview.total_amount) * 100)} of volume
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Provider Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                {t('finance.momo.provider_breakdown', 'Provider Breakdown')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statistics.provider_breakdown.map((provider) => (
                  <div key={provider.provider_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-medium">
                        {provider.provider_code}
                      </div>
                      <div>
                        <div className="font-medium">{provider.provider_name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {provider.transaction_count} transactions
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(provider.total_amount)}</div>
                      <div className={`text-sm ${getSuccessRateColor(provider.success_rate)}`}>
                        {formatPercentage(provider.success_rate)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transaction Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {t('finance.momo.transaction_types', 'Transaction Types')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statistics.transaction_types.map((type) => (
                  <div key={type.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">
                        {t(`finance.momo.type.${type.type}`, type.type)}
                      </Badge>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {type.count} transactions
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(type.amount)}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatPercentage(type.percentage)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Trends */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t('finance.momo.daily_trends', 'Daily Trends')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('common.date', 'Date')}</TableHead>
                      <TableHead>{t('finance.momo.transactions', 'Transactions')}</TableHead>
                      <TableHead>{t('finance.momo.amount', 'Amount')}</TableHead>
                      <TableHead>{t('finance.momo.successful', 'Successful')}</TableHead>
                      <TableHead>{t('finance.momo.failed', 'Failed')}</TableHead>
                      <TableHead>{t('finance.momo.success_rate', 'Success Rate')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statistics.daily_stats.map((day) => {
                      const successRate = day.transaction_count > 0 
                        ? (day.successful_count / day.transaction_count) * 100 
                        : 0;
                      
                      return (
                        <TableRow key={day.date}>
                          <TableCell className="font-medium">
                            {formatDate(day.date)}
                          </TableCell>
                          <TableCell>{day.transaction_count.toLocaleString()}</TableCell>
                          <TableCell>{formatCurrency(day.total_amount)}</TableCell>
                          <TableCell className="text-green-600">{day.successful_count}</TableCell>
                          <TableCell className="text-red-600">{day.failed_count}</TableCell>
                          <TableCell className={getSuccessRateColor(successRate)}>
                            {formatPercentage(successRate)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Top Customers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('finance.momo.top_customers', 'Top Customers')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statistics.top_customers.map((customer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{customer.customer_name || 'Anonymous'}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {customer.phone_number}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(customer.total_amount)}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {customer.transaction_count} transactions
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hourly Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t('finance.momo.hourly_distribution', 'Hourly Distribution')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {statistics.hourly_distribution.map((hour) => (
                  <div key={hour.hour} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 text-sm text-gray-600 dark:text-gray-400">
                        {hour.hour.toString().padStart(2, '0')}:00
                      </div>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(hour.transaction_count / Math.max(...statistics.hourly_distribution.map(h => h.transaction_count))) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{hour.transaction_count}</div>
                      <div className={`text-xs ${getSuccessRateColor(hour.success_rate)}`}>
                        {formatPercentage(hour.success_rate)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
