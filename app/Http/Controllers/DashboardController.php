<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Models\Client;
use App\Models\Lead;
use App\Models\Communication;
use App\Models\Finance\Invoice;
use App\Models\Finance\Transaction;
use App\Models\Project;
use App\Models\HR\Employee;
use App\Models\Support\Ticket;
use App\Models\CMS\Page;
use App\Models\CMS\Post;
use App\Models\AI\Service as AIService;
use App\Models\AI\Conversation;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Handle dashboard routing based on user role.
     */
    public function index(): Response|RedirectResponse
    {
        $user = Auth::user();

        // Redirect customers to their dedicated dashboard
        if ($user->hasRole('customer')) {
            return redirect()->route('customer.dashboard');
        }

        // For admin, manager, and staff users, show the main dashboard with comprehensive data
        $dashboardData = $this->getAdminDashboardData();

        return Inertia::render('Dashboard', $dashboardData);
    }

    /**
     * Get comprehensive admin dashboard data.
     */
    private function getAdminDashboardData(): array
    {
        $user = Auth::user();

        // Cache dashboard data for 5 minutes to improve performance
        return Cache::remember("admin_dashboard_{$user->id}", 300, function () use ($user) {
            return [
                'stats' => $this->getOverviewStats(),
                'systemHealth' => $this->getSystemHealth(),
                'recentActivity' => $this->getRecentActivity(),
                'moduleUsage' => $this->getModuleUsage(),
                'userManagement' => $this->getUserManagementSummary(),
                'quickActions' => $this->getQuickActions(),
                'analytics' => $this->getAnalyticsData(),
                'notifications' => $this->getSystemNotifications(),
            ];
        });
    }

    /**
     * Get overview statistics.
     */
    private function getOverviewStats(): array
    {
        $cid = currentCompanyId();
        return [
            'totalUsers' => User::where('company_id', $cid)->count(),
            'activeUsers' => User::where('company_id', $cid)->where('last_login_at', '>=', Carbon::now()->subDays(30))->count(),
            'totalClients' => Client::where('company_id', $cid)->count(),
            'totalLeads' => Lead::where('company_id', $cid)->count(),
            'totalProjects' => Project::where('company_id', $cid)->count(),
            'totalTickets' => Ticket::where('company_id', $cid)->count(),
            'totalInvoices' => Invoice::where('company_id', $cid)->count(),
            'totalRevenue' => Invoice::where('company_id', $cid)->where('status', 'paid')->sum('total_amount'),
            'monthlyRevenue' => Invoice::where('company_id', $cid)->where('status', 'paid')
                ->whereMonth('created_at', Carbon::now()->month)
                ->sum('total_amount'),
            'pendingTickets' => Ticket::where('company_id', $cid)->where('status', 'open')->count(),
            'activeProjects' => Project::where('company_id', $cid)->where('status', 'active')->count(),
        ];
    }

    /**
     * Get system health monitoring data.
     */
    private function getSystemHealth(): array
    {
        $dbStatus = $this->checkDatabaseHealth();
        $cacheStatus = $this->checkCacheHealth();
        $storageStatus = $this->checkStorageHealth();

        return [
            'database' => $dbStatus,
            'cache' => $cacheStatus,
            'storage' => $storageStatus,
            'overallHealth' => $dbStatus['status'] === 'healthy' &&
                             $cacheStatus['status'] === 'healthy' &&
                             $storageStatus['status'] === 'healthy' ? 'healthy' : 'warning',
            'lastChecked' => Carbon::now()->toISOString(),
        ];
    }

    /**
     * Check database health.
     */
    private function checkDatabaseHealth(): array
    {
        try {
            $start = microtime(true);
            DB::connection()->getPdo();
            $responseTime = round((microtime(true) - $start) * 1000, 2);

            return [
                'status' => 'healthy',
                'responseTime' => $responseTime . 'ms',
                'connections' => DB::connection()->getConfig()['database'] ?? 'Unknown',
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'error' => $e->getMessage(),
                'responseTime' => null,
            ];
        }
    }

    /**
     * Check cache health.
     */
    private function checkCacheHealth(): array
    {
        try {
            $start = microtime(true);
            Cache::put('health_check', 'ok', 10);
            $result = Cache::get('health_check');
            $responseTime = round((microtime(true) - $start) * 1000, 2);

            return [
                'status' => $result === 'ok' ? 'healthy' : 'warning',
                'responseTime' => $responseTime . 'ms',
                'driver' => config('cache.default'),
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'error' => $e->getMessage(),
                'responseTime' => null,
            ];
        }
    }

    /**
     * Check storage health.
     */
    private function checkStorageHealth(): array
    {
        try {
            $storagePath = storage_path();
            $freeBytes = disk_free_space($storagePath);
            $totalBytes = disk_total_space($storagePath);
            $usedPercentage = round((($totalBytes - $freeBytes) / $totalBytes) * 100, 2);

            return [
                'status' => $usedPercentage < 90 ? 'healthy' : 'warning',
                'freeSpace' => $this->formatBytes($freeBytes),
                'totalSpace' => $this->formatBytes($totalBytes),
                'usedPercentage' => $usedPercentage,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Format bytes to human readable format.
     */
    private function formatBytes($bytes, $precision = 2): string
    {
        $units = array('B', 'KB', 'MB', 'GB', 'TB');

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }

    /**
     * Get recent activity feed.
     */
    private function getRecentActivity(): array
    {
        $cid = currentCompanyId();
        $activities = [];

        // Recent user registrations
        $recentUsers = User::where('company_id', $cid)->latest()->take(5)->get(['id', 'name', 'email', 'created_at']);
        foreach ($recentUsers as $user) {
            $activities[] = [
                'type' => 'user_registered',
                'title' => 'New User Registration',
                'description' => "{$user->name} registered",
                'timestamp' => $user->created_at,
                'icon' => 'user-plus',
                'color' => 'green',
            ];
        }

        // Recent communications
        $recentComms = Communication::with('user')->where('company_id', $cid)->latest()->take(5)->get();
        foreach ($recentComms as $comm) {
            $activities[] = [
                'type' => 'communication',
                'title' => 'New Communication',
                'description' => "Communication by {$comm->user->name}",
                'timestamp' => $comm->created_at,
                'icon' => 'message-square',
                'color' => 'blue',
            ];
        }

        // Recent tickets
        $recentTickets = Ticket::with('createdBy')->where('company_id', $cid)->latest()->take(5)->get();
        foreach ($recentTickets as $ticket) {
            $activities[] = [
                'type' => 'ticket',
                'title' => 'New Support Ticket',
                'description' => "Ticket #{$ticket->id} created",
                'timestamp' => $ticket->created_at,
                'icon' => 'ticket',
                'color' => 'orange',
            ];
        }

        // Sort by timestamp and return latest 10
        usort($activities, function ($a, $b) {
            return $b['timestamp'] <=> $a['timestamp'];
        });

        return array_slice($activities, 0, 10);
    }

    /**
     * Get module usage analytics.
     */
    private function getModuleUsage(): array
    {
        $cid = currentCompanyId();
        return [
            'crm' => [
                'clients' => Client::where('company_id', $cid)->count(),
                'leads' => Lead::where('company_id', $cid)->count(),
                'communications' => Communication::where('company_id', $cid)->count(),
                'growth' => $this->getModuleGrowth('clients', $cid),
            ],
            'finance' => [
                'invoices' => Invoice::where('company_id', $cid)->count(),
                'transactions' => Transaction::where('company_id', $cid)->count(),
                'revenue' => Invoice::where('company_id', $cid)->where('status', 'paid')->sum('total_amount'),
                'growth' => $this->getModuleGrowth('invoices', $cid),
            ],
            'projects' => [
                'total' => Project::where('company_id', $cid)->count(),
                'active' => Project::where('company_id', $cid)->where('status', 'active')->count(),
                'completed' => Project::where('company_id', $cid)->where('status', 'completed')->count(),
                'growth' => $this->getModuleGrowth('projects', $cid),
            ],
            'hr' => [
                'employees' => Employee::where('company_id', $cid)->count(),
                'active' => Employee::where('company_id', $cid)->count(),
                'departments' => Employee::where('company_id', $cid)->distinct('department_id')->count(),
                'growth' => $this->getModuleGrowth('employees', $cid),
            ],
            'support' => [
                'tickets' => Ticket::where('company_id', $cid)->count(),
                'open' => Ticket::where('company_id', $cid)->where('status', 'open')->count(),
                'resolved' => Ticket::where('company_id', $cid)->where('status', 'resolved')->count(),
                'growth' => $this->getModuleGrowth('tickets', $cid),
            ],
            'cms' => [
                'pages' => Page::where('company_id', $cid)->count(),
                'posts' => [],
                'published' => [],
                'growth' => [],
            ],
            'ai' => [
                'services' => AIService::where('company_id', $cid)->count(),
                'conversations' => Conversation::where('company_id', $cid)->count(),
                'active_services' => AIService::where('company_id', $cid)->where('is_enabled', true)->count(),
                'growth' => $this->getModuleGrowth('ai_conversations', $cid),
            ],
        ];
    }

    /**
     * Get module growth data.
     */
    private function getModuleGrowth(string $table): array
    {
        return $this->getModuleGrowthWithCompany($table, currentCompanyId());
    }

    private function getModuleGrowthWithCompany(string $table, $companyId): array
    {
        $currentMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();

        $tableMap = [
            'clients' => 'clients',
            'invoices' => 'invoices',
            'projects' => 'projects',
            'employees' => 'hr_employees',
            'tickets' => 'tickets',
            'ai_conversations' => 'conversations',
        ];
        $actualTable = $tableMap[$table] ?? $table;

        $currentCount = DB::table($actualTable)
            ->where('company_id', $companyId)
            ->where('created_at', '>=', $currentMonth)
            ->count();

        $lastCount = DB::table($actualTable)
            ->where('company_id', $companyId)
            ->where('created_at', '>=', $lastMonth)
            ->where('created_at', '<', $currentMonth)
            ->count();

        $percentage = $lastCount > 0 ? round((($currentCount - $lastCount) / $lastCount) * 100, 1) : 0;

        return [
            'current' => $currentCount,
            'previous' => $lastCount,
            'percentage' => $percentage,
            'trend' => $percentage > 0 ? 'up' : ($percentage < 0 ? 'down' : 'stable'),
        ];
    }

    /**
     * Get user management summary.
     */
    private function getUserManagementSummary(): array
    {
        $cid = currentCompanyId();
        $roleDistribution = Role::with(['users' => function ($q) use ($cid) {
            $q->where('company_id', $cid);
        }])->get()->mapWithKeys(function ($role) {
            return [$role->name => $role->users->count()];
        });

        return [
            'totalUsers' => User::where('company_id', $cid)->count(),
            'activeUsers' => User::where('company_id', $cid)->where('last_login_at', '>=', Carbon::now()->subDays(30))->count(),
            'newUsersThisMonth' => User::where('company_id', $cid)->whereMonth('created_at', Carbon::now()->month)->count(),
            'roleDistribution' => $roleDistribution,
            'recentRegistrations' => User::where('company_id', $cid)->latest()->take(5)->get(['id', 'name', 'email', 'created_at']),
        ];
    }

    /**
     * Get quick actions for admin.
     */
    private function getQuickActions(): array
    {
        // No company-specific logic needed for quick actions
        return [
            [
                'title' => 'Create User',
                'description' => 'Add a new user to the system',
                'route' => 'admin.users.create',
                'icon' => 'user-plus',
                'color' => 'blue',
            ],
            [
                'title' => 'Manage Roles',
                'description' => 'Configure user roles and permissions',
                'route' => 'admin.roles.index',
                'icon' => 'shield',
                'color' => 'green',
            ],
            [
                'title' => 'System Settings',
                'description' => 'Configure system-wide settings',
                'route' => 'settings.index',
                'icon' => 'settings',
                'color' => 'gray',
            ],
            [
                'title' => 'View Reports',
                'description' => 'Access system reports and analytics',
                'route' => 'finance.reports.index',
                'icon' => 'bar-chart',
                'color' => 'purple',
            ],
            [
                'title' => 'Backup System',
                'description' => 'Create system backup',
                'route' => 'settings.maintenance.backup',
                'icon' => 'download',
                'color' => 'orange',
            ],
            [
                'title' => 'Module Settings',
                'description' => 'Configure module activation',
                'route' => 'admin.modules.marketplace',
                'icon' => 'grid',
                'color' => 'indigo',
            ],
        ];
    }

    /**
     * Get analytics data for charts.
     */
    private function getAnalyticsData(): array
    {
        return [
            'userGrowth' => $this->getUserGrowthData(),
            'revenueGrowth' => $this->getRevenueGrowthData(),
            'moduleActivity' => $this->getModuleActivityData(),
            'systemPerformance' => $this->getSystemPerformanceData(),
        ];
    }

    /**
     * Get user growth data for the last 12 months.
     */
    private function getUserGrowthData(): array
    {
        $cid = currentCompanyId();
        $months = [];
        $data = [];

        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $months[] = $date->format('M Y');

            $count = User::where('company_id', $cid)
                        ->whereYear('created_at', $date->year)
                        ->whereMonth('created_at', $date->month)
                        ->count();
            $data[] = $count;
        }

        return [
            'labels' => $months,
            'data' => $data,
        ];
    }

    /**
     * Get revenue growth data for the last 12 months.
     */
    private function getRevenueGrowthData(): array
    {
        $cid = currentCompanyId();
        $months = [];
        $data = [];

        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $months[] = $date->format('M Y');

            $revenue = Invoice::where('company_id', $cid)
                            ->where('status', 'paid')
                            ->whereYear('created_at', $date->year)
                            ->whereMonth('created_at', $date->month)
                            ->sum('total_amount');
            $data[] = (float) $revenue;
        }

        return [
            'labels' => $months,
            'data' => $data,
        ];
    }

    /**
     * Get module activity data.
     */
    private function getModuleActivityData(): array
    {
        $cid = currentCompanyId();
        return [
            'labels' => ['CRM', 'Finance', 'Projects', 'HR', 'Support', 'CMS', 'AI'],
            'data' => [
                Client::where('company_id', $cid)->count() + Lead::where('company_id', $cid)->count(),
                Invoice::where('company_id', $cid)->count() + Transaction::where('company_id', $cid)->count(),
                Project::where('company_id', $cid)->count(),
                Employee::where('company_id', $cid)->count(),
                Ticket::where('company_id', $cid)->count(),
                Page::where('company_id', $cid)->count(),
                Conversation::where('company_id', $cid)->count(),
            ],
        ];
    }

    /**
     * Get system performance data.
     */
    private function getSystemPerformanceData(): array
    {
        // Simulate performance metrics (in a real app, you'd collect these from monitoring tools)
        $days = [];
        $cpuData = [];
        $memoryData = [];
        $responseTimeData = [];

        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $days[] = $date->format('M j');

            // Simulate metrics
            $cpuData[] = rand(20, 80);
            $memoryData[] = rand(30, 90);
            $responseTimeData[] = rand(100, 500);
        }

        return [
            'labels' => $days,
            'cpu' => $cpuData,
            'memory' => $memoryData,
            'responseTime' => $responseTimeData,
        ];
    }

    /**
     * Get system notifications.
     */
    private function getSystemNotifications(): array
    {
        $cid = currentCompanyId();
        $notifications = [];

        // Check for system issues
        $pendingTickets = Ticket::where('company_id', $cid)->where('status', 'open')->count();
        if ($pendingTickets > 10) {
            $notifications[] = [
                'type' => 'warning',
                'title' => 'High Ticket Volume',
                'message' => "You have {$pendingTickets} pending support tickets",
                'action' => 'View Tickets',
                'route' => 'support.tickets.index',
            ];
        }

        // Check for overdue invoices
        $overdueInvoices = Invoice::where('company_id', $cid)->where('status', 'pending')
            ->where('due_date', '<', Carbon::now())
            ->count();
        if ($overdueInvoices > 0) {
            $notifications[] = [
                'type' => 'error',
                'title' => 'Overdue Invoices',
                'message' => "You have {$overdueInvoices} overdue invoices",
                'action' => 'View Invoices',
                'route' => 'finance.invoices.index',
            ];
        }

        // Check for low storage
        $storagePath = storage_path();
        $freeBytes = disk_free_space($storagePath);
        $totalBytes = disk_total_space($storagePath);
        $usedPercentage = round((($totalBytes - $freeBytes) / $totalBytes) * 100, 2);

        if ($usedPercentage > 85) {
            $notifications[] = [
                'type' => 'warning',
                'title' => 'Low Storage Space',
                'message' => "Storage is {$usedPercentage}% full",
                'action' => 'Manage Storage',
                'route' => 'admin.storage.index',
            ];
        }

        return $notifications;
    }
}
