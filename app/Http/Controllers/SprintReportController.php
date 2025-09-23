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
        $data = $request->validate([
            'summary' => 'required|string',
            'metrics' => 'nullable|array',
        ]);
        $data['user_id'] = Auth::id();
        $data['sprint_id'] = $sprint->id;
        SprintReport::create($data);
        return back();
    }
}
