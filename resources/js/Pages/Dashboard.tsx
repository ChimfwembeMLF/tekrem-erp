import React, { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  FileText,
  Ticket,
  Building,
  UserPlus,
  Shield,
  Settings,
  BarChart3,
  Download,
  Grid,
  RefreshCw,
  Bell,
  Server,
  Database,
  HardDrive,
} from 'lucide-react';
import usePermissions from '@/Hooks/usePermissions';
import useTranslate from '@/Hooks/useTranslate';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

// Dashboard Components
import StatsCard from '@/Components/Dashboard/StatsCard';
import SystemHealthWidget from '@/Components/Dashboard/SystemHealthWidget';
import ActivityFeed from '@/Components/Dashboard/ActivityFeed';
import QuickActions from '@/Components/Dashboard/QuickActions';
import AnalyticsWidget from '@/Components/Dashboard/AnalyticsWidget';

interface DashboardProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalClients: number;
    totalLeads: number;
    totalProjects: number;
    totalTickets: number;
    totalInvoices: number;
    totalRevenue: number;
    monthlyRevenue: number;
    pendingTickets: number;
    activeProjects: number;
  };
  systemHealth: {
    database: {
      status: string;
      responseTime: string;
      connections: string;
    };
    cache: {
      status: string;
      responseTime: string;
      driver: string;
    };
    storage: {
      status: string;
      freeSpace: string;
      totalSpace: string;
      usedPercentage: number;
    };
    overallHealth: string;
    lastChecked: string;
  };
  recentActivity: Array<{
    type: string;
    title: string;
    description: string;
    timestamp: string;
    icon: string;
    color: string;
  }>;
  moduleUsage: {
    [key: string]: {
      [key: string]: number | object;
    };
  };
  userManagement: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    roleDistribution: { [key: string]: number };
    recentRegistrations: Array<{
      id: number;
      name: string;
      email: string;
      created_at: string;
    }>;
  };
  quickActions: Array<{
    title: string;
    description: string;
    route: string;
    icon: string;
    color: string;
  }>;
  analytics: {
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
  };
  notifications: Array<{
    type: string;
    title: string;
    message: string;
    action: string;
    route: string;
  }>;
}

export default function Dashboard({
  stats,
  systemHealth,
  recentActivity,
  moduleUsage,
  userManagement,
  quickActions,
  analytics,
  notifications,
}: DashboardProps) {
  const { hasAnyRole } = usePermissions();
  const { t } = useTranslate();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    window.location.reload();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <AppLayout
      title={t('dashboard.title', 'Admin Dashboard')}
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
              {t('dashboard.title', 'Admin Dashboard')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {t('dashboard.subtitle', 'Monitor and manage your TekRem ERP system')}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
              {t('dashboard.refresh', 'Refresh')}
            </Button>
            {hasAnyRole(['admin']) && (
              <Link href="/settings">
                <Button size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  {t('dashboard.settings', 'Settings')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    >
      <Head title={t('dashboard.title', 'Admin Dashboard')} />

      <div className="py-6">
        <div className="w-full mx-auto sm:px-6 lg:px-8 space-y-6">
          {/* System Notifications */}
          {notifications && notifications.length > 0 && (
            <div className="space-y-2">
              {notifications.map((notification, index) => (
                <Alert key={index} className={cn(
                  notification.type === 'error' && 'border-red-200 bg-red-50',
                  notification.type === 'warning' && 'border-yellow-200 bg-yellow-50',
                  notification.type === 'info' && 'border-blue-200 bg-blue-50'
                )}>
                  <Bell className="h-4 w-4" />
                  <AlertTitle>{notification.title}</AlertTitle>
                  <AlertDescription className="flex justify-between items-center">
                    <span>{notification.message}</span>
                    <Link href={notification.route}>
                      <Button variant="outline" size="sm">
                        {notification.action}
                      </Button>
                    </Link>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Overview Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title={t('dashboard.total_users', 'Total Users')}
              value={stats.totalUsers}
              subtitle={`${formatNumber(stats.activeUsers)} active this month`}
              icon={Users}
            />

            <StatsCard
              title={t('dashboard.total_revenue', 'Total Revenue')}
              value={formatCurrency(stats.totalRevenue)}
              subtitle={`${formatCurrency(stats.monthlyRevenue)} this month`}
              icon={DollarSign}
            />

            <StatsCard
              title={t('dashboard.active_projects', 'Active Projects')}
              value={stats.activeProjects}
              subtitle={`${formatNumber(stats.totalProjects)} total projects`}
              icon={Building}
            />

            <StatsCard
              title={t('dashboard.pending_tickets', 'Pending Tickets')}
              value={stats.pendingTickets}
              subtitle={`${formatNumber(stats.totalTickets)} total tickets`}
              icon={Ticket}
            />
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">{t('dashboard.overview', 'Overview')}</TabsTrigger>
              <TabsTrigger value="system">{t('dashboard.system_health', 'System Health')}</TabsTrigger>
              <TabsTrigger value="modules">{t('dashboard.modules', 'Modules')}</TabsTrigger>
              <TabsTrigger value="users">{t('dashboard.users', 'Users')}</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <QuickActions actions={quickActions} />

                {/* Recent Activity */}
                <ActivityFeed activities={recentActivity} maxItems={8} />
              </div>

              {/* Analytics Widget */}
              <AnalyticsWidget data={analytics} />
            </TabsContent>

            {/* System Health Tab */}
            <TabsContent value="system" className="space-y-6">
              <SystemHealthWidget data={systemHealth} />
            </TabsContent>

            {/* Modules Tab */}
            <TabsContent value="modules" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(moduleUsage).map(([moduleName, moduleData]) => (
                  <Card key={moduleName}>
                    <CardHeader>
                      <CardTitle className="capitalize">{moduleName}</CardTitle>
                      <CardDescription>
                        {t(`dashboard.${moduleName}_module`, `${moduleName.toUpperCase()} Module Statistics`)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(moduleData).map(([key, value]) => {
                          if (typeof value === 'object') return null;
                          return (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
                              <span className="text-sm font-medium">{formatNumber(value as number)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {t('dashboard.user_statistics', 'User Statistics')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{formatNumber(userManagement.totalUsers)}</div>
                          <div className="text-sm text-muted-foreground">{t('dashboard.total_users', 'Total Users')}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{formatNumber(userManagement.activeUsers)}</div>
                          <div className="text-sm text-muted-foreground">{t('dashboard.active_users', 'Active Users')}</div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{formatNumber(userManagement.newUsersThisMonth)}</div>
                        <div className="text-sm text-muted-foreground">{t('dashboard.new_this_month', 'New This Month')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Role Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      {t('dashboard.role_distribution', 'Role Distribution')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(userManagement.roleDistribution).map(([role, count]) => (
                        <div key={role} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{role}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{formatNumber(count)}</span>
                            <Badge variant="outline">{((count / userManagement.totalUsers) * 100).toFixed(1)}%</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Registrations */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      {t('dashboard.recent_registrations', 'Recent Registrations')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {userManagement.recentRegistrations.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
