<?php

namespace App\Http\Controllers;

use App\Models\Sprint;
use App\Models\SprintReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SprintReportController extends Controller
{
    public function store(Request $request, Sprint $sprint)
    {
        // Enforce multi-tenancy
        if ($sprint->company_id !== currentCompanyId()) {
            abort(404);
        }
        $data = $request->validate([
            'summary' => 'required|string',
            'metrics' => 'nullable|array',
        ]);
        $data['user_id'] = Auth::id();
        $data['sprint_id'] = $sprint->id;
        $data['company_id'] = currentCompanyId();
        SprintReport::create($data);
        return back();
    }
}
