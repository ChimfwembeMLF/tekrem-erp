<?php

namespace App\Http\Controllers\Analytics;

use App\Http\Controllers\Controller;
use App\Services\Analytics\SiteAnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SiteAnalyticsController extends Controller
{
    public function __construct(
        private SiteAnalyticsService $analytics
    ) {}

    public function index(Request $request): Response
    {
        $period = $request->get('period', '30d');

        if (!in_array($period, ['today', '7d', '30d', '90d'], true)) {
            $period = '30d';
        }

        return Inertia::render('Analytics/Site/Dashboard', $this->analytics->dashboard($period));
    }
}
