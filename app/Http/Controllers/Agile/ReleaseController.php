<?php

namespace App\Http\Controllers\Agile;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Release;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReleaseController extends Controller
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

        $releases = $project->releases()
            ->where('company_id', $companyId)
            ->with([
                'sprints' => fn ($q) => $q->where('company_id', $companyId),
                'epics' => fn ($q) => $q->where('company_id', $companyId),
            ])
            ->orderByDesc('planned_date')
            ->get();

        return Inertia::render('Agile/Releases', [
            'project' => $project,
            'releases' => $releases,
            'upcomingReleases' => $releases->whereIn('status', ['planned', 'in_progress']),
            'releasedVersions' => $releases->where('status', 'released'),
        ]);
    }

    public function show(Release $release)
    {
        $companyId = $this->companyId();
        abort_unless($release->company_id === $companyId, 403);

        // $this->authorize('view', $release->project);

        $release->load([
            'project',
            'sprints' => fn ($q) => $q
                ->where('company_id', $companyId)
                ->with(['cards' => fn ($c) => $c->where('company_id', $companyId)]),
            'epics' => fn ($q) => $q
                ->where('company_id', $companyId)
                ->with(['cards' => fn ($c) => $c->where('company_id', $companyId)]),
        ]);

        return Inertia::render('Agile/Releases/Show', [
            'release' => $release,
            'project' => $release->project,
        ]);
    }

    public function create(Project $project)
    {
        $companyId = $this->companyId();
        abort_unless($project->company_id === $companyId, 403);

        // $this->authorize('update', $project);

        return Inertia::render('Agile/Releases/Create', [
            'project' => $project,
            'sprints' => $project->sprints()->where('company_id', $companyId)->get(),
            'epics' => $project->epics()->where('company_id', $companyId)->get(),
        ]);
    }

    public function store(Request $request, Project $project)
    {
        $companyId = $this->companyId();
        abort_unless($project->company_id === $companyId, 403);

        // $this->authorize('update', $project);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'version_number' => 'required|string|max:50',
            'description' => 'nullable|string',
            'release_notes' => 'nullable|string',
            'planned_date' => 'nullable|date',
            'status' => 'required|in:planned,in_progress,released,cancelled',
            'sprint_ids' => 'nullable|array',
            'sprint_ids.*' => 'exists:sprints,id',
            'epic_ids' => 'nullable|array',
            'epic_ids.*' => 'exists:epics,id',
        ]);

        $sprintIds = $validated['sprint_ids'] ?? [];
        $epicIds = $validated['epic_ids'] ?? [];
        unset($validated['sprint_ids'], $validated['epic_ids']);

        $release = Release::create([
            ...$validated,
            'project_id' => $project->id,
            'company_id' => $companyId,
        ]);

        if ($sprintIds) {
            $release->sprints()->sync($sprintIds);
        }
        if ($epicIds) {
            $release->epics()->sync($epicIds);
        }

        return redirect()
            ->route('agile.releases.show', $release)
            ->with('success', 'Release created successfully.');
    }

    public function edit(Release $release)
    {
        $companyId = $this->companyId();
        abort_unless($release->company_id === $companyId, 403);

        // $this->authorize('update', $release->project);

        $release->load(['sprints', 'epics']);

        return Inertia::render('Agile/Releases/Edit', [
            'release' => $release,
            'project' => $release->project,
            'sprints' => $release->project->sprints()->where('company_id', $companyId)->get(),
            'epics' => $release->project->epics()->where('company_id', $companyId)->get(),
        ]);
    }

    public function update(Request $request, Release $release)
    {
        $companyId = $this->companyId();
        abort_unless($release->company_id === $companyId, 403);

        // $this->authorize('update', $release->project);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'version_number' => 'sometimes|string|max:50',
            'description' => 'nullable|string',
            'release_notes' => 'nullable|string',
            'planned_date' => 'nullable|date',
            'status' => 'sometimes|in:planned,in_progress,released,cancelled',
            'sprint_ids' => 'nullable|array',
            'sprint_ids.*' => 'exists:sprints,id',
            'epic_ids' => 'nullable|array',
            'epic_ids.*' => 'exists:epics,id',
        ]);

        $sprintIds = $validated['sprint_ids'] ?? null;
        $epicIds = $validated['epic_ids'] ?? null;
        unset($validated['sprint_ids'], $validated['epic_ids']);

        $release->update($validated);

        if ($sprintIds !== null) {
            $release->sprints()->sync($sprintIds);
        }
        if ($epicIds !== null) {
            $release->epics()->sync($epicIds);
        }

        return back()->with('success', 'Release updated successfully.');
    }

    public function publish(Release $release)
    {
        $companyId = $this->companyId();
        abort_unless($release->company_id === $companyId, 403);

        // $this->authorize('update', $release->project);

        $release->markAsReleased();

        return back()->with('success', 'Release published successfully.');
    }

    public function destroy(Release $release)
    {
        $companyId = $this->companyId();
        abort_unless($release->company_id === $companyId, 403);

        // $this->authorize('update', $release->project);

        $release->delete();

        return redirect()
            ->route('agile.releases.index', $release->project_id)
            ->with('success', 'Release deleted successfully.');
    }
}
