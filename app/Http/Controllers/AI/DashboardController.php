<?php

namespace App\Http\Controllers\AI;

use App\Http\Controllers\Controller;
use App\Models\AI\Service;
use App\Models\AI\AIModel;
use App\Models\AI\Conversation;
use App\Models\AI\PromptTemplate;
use App\Models\AI\UsageLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the AI dashboard.
     */
    public function index(Request $request)
    {
        $companyId = session('current_company_id');
        // Get overview statistics
        $stats = [
            'total_services' => Service::enabled()->where('company_id', $companyId)->count(),
            'total_models' => AIModel::enabled()->where('company_id', $companyId)->count(),
            'total_conversations' => Conversation::active()->where('company_id', $companyId)->count(),
            'total_templates' => PromptTemplate::where('company_id', $companyId)->count(),
        ];

        // Get recent usage statistics
        $usageStats = UsageLog::getUsageStats('7 days', null, $companyId);

        // Get recent conversations
        $recentConversations = Conversation::with(['user', 'aiModel.service'])
            ->active()
            ->where('company_id', $companyId)
            ->latest()
            ->limit(5)
            ->get();

        // Get popular templates
        $popularTemplates = PromptTemplate::where('company_id', $companyId)->getPopular(5);

        // Get enabled services with their status and usage
        $services = Service::enabled()->where('company_id', $companyId)->orderBy('priority')->get()->map(function ($service) use ($companyId) {
            $connectionTest = $service->testConnection();
            $usageStats = $service->getUsageStats('24 hours', $companyId);

            return [
                'id' => $service->id,
                'name' => $service->name,
                'provider' => $service->provider,
                'is_default' => $service->is_default,
                'status' => $connectionTest['success'] ? 'online' : 'offline',
                'usage' => [
                    'requests_today' => $usageStats['total_requests'] ?? 0,
                    'tokens_today' => $usageStats['total_tokens'] ?? 0,
                    'cost_today' => $usageStats['total_cost'] ?? 0,
                ],
            ];
        });

        // Get daily usage for the last 7 days
        $dailyUsage = UsageLog::getDailyUsage('7 days', null, $companyId);

        // Get usage by operation type
        $usageByOperation = UsageLog::getUsageByOperation('30 days', null, $companyId);

        // Get quick stats for today vs yesterday
        $quickStats = $this->getQuickStatsData($companyId);

        // Prepare analytics data structure
        $analytics = [
            'overview' => $usageStats,
            'daily_usage' => $dailyUsage,
            'usage_by_operation' => $usageByOperation->pluck('count', 'operation_type')->toArray(),
            'usage_by_model' => UsageLog::getUsageByModel('30 days', null, $companyId)->pluck('count', 'ai_model_id')->toArray(),
        ];

        return Inertia::render('AI/Analytics/Dashboard', [
            'stats' => $stats,
            'services' => $services,
            'analytics' => $analytics,
            'quick_stats' => $quickStats,
        ]);
    }

    /**
     * Get AI service status.
     */
    public function serviceStatus()
    {
        $companyId = session('current_company_id');
        $services = Service::enabled()->where('company_id', $companyId)->get();
        $status = [];

        foreach ($services as $service) {
            $status[] = [
                'id' => $service->id,
                'name' => $service->name,
                'provider' => $service->provider,
                'is_default' => $service->is_default,
                'status' => $service->testConnection(),
                'usage' => $service->getUsageStats('24 hours', $companyId),
            ];
        }

        return response()->json($status);
    }

    /**
     * Get usage analytics data.
     */
    public function analytics(Request $request)
    {
        $period = $request->get('period', '30 days');
        $userId = $request->get('user_id');
        $companyId = session('current_company_id');

        $data = [
            'overview' => UsageLog::getUsageStats($period, $userId, $companyId),
            'daily_usage' => UsageLog::getDailyUsage($period, $userId, $companyId),
            'usage_by_operation' => UsageLog::getUsageByOperation($period, $userId, $companyId),
            'usage_by_model' => UsageLog::getUsageByModel($period, $userId, $companyId),
        ];

        return response()->json($data);
    }

    /**
     * Test AI service connection.
     */
    public function testConnection(Request $request)
    {
        $request->validate([
            'service_id' => 'required|exists:ai_services,id'
        ]);
        $companyId = session('current_company_id');
        $service = Service::where('company_id', $companyId)->findOrFail($request->service_id);
        $result = $service->testConnection();

        return response()->json($result);
    }

    /**
     * Get quick stats data for dashboard.
     */
    private function getQuickStatsData($companyId = null)
    {
        $today = now()->startOfDay();
        $yesterday = now()->subDay()->startOfDay();

        $todayStats = UsageLog::where('created_at', '>=', $today)->where('company_id', $companyId)->get();
        $yesterdayStats = UsageLog::whereBetween('created_at', [$yesterday, $today])->where('company_id', $companyId)->get();

        $stats = [
            'today' => [
                'requests' => $todayStats->count(),
                'tokens' => $todayStats->sum('total_tokens'),
                'cost' => $todayStats->sum('cost'),
                'success_rate' => $todayStats->count() > 0
                    ? ($todayStats->where('status', 'success')->count() / $todayStats->count()) * 100
                    : 0
            ],
            'yesterday' => [
                'requests' => $yesterdayStats->count(),
                'tokens' => $yesterdayStats->sum('total_tokens'),
                'cost' => $yesterdayStats->sum('cost'),
                'success_rate' => $yesterdayStats->count() > 0
                    ? ($yesterdayStats->where('status', 'success')->count() / $yesterdayStats->count()) * 100
                    : 0
            ]
        ];

        // Calculate percentage changes
        $stats['changes'] = [
            'requests' => $this->calculatePercentageChange($stats['yesterday']['requests'], $stats['today']['requests']),
            'tokens' => $this->calculatePercentageChange($stats['yesterday']['tokens'], $stats['today']['tokens']),
            'cost' => $this->calculatePercentageChange($stats['yesterday']['cost'], $stats['today']['cost']),
            'success_rate' => $this->calculatePercentageChange($stats['yesterday']['success_rate'], $stats['today']['success_rate']),
        ];

        return $stats;
    }

    /**
     * Get quick stats for widgets (API endpoint).
     */
    public function quickStats()
    {
        $companyId = session('current_company_id');
        return response()->json($this->getQuickStatsData($companyId));
    }

    /**
     * Calculate percentage change between two values.
     */
    private function calculatePercentageChange($oldValue, $newValue)
    {
        if ($oldValue == 0) {
            return $newValue > 0 ? 100 : 0;
        }

        return (($newValue - $oldValue) / $oldValue) * 100;
    }
}
