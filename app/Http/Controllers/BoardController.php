<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Project;
use App\Models\BoardMember;
use App\Models\BoardInvitation;
use App\Models\BoardColumn;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;

class BoardController extends Controller
{

      public function reorderColumns(Request $request, Board $board) : RedirectResponse
    {
        $request->validate([
            'column_id' => 'required|exists:board_columns,id',
            'order' => 'required|integer|min:0',
        ]);

        $columnId = $request->input('column_id');
        $newOrder = $request->input('order');

        // Find the column to move
        $column = $board->columns()->findOrFail($columnId);
        $oldOrder = $column->order;

        // Update the column order
        $column->update(['order' => $newOrder]);

        // Reorder other columns
        if ($newOrder > $oldOrder) {
            // Moving right - decrement orders between old and new position
            $board->columns()
                ->where('id', '!=', $columnId)
                ->whereBetween('order', [$oldOrder + 1, $newOrder])
                ->decrement('order');
        } else if ($newOrder < $oldOrder) {
            // Moving left - increment orders between new and old position
            $board->columns()
                ->where('id', '!=', $columnId)
                ->whereBetween('order', [$newOrder, $oldOrder - 1])
                ->increment('order');
        }

        // Get the project from the board
        $project = $board->project;

        return redirect()->route('pm.projects.boards.show', [$project, $board]);
    }

public function index()
{
    // Get all boards the user has access to across all projects
    $user = auth()->user();

    // Get boards from projects the user owns OR boards where the user is a member
    $boards = Board::where(function ($query) use ($user) {
        // Boards from projects owned by the user
        $query->whereHas('project', function ($projectQuery) use ($user) {
            $projectQuery->where('owner_id', $user->id);
        })
        // OR boards where the user is a direct member
        ->orWhereHas('members', function ($memberQuery) use ($user) {
            $memberQuery->where('user_id', $user->id);
        });
    })
    ->with([
        'project',
        'columns.cards',
        'members.user',
        'owner',
    ])
    ->get();

    return Inertia::render('PM/Boards/Index', [
        'project' => null, // No specific project for global boards view
        'boards' => $boards->map(function ($board) {
            return [
                'id' => $board->id,
                'project_id' => $board->project_id,
                'project_name' => $board->project->name,
                'name' => $board->name,
                'description' => $board->description,
                'type' => $board->type,
                'visibility' => $board->visibility,
                'cards_count' => $board->columns->sum(function ($col) {
                    return $col->cards->count();
                }),
                'members_count' => $board->members->count(),
                'last_updated' => $board->updated_at,
                'owner' => $board->owner ? [
                    'id' => $board->owner->id,
                    'name' => $board->owner->name,
                ] : null,
            ];
        }),
    ]);
}

    public function create(Request $request)
    {
        $projectId = $request->get('project_id');
        $project = $projectId ? Project::findOrFail($projectId) : null;

        return Inertia::render('PM/Boards/Create', [
            'project' => $project,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:kanban,scrum',
            'visibility' => 'required|in:private,public',
            'project_id' => 'required|exists:projects,id',
        ]);

        $data['owner_id'] = Auth::id();
        $board = Board::create($data);

        // Add the creator as an admin member
        BoardMember::create([
            'board_id' => $board->id,
            'user_id' => Auth::id(),
            'role' => 'admin',
        ]);

        // Create default columns for the board
        $this->createDefaultColumns($board);

        $project = Project::find($data['project_id']);
        return redirect()->route('pm.projects.boards', $project)->with('success', 'Board created successfully!');
    }

    public function show(Project $project, Board $board)
    {
        $board->load('columns.cards', 'members.user', 'owner');
        return Inertia::render('PM/Boards/Show', [
            'project' => $project,
            'board' => $board,
        ]);
    }

    public function edit(Board $board)
    {
        $board->load('project');
        return Inertia::render('PM/Boards/Edit', [
            'project' => $board->project,
            'board' => $board,
        ]);
    }

    public function update(Request $request, Board $board): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:kanban,scrum',
        ]);
        $board->update($data);
        $board->load('project');
        return redirect()->route('pm.projects.boards.show', [$board->project, $board]);
    }

    public function destroy(Board $board): RedirectResponse
    {
        $board->load('project');
        $project = $board->project;
        $board->delete();
        return redirect()->route('pm.projects.boards', $project);
    }

    public function invite(Request $request, Project $project, Board $board): RedirectResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
        ]);
        $token = bin2hex(random_bytes(16));
        BoardInvitation::create([
            'board_id' => $board->id,
            'email' => $data['email'],
            'token' => $token,
        ]);
        // Send invitation email logic here
        return back()->with('success', 'Invitation sent!');
    }

    public function duplicate(Request $request, Board $board): RedirectResponse
    {
        $duplicatedBoard = $board->replicate();
        $duplicatedBoard->name = $board->name . ' (Copy)';
        $duplicatedBoard->save();

        // Copy board members
        foreach ($board->members as $member) {
            BoardMember::create([
                'board_id' => $duplicatedBoard->id,
                'user_id' => $member->user_id,
                'role' => $member->role,
            ]);
        }

        // Copy columns
        foreach ($board->columns as $column) {
            $duplicatedColumn = $column->replicate();
            $duplicatedColumn->board_id = $duplicatedBoard->id;
            $duplicatedColumn->save();

            // Copy cards in this column
            foreach ($column->cards as $card) {
                $duplicatedCard = $card->replicate();
                $duplicatedCard->column_id = $duplicatedColumn->id;
                $duplicatedCard->save();

                // Copy card labels if they exist
                if ($card->labels) {
                    $duplicatedCard->labels()->sync($card->labels->pluck('id'));
                }
            }
        }

        $project = $board->project;
        return redirect()->route('pm.projects.boards.show', [$project, $duplicatedBoard])
            ->with('success', 'Board duplicated successfully!');
    }

    public function archive(Request $request, Board $board): RedirectResponse
    {
        $board->update(['archived_at' => now()]);

        $project = $board->project;
        return redirect()->route('pm.projects.boards', $project)
            ->with('success', 'Board archived successfully!');
    }

    public function restore(Request $request, Board $board): RedirectResponse
    {
        $board->update(['archived_at' => null]);

        $project = $board->project;
        return redirect()->route('pm.projects.boards.show', [$project, $board])
            ->with('success', 'Board restored successfully!');
    }

    /**
     * Create default columns for a new board
     */
    private function createDefaultColumns(Board $board)
    {
        $defaultColumns = [
            ['name' => 'To Do', 'order' => 1, 'color' => '#6b7280'],
            ['name' => 'In Progress', 'order' => 2, 'color' => '#3b82f6'],
            ['name' => 'Review', 'order' => 3, 'color' => '#f59e0b'],
            ['name' => 'Done', 'order' => 4, 'color' => '#10b981', 'is_done_column' => true],
        ];

        foreach ($defaultColumns as $column) {
            $column['board_id'] = $board->id;
            BoardColumn::create($column);
        }
    }
}
