import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Users, UserPlus, UserCheck, BarChart, AlertCircle, Star } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/Components/ui/tabs';
import ImportLead from './ImportLead';
import PublishPost from './PublishPost';
import GetAnalytics from './GetAnalytics';
import TestConnection from './TestConnection';
import useTranslate from '@/Hooks/useTranslate';


export default function LinkedInDashboard({ companies = [], recentLeads = [], stats = {} }) {
  const { t } = useTranslate();

  return (
    <AppLayout title={t('linkedin.title', 'LinkedIn')}>
      <Head title={t('linkedin.title', 'LinkedIn')} />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('linkedin.title', 'LinkedIn')}</h1>
            <p className="text-muted-foreground">
              {t('linkedin.dashboard_description', 'Manage your LinkedIn companies and posts.')}
            </p>
          </div>
        </div>
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="import-lead">Import Lead</TabsTrigger>
            <TabsTrigger value="publish-post">Publish Post</TabsTrigger>
            <TabsTrigger value="get-analytics">Get Analytics</TabsTrigger>
            <TabsTrigger value="test-connection">Test Connection</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_companies ?? 0}</div>
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
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unprocessed Leads</CardTitle>
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.unprocessed_leads ?? 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">High Value Leads</CardTitle>
                  <Star className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{stats.high_value_leads ?? 0}</div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Companies</CardTitle>
                <CardDescription>List of LinkedIn companies</CardDescription>
              </CardHeader>
              <CardContent>
                {companies.length === 0 ? (
                  <p className="text-muted-foreground">No companies found.</p>
                ) : (
                  <ul>
                    {companies.map((company) => (
                      <li key={company.id}>{company.name} ({company.follower_count} followers)</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Leads</CardTitle>
                <CardDescription>Latest LinkedIn leads</CardDescription>
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
          </TabsContent>
          <TabsContent value="import-lead">
            <ImportLead />
          </TabsContent>
          <TabsContent value="publish-post">
            <PublishPost />
          </TabsContent>
          <TabsContent value="get-analytics">
            <GetAnalytics />
          </TabsContent>
          <TabsContent value="test-connection">
            <TestConnection />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
