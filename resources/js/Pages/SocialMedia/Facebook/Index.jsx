import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Users, UserCheck, UserPlus, FileText, CheckCircle, ListChecks } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/Components/ui/tabs';
import SubscribeWebhooks from './SubscribeWebhooks';
import SyncLeads from './SyncLeads';
import PublishPost from './PublishPost';
import GetInsights from './GetInsights';
import TestConnection from './TestConnection';
import useTranslate from '@/Hooks/useTranslate';


const FacebookDashboard = ({ pages = [], recentLeads = [], recentPosts = [], stats = {} }) => {
  const { t } = useTranslate();
  return (
    <AppLayout title={t('facebook.title', 'Facebook')}>
      <Head title={t('facebook.title', 'Facebook')} />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('facebook.title', 'Facebook')}</h1>
            <p className="text-muted-foreground">
              {t('facebook.dashboard_description', 'Manage your Facebook pages and posts.')}
            </p>
          </div>
        </div>
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="subscribe-webhooks">Subscribe Webhooks</TabsTrigger>
            <TabsTrigger value="sync-leads">Sync Leads</TabsTrigger>
            <TabsTrigger value="publish-post">Publish Post</TabsTrigger>
            <TabsTrigger value="get-insights">Get Insights</TabsTrigger>
            <TabsTrigger value="test-connection">Test Connection</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_pages ?? 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Pages</CardTitle>
                  <UserCheck className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.active_pages ?? 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                  <UserPlus className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.total_leads ?? 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Leads This Month</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.leads_this_month ?? 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                  <ListChecks className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_posts ?? 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Published Posts</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.published_posts ?? 0}</div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Pages</CardTitle>
                <CardDescription>List of Facebook pages</CardDescription>
              </CardHeader>
              <CardContent>
                {pages.length === 0 ? (
                  <p className="text-muted-foreground">No pages found.</p>
                ) : (
                  <ul>
                    {pages.map((page) => (
                      <li key={page.id}>{page.name} ({page.is_active ? 'Active' : 'Inactive'})</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Leads</CardTitle>
                <CardDescription>Latest Facebook leads</CardDescription>
              </CardHeader>
              <CardContent>
                {recentLeads.length === 0 ? (
                  <p className="text-muted-foreground">No leads found.</p>
                ) : (
                  <ul>
                    {recentLeads.map((lead) => (
                      <li key={lead.id}>{lead.lead?.name || 'Unknown Lead'}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Posts</CardTitle>
              </CardHeader>
              <CardContent>
                {recentPosts.length === 0 ? (
                  <p className="text-muted-foreground">No recent posts found.</p>
                ) : (
                  <ul>
                    {recentPosts.map((post) => (
                      <li key={post.id}>{post.content}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="subscribe-webhooks">
            <SubscribeWebhooks />
          </TabsContent>
          <TabsContent value="sync-leads">
            <SyncLeads />
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

export default FacebookDashboard;
