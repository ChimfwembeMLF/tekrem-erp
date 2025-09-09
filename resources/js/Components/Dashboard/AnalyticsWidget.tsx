import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Button } from '@/Components/ui/button';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import LineChart from './Charts/LineChart';
import BarChart from './Charts/BarChart';
import DoughnutChart from './Charts/DoughnutChart';
import useTranslate from '@/Hooks/useTranslate';

interface AnalyticsData {
  userGrowth: {
    labels: string[];
    data: number[];
  };
  revenueGrowth: {
    labels: string[];
    data: number[];
  };
  moduleActivity: {
    labels: string[];
    data: number[];
  };
  systemPerformance: {
    labels: string[];
    cpu: number[];
    memory: number[];
    responseTime: number[];
  };
}

interface AnalyticsWidgetProps {
  data: AnalyticsData;
}

export default function AnalyticsWidget({ data }: AnalyticsWidgetProps) {
  const { t } = useTranslate();
  const [activeTab, setActiveTab] = useState('growth');

  // Prepare chart data
  const userGrowthData = {
    labels: data.userGrowth.labels,
    datasets: [
      {
        label: 'New Users',
        data: data.userGrowth.data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
    ],
  };

  const revenueGrowthData = {
    labels: data.revenueGrowth.labels,
    datasets: [
      {
        label: 'Revenue ($)',
        data: data.revenueGrowth.data,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
      },
    ],
  };

  const moduleActivityData = {
    labels: data.moduleActivity.labels,
    datasets: [
      {
        label: 'Activity Count',
        data: data.moduleActivity.data,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(14, 165, 233, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(251, 191, 36)',
          'rgb(239, 68, 68)',
          'rgb(168, 85, 247)',
          'rgb(236, 72, 153)',
          'rgb(14, 165, 233)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const systemPerformanceData = {
    labels: data.systemPerformance.labels,
    datasets: [
      {
        label: 'CPU Usage (%)',
        data: data.systemPerformance.cpu,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: false,
      },
      {
        label: 'Memory Usage (%)',
        data: data.systemPerformance.memory,
        borderColor: 'rgb(251, 191, 36)',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        fill: false,
      },
    ],
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {t('dashboard.analytics', 'Analytics & Insights')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="growth" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t('dashboard.user_growth', 'User Growth')}
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t('dashboard.revenue', 'Revenue')}
            </TabsTrigger>
            <TabsTrigger value="modules" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              {t('dashboard.modules', 'Modules')}
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t('dashboard.performance', 'Performance')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="growth">
            <LineChart
              title={t('dashboard.user_growth_chart', 'User Growth Over Time')}
              data={userGrowthData}
              height={350}
            />
          </TabsContent>

          <TabsContent value="revenue">
            <LineChart
              title={t('dashboard.revenue_growth_chart', 'Revenue Growth Over Time')}
              data={revenueGrowthData}
              height={350}
            />
          </TabsContent>

          <TabsContent value="modules">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BarChart
                title={t('dashboard.module_activity_chart', 'Module Activity')}
                data={moduleActivityData}
                height={300}
              />
              <DoughnutChart
                title={t('dashboard.module_distribution', 'Module Usage Distribution')}
                data={moduleActivityData}
                height={300}
              />
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <LineChart
              title={t('dashboard.system_performance_chart', 'System Performance Metrics')}
              data={systemPerformanceData}
              height={350}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
