<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\BoardCard;
use App\Models\BoardColumn;
use App\Models\Epic;
use App\Models\Sprint;
use App\Models\Label;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;

class BoardCardController extends Controller
{
    public function index(Project $project, Board $board)
    {
        if ($project->company_id !== currentCompanyId() || $board->company_id !== currentCompanyId()) {
            abort(404);
        }
        return inertia('PM/Boards/Cards/Index', [
            'project' => $project,
            'board' => $board,
        ]);
    }

    public function create(Project $project, Board $board)
    {
        if ($project->company_id !== currentCompanyId() || $board->company_id !== currentCompanyId()) {
            abort(404);
        }
        return inertia('PM/Boards/Cards/Create/Index', [
            'project' => $project,
            'board' => $board,
        ]);
    }

    public function show(Project $project, Board $board, BoardCard $card)
    {
        if ($project->company_id !== currentCompanyId() || $board->company_id !== currentCompanyId() || $card->company_id !== currentCompanyId()) {
            abort(404);
        }
        return inertia('PM/Boards/Cards/Show/Index', [
            'project' => $project,
            'board' => $board,
            'card' => $card,
        ]);
    }

    public function edit(Project $project, Board $board, BoardCard $card)
    {
        if ($project->company_id !== currentCompanyId() || $board->company_id !== currentCompanyId() || $card->company_id !== currentCompanyId()) {
            abort(404);
        }
        return inertia('PM/Boards/Cards/Edit/Index', [
            'project' => $project,
            'board' => $board,
            'card' => $card,
        ]);
    }
    public function store(Request $request, Project $project, Board $board)
    {
        if ($project->company_id !== currentCompanyId() || $board->company_id !== currentCompanyId()) {
            abort(404);
        }
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|string',
            'priority' => 'required|in:low,medium,high,critical',
            'assignee_id' => 'nullable|exists:users,id',
            'reporter_id' => 'nullable|exists:users,id',
            'epic_id' => 'nullable|exists:epics,id',
            'sprint_id' => 'nullable|exists:sprints,id',
            'story_points' => 'nullable|integer',
            'due_date' => 'nullable|date',
            'order' => 'nullable|integer',
            'column_id' => 'required|exists:board_columns,id',
        ]);
        $data['board_id'] = $board->id;
        $data['company_id'] = currentCompanyId();
        $card = BoardCard::create($data);
        // Attach labels if provided
        if ($request->has('labels')) {
            $card->labels()->sync($request->input('labels'));
        }
        // Ensure $project is loaded (Board may not have project loaded if shallow route)
        if (!$project || !$project->id) {
            $project = $board->project;
        }
        return redirect()->route('pm.projects.show', $project->id);
    }

    public function update(Request $request, Project $project, Board $board, BoardColumn $column, BoardCard $card)
    {
        if ($project->company_id !== currentCompanyId() || $board->company_id !== currentCompanyId() || $column->company_id !== currentCompanyId() || $card->company_id !== currentCompanyId()) {
            abort(404);
        }
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|string',
            'priority' => 'required|in:low,medium,high,critical',
            'assignee_id' => 'nullable|exists:users,id',
            'reporter_id' => 'nullable|exists:users,id',
            'epic_id' => 'nullable|exists:epics,id',
            'sprint_id' => 'nullable|exists:sprints,id',
            'story_points' => 'nullable|integer',
            'due_date' => 'nullable|date',
            'order' => 'nullable|integer',
        ]);
        $card->update($data);
        // Attach labels if provided
        if ($request->has('labels')) {
            $card->labels()->sync($request->input('labels'));
        }
        return redirect()->route('pm.projects.boards.show', [$project, $board]);
    }

    public function move(Request $request, BoardCard $card): RedirectResponse
    {
        if ($card->company_id !== currentCompanyId()) {
            abort(404);
        }
        $request->validate([
            'column_id' => 'required|exists:board_columns,id',
            'position' => 'required|integer|min:0',
        ]);

        $newColumnId = (int) $request->input('column_id');
        $newPosition = (int) $request->input('position');
        $oldColumnId = (int) $card->column_id;
        $oldPosition = (int) ($card->order ?? 0); // Store original position before update, default to 0 if null

        // Ensure new column belongs to current company
        $newColumn = \App\Models\BoardColumn::find($newColumnId);
        if (!$newColumn || $newColumn->company_id !== currentCompanyId()) {
            abort(404);
        }

        // Update the card's column and position
        $card->update([
            'column_id' => $newColumnId,
            'order' => $newPosition,
        ]);

        // If moving to a different column, reorder cards in both columns
        if ($oldColumnId !== $newColumnId) {
            // Reorder remaining cards in the old column
            BoardCard::where('column_id', $oldColumnId)
                ->where('company_id', currentCompanyId())
                ->where('order', '>', (int) $oldPosition)
                ->decrement('order');

            // Reorder cards in the new column to make space
            BoardCard::where('column_id', $newColumnId)
                ->where('company_id', currentCompanyId())
                ->where('id', '!=', $card->id)
                ->where('order', '>=', (int) $newPosition)
                ->increment('order');
        } else {
            // Moving within the same column - reorder accordingly
            if ($newPosition > $oldPosition) {
                // Moving down - decrement positions between old and new
                BoardCard::where('column_id', $oldColumnId)
                    ->where('company_id', currentCompanyId())
                    ->where('id', '!=', $card->id)
                    ->whereBetween('order', [(int) $oldPosition + 1, (int) $newPosition])
                    ->decrement('order');
            } else if ($newPosition < $oldPosition) {
                // Moving up - increment positions between new and old
                BoardCard::where('column_id', $oldColumnId)
                    ->where('company_id', currentCompanyId())
                    ->where('id', '!=', $card->id)
                    ->whereBetween('order', [(int) $newPosition, (int) $oldPosition - 1])
                    ->increment('order');
            }
        }

        // Get the project from the card's board
        $board = $card->column->board;
        $project = $board->project;

        return redirect()->route('pm.projects.boards.show', [$project, $board]);
    }

    public function destroy(Project $project, Board $board, BoardColumn $column, BoardCard $card)
    {
        if ($project->company_id !== currentCompanyId() || $board->company_id !== currentCompanyId() || $column->company_id !== currentCompanyId() || $card->company_id !== currentCompanyId()) {
            abort(404);
        }
        $card->delete();
        return redirect()->route('pm.projects.boards.show', [$project, $board]);
    }

    public function duplicate(Request $request, BoardCard $card): RedirectResponse
    {
        if ($card->company_id !== currentCompanyId()) {
            abort(404);
        }
        $duplicatedCard = $card->replicate();
        $duplicatedCard->title = $card->title . ' (Copy)';
        $duplicatedCard->company_id = currentCompanyId();
        $duplicatedCard->save();

        // Copy labels if they exist
        if ($card->labels) {
            $duplicatedCard->labels()->sync($card->labels->pluck('id'));
        }

        // Get the project from the card's board
        $board = $card->column->board;
        $project = $board->project;

        return redirect()->route('pm.projects.boards.show', [$project, $board]);
    }

    public function archive(Request $request, BoardCard $card): RedirectResponse
    {
        if ($card->company_id !== currentCompanyId()) {
            abort(404);
        }
        $card->update(['archived_at' => now()]);

        // Get the project from the card's board
        $board = $card->column->board;
        $project = $board->project;

        return redirect()->route('pm.projects.boards.show', [$project, $board]);
    }

    public function restore(Request $request, BoardCard $card): RedirectResponse
    {
        if ($card->company_id !== currentCompanyId()) {
            abort(404);
        }
        $card->update(['archived_at' => null]);

        // Get the project from the card's board
        $board = $card->column->board;
        $project = $board->project;

        return redirect()->route('pm.projects.boards.show', [$project, $board]);
    }

    public function subscribe(Request $request, BoardCard $card): RedirectResponse
    {
        if ($card->company_id !== currentCompanyId()) {
            abort(404);
        }
        $user = Auth::user();
        // ...existing code...
        $board = $card->column->board;
        $project = $board->project;

        return redirect()->route('pm.projects.boards.show', [$project, $board])
            ->with('success', 'Subscribed to card notifications');
    }

    public function unsubscribe(Request $request, BoardCard $card): RedirectResponse
    {
        if ($card->company_id !== currentCompanyId()) {
            abort(404);
        }
        $user = Auth::user();
        // ...existing code...
        $board = $card->column->board;
        $project = $board->project;

        return redirect()->route('pm.projects.boards.show', [$project, $board])
            ->with('success', 'Unsubscribed from card notifications');
    }

    public function vote(Request $request, BoardCard $card): RedirectResponse
    {
        if ($card->company_id !== currentCompanyId()) {
            abort(404);
        }
        $user = Auth::user();
        // ...existing code...
        $board = $card->column->board;
        $project = $board->project;

        return redirect()->route('pm.projects.boards.show', [$project, $board])
            ->with('success', 'Vote added');
    }

    public function unvote(Request $request, BoardCard $card): RedirectResponse
    {
        if ($card->company_id !== currentCompanyId()) {
            abort(404);
        }
        $user = Auth::user();
        // ...existing code...
        $board = $card->column->board;
        $project = $board->project;

        return redirect()->route('pm.projects.boards.show', [$project, $board])
            ->with('success', 'Vote removed');
    }

    public function remind(Request $request, BoardCard $card): RedirectResponse
    {
        if ($card->company_id !== currentCompanyId()) {
            abort(404);
        }
        $request->validate([
            'message' => 'nullable|string|max:500',
            'reminder_date' => 'required|date|after:now',
        ]);
        // ...existing code...
        $board = $card->column->board;
        $project = $board->project;

        return redirect()->route('pm.projects.boards.show', [$project, $board])
            ->with('success', 'Reminder set successfully');
    }

    public function relate(Request $request, BoardCard $card): RedirectResponse
    {
        if ($card->company_id !== currentCompanyId()) {
            abort(404);
        }
        $request->validate([
            'related_card_id' => 'required|exists:board_cards,id',
            'relation_type' => 'required|in:blocks,is_blocked_by,relates_to,duplicates,is_duplicated_by',
        ]);
        // Ensure related card belongs to current company
        $relatedCard = \App\Models\BoardCard::find($request->input('related_card_id'));
        if (!$relatedCard || $relatedCard->company_id !== currentCompanyId()) {
            abort(404);
        }
        // ...existing code...
        $board = $card->column->board;
        $project = $board->project;

        return redirect()->route('pm.projects.boards.show', [$project, $board])
            ->with('success', 'Card relationship created');
    }

    public function unrelate(Request $request, BoardCard $card): RedirectResponse
    {
        if ($card->company_id !== currentCompanyId()) {
            abort(404);
        }
        $request->validate([
            'related_card_id' => 'required|exists:board_cards,id',
        ]);
        // Ensure related card belongs to current company
        $relatedCard = \App\Models\BoardCard::find($request->input('related_card_id'));
        if (!$relatedCard || $relatedCard->company_id !== currentCompanyId()) {
            abort(404);
        }
        // ...existing code...
        $board = $card->column->board;
        $project = $board->project;

        return redirect()->route('pm.projects.boards.show', [$project, $board])
            ->with('success', 'Card relationship removed');
    }
}
