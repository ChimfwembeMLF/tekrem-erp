<?php

namespace App\Http\Controllers\Agile;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\BoardCard;
use App\Models\BoardColumn;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BoardCardController extends Controller
{
    public function show(BoardCard $card)
    {
        // $this->authorize('view', $card->board->project);

        $card->load([
            'assignee',
            'reporter',
            'column',
            'board',
            'sprint',
            'epic',
            'task',
            'comments.user',
            'attachments'
        ]);

        return Inertia::render('Agile/Cards/Show', [
            'card' => $card,
            'project' => $card->board->project,
        ]);
    }

    public function create(Request $request)
    {
        $board = Board::findOrFail($request->board);
        // $this->authorize('update', $board->project);

        $column = $request->column ? BoardColumn::find($request->column) : null;

        return Inertia::render('Agile/Cards/Create', [
            'board' => $board->load('columns'),
            'project' => $board->project,
            'defaultColumn' => $column,
            'sprints' => $board->sprints,
            'epics' => $board->epics,
        ]);
    }

    public function store(Request $request, Board $board)
    {
        // $this->authorize('update', $board->project);

        $validated = $request->validate([
            'column_id' => 'required|exists:board_columns,id',
            'type' => 'required|in:story,task,bug,epic',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'assignee_id' => 'nullable|exists:users,id',
            'reporter_id' => 'nullable|exists:users,id',
            'priority' => 'required|in:low,medium,high,critical',
            'story_points' => 'nullable|integer|min:0',
            'due_date' => 'nullable|date',
            'sprint_id' => 'nullable|exists:sprints,id',
            'epic_id' => 'nullable|exists:epics,id',
            'labels' => 'nullable|array',
        ]);

        $validated['board_id'] = $board->id;
        $validated['reporter_id'] = $validated['reporter_id'] ?? auth()->id();
        $validated['order'] = $board->cards()->where('column_id', $validated['column_id'])->max('order') + 1;

        $card = BoardCard::create($validated);

        return redirect()->route('agile.board.show', $board)
            ->with('success', 'Card created successfully.');
    }

    public function edit(BoardCard $card)
    {
        // $this->authorize('update', $card->board->project);

        $card->load(['board.columns', 'board.project']);

        return Inertia::render('Agile/Cards/Edit', [
            'card' => $card,
            'board' => $card->board,
            'project' => $card->board->project,
            'sprints' => $card->board->sprints,
            'epics' => $card->board->epics,
        ]);
    }

    public function update(Request $request, BoardCard $card)
    {
        // $this->authorize('update', $card->board->project);

        $validated = $request->validate([
            'column_id' => 'sometimes|exists:board_columns,id',
            'type' => 'sometimes|in:story,task,bug,epic',
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'assignee_id' => 'nullable|exists:users,id',
            'priority' => 'sometimes|in:low,medium,high,critical',
            'story_points' => 'nullable|integer|min:0',
            'due_date' => 'nullable|date',
            'sprint_id' => 'nullable|exists:sprints,id',
            'epic_id' => 'nullable|exists:epics,id',
            'labels' => 'nullable|array',
            'status' => 'nullable|string',
        ]);

        $card->update($validated);

        // Sync to linked task if in hybrid mode
        if ($card->task_id && isset($validated['status'])) {
            $card->task()->update(['status' => $validated['status']]);
        }

        return back()->with('success', 'Card updated successfully.');
    }

    public function move(Request $request, BoardCard $card)
    {
        // $this->authorize('update', $card->board->project);

        $validated = $request->validate([
            'column_id' => 'required|exists:board_columns,id',
            'order' => 'required|integer|min:0',
        ]);

        $card->update([
            'column_id' => $validated['column_id'],
            'order' => $validated['order'],
        ]);

        // Update other cards' order in the same column
        $cards = BoardCard::where('column_id', $validated['column_id'])
            ->where('id', '!=', $card->id)
            ->orderBy('order')
            ->get();

        $order = 0;
        foreach ($cards as $c) {
            if ($order == $validated['order']) {
                $order++;
            }
            $c->update(['order' => $order]);
            $order++;
        }

        return response()->json(['success' => true]);
    }

    public function destroy(BoardCard $card)
    {
        // $this->authorize('update', $card->board->project);

        $card->delete();

        return back()->with('success', 'Card deleted successfully.');
    }
}
