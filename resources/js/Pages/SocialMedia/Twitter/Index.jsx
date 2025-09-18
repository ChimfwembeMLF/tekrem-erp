
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/Components/ui/tabs';

const TwitterDashboard = ({ tweets = [] }) => (
  <AppLayout title="Twitter/X Dashboard">
    <div className="space-y-6">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          {/* Add more TabsTrigger here for future Twitter features */}
        </TabsList>
        <TabsContent value="dashboard">
          <Card>
            <CardHeader>
              <CardTitle>Twitter/X Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {tweets.length === 0 ? (
                <p className="text-muted-foreground">No tweets found.</p>
              ) : (
                <ul>
                  {tweets.map((tweet) => (
                    <li key={tweet.id}>{tweet.content}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  </AppLayout>
);

export default TwitterDashboard;
