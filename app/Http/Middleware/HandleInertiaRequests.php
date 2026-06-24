<?php

namespace App\Http\Middleware;

use App\Models\HR\Attendance;
use App\Models\HR\Employee;
use App\Models\Setting;
use App\Services\HR\HrSettings;
use App\Services\HR\OfficeLocationService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    ...$request->user()->toArray(),
                    'roles' => $request->user()->user_roles ?? [],
                    'permissions' => $request->user()->user_permissions ?? [],
                ] : null,
            ],
            'notifications' => $request->user() ? [
                'recent' => $request->user()->notifications()
                    ->latest()
                    ->take(10)
                    ->get(),
                'unreadCount' => $request->user()->unreadNotifications()->count(),
            ] : null,
            'recaptcha' => [
                'enabled' => Setting::get('recaptcha.recaptcha_enabled', false) && !app()->environment('local', 'development', 'dev'),
                'site_key' => Setting::get('recaptcha.recaptcha_site_key', ''),
                'theme' => Setting::get('recaptcha.recaptcha_theme', 'light'),
                'size' => Setting::get('recaptcha.recaptcha_size', 'normal'),
                'development_mode' => app()->environment('local', 'development', 'dev'),
            ],
            'staffClock' => fn () => $this->staffClockStatus($request),
            'staffPortal' => fn () => $this->staffPortalMeta($request),
            'flash' => fn () => $this->flashMessages($request),
        ];
    }

    /**
     * Normalized flash messages for global toast display.
     *
     * @return array{success: ?string, error: ?string, message: ?string}
     */
    private function flashMessages(Request $request): array
    {
        $success = $request->session()->get('success');
        $error = $request->session()->get('error');
        $message = $request->session()->get('message');

        $legacy = $request->session()->get('flash');
        if (is_array($legacy)) {
            $banner = $legacy['banner'] ?? null;
            $style = $legacy['bannerStyle'] ?? 'success';

            if ($banner) {
                if ($style === 'danger') {
                    $error = $error ?? $banner;
                } else {
                    $success = $success ?? $banner;
                }
            }
        }

        // Jetstream-style session flash (if present)
        $jetstreamFlash = $request->session()->get('jetstream.flash');
        if (is_array($jetstreamFlash) && ! empty($jetstreamFlash['banner'])) {
            $style = $jetstreamFlash['bannerStyle'] ?? 'success';
            if ($style === 'danger') {
                $error = $error ?? $jetstreamFlash['banner'];
            } else {
                $success = $success ?? $jetstreamFlash['banner'];
            }
        }

        return [
            'success' => is_string($success) ? $success : null,
            'error' => is_string($error) ? $error : null,
            'message' => is_string($message) ? $message : null,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function staffClockStatus(Request $request): ?array
    {
        $user = $request->user();

        if (! $user) {
            return null;
        }

        $employee = $user->employee()
            ->with('user')
            ->where('employment_status', 'active')
            ->first();

        if (! $employee) {
            return null;
        }

        $officeLocation = app(OfficeLocationService::class);
        $today = now()->format('Y-m-d');

        $attendance = Attendance::where('employee_id', $employee->id)
            ->where('date', $today)
            ->first();

        return [
            'employee_id' => $employee->id,
            'employee_name' => $employee->full_name,
            'date' => $today,
            'clock_in' => $attendance?->clock_in?->format('H:i'),
            'clock_out' => $attendance?->clock_out?->format('H:i'),
            'is_clocked_in' => $attendance ? $attendance->isClockedIn() : false,
            'can_clock_in' => ! $attendance || ! $attendance->clock_in,
            'can_clock_out' => $attendance ? $attendance->isClockedIn() : false,
            'require_location' => (bool) HrSettings::attendance('require_clock_in_location', true),
            'location_enforced' => $officeLocation->shouldEnforceGeofence(),
            'mock_location' => $officeLocation->getMockCoordinates(),
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function staffPortalMeta(Request $request): ?array
    {
        $user = $request->user();

        if (! $user) {
            return null;
        }

        $employee = $user->employee()
            ->where('employment_status', 'active')
            ->first();

        if (! $employee) {
            return null;
        }

        $isManager = Employee::query()
            ->where('manager_id', $employee->id)
            ->where('employment_status', 'active')
            ->exists();

        $pendingTeamLeaves = 0;
        if ($isManager) {
            $subordinateIds = Employee::query()
                ->where('manager_id', $employee->id)
                ->pluck('id');
            $pendingTeamLeaves = \App\Models\HR\Leave::pending()
                ->whereIn('employee_id', $subordinateIds)
                ->count();
        }

        return [
            'dashboard_url' => route('staff.dashboard'),
            'is_manager' => $isManager,
            'pending_team_leaves' => $pendingTeamLeaves,
        ];
    }
}
