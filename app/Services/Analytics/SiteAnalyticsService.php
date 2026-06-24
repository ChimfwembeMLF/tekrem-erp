<?php

namespace App\Services\Analytics;

use App\Models\Analytics\SitePageView;
use App\Models\Analytics\SiteVisitor;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SiteAnalyticsService
{
    public function getDateRange(?string $period = '30d'): array
    {
        $end = now()->endOfDay();

        $start = match ($period) {
            '7d' => now()->subDays(6)->startOfDay(),
            '90d' => now()->subDays(89)->startOfDay(),
            'today' => now()->startOfDay(),
            default => now()->subDays(29)->startOfDay(),
        };

        return [
            'period' => $period,
            'start' => $start,
            'end' => $end,
            'label' => match ($period) {
                '7d' => 'Last 7 days',
                '90d' => 'Last 90 days',
                'today' => 'Today',
                default => 'Last 30 days',
            },
        ];
    }

    public function dashboard(string $period = '30d'): array
    {
        $range = $this->getDateRange($period);

        if (!Schema::hasTable('site_visitors') || !Schema::hasTable('site_page_views')) {
            return $this->emptyDashboard($range);
        }

        $start = $range['start'];
        $end = $range['end'];

        $visitorBase = SiteVisitor::query()
            ->where('is_bot', false)
            ->whereBetween('last_seen_at', [$start, $end]);

        $pageViewBase = SitePageView::query()
            ->whereBetween('created_at', [$start, $end])
            ->whereHas('visitor', fn ($q) => $q->where('is_bot', false));

        $uniqueVisitors = (clone $visitorBase)->count();
        $totalPageViews = (clone $pageViewBase)->count();
        $loggedInVisitors = (clone $visitorBase)->whereNotNull('user_id')->count();
        $anonymousVisitors = max(0, $uniqueVisitors - $loggedInVisitors);

        $todayStart = now()->startOfDay();
        $visitorsToday = SiteVisitor::query()
            ->where('is_bot', false)
            ->where('last_seen_at', '>=', $todayStart)
            ->count();

        $pageViewsToday = SitePageView::query()
            ->where('created_at', '>=', $todayStart)
            ->whereHas('visitor', fn ($q) => $q->where('is_bot', false))
            ->count();

        return [
            'dateRange' => [
                'period' => $range['period'],
                'label' => $range['label'],
                'start' => $start->toDateString(),
                'end' => $end->toDateString(),
            ],
            'overview' => [
                'unique_visitors' => $uniqueVisitors,
                'page_views' => $totalPageViews,
                'visitors_today' => $visitorsToday,
                'page_views_today' => $pageViewsToday,
                'logged_in_visitors' => $loggedInVisitors,
                'anonymous_visitors' => $anonymousVisitors,
                'avg_pages_per_visitor' => $uniqueVisitors > 0
                    ? round($totalPageViews / $uniqueVisitors, 1)
                    : 0,
            ],
            'trafficTrend' => $this->trafficTrend($start, $end),
            'topPages' => $this->topPages($start, $end),
            'topCountries' => $this->topCountries($start, $end),
            'topCities' => $this->topCities($start, $end),
            'devices' => $this->groupCount($visitorBase, 'device_type'),
            'browsers' => $this->groupCount($visitorBase, 'browser'),
            'referrers' => $this->topReferrers($start, $end),
            'ageDistribution' => $this->ageDistribution($start, $end),
            'recentVisitors' => $this->recentVisitors($start, $end),
        ];
    }

    private function trafficTrend(Carbon $start, Carbon $end): array
    {
        $views = SitePageView::query()
            ->selectRaw('DATE(created_at) as date, COUNT(*) as page_views')
            ->whereBetween('created_at', [$start, $end])
            ->whereHas('visitor', fn ($q) => $q->where('is_bot', false))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $visitors = SiteVisitor::query()
            ->selectRaw('DATE(last_seen_at) as date, COUNT(*) as visitors')
            ->where('is_bot', false)
            ->whereBetween('last_seen_at', [$start, $end])
            ->groupBy(DB::raw('DATE(last_seen_at)'))
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $trend = [];
        $cursor = $start->copy()->startOfDay();

        while ($cursor->lte($end)) {
            $key = $cursor->toDateString();
            $trend[] = [
                'date' => $key,
                'label' => $cursor->format('M j'),
                'visitors' => (int) ($visitors[$key]->visitors ?? 0),
                'page_views' => (int) ($views[$key]->page_views ?? 0),
            ];
            $cursor->addDay();
        }

        return $trend;
    }

    private function topPages(Carbon $start, Carbon $end, int $limit = 10): array
    {
        return SitePageView::query()
            ->selectRaw('path, COUNT(*) as views')
            ->whereBetween('created_at', [$start, $end])
            ->whereHas('visitor', fn ($q) => $q->where('is_bot', false))
            ->groupBy('path')
            ->orderByDesc('views')
            ->limit($limit)
            ->get()
            ->map(fn ($row) => ['path' => $row->path, 'views' => (int) $row->views])
            ->all();
    }

    private function topCountries(Carbon $start, Carbon $end, int $limit = 10): array
    {
        return SiteVisitor::query()
            ->selectRaw('country_name, country_code, COUNT(*) as visitors')
            ->where('is_bot', false)
            ->whereBetween('last_seen_at', [$start, $end])
            ->whereNotNull('country_code')
            ->groupBy('country_name', 'country_code')
            ->orderByDesc('visitors')
            ->limit($limit)
            ->get()
            ->map(fn ($row) => [
                'country' => $row->country_name ?: 'Unknown',
                'country_code' => $row->country_code,
                'visitors' => (int) $row->visitors,
            ])
            ->all();
    }

    private function topCities(Carbon $start, Carbon $end, int $limit = 10): array
    {
        return SiteVisitor::query()
            ->selectRaw('city, region, country_name, COUNT(*) as visitors')
            ->where('is_bot', false)
            ->whereBetween('last_seen_at', [$start, $end])
            ->whereNotNull('city')
            ->groupBy('city', 'region', 'country_name')
            ->orderByDesc('visitors')
            ->limit($limit)
            ->get()
            ->map(fn ($row) => [
                'city' => $row->city,
                'region' => $row->region,
                'country' => $row->country_name,
                'visitors' => (int) $row->visitors,
            ])
            ->all();
    }

    private function groupCount($query, string $column): array
    {
        return (clone $query)
            ->selectRaw("{$column}, COUNT(*) as count")
            ->whereNotNull($column)
            ->groupBy($column)
            ->orderByDesc('count')
            ->get()
            ->map(fn ($row) => ['label' => $row->{$column}, 'count' => (int) $row->count])
            ->all();
    }

    private function topReferrers(Carbon $start, Carbon $end, int $limit = 8): array
    {
        return SitePageView::query()
            ->selectRaw('referrer_host, COUNT(*) as views')
            ->whereBetween('created_at', [$start, $end])
            ->whereNotNull('referrer_host')
            ->whereHas('visitor', fn ($q) => $q->where('is_bot', false))
            ->groupBy('referrer_host')
            ->orderByDesc('views')
            ->limit($limit)
            ->get()
            ->map(fn ($row) => ['referrer' => $row->referrer_host, 'views' => (int) $row->views])
            ->all();
    }

    private function ageDistribution(Carbon $start, Carbon $end): array
    {
        $buckets = [
            'Under 18' => [0, 17],
            '18-24' => [18, 24],
            '25-34' => [25, 34],
            '35-44' => [35, 44],
            '45-54' => [45, 54],
            '55+' => [55, 120],
        ];

        $visitorsWithAge = SiteVisitor::query()
            ->where('is_bot', false)
            ->whereBetween('last_seen_at', [$start, $end])
            ->whereNotNull('age')
            ->get(['age']);

        $knownCount = $visitorsWithAge->count();

        $distribution = collect($buckets)->map(function (array $range, string $label) use ($visitorsWithAge, $knownCount) {
            $count = $visitorsWithAge->filter(
                fn ($visitor) => $visitor->age >= $range[0] && $visitor->age <= $range[1]
            )->count();

            return [
                'label' => $label,
                'count' => $count,
                'percentage' => $knownCount > 0 ? round(($count / $knownCount) * 100, 1) : 0,
            ];
        })->values()->all();

        return [
            'known_visitors' => $knownCount,
            'buckets' => $distribution,
        ];
    }

    private function recentVisitors(Carbon $start, Carbon $end, int $limit = 20): array
    {
        return SiteVisitor::query()
            ->with('user:id,name,email')
            ->where('is_bot', false)
            ->whereBetween('last_seen_at', [$start, $end])
            ->orderByDesc('last_seen_at')
            ->limit($limit)
            ->get()
            ->map(fn (SiteVisitor $visitor) => [
                'id' => $visitor->id,
                'visitor_key' => substr($visitor->visitor_key, 0, 8),
                'user' => $visitor->user ? [
                    'name' => $visitor->user->name,
                    'email' => $visitor->user->email,
                ] : null,
                'location' => $visitor->locationLabel(),
                'country_code' => $visitor->country_code,
                'city' => $visitor->city,
                'device_type' => $visitor->device_type,
                'browser' => $visitor->browser,
                'age' => $visitor->age,
                'page_views_count' => $visitor->page_views_count,
                'landing_path' => $visitor->landing_path,
                'last_seen_at' => $visitor->last_seen_at?->toIso8601String(),
            ])
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function emptyDashboard(array $range): array
    {
        return [
            'dateRange' => [
                'period' => $range['period'],
                'label' => $range['label'],
                'start' => $range['start']->toDateString(),
                'end' => $range['end']->toDateString(),
            ],
            'setupRequired' => true,
            'overview' => [
                'unique_visitors' => 0,
                'page_views' => 0,
                'visitors_today' => 0,
                'page_views_today' => 0,
                'logged_in_visitors' => 0,
                'anonymous_visitors' => 0,
                'avg_pages_per_visitor' => 0,
            ],
            'trafficTrend' => [],
            'topPages' => [],
            'topCountries' => [],
            'topCities' => [],
            'devices' => [],
            'browsers' => [],
            'referrers' => [],
            'ageDistribution' => [
                'known_visitors' => 0,
                'buckets' => [],
            ],
            'recentVisitors' => [],
        ];
    }
}
