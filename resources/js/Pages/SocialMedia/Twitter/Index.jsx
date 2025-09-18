

import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/Components/ui/tabs';

const TwitterDashboard = ({ tweets = [], stats = {} }) => {
  const [tweetText, setTweetText] = useState('');
  const [tweetAccount, setTweetAccount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreateTweet = (e) => {
    e.preventDefault();
    setSubmitting(true);
    Inertia.post(route('social-media.twitter.tweets.create'), {
      text: tweetText,
      twitter_account_id: tweetAccount,
    }, {
      onFinish: () => {
        setSubmitting(false);
        setTweetText('');
      }
    });
  };

  const handlePublishTweet = (tweetId) => {
    Inertia.post(route('social-media.twitter.tweets.publish', { tweet: tweetId }));
  };

  return (
    <AppLayout title="Twitter/X Dashboard">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Twitter/X</h1>
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="create-tweet">Create Tweet</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle>Total Tweets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total_tweets ?? 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Followers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.followers ?? 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Following</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.following ?? 0}</div>
                </CardContent>
              </Card>
            </div>
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Tweets</CardTitle>
              </CardHeader>
              <CardContent>
                {tweets.length === 0 ? (
                  <p className="text-muted-foreground">No tweets found.</p>
                ) : (
                  <ul>
                    {tweets.map((tweet) => (
                      <li key={tweet.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <span>{tweet.text}</span>
                        {!tweet.published && (
                          <button className="ml-4 px-2 py-1 bg-blue-500 text-white rounded" onClick={() => handlePublishTweet(tweet.id)}>
                            Publish
                          </button>
                        )}
                        {tweet.published && <span className="ml-4 text-green-600">Published</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="create-tweet">
            <Card>
              <CardHeader>
                <CardTitle>Create a New Tweet</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTweet} className="space-y-4">
                  <textarea
                    className="w-full border rounded p-2"
                    rows={3}
                    value={tweetText}
                    onChange={e => setTweetText(e.target.value)}
                    placeholder="What's happening?"
                    required
                  />
                  {/* Add account selection if multiple accounts supported */}
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                    disabled={submitting}
                  >
                    {submitting ? 'Posting...' : 'Post Tweet'}
                  </button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default TwitterDashboard;
