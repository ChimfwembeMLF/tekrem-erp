<?php

namespace App\Http\Controllers\Agile;

use App\Http\Controllers\Controller;
use App\Models\Epic;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EpicController extends Controller
{
    protected function companyId(): int
    {
        $companyId = session('current_company_id');
        abort_unless($companyId, 403, 'No active company');
        return $companyId;
    }

    public function index(Project $project)
    {
        $companyId = $this->companyId();
        abort_unless($project->company_id === $companyId, 403);

        // $this->authorize('view', $project);

        $epics = $project->epics()
            ->where('company_id', $companyId)
            ->with(['cards' => fn ($q) => $q->where('company_id', $companyId)])
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Agile/Epics/Index', [
            'project' => $project,
            'epics' => $epics,
        ]);
    }

    public function store(Request $request, Project $project)
    {
        $companyId = $this->companyId();
        abort_unless($project->company_id === $companyId, 403);

        // $this->authorize('update', $project);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'required|string|max:7',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
        ]);

        Epic::create([
            ...$validated,
            'project_id' => $project->id,
            'company_id' => $companyId,
        ]);

        return back()->with('success', 'Epic created successfully.');
    }

    public function show(Epic $epic)
    {
        $companyId = $this->companyId();
        abort_unless($epic->company_id === $companyId, 403);

        // $this->authorize('view', $epic->project);

        $epic->load([
            'project',
            'releases',
            'cards' => fn ($q) => $q
                ->where('company_id', $companyId)
                ->with(['assignee', 'column']),
        ]);

        return Inertia::render('Agile/Epics/Show', [
            'epic' => $epic,
            'project' => $epic->project,
        ]);
    }

    public function update(Request $request, Epic $epic)
    {
        $companyId = $this->companyId();
        abort_unless($epic->company_id === $companyId, 403);

        // $this->authorize('update', $epic->project);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'color' => 'sometimes|string|max:7',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
        ]);

        $epic->update($validated);

        return back()->with('success', 'Epic updated successfully.');
    }

    public function destroy(Epic $epic)
    {
        $companyId = $this->companyId();
        abort_unless($epic->company_id === $companyId, 403);

        // $this->authorize('update', $epic->project);

        $epic->cards()
            ->where('company_id', $companyId)
            ->update(['epic_id' => null]);

        $epic->delete();

        return redirect()
            ->route('agile.epics.index', $epic->project_id)
            ->with('success', 'Epic deleted successfully.');
    }
}
