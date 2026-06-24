<?php

namespace App\Services\Analytics;

use App\Models\Analytics\SitePageView;
use App\Models\Analytics\SiteVisitor;
use App\Models\HR\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class VisitorTrackingService
{
    public function __construct(
        private GeoLocationService $geoLocation
    ) {}

    /**
     * @param  array<string, mixed>  $context
     */
    public function trackFromContext(array $context): void
    {
        if (!config('analytics.enabled') || !$this->tablesExist()) {
            return;
        }

        try {
            $this->persistVisit($context);
        } catch (\Throwable) {
            // Never break page loads when analytics storage is unavailable.
        }
    }

    public function tablesExist(): bool
    {
        return Schema::hasTable('site_visitors') && Schema::hasTable('site_page_views');
    }

    /**
     * @param  array<string, mixed>  $context
     */
    private function persistVisit(array $context): void
    {
        if (!config('analytics.enabled')) {
            return;
        }

        $userAgent = (string) ($context['user_agent'] ?? '');
        $isBot = $this->isBot($userAgent);
        $visitorKey = (string) ($context['visitor_key'] ?? Str::uuid());
        $userId = $context['user_id'] ?? null;
        $user = $userId ? User::query()->find($userId) : null;
        $ipAddress = $context['ip'] ?? null;
        $path = '/' . ltrim((string) ($context['path'] ?? '/'), '/');
        $referrerHost = $this->referrerHost($context['referer'] ?? null);
        $routeName = $context['route_name'] ?? null;
        $device = $this->parseUserAgent($userAgent);
        $now = now();

        $visitor = SiteVisitor::query()->firstOrNew(['visitor_key' => $visitorKey]);

        if (!$visitor->exists) {
            $visitor->first_seen_at = $now;
            $visitor->landing_path = $path;
            $visitor->referrer_host = $referrerHost;
        }

        $visitor->fill([
            'user_id' => $user?->id,
            'ip_address' => $ipAddress,
            'user_agent' => Str::limit($userAgent, 500, ''),
            'device_type' => $device['device_type'],
            'browser' => $device['browser'],
            'os' => $device['os'],
            'is_bot' => $isBot,
            'last_seen_at' => $now,
        ]);

        if ($user) {
            $age = $this->resolveAge($user);
            if ($age !== null) {
                $visitor->age = $age;
            }
        }

        if (!$visitor->country_code && !$isBot) {
            $geo = $this->geoLocation->lookup($ipAddress);
            if ($geo) {
                $visitor->fill($geo);
            }
        }

        $visitor->page_views_count = ($visitor->page_views_count ?? 0) + 1;
        $visitor->save();

        if (!$isBot) {
            SitePageView::query()->create([
                'site_visitor_id' => $visitor->id,
                'user_id' => $user?->id,
                'path' => Str::limit($path, 500, ''),
                'route_name' => $routeName,
                'referrer_host' => $referrerHost,
                'method' => (string) ($context['method'] ?? 'GET'),
                'created_at' => $now,
            ]);
        }
    }

    public function track(Request $request): void
    {
        if (!$this->shouldTrack($request)) {
            return;
        }

        $this->trackFromContext([
            'visitor_key' => $this->resolveVisitorKey($request),
            'user_id' => $request->user()?->id,
            'ip' => $request->ip(),
            'path' => $request->path(),
            'method' => $request->method(),
            'user_agent' => $request->userAgent(),
            'referer' => $request->headers->get('referer'),
            'route_name' => $request->route()?->getName(),
        ]);
    }

    public function shouldTrack(Request $request): bool
    {
        if (!$request->isMethod('GET')) {
            return false;
        }

        if ($request->ajax() && !$request->header('X-Inertia')) {
            return false;
        }

        $path = $request->path();

        foreach (config('analytics.exclude_paths', []) as $pattern) {
            if (Str::is($pattern, $path)) {
                return false;
            }
        }

        $extension = pathinfo($path, PATHINFO_EXTENSION);
        if ($extension && in_array(strtolower($extension), config('analytics.exclude_extensions', []), true)) {
            return false;
        }

        if ($request->routeIs('analytics.*')) {
            return false;
        }

        return true;
    }

    public function isBot(string $userAgent): bool
    {
        if ($userAgent === '') {
            return true;
        }

        $needle = strtolower($userAgent);

        foreach (config('analytics.bot_patterns', []) as $pattern) {
            if (str_contains($needle, $pattern)) {
                return true;
            }
        }

        return false;
    }

    public function resolveVisitorKey(Request $request): string
    {
        $cookieName = config('analytics.cookie_name', 'erp_vid');
        $existing = $request->cookie($cookieName);

        if ($existing && Str::isUuid($existing)) {
            return $existing;
        }

        return (string) Str::uuid();
    }

    public function cookieName(): string
    {
        return config('analytics.cookie_name', 'erp_vid');
    }

    public function cookieLifetimeMinutes(): int
    {
        return (int) config('analytics.cookie_lifetime_days', 365) * 24 * 60;
    }

    private function referrerHost(?string $referrer): ?string
    {
        if (!$referrer) {
            return null;
        }

        $host = parse_url($referrer, PHP_URL_HOST);

        return is_string($host) ? Str::limit($host, 255, '') : null;
    }

    private function resolveAge(User $user): ?int
    {
        $employee = Employee::query()
            ->where('user_id', $user->id)
            ->whereNotNull('date_of_birth')
            ->first();

        return $employee?->date_of_birth?->age;
    }

    /**
     * @return array{device_type: string, browser: string, os: string}
     */
    private function parseUserAgent(string $userAgent): array
    {
        $ua = strtolower($userAgent);

        $device = 'desktop';
        if (str_contains($ua, 'mobile') || str_contains($ua, 'android')) {
            $device = 'mobile';
        } elseif (str_contains($ua, 'tablet') || str_contains($ua, 'ipad')) {
            $device = 'tablet';
        }

        $browser = 'Other';
        if (str_contains($ua, 'edg/')) {
            $browser = 'Edge';
        } elseif (str_contains($ua, 'chrome/') && !str_contains($ua, 'chromium')) {
            $browser = 'Chrome';
        } elseif (str_contains($ua, 'firefox/')) {
            $browser = 'Firefox';
        } elseif (str_contains($ua, 'safari/') && !str_contains($ua, 'chrome/')) {
            $browser = 'Safari';
        } elseif (str_contains($ua, 'opr/') || str_contains($ua, 'opera')) {
            $browser = 'Opera';
        }

        $os = 'Other';
        if (str_contains($ua, 'windows')) {
            $os = 'Windows';
        } elseif (str_contains($ua, 'mac os') || str_contains($ua, 'macintosh')) {
            $os = 'macOS';
        } elseif (str_contains($ua, 'android')) {
            $os = 'Android';
        } elseif (str_contains($ua, 'iphone') || str_contains($ua, 'ipad') || str_contains($ua, 'ios')) {
            $os = 'iOS';
        } elseif (str_contains($ua, 'linux')) {
            $os = 'Linux';
        }

        return [
            'device_type' => $device,
            'browser' => $browser,
            'os' => $os,
        ];
    }
}
