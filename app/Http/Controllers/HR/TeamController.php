<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\HR\Team;

class TeamController extends Controller
{
    public function index()
    {
        $teams = Team::all();
        return Inertia::render('HR/Teams/Index', [
            'teams' => $teams,
        ]);
    }

    public function create()
    {
        return Inertia::render('HR/Teams/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);
        Team::create($data);
        return redirect()->route('hr.teams.index')->with('success', 'Team created.');
    }

    public function show(Team $team)
    {
        return Inertia::render('HR/Teams/Show', [
            'team' => $team,
        ]);
    }

    public function edit(Team $team)
    {
        return Inertia::render('HR/Teams/Edit', [
            'team' => $team,
        ]);
    }

    public function update(Request $request, Team $team)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);
        $team->update($data);
        return redirect()->route('hr.teams.index')->with('success', 'Team updated.');
    }

    public function destroy(Team $team)
    {
        $team->delete();
        return redirect()->route('hr.teams.index')->with('success', 'Team deleted.');
    }
}
