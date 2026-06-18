import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import {
  Users,
  DollarSign,
  Building,
  Ticket,
  RefreshCw,
  Settings,
  Bell,
  Server,
} from 'lucide-react';
import usePermissions from '@/Hooks/usePermissions';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { cn } from '@/lib/utils';
import StatsCard from '@/Components/Dashboard/StatsCard';
import SystemHealthWidget from '@/Components/Dashboard/SystemHealthWidget';
import ActivityFeed from '@/Components/Dashboard/ActivityFeed';
import QuickActions from '@/Components/Dashboard/QuickActions';
import AnalyticsWidget from '@/Components/Dashboard/AnalyticsWidget';
import ModuleCardGrid, { ModuleCard } from '@/Components/Dashboard/ModuleCardGrid';

interface DashboardProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalProjects: number;
    totalTickets: number;
    totalRevenue: number;
    monthlyRevenue: number;
    pendingTickets: number;
    activeProjects: number;
  };
  systemHealth: {
    database: { status: string; responseTime: string };
    cache: { status: string; responseTime: string };
    storage: { status: string; usedPercentage: number };
    overallHealth: string;
    lastChecked: string;
  };
  recentActivity: Array<{
    id?: string | number;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    icon: string;
    color: string;
  }>;
  moduleCards: ModuleCard[];
  userManagement: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    roleDistribution: Record<string, number>;
    recentRegistrations: Array<{ id: number; name: string; email: string; created_at: string }>;
  };
  quickActions: Array<{
    title: string;
    description: string;
    route: string;
    icon: string;
  }>;
  analytics: {
    userGrowth: { labels: string[]; data: number[] };
    revenueGrowth: { labels: string[]; data: number[] };
    moduleActivity: { labels: string[]; data: number[] };
  };
  notifications: Array<{
    type: string;
    title: string;
    message: string;
    action: string;
    route: string;
  }>;
  isAdmin: boolean;
}

export default function Dashboard({
  stats,
  systemHealth,
  recentActivity,
  moduleCards,
  userManagement,
  quickActions,
  analytics,
  notifications,
  isAdmin,
}: DashboardProps) {
  const { hasAnyRole } = usePermissions();
  const { t } = useTranslate();
  const route = useRoute();
  const [refreshing, setRefreshing] = useState(false);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-ZM', { style: 'currency', currency: 'ZMW' }).format(amount);

  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);

  return (
    <AppLayout
      title={t('dashboard.title', 'Dashboard')}
      renderHeader={() => (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {t('dashboard.title', 'Dashboard')}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('dashboard.subtitle', 'Overview of your ERP modules and operations')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setRefreshing(true); window.location.reload(); }} disabled={refreshing}>
              <RefreshCw className={cn('mr-2 h-4 w-4', refreshing && 'animate-spin')} />
              Refresh
            </Button>
            {hasAnyRole(['admin', 'super_user']) && (
              <Button size="sm" asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    >
      <Head title={t('dashboard.title', 'Dashboard')} />

      <div className="space-y-6 pb-8">
        {notifications?.length > 0 && (
          <div className="space-y-2">
            {notifications.map((notification, index) => (
              <Alert
                key={index}
                className={cn(
                  notification.type === 'error' && 'border-destructive/30 bg-destructive/5',
                  notification.type === 'warning' && 'border-amber-500/30 bg-amber-500/5'
                )}
              >
                <Bell className="h-4 w-4" />
                <AlertTitle>{notification.title}</AlertTitle>
                <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span>{notification.message}</span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={route(notification.route)}>{notification.action}</Link>
                  </Button>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Active users" value={stats.activeUsers} subtitle={`${formatNumber(stats.totalUsers)} total`} icon={Users} />
          <StatsCard title="Revenue (month)" value={formatCurrency(stats.monthlyRevenue)} subtitle={formatCurrency(stats.totalRevenue) + ' all time'} icon={DollarSign} />
          <StatsCard title="Active projects" value={stats.activeProjects} subtitle={`${formatNumber(stats.totalProjects)} total`} icon={Building} />
          <StatsCard title="Open tickets" value={stats.pendingTickets} subtitle={`${formatNumber(stats.totalTickets)} total`} icon={Ticket} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <QuickActions actions={quickActions} />
            <div>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wide">Modules</h3>
              <ModuleCardGrid modules={moduleCards} />
            </div>
          </div>
          <ActivityFeed activities={recentActivity} maxItems={8} />
        </div>

        <AnalyticsWidget data={analytics} />

        {isAdmin && (
          <Tabs defaultValue="health">
            <TabsList>
              <TabsTrigger value="health" className="gap-2">
                <Server className="h-4 w-4" />
                System health
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
            </TabsList>
            <TabsContent value="health" className="mt-4">
              <SystemHealthWidget data={systemHealth} />
            </TabsContent>
            <TabsContent value="users" className="mt-4">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">User summary</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">{formatNumber(userManagement.totalUsers)}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{formatNumber(userManagement.activeUsers)}</p>
                      <p className="text-xs text-muted-foreground">Active</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{formatNumber(userManagement.newUsersThisMonth)}</p>
                      <p className="text-xs text-muted-foreground">New</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent registrations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {userManagement.recentRegistrations.map((user) => (
                      <div key={user.id} className="flex justify-between border-b border-border pb-2 text-sm last:border-0">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-muted-foreground">{user.email}</p>
                        </div>
                        <span className="text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}
