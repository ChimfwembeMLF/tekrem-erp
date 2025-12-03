<?php

namespace App\Http\Controllers\Agile;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Release;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReleaseController extends Controller
{
    public function index(Project $project)
    {
        // $this->authorize('view', $project);

        $releases = $project->releases()
            ->with(['sprints', 'epics'])
            ->orderBy('planned_date', 'desc')
            ->get();

        $upcomingReleases = $releases->whereIn('status', ['planned', 'in_progress']);
        $releasedVersions = $releases->where('status', 'released');

        return Inertia::render('Agile/Releases', [
            'project' => $project,
            'releases' => $releases,
            'upcomingReleases' => $upcomingReleases,
            'releasedVersions' => $releasedVersions,
        ]);
    }

    public function show(Release $release)
    {
        // $this->authorize('view', $release->project);

        $release->load([
            'sprints.cards',
            'epics.cards',
            'project'
        ]);

        return Inertia::render('Agile/Releases/Show', [
            'release' => $release,
            'project' => $release->project,
        ]);
    }

    public function create(Project $project)
    {
        // $this->authorize('update', $project);

        $sprints = $project->sprints()->get();
        $epics = $project->epics()->get();

        return Inertia::render('Agile/Releases/Create', [
            'project' => $project,
            'sprints' => $sprints,
            'epics' => $epics,
        ]);
    }

    public function store(Request $request, Project $project)
    {
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

        $validated['project_id'] = $project->id;

        $release = Release::create($validated);

        // Attach sprints and epics
        if (!empty($sprintIds)) {
            $release->sprints()->attach($sprintIds);
        }
        if (!empty($epicIds)) {
            $release->epics()->attach($epicIds);
        }

        return redirect()->route('agile.releases.show', $release)
            ->with('success', 'Release created successfully.');
    }

    public function edit(Release $release)
    {
        // $this->authorize('update', $release->project);

        $release->load(['sprints', 'epics']);

        $sprints = $release->project->sprints()->get();
        $epics = $release->project->epics()->get();

        return Inertia::render('Agile/Releases/Edit', [
            'release' => $release,
            'project' => $release->project,
            'sprints' => $sprints,
            'epics' => $epics,
        ]);
    }

    public function update(Request $request, Release $release)
    {
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

        // Sync sprints and epics if provided
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
        // $this->authorize('update', $release->project);

        $release->markAsReleased();

        return back()->with('success', 'Release published successfully.');
    }

    public function destroy(Release $release)
    {
        // $this->authorize('update', $release->project);

        $release->delete();

        return redirect()->route('agile.releases.index', $release->project_id)
            ->with('success', 'Release deleted successfully.');
    }
}
