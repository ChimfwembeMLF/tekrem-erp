import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Users, Image, UserCheck, BarChart } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/Components/ui/tabs';
import SyncMedia from './SyncMedia';
import GetHashtagInfo from './GetHashtagInfo';
import PublishPost from './PublishPost';
import GetInsights from './GetInsights';
import TestConnection from './TestConnection';
import useTranslate from '@/Hooks/useTranslate';



const InstagramDashboard = ({ accounts = [], recentMedia = [], stats = {} }) => {
  const { t } = useTranslate();
  return (
    <AppLayout title={t('instagram.title', 'Instagram')}>
      <Head title={t('instagram.title', 'Instagram')} />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('instagram.title', 'Instagram')}</h1>
            <p className="text-muted-foreground">
              {t('instagram.dashboard_description', 'Manage your Instagram accounts and posts.')}
            </p>
          </div>
        </div>
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="sync-media">Sync Media</TabsTrigger>
            <TabsTrigger value="get-hashtag-info">Get Hashtag Info</TabsTrigger>
            <TabsTrigger value="publish-post">Publish Post</TabsTrigger>
            <TabsTrigger value="get-insights">Get Insights</TabsTrigger>
            <TabsTrigger value="test-connection">Test Connection</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_accounts ?? 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Media</CardTitle>
                  <Image className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.total_media ?? 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
                  <UserCheck className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.total_followers ?? 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.avg_engagement ?? 0}</div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Accounts</CardTitle>
                <CardDescription>List of Instagram accounts</CardDescription>
              </CardHeader>
              <CardContent>
                {accounts.length === 0 ? (
                  <p className="text-muted-foreground">No accounts found.</p>
                ) : (
                  <ul>
                    {accounts.map((account) => (
                      <li key={account.id}>{account.username} ({account.followers_count} followers)</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Media</CardTitle>
                <CardDescription>Latest Instagram media</CardDescription>
              </CardHeader>
              <CardContent>
                {recentMedia.length === 0 ? (
                  <p className="text-muted-foreground">No media found.</p>
                ) : (
                  <ul>
                    {recentMedia.map((media) => (
                      <li key={media.id}>{media.caption || 'No caption'}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="sync-media">
            <SyncMedia />
          </TabsContent>
          <TabsContent value="get-hashtag-info">
            <GetHashtagInfo />
          </TabsContent>
          <TabsContent value="publish-post">
            <PublishPost />
          </TabsContent>
          <TabsContent value="get-insights">
            <GetInsights />
          </TabsContent>
          <TabsContent value="test-connection">
            <TestConnection />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};



export default InstagramDashboard;
