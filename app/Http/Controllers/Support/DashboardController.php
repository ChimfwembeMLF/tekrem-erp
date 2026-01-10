<?php

namespace App\Http\Controllers\Support;

use App\Http\Controllers\Controller;
use App\Models\Support\Ticket;
use App\Models\Support\TicketCategory;
use App\Models\Support\KnowledgeBaseArticle;
use App\Models\Support\FAQ;
use App\Models\Support\SLA;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    protected function getCompanyId()
    {
        return currentCompanyId();
    }

    /**
     * Display the Support dashboard.
     */
    public function index(): Response
    {
        $companyId = $this->getCompanyId();
        $totalTickets = Ticket::where('company_id', $companyId)->count();
        $openTickets = Ticket::where('company_id', $companyId)->where('status', 'open')->count();
        $inProgressTickets = Ticket::where('company_id', $companyId)->where('status', 'in_progress')->count();
        $pendingTickets = Ticket::where('company_id', $companyId)->where('status', 'pending')->count();
        $resolvedTickets = Ticket::where('company_id', $companyId)->where('status', 'resolved')->count();
        $closedTickets = Ticket::where('company_id', $companyId)->where('status', 'closed')->count();
        $overdueTickets = Ticket::where('company_id', $companyId)->overdue()->count();
        $ticketsByPriority = Ticket::where('company_id', $companyId)
            ->selectRaw('priority, count(*) as count')
            ->groupBy('priority')
            ->get();
        $ticketsByCategory = Ticket::where('company_id', $companyId)
            ->with('category')
            ->selectRaw('category_id, count(*) as count')
            ->groupBy('category_id')
            ->get();
        $recentTickets = Ticket::where('company_id', $companyId)
            ->with(['category', 'assignedTo', 'createdBy', 'requester'])
            ->latest()
            ->take(10)
            ->get();
        $myTickets = Ticket::where('company_id', $companyId)
            ->with(['category', 'requester'])
            ->where('assigned_to', auth()->id())
            ->whereNotIn('status', ['resolved', 'closed'])
            ->latest()
            ->take(5)
            ->get();
        $overdueTicketsList = Ticket::where('company_id', $companyId)
            ->with(['category', 'assignedTo', 'requester'])
            ->overdue()
            ->latest()
            ->take(5)
            ->get();
        $slaCompliance = $this->getSLACompliance($companyId);
        $totalArticles = KnowledgeBaseArticle::where('company_id', $companyId)->published()->count();
        $totalFAQs = FAQ::where('company_id', $companyId)->published()->count();
        $popularArticles = KnowledgeBaseArticle::where('company_id', $companyId)
            ->published()
            ->orderBy('view_count', 'desc')
            ->take(5)
            ->get(['id', 'title', 'view_count', 'helpful_count']);
        $avgResolutionTime = Ticket::where('company_id', $companyId)
            ->whereNotNull('resolved_at')
            ->whereNotNull('resolution_time_minutes')
            ->avg('resolution_time_minutes');
        $avgResponseTime = Ticket::where('company_id', $companyId)
            ->whereNotNull('first_response_at')
            ->whereNotNull('response_time_minutes')
            ->avg('response_time_minutes');
        $avgSatisfactionRating = Ticket::where('company_id', $companyId)
            ->whereNotNull('satisfaction_rating')
            ->avg('satisfaction_rating');
        $satisfactionRatings = Ticket::where('company_id', $companyId)
            ->whereNotNull('satisfaction_rating')
            ->selectRaw('satisfaction_rating, count(*) as count')
            ->groupBy('satisfaction_rating')
            ->get();

        return Inertia::render('Support/Dashboard', [
            'stats' => [
                'totalTickets' => $totalTickets,
                'openTickets' => $openTickets,
                'inProgressTickets' => $inProgressTickets,
                'pendingTickets' => $pendingTickets,
                'resolvedTickets' => $resolvedTickets,
                'closedTickets' => $closedTickets,
                'overdueTickets' => $overdueTickets,
                'totalArticles' => $totalArticles,
                'totalFAQs' => $totalFAQs,
                'avgResolutionTime' => round($avgResolutionTime ?? 0, 2),
                'avgResponseTime' => round($avgResponseTime ?? 0, 2),
                'avgSatisfactionRating' => round($avgSatisfactionRating ?? 0, 2),
            ],
            'ticketsByPriority' => $ticketsByPriority,
            'ticketsByCategory' => $ticketsByCategory,
            'recentTickets' => $recentTickets,
            'myTickets' => $myTickets,
            'overdueTickets' => $overdueTicketsList,
            'slaCompliance' => $slaCompliance,
            'popularArticles' => $popularArticles,
            'satisfactionRatings' => $satisfactionRatings,
        ]);
    }

    /**
     * Get SLA compliance data.
     */
    private function getSLACompliance($companyId): array
    {
        $slaCompliance = [];
        $slas = SLA::where('company_id', $companyId)->active()->get();

        foreach ($slas as $sla) {
            $startDate = now()->subDays(30);
            $endDate = now();
            
            $compliance = $sla->getCompliancePercentage($startDate, $endDate);
            
            $slaCompliance[] = [
                'name' => $sla->name,
                'compliance' => $compliance,
                'tickets_count' => $sla->tickets()
                    ->where('company_id', $companyId)
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->count(),
            ];
        }

        return $slaCompliance;
    }
}
