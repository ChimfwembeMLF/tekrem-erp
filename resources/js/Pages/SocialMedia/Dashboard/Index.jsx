
import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Facebook, Twitter, Instagram, Linkedin, MessageCircle } from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';

const Index = ({
  connectionStatus = { facebook: false, instagram: false, linkedin: false },
  accountCounts = { facebook_pages: 0, instagram_accounts: 0, linkedin_companies: 0 },
  recentPosts = [],
  scheduledPosts = [],
  platformStats = {},
  engagementMetrics = {},
}) => {
  const { t } = useTranslate();

  return (
    <AppLayout title={t('social_media.title', 'Social Media')}>
      <Head title={t('social_media.title', 'Social Media')} />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('social_media.title', 'Social Media')}</h1>
            <p className="text-muted-foreground">
              {t('social_media.dashboard_description', 'Manage and monitor your connected social media platforms.')}
            </p>
          </div>
        </div>

        {/* Connection Status */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {/* Facebook */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium flex items-center gap-2"><Facebook className="h-5 w-5 text-[#1877F2]" /> Facebook</CardTitle>
                <CardDescription>Connect with Facebook Pages and Messenger</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Badge variant={connectionStatus.facebook ? 'secondary' : 'destructive'}>
                {connectionStatus.facebook ? 'Connected' : 'Disconnected'}
              </Badge>
            </CardContent>
          </Card>
          {/* Twitter/X */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium flex items-center gap-2"><Twitter className="h-5 w-5 text-[#1DA1F2]" /> Twitter/X</CardTitle>
                <CardDescription>Integrate with Twitter/X for social engagement</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Badge variant={connectionStatus.twitter ? 'secondary' : 'destructive'}>
                {connectionStatus.twitter ? 'Connected' : 'Disconnected'}
              </Badge>
            </CardContent>
          </Card>
          {/* Instagram */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium flex items-center gap-2"><Instagram className="h-5 w-5 text-[#E4405F]" /> Instagram</CardTitle>
                <CardDescription>Connect Instagram Business accounts</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Badge variant={connectionStatus.instagram ? 'secondary' : 'destructive'}>
                {connectionStatus.instagram ? 'Connected' : 'Disconnected'}
              </Badge>
            </CardContent>
          </Card>
          {/* LinkedIn */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium flex items-center gap-2"><Linkedin className="h-5 w-5 text-[#0077B5]" /> LinkedIn</CardTitle>
                <CardDescription>Integrate with LinkedIn for professional networking</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Badge variant={connectionStatus.linkedin ? 'secondary' : 'destructive'}>
                {connectionStatus.linkedin ? 'Connected' : 'Disconnected'}
              </Badge>
            </CardContent>
          </Card>
          {/* WhatsApp */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium flex items-center gap-2"><MessageCircle className="h-5 w-5 text-[#25D366]" /> WhatsApp</CardTitle>
                <CardDescription>Connect WhatsApp Business API</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Badge variant={connectionStatus.whatsapp ? 'secondary' : 'destructive'}>
                {connectionStatus.whatsapp ? 'Connected' : 'Disconnected'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Account Counts */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Facebook Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accountCounts.facebook_pages}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Instagram Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accountCounts.instagram_accounts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>LinkedIn Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accountCounts.linkedin_companies}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
            <CardDescription>Latest posts across all platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentPosts.length === 0 && (
                <p className="text-muted-foreground">No recent posts found.</p>
              )}
              {recentPosts.map((post) => (
                <div key={post.id} className="border-b py-2 flex justify-between items-center">
                  <div>
                    <span className="font-semibold">[{post.platform}]</span> {post.content}
                    <span className="ml-2 text-xs text-muted-foreground">by {post.created_by}</span>
                  </div>
                  <Badge variant={post.status === 'published' ? 'secondary' : 'outline'}>{post.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Index;
