<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Communication;
use App\Models\Lead;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the CRM dashboard.
     */
    public function index()
    {
        $companyId = currentCompanyId();
        $totalClients = Client::where('company_id', $companyId)->count();
        $totalLeads = Lead::where('company_id', $companyId)->count();
        $recentClients = Client::where('company_id', $companyId)->latest()->take(5)->get();
        $recentLeads = Lead::where('company_id', $companyId)->latest()->take(5)->get();
        $recentCommunications = Communication::where('company_id', $companyId)
            ->with('communicable', 'user')
            ->latest()
            ->take(10)
            ->get();
        $leadsByStatus = Lead::where('company_id', $companyId)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get();
        $clientsByStatus = Client::where('company_id', $companyId)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get();
        return Inertia::render('CRM/Dashboard', [
            'stats' => [
                'totalClients' => $totalClients,
                'totalLeads' => $totalLeads,
                'leadsByStatus' => $leadsByStatus,
                'clientsByStatus' => $clientsByStatus,
            ],
            'recentClients' => $recentClients,
            'recentLeads' => $recentLeads,
            'recentCommunications' => $recentCommunications,
        ]);
    }
}
