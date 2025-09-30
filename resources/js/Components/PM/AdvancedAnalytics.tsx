import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Target,
  AlertTriangle,
  CheckCircle,
  Calendar
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AnalyticsData {
  overview: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalCards: number;
    completedCards: number;
    averageVelocity: number;
    teamMembers: number;
  };
  velocity: Array<{
    sprint: string;
    planned: number;
    completed: number;
    date: string;
  }>;
  burndown: Array<{
    day: string;
    remaining: number;
    ideal: number;
  }>;
  cardsByStatus: Array<{
    status: string;
    count: number;
    color: string;
  }>;
  cardsByPriority: Array<{
    priority: string;
    count: number;
    color: string;
  }>;
  teamPerformance: Array<{
    member: string;
    completed: number;
    inProgress: number;
    velocity: number;
  }>;
  projectHealth: Array<{
    project: string;
    health: 'good' | 'warning' | 'critical';
    completion: number;
    daysOverdue: number;
  }>;
}

interface AdvancedAnalyticsProps {
  data: AnalyticsData;
  timeRange: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange: (range: '7d' | '30d' | '90d' | '1y') => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdvancedAnalytics({ data, timeRange, onTimeRangeChange }: AdvancedAnalyticsProps) {
  const completionRate = data.overview.totalCards > 0 
    ? Math.round((data.overview.completedCards / data.overview.totalCards) * 100)
    : 0;

  const projectCompletionRate = data.overview.totalProjects > 0
    ? Math.round((data.overview.completedProjects / data.overview.totalProjects) * 100)
    : 0;

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {data.overview.activeProjects} active
            </p>
            <Progress value={projectCompletionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cards Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.completedCards}</div>
            <p className="text-xs text-muted-foreground">
              of {data.overview.totalCards} total
            </p>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Velocity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.averageVelocity}</div>
            <p className="text-xs text-muted-foreground">
              story points per sprint
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.teamMembers}</div>
            <p className="text-xs text-muted-foreground">
              active contributors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="velocity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="velocity">Velocity</TabsTrigger>
          <TabsTrigger value="burndown">Burndown</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
          <TabsTrigger value="health">Project Health</TabsTrigger>
        </TabsList>

        <TabsContent value="velocity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sprint Velocity</CardTitle>
              <CardDescription>
                Planned vs completed story points over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.velocity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sprint" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="planned" fill="#e2e8f0" name="Planned" />
                  <Bar dataKey="completed" fill="#3b82f6" name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="burndown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sprint Burndown</CardTitle>
              <CardDescription>
                Remaining work vs ideal burndown line
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.burndown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="ideal" 
                    stroke="#e2e8f0" 
                    strokeDasharray="5 5"
                    name="Ideal"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="remaining" 
                    stroke="#3b82f6" 
                    name="Actual"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Cards by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={data.cardsByStatus}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ status, count }) => `${status}: ${count}`}
                    >
                      {data.cardsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cards by Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={data.cardsByPriority}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ priority, count }) => `${priority}: ${count}`}
                    >
                      {data.cardsByPriority.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
              <CardDescription>
                Individual team member productivity metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.teamPerformance.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{member.member}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>Completed: {member.completed}</span>
                        <span>In Progress: {member.inProgress}</span>
                        <span>Velocity: {member.velocity} pts</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{member.velocity}</div>
                      <div className="text-xs text-gray-500">avg velocity</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Health</CardTitle>
              <CardDescription>
                Overview of project status and potential issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.projectHealth.map((project, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getHealthIcon(project.health)}
                      <div>
                        <h4 className="font-medium">{project.project}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getHealthColor(project.health)}>
                            {project.health}
                          </Badge>
                          {project.daysOverdue > 0 && (
                            <span className="text-sm text-red-600">
                              {project.daysOverdue} days overdue
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{project.completion}%</div>
                      <Progress value={project.completion} className="w-20 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// To use this component, you'll need to install recharts:
// npm install recharts

// Usage in your dashboard:
/*
<AdvancedAnalytics
  data={analyticsData}
  timeRange={timeRange}
  onTimeRangeChange={setTimeRange}
/>
*/
