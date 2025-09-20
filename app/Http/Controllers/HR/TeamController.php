<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\HR\Team;
use App\Models\HR\Employee;

class TeamController extends Controller
{
    public function index()
    {
        $teams = Team::with(['employees.user'])->get();
        $teamsData = $teams->map(function ($team) {
            $lead = $team->employees->first(function ($e) use ($team) {
                return $e->pivot->is_lead;
            });
            return [
                'id' => $team->id,
                'name' => $team->name,
                'description' => $team->description,
                'members' => $team->employees->map(fn($e) => [
                    'id' => $e->id,
                    'name' => $e->user->name ?? '',
                ]),
                'lead' => $lead ? ['id' => $lead->id, 'name' => $lead->user->name ?? ''] : null,
            ];
        });
        return Inertia::render('HR/Team/Index', [
            'teams' => $teamsData,
        ]);
    }

    public function create()
    {
        $employees = Employee::with('user')->get()->map(fn($e) => [
            'id' => $e->id,
            'name' => $e->user->name ?? '',
        ]);
        return Inertia::render('HR/Team/Create', [
            'employees' => $employees,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'members' => 'array',
            'members.*' => 'exists:hr_employees,id',
            'lead' => 'nullable|integer|exists:hr_employees,id',
        ]);
        $team = Team::create($data);
        $sync = [];
        foreach ($data['members'] ?? [] as $id) {
            $sync[$id] = ['is_lead' => ($data['lead'] ?? null) == $id];
        }
        $team->employees()->sync($sync);
        return redirect()->route('hr.teams.index')->with('success', 'Team created.');
    }

    public function show(Team $team)
    {
        $team->load('employees.user');
        $lead = $team->employees->first(fn($e) => $e->pivot->is_lead);
        return Inertia::render('HR/Team/Show', [
            'team' => [
                'id' => $team->id,
                'name' => $team->name,
                'description' => $team->description,
                'members' => $team->employees->map(fn($e) => [
                    'id' => $e->id,
                    'name' => $e->user->name ?? '',
                ]),
                'lead' => $lead ? ['id' => $lead->id, 'name' => $lead->user->name ?? ''] : null,
            ],
        ]);
    }

    public function edit(Team $team)
    {
        $team->load('employees.user');
        $employees = Employee::with('user')->get()->map(fn($e) => [
            'id' => $e->id,
            'name' => $e->user->name ?? '',
        ]);
        $lead = $team->employees->first(fn($e) => $e->pivot->is_lead);
        return Inertia::render('HR/Team/Edit', [
            'team' => [
                'id' => $team->id,
                'name' => $team->name,
                'description' => $team->description,
                'members' => $team->employees->map(fn($e) => [
                    'id' => $e->id,
                    'name' => $e->user->name ?? '',
                ]),
                'lead' => $lead ? ['id' => $lead->id, 'name' => $lead->user->name ?? ''] : null,
            ],
            'employees' => $employees,
        ]);
    }

    public function update(Request $request, Team $team)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'members' => 'array',
            'members.*' => 'exists:hr_employees,id',
            'lead' => 'nullable|integer|exists:hr_employees,id',
        ]);
        $team->update($data);
        $sync = [];
        foreach ($data['members'] ?? [] as $id) {
            $sync[$id] = ['is_lead' => ($data['lead'] ?? null) == $id];
        }
        $team->employees()->sync($sync);
        return redirect()->route('hr.teams.index')->with('success', 'Team updated.');
    }

    public function destroy(Team $team)
    {
        $team->delete();
        return redirect()->route('hr.teams.index')->with('success', 'Team deleted.');
    }
}
