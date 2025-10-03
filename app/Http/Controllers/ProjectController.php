<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;

class ProjectController extends Controller
{
    /**
     * Show the default Kanban board for a project as the main project page.
     * This replaces the default project view with the Kanban UI, but keeps all project data accessible.
     */
    public function showKanban(Project $project)
    {
        // Eager load all necessary relationships for project and boards
        $project->load([
            'owner',
            'boards.columns.cards.labels',
            'boards.columns.cards.assignee',
            'boards.columns.cards.reporter',
            'boards.epics.cards',
            'boards.members.user',
            'boards.owner',
            'boards.sprints.reports',
        ]);

        // Find the default Kanban board (first Kanban type board)
        $defaultBoard = $project->boards->where('type', 'kanban')->first();
        if (!$defaultBoard) {
            // Fallback: just use the first board if no kanban found
            $defaultBoard = $project->boards->first();
        }
        if (!$defaultBoard) {
            // No boards at all, fallback to original project view
            return $this->show($project);
        }

        // Get all users for assignee dropdown
        $employees = \App\Models\User::select('id', 'name', 'email')->get();

        // Option 1: Render the Kanban board view/component directly, but pass all project data
        return Inertia::render('PM/Boards/Show', [
            'project' => $project,
            'board' => $defaultBoard,
            'employees' => $employees,
        ]);
    }
    public function dashboard()
    {
        // Real analytics queries
        $projects = \App\Models\Project::count();
        $active = \App\Models\Project::where('status', 'active')->count();
        $completed = \App\Models\Project::where('status', 'completed')->count();

        // Calculate velocity: average completed points per sprint (last 5 sprints)
        $recentSprints = \App\Models\Sprint::orderBy('end_date', 'desc')->take(5)->get();
        $sprintLabels = [];
        $completedPoints = [];
        $velocitySum = 0;
        $velocityCount = 0;
        foreach ($recentSprints as $sprint) {
            $label = $sprint->name ?? ('Sprint ' . $sprint->id);
            $sprintLabels[] = $label;
            $report = $sprint->reports()->latest()->first();
            $points = $report ? ($report->completed_points ?? 0) : 0;
            $completedPoints[] = $points;
            if ($report && isset($report->velocity)) {
                $velocitySum += $report->velocity;
                $velocityCount++;
            }
        }
        $velocity = $velocityCount > 0 ? round($velocitySum / $velocityCount, 2) : 0;

        $chartData = [
            'labels' => $sprintLabels,
            'datasets' => [
                [
                    'label' => 'Completed Points',
                    'data' => $completedPoints,
                    'backgroundColor' => 'rgba(99, 102, 241, 0.5)',
                ],
            ],
        ];

        return Inertia::render('PM/ProjectDashboard', [
            'analytics' => [
                'projects' => $projects,
                'active' => $active,
                'completed' => $completed,
                'velocity' => $velocity,
                'chartData' => $chartData,
            ],
        ]);
    }

    // PM module: List all projects (entry point)
    public function pmIndex()
    {
        $projects = Project::with('owner', 'boards')->get();
        return Inertia::render('PM/Projects/Index', [
            'projects' => $projects,
        ]);
    }

    // PM module: List all boards for a project
    public function pmBoards(Project $project)
    {
        $project->load(['boards.owner', 'boards.members', 'boards.cards', 'boards.columns']);

        // Transform boards with additional data for the frontend
        $boards = $project->boards->map(function ($board) use ($project) {
            return [
                'id' => $board->id,
                'name' => $board->name,
                'type' => $board->type,
                'description' => $board->description,
                'visibility' => $board->visibility,
                'created_at' => $board->created_at,
                'updated_at' => $board->updated_at,
                'owner' => $board->owner,
                'members_count' => $board->members->count(),
                'cards_count' => $board->cards->count(),
                'columns_count' => $board->columns->count(),
                'show_url' => route('pm.projects.boards.show', ['project' => $project->id, 'board' => $board->id]),
            ];
        });

        return Inertia::render('PM/Boards/Index', [
            'project' => $project,
            'boards' => $boards,
        ]);
    }

    public function create()
    {
        return Inertia::render('PM/Projects/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);
        $data['owner_id'] = Auth::id();
        $project = Project::create($data);
        return redirect()->route('projects.show', $project);
    }

    public function show(Project $project)
    {
        $project->load(['owner',
            'boards.columns.cards.labels',
            'boards.columns.cards.assignee',
            'boards.columns.cards.reporter',
            'boards.epics.cards',
            // 'boards.labels.cards', // REMOVE: Board has no labels() relationship
            'boards.members.user',
            'boards.owner',
            'boards.sprints.reports', // ADD: eager load sprints and their reports
        ]);

        // For each board, flatten columns/cards/epics/labels/members for easy frontend use
        $boards = $project->boards->map(function ($board) {
            return [
                'id' => $board->id,
                'name' => $board->name,
                'type' => $board->type,
                'description' => $board->description,
                'columns' => $board->columns->map(function ($col) {
                    return [
                        'id' => $col->id,
                        'name' => $col->name,
                        'order' => $col->order,
                        'color' => $col->color,
                        'is_done_column' => $col->is_done_column,
                        'cards' => $col->cards->map(function ($card) {
                            return [
                                'id' => $card->id,
                                'title' => $card->title,
                                'key' => $card->id, // or $card->key if exists
                                'status' => $card->status,
                                'assignee_id' => $card->assignee_id,
                                'sprint_id' => $card->sprint_id,
                                'assignees' => $card->assignee ? [
                                    $card->assignee->name
                                ] : [],
                                'tags' => is_array($card->labels)
                                    ? array_map(function($label) { return is_object($label) ? ($label->name ?? null) : $label['name'] ?? null; }, $card->labels)
                                    : ($card->labels ? $card->labels->pluck('name')->toArray() : []),
                            ];
                        }),
                    ];
                }),
                'epics' => $board->epics->map(function ($epic) {
                    return [
                        'id' => $epic->id,
                        'name' => $epic->name,
                        'description' => $epic->description,
                        'color' => $epic->color,
                        'cards' => $epic->cards->pluck('id'),
                    ];
                }),
                // Remove 'labels' (no board->labels relationship)
                'members' => $board->members->map(function ($member) {
                    return [
                        'id' => $member->id,
                        'role' => $member->role,
                        'user' => $member->user ? [
                            'id' => $member->user->id,
                            'name' => $member->user->name,
                            'email' => $member->user->email,
                        ] : null,
                    ];
                }),
                // Add sprints
                'sprints' => $board->sprints->map(function ($sprint) {
                    return [
                        'id' => $sprint->id,
                        'name' => $sprint->name,
                        'goal' => $sprint->goal,
                        'start_date' => $sprint->start_date,
                        'end_date' => $sprint->end_date,
                        'status' => $sprint->status,
                        'reports' => $sprint->reports->map(function ($report) {
                            return [
                                'id' => $report->id,
                                'user_id' => $report->user_id,
                                'summary' => $report->summary,
                                'completed_points' => $report->completed_points,
                                'incomplete_points' => $report->incomplete_points,
                                'velocity' => $report->velocity,
                                'metrics' => $report->metrics,
                            ];
                        }),
                    ];
                }),
            ];
        });

        // For analytics, you may want to aggregate across all boards
        // (This is a placeholder, you can expand as needed)
        $analytics = [
            'projects' => Project::count(),
            'active' => Project::where('status', 'active')->count(),
            'completed' => Project::where('status', 'completed')->count(),
        ];

        // Get all users for assignee dropdown
        $employees = \App\Models\User::select('id', 'name', 'email')->get();

        return Inertia::render('PM/Projects/Show', [
            'project' => $project,
            'boards' => $boards,
            'analytics' => $analytics,
            'employees' => $employees,
        ]);
    }

    public function edit(Project $project)
    {
        return Inertia::render('PM/Projects/Edit', [
            'project' => $project,
        ]);
    }

    public function update(Request $request, Project $project): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);
        $project->update($data);
        return redirect()->route('projects.show', $project);
    }

    public function destroy(Project $project): RedirectResponse
    {
        $project->delete();
        return redirect()->route('projects.index');
    }
}
