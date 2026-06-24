import React from 'react';
import { router } from '@inertiajs/react';
import ModuleDashboardShell from '@/Components/Dashboard/ModuleDashboardShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Activity,
  Eye,
  Globe,
  MapPin,
  Monitor,
  Users,
  UserCheck,
  Info,
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Overview {
  unique_visitors: number;
  page_views: number;
  visitors_today: number;
  page_views_today: number;
  logged_in_visitors: number;
  anonymous_visitors: number;
  avg_pages_per_visitor: number;
}

interface TrendPoint {
  date: string;
  label: string;
  visitors: number;
  page_views: number;
}

interface CountRow {
  label: string;
  count: number;
}

interface TopPage {
  path: string;
  views: number;
}

interface CountryRow {
  country: string;
  country_code: string;
  visitors: number;
}

interface CityRow {
  city: string;
  region?: string;
  country?: string;
  visitors: number;
}

interface ReferrerRow {
  referrer: string;
  views: number;
}

interface AgeBucket {
  label: string;
  count: number;
  percentage: number;
}

interface RecentVisitor {
  id: number;
  visitor_key: string;
  user?: { name: string; email: string } | null;
  location: string;
  country_code?: string;
  city?: string;
  device_type?: string;
  browser?: string;
  age?: number | null;
  page_views_count: number;
  landing_path?: string;
  last_seen_at?: string;
}

interface Props {
  dateRange: {
    period: string;
    label: string;
    start: string;
    end: string;
  };
  overview: Overview;
  trafficTrend: TrendPoint[];
  topPages: TopPage[];
  topCountries: CountryRow[];
  topCities: CityRow[];
  devices: CountRow[];
  browsers: CountRow[];
  referrers: ReferrerRow[];
  ageDistribution: {
    known_visitors: number;
    buckets: AgeBucket[];
  };
  recentVisitors: RecentVisitor[];
}

const PIE_COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function SiteAnalyticsDashboard({
  dateRange,
  overview,
  trafficTrend,
  topPages,
  topCountries,
  topCities,
  devices,
  browsers,
  referrers,
  ageDistribution,
  recentVisitors,
}: Props) {
  const route = useRoute();

  const handlePeriodChange = (period: string) => {
    router.get(route('analytics.site.index'), { period }, { preserveState: true, replace: true });
  };

  const formatDateTime = (value?: string) => {
    if (!value) return '—';
    return new Date(value).toLocaleString();
  };

  return (
    <ModuleDashboardShell
      title="Site Analytics"
      description="See who visits your site, where they come from, and which pages they view."
      workspaceLabel="Analytics"
      heroAccent="from-primary/15 via-primary/5 to-secondary/10"
      actions={
        <Select value={dateRange.period} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      }
    >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.unique_visitors.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{dateRange.label}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Page Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.page_views.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {overview.avg_pages_per_visitor} pages / visitor
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.visitors_today.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {overview.page_views_today.toLocaleString()} page views today
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Logged-in Visitors</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.logged_in_visitors.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {overview.anonymous_visitors.toLocaleString()} anonymous
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Traffic Trend</CardTitle>
            <CardDescription>Visitors and page views over {dateRange.label.toLowerCase()}</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trafficTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="visitors" stroke="#2563eb" strokeWidth={2} name="Visitors" />
                <Line type="monotone" dataKey="page_views" stroke="#16a34a" strokeWidth={2} name="Page Views" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Top Countries
              </CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              {topCountries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topCountries} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="country" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="visitors" fill="#2563eb" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">No geographic data yet. Visits will appear after traffic is recorded.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Top Cities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topCities.length > 0 ? topCities.map((city) => (
                  <div key={`${city.city}-${city.country}`} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{city.city}</p>
                      <p className="text-xs text-muted-foreground">
                        {[city.region, city.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                    <Badge variant="secondary">{city.visitors}</Badge>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">No city data yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topPages.map((page) => (
                <div key={page.path} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <code className="truncate text-xs">{page.path}</code>
                  <Badge>{page.views}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Devices
              </CardTitle>
            </CardHeader>
            <CardContent className="h-56">
              {devices.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={devices} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={80} label>
                      {devices.map((entry, index) => (
                        <Cell key={entry.label} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">No device data yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Referrers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {referrers.length > 0 ? referrers.map((row) => (
                <div key={row.referrer} className="flex items-center justify-between rounded-lg border p-3">
                  <span className="truncate text-sm">{row.referrer}</span>
                  <Badge variant="outline">{row.views}</Badge>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">Direct traffic or no referrer data yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Age Distribution</CardTitle>
            <CardDescription className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Age is only available for logged-in staff with a date of birth on their HR employee profile.
                Anonymous visitors cannot be aged from a website visit alone.
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ageDistribution.known_visitors > 0 ? (
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                {ageDistribution.buckets.map((bucket) => (
                  <div key={bucket.label} className="rounded-lg border p-4 text-center">
                    <p className="text-sm text-muted-foreground">{bucket.label}</p>
                    <p className="text-2xl font-bold">{bucket.count}</p>
                    <p className="text-xs text-muted-foreground">{bucket.percentage}%</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No age data yet. Add date of birth to employee records for logged-in staff visits.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Visitors</CardTitle>
            <CardDescription>Latest {recentVisitors.length} visitors in the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Visitor</th>
                    <th className="pb-3 pr-4 font-medium">Location</th>
                    <th className="pb-3 pr-4 font-medium">Device</th>
                    <th className="pb-3 pr-4 font-medium">Age</th>
                    <th className="pb-3 pr-4 font-medium">Views</th>
                    <th className="pb-3 font-medium">Last seen</th>
                  </tr>
                </thead>
                <tbody>
                  {recentVisitors.map((visitor) => (
                    <tr key={visitor.id} className="border-b last:border-0">
                      <td className="py-3 pr-4">
                        <div className="font-medium">
                          {visitor.user?.name ?? `Visitor ${visitor.visitor_key}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {visitor.user?.email ?? visitor.landing_path ?? 'Anonymous'}
                        </div>
                      </td>
                      <td className="py-3 pr-4">{visitor.location}</td>
                      <td className="py-3 pr-4">
                        {[visitor.device_type, visitor.browser].filter(Boolean).join(' · ') || '—'}
                      </td>
                      <td className="py-3 pr-4">{visitor.age ?? '—'}</td>
                      <td className="py-3 pr-4">{visitor.page_views_count}</td>
                      <td className="py-3">{formatDateTime(visitor.last_seen_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
    </ModuleDashboardShell>
  );
}
