import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { 
  FolderOpen, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  BarChart3,
  Plus,
  Activity,
  Target
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Analytics {
  projects: number;
  active: number;
  completed: number;
  velocity: number;
  chartData: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string;
    }>;
  };
}

interface ProjectDashboardProps {
  analytics: Analytics;
}

export default function ProjectDashboard({ analytics }: ProjectDashboardProps) {
  const { t } = useTranslate();
  const route = useRoute();

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: t('pm.velocity_chart', 'Sprint Velocity Chart'),
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <AppLayout
      title={t('pm.dashboard', 'Project Management Dashboard')}
      renderHeader={() => (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
              {t('pm.dashboard', 'Project Management Dashboard')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {t('pm.dashboard_description', 'Overview of your projects and team performance')}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = route('pm.projects.create')}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('pm.new_project', 'New Project')}
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => window.location.href = route('pm.projects.index')}
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              {t('pm.view_projects', 'View Projects')}
            </Button>
          </div>
        </div>
      )}
    >
      <Head title={t('pm.dashboard', 'PM Dashboard')} />

      <div className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('pm.total_projects', 'Total Projects')}
                </CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.projects}</div>
                <p className="text-xs text-muted-foreground">
                  {t('pm.all_projects', 'All projects in system')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('pm.active_projects', 'Active Projects')}
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.active}</div>
                <p className="text-xs text-muted-foreground">
                  {t('pm.currently_active', 'Currently in progress')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('pm.completed_projects', 'Completed Projects')}
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.completed}</div>
                <p className="text-xs text-muted-foreground">
                  {t('pm.successfully_completed', 'Successfully completed')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('pm.team_velocity', 'Team Velocity')}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.velocity}</div>
                <p className="text-xs text-muted-foreground">
                  {t('pm.story_points_per_sprint', 'Story points per sprint')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Velocity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t('pm.velocity_trends', 'Velocity Trends')}
              </CardTitle>
              <CardDescription>
                {t('pm.velocity_description', 'Track your team\'s velocity over recent sprints')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Line data={analytics.chartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {t('pm.quick_actions', 'Quick Actions')}
              </CardTitle>
              <CardDescription>
                {t('pm.quick_actions_description', 'Common project management tasks')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => window.location.href = route('pm.projects.create')}
                >
                  <Plus className="h-6 w-6 mb-2" />
                  {t('pm.create_project', 'Create Project')}
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => window.location.href = route('pm.projects.index')}
                >
                  <FolderOpen className="h-6 w-6 mb-2" />
                  {t('pm.manage_projects', 'Manage Projects')}
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => window.location.href = route('pm.projects.index')}
                >
                  <BarChart3 className="h-6 w-6 mb-2" />
                  {t('pm.view_reports', 'View Reports')}
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </AppLayout>
  );
}
