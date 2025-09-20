<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class OrgChartController extends Controller
{
    public function index()
    {
        // You may want to fetch org chart data here
        return Inertia::render('HR/OrgChart/Index');
    }
}
