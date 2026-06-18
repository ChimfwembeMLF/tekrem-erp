import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Users, DollarSign, Activity } from 'lucide-react';
import LineChart from './Charts/LineChart';
import BarChart from './Charts/BarChart';
import DoughnutChart from './Charts/DoughnutChart';
import useTranslate from '@/Hooks/useTranslate';

interface AnalyticsData {
  userGrowth: { labels: string[]; data: number[] };
  revenueGrowth: { labels: string[]; data: number[] };
  moduleActivity: { labels: string[]; data: number[] };
}

interface AnalyticsWidgetProps {
  data: AnalyticsData;
}

export default function AnalyticsWidget({ data }: AnalyticsWidgetProps) {
  const { t } = useTranslate();
  const [activeTab, setActiveTab] = useState('growth');

  const userGrowthData = {
    labels: data.userGrowth.labels,
    datasets: [{
      label: 'New Users',
      data: data.userGrowth.data,
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
    }],
  };

  const revenueGrowthData = {
    labels: data.revenueGrowth.labels,
    datasets: [{
      label: 'Revenue (ZMW)',
      data: data.revenueGrowth.data,
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      fill: true,
    }],
  };

  const moduleActivityData = {
    labels: data.moduleActivity.labels,
    datasets: [{
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
        'rgba(99, 102, 241, 0.8)',
        'rgba(20, 184, 166, 0.8)',
      ],
      borderWidth: 1,
    }],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="growth" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="revenue" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="modules" className="gap-2">
              <Activity className="h-4 w-4" />
              Modules
            </TabsTrigger>
          </TabsList>

          <TabsContent value="growth">
            <LineChart title={t('dashboard.user_growth_chart', 'User growth')} data={userGrowthData} height={300} />
          </TabsContent>
          <TabsContent value="revenue">
            <LineChart title={t('dashboard.revenue_growth_chart', 'Revenue growth')} data={revenueGrowthData} height={300} />
          </TabsContent>
          <TabsContent value="modules">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <BarChart title="Module activity" data={moduleActivityData} height={280} />
              <DoughnutChart title="Distribution" data={moduleActivityData} height={280} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
