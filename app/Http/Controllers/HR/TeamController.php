<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\HR\Team;
use App\Models\HR\Employee;

class TeamController extends Controller
{
    public function index(Request $request)
    {
        $companyId = currentCompanyId();
        $query = Team::with('employees.user')->where('company_id', $companyId);

        // Optional search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Pagination
        $teams = $query->paginate(10)->withQueryString();

        // Transform data for Inertia
        $teamsData = $teams->through(function ($team) {
            $lead = $team->employees->first(fn($e) => $e->pivot->is_lead);
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
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        $companyId = currentCompanyId();
        $employees = Employee::with('user')->where('company_id', $companyId)->get()->map(fn($e) => [
            'id' => $e->id,
            'name' => $e->user->name ?? '',
        ]);
        return Inertia::render('HR/Team/Create', [
            'employees' => $employees,
        ]);
    }

    public function store(Request $request)
    {
        $companyId = currentCompanyId();
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'members' => 'array',
            'members.*' => 'exists:hr_employees,id',
            'lead' => 'nullable|integer|exists:hr_employees,id',
        ]);
        $data['company_id'] = $companyId;
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
        $companyId = currentCompanyId();
        if ($team->company_id !== $companyId) {
            abort(403);
        }
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
        $companyId = currentCompanyId();
        if ($team->company_id !== $companyId) {
            abort(403);
        }
        $team->load('employees.user');
        $employees = Employee::with('user')->where('company_id', $companyId)->get()->map(fn($e) => [
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
        $companyId = currentCompanyId();
        if ($team->company_id !== $companyId) {
            abort(403);
        }
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
        $companyId = currentCompanyId();
        if ($team->company_id !== $companyId) {
            abort(403);
        }
        $team->delete();
        return redirect()->route('hr.teams.index')->with('success', 'Team deleted.');
    }
}
