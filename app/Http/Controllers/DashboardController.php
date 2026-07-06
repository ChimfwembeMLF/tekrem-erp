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
use App\Models\AI\Service as AIService;
use App\Models\AI\Conversation;
use App\Models\Inventory\Product;
use App\Models\Inventory\StockLevel;
use App\Models\Inventory\Warehouse;
use App\Models\Procurement\PurchaseOrder;
use App\Models\Procurement\Supplier;
use App\Models\Sales\SalesOrder;
use App\Models\POS\PosSession;
use App\Models\Finance\MomoTransaction;
use App\Services\DashboardRedirectService;
use App\Support\Organizations\OrganizationModuleAccess;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Handle dashboard routing based on user role.
     */
    public function index(): Response|RedirectResponse
    {
        $user = Auth::user();
        $home = app(DashboardRedirectService::class)->resolve($user);

        if ($home !== route('dashboard')) {
            return redirect($home);
        }

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
            $data = [
                'stats' => $this->getOverviewStats(),
                'systemHealth' => $this->getSystemHealth(),
                'recentActivity' => $this->getRecentActivity(),
                'moduleCards' => $this->getModuleCards(),
                'userManagement' => $this->getUserManagementSummary(),
                'quickActions' => $this->getQuickActions($user),
                'analytics' => $this->getAnalyticsData(),
                'notifications' => $this->getSystemNotifications(),
                'isAdmin' => $user->hasAnyRole(['admin', 'super_user']),
            ];

            if ($user->can('view hr') && OrganizationModuleAccess::hasModule('hr')) {
                $hrQueue = app(\App\Services\HR\HrActionQueueService::class)->hrQueue();
                $data['peopleActionQueue'] = [
                    ...$hrQueue,
                    'total' => app(\App\Services\HR\HrActionQueueService::class)->totalHrActions($hrQueue),
                ];
            }

            $managerQueue = app(\App\Services\HR\HrActionQueueService::class)->managerQueue($user);
            if ($managerQueue) {
                $data['managerTeamQueue'] = $managerQueue;
            }

            return $data;
        });
    }

    /**
     * Get overview statistics.
     */
    private function getOverviewStats(): array
    {
        return [
            'totalUsers' => User::count(),
            'activeUsers' => User::where('last_login_at', '>=', Carbon::now()->subDays(30))->count(),
            'totalClients' => Client::count(),
            'totalLeads' => Lead::count(),
            'totalProjects' => Project::count(),
            'totalTickets' => Ticket::count(),
            'totalInvoices' => Invoice::count(),
            'totalRevenue' => Invoice::where('status', 'paid')->sum('total_amount'),
            'monthlyRevenue' => Invoice::where('status', 'paid')
                ->whereMonth('created_at', Carbon::now()->month)
                ->sum('total_amount'),
            'pendingTickets' => Ticket::where('status', 'open')->count(),
            'activeProjects' => Project::where('status', 'active')->count(),
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
        $activities = [];

        // Recent user registrations
        $recentUsers = User::latest()->take(10)->get(['id', 'name', 'email', 'created_at']);
        foreach ($recentUsers as $user) {
            $activities[] = [
                'id' => 'user-' . $user->id,
                'type' => 'user_registered',
                'title' => 'New User Registration',
                'description' => "{$user->name} registered",
                'timestamp' => $user->created_at?->toISOString(),
                'icon' => 'user-plus',
                'color' => 'green',
            ];
        }

        // Recent communications
        $recentComms = Communication::with('user')->latest()->take(10)->get();
        foreach ($recentComms as $comm) {
            $activities[] = [
                'id' => 'comm-' . $comm->id,
                'type' => 'communication',
                'title' => 'New Communication',
                'description' => 'Communication by ' . ($comm->user?->name ?? 'Unknown'),
                'timestamp' => $comm->created_at?->toISOString(),
                'icon' => 'message-square',
                'color' => 'blue',
            ];
        }

        // Recent tickets
        $recentTickets = Ticket::with('createdBy')->latest()->take(10)->get();
        foreach ($recentTickets as $ticket) {
            $activities[] = [
                'id' => 'ticket-' . $ticket->id,
                'type' => 'ticket',
                'title' => 'New Support Ticket',
                'description' => "Ticket #{$ticket->id} created",
                'timestamp' => $ticket->created_at?->toISOString(),
                'icon' => 'ticket',
                'color' => 'orange',
            ];
        }

        // Sort by timestamp and return latest 30
        usort($activities, function ($a, $b) {
            return strcmp($b['timestamp'] ?? '', $a['timestamp'] ?? '');
        });

        return array_slice($activities, 0, 30);
    }

    /**
     * Module cards for the admin dashboard grid.
     */
    private function getModuleCards(): array
    {
        $lowStock = StockLevel::whereColumn('quantity', '<=', 'reorder_level')->count();
        $pendingPos = PurchaseOrder::where('status', 'draft')->count();
        $pendingSales = SalesOrder::whereIn('status', ['draft', 'confirmed'])->count();
        $openPosSessions = PosSession::where('status', 'open')->count();
        $pendingMomo = MomoTransaction::whereIn('status', ['pending', 'processing'])->count();

        return OrganizationModuleAccess::filterByModuleKey([
            [
                'key' => 'crm',
                'name' => 'CRM',
                'description' => 'Clients, leads, and communications',
                'route' => 'crm.dashboard',
                'metrics' => [
                    ['label' => 'Clients', 'value' => Client::count()],
                    ['label' => 'Leads', 'value' => Lead::count()],
                ],
            ],
            [
                'key' => 'finance',
                'name' => 'Finance',
                'description' => 'Invoices, payments, and reporting',
                'route' => 'finance.dashboard',
                'metrics' => [
                    ['label' => 'Invoices', 'value' => Invoice::count()],
                    ['label' => 'Revenue', 'value' => $this->formatZmw(Invoice::where('status', 'paid')->sum('total_amount'))],
                ],
            ],
            [
                'key' => 'projects',
                'name' => 'Projects',
                'description' => 'Delivery, boards, and milestones',
                'route' => 'projects.dashboard',
                'metrics' => [
                    ['label' => 'Active', 'value' => Project::where('status', 'active')->count()],
                    ['label' => 'Total', 'value' => Project::count()],
                ],
            ],
            [
                'key' => 'hr',
                'name' => 'HR',
                'description' => 'People operations and payroll',
                'route' => 'hr.dashboard',
                'metrics' => [
                    ['label' => 'Employees', 'value' => Employee::count()],
                    ['label' => 'Departments', 'value' => Employee::distinct('department_id')->count('department_id')],
                ],
            ],
            [
                'key' => 'support',
                'name' => 'Support',
                'description' => 'Tickets and knowledge base',
                'route' => 'support.dashboard',
                'metrics' => [
                    ['label' => 'Open', 'value' => Ticket::where('status', 'open')->count()],
                    ['label' => 'Total', 'value' => Ticket::count()],
                ],
            ],
            [
                'key' => 'inventory',
                'name' => 'Inventory',
                'description' => 'Products, stock, and warehouses',
                'route' => 'inventory.dashboard',
                'metrics' => [
                    ['label' => 'Products', 'value' => Product::where('is_active', true)->count()],
                    ['label' => 'Low stock', 'value' => $lowStock],
                ],
            ],
            [
                'key' => 'procurement',
                'name' => 'Procurement',
                'description' => 'Suppliers and purchase orders',
                'route' => 'procurement.dashboard',
                'metrics' => [
                    ['label' => 'Suppliers', 'value' => Supplier::where('is_active', true)->count()],
                    ['label' => 'Pending POs', 'value' => $pendingPos],
                ],
            ],
            [
                'key' => 'sales',
                'name' => 'Sales',
                'description' => 'Orders and fulfillment',
                'route' => 'sales.dashboard',
                'metrics' => [
                    ['label' => 'Pending', 'value' => $pendingSales],
                    ['label' => 'Total', 'value' => SalesOrder::count()],
                ],
            ],
            [
                'key' => 'pos',
                'name' => 'POS',
                'description' => 'Registers and live sessions',
                'route' => 'pos.index',
                'metrics' => [
                    ['label' => 'Open sessions', 'value' => $openPosSessions],
                    ['label' => 'Warehouses', 'value' => Warehouse::where('is_active', true)->count()],
                ],
            ],
            [
                'key' => 'ecommerce',
                'name' => 'Ecommerce',
                'description' => 'Online store and web orders',
                'route' => 'ecommerce.dashboard',
                'metrics' => [
                    ['label' => 'Published', 'value' => Product::where('is_published', true)->count()],
                    ['label' => 'Web orders', 'value' => SalesOrder::where('source', 'ecommerce')->count()],
                ],
            ],
            [
                'key' => 'momo',
                'name' => 'Mobile Money',
                'description' => 'PawaPay collections and payouts',
                'route' => 'finance.momo.dashboard',
                'metrics' => [
                    ['label' => 'Pending', 'value' => $pendingMomo],
                    ['label' => 'This month', 'value' => MomoTransaction::where('created_at', '>=', Carbon::now()->startOfMonth())->count()],
                ],
            ],
            [
                'key' => 'ai',
                'name' => 'AI',
                'description' => 'Services and conversations',
                'route' => 'ai.dashboard',
                'metrics' => [
                    ['label' => 'Services', 'value' => AIService::where('is_enabled', true)->count()],
                    ['label' => 'Chats', 'value' => Conversation::count()],
                ],
            ],
        ]);
    }

    private function formatZmw(float $amount): string
    {
        return 'ZMW ' . number_format($amount, 2);
    }

    /**
     * Get user management summary.
     */
    private function getUserManagementSummary(): array
    {
        $roleDistribution = Role::withCount('users')->get()->mapWithKeys(function ($role) {
            return [$role->name => $role->users_count];
        });

        return [
            'totalUsers' => User::count(),
            'activeUsers' => User::where('last_login_at', '>=', Carbon::now()->subDays(30))->count(),
            'newUsersThisMonth' => User::whereMonth('created_at', Carbon::now()->month)->count(),
            'roleDistribution' => $roleDistribution,
            'recentRegistrations' => User::latest()->take(5)->get(['id', 'name', 'email', 'created_at']),
            //'topPermissions' => Permission::withCount('users')->orderBy('users_count', 'desc')->take(5)->get(),
        ];
    }

    /**
     * Get quick actions for admin.
     */
    private function getQuickActions(?User $user = null): array
    {
        $user = $user ?? Auth::user();

        $actions = [
            [
                'title' => 'Create User',
                'description' => 'Add a new user to the system',
                'route' => 'admin.users.create',
                'icon' => 'user-plus',
                'permission' => null,
                'roles' => ['admin', 'super_user'],
            ],
            [
                'title' => 'New Invoice',
                'description' => 'Create a client invoice',
                'route' => 'finance.invoices.create',
                'icon' => 'bar-chart',
                'permission' => 'view finance',
                'module' => 'finance',
            ],
            [
                'title' => 'Open Tickets',
                'description' => 'Review support queue',
                'route' => 'support.tickets.index',
                'icon' => 'grid',
                'permission' => 'view support',
                'module' => 'support',
            ],
            [
                'title' => 'Low Stock',
                'description' => 'Review inventory alerts',
                'route' => 'inventory.dashboard',
                'icon' => 'download',
                'permission' => 'view inventory',
                'module' => 'inventory',
            ],
            [
                'title' => 'New Sales Order',
                'description' => 'Create a sales order',
                'route' => 'sales.orders.create',
                'icon' => 'plus',
                'permission' => 'view sales orders',
                'module' => 'sales',
            ],
            [
                'title' => 'System Settings',
                'description' => 'Configure system-wide settings',
                'route' => 'settings.index',
                'icon' => 'settings',
                'permission' => null,
                'roles' => ['admin', 'super_user', 'manager'],
            ],
        ];

        $actions = OrganizationModuleAccess::filterByModule($actions);

        return array_values(array_filter($actions, function (array $action) use ($user) {
            if (!empty($action['roles']) && !$user->hasAnyRole($action['roles'])) {
                return false;
            }

            if (!empty($action['permission']) && !$user->can($action['permission'])) {
                return false;
            }

            return true;
        }));
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
        ];
    }

    /**
     * Get user growth data for the last 12 months.
     */
    private function getUserGrowthData(): array
    {
        $months = [];
        $data = [];

        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $months[] = $date->format('M Y');

            $count = User::whereYear('created_at', $date->year)
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
        $months = [];
        $data = [];

        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $months[] = $date->format('M Y');

            $revenue = Invoice::where('status', 'paid')
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
        return [
            'labels' => ['CRM', 'Finance', 'Projects', 'HR', 'Support', 'Inventory', 'Sales', 'POS', 'AI'],
            'data' => [
                Client::count() + Lead::count(),
                Invoice::count() + Transaction::count(),
                Project::count(),
                Employee::count(),
                Ticket::count(),
                Product::count(),
                SalesOrder::count(),
                PosSession::count(),
                Conversation::count(),
            ],
        ];
    }

    /**
     * Get system notifications.
     */
    private function getSystemNotifications(): array
    {
        $notifications = [];

        // Check for system issues
        $pendingTickets = Ticket::where('status', 'open')->count();
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
        $overdueInvoices = Invoice::where('status', 'pending')
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
