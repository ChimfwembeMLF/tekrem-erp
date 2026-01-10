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
    protected function companyId(): int
    {
        $companyId = session('current_company_id');
        abort_unless($companyId, 403, 'No active company');
        return $companyId;
    }

    public function show(BoardCard $card)
    {
        $companyId = $this->companyId();
        abort_unless($card->company_id === $companyId, 403);

        $card->load([
            'assignee',
            'reporter',
            'column',
            'board.project',
            'sprint',
            'epic',
            'task',
            'comments.user',
            'attachments',
        ]);

        return Inertia::render('Agile/Cards/Show', [
            'card' => $card,
            'project' => $card->board->project,
        ]);
    }

    public function create(Request $request)
    {
        $companyId = $this->companyId();

        $board = Board::where('id', $request->board)
            ->where('company_id', $companyId)
            ->firstOrFail();

        $column = $request->column
            ? BoardColumn::where('id', $request->column)
                ->where('board_id', $board->id)
                ->where('company_id', $companyId)
                ->firstOrFail()
            : null;

        $board->load(['columns', 'sprints', 'epics', 'project']);

        return Inertia::render('Agile/Cards/Create', [
            'board' => $board,
            'project' => $board->project,
            'defaultColumn' => $column,
            'sprints' => $board->sprints,
            'epics' => $board->epics,
        ]);
    }

    public function store(Request $request, Board $board)
    {
        $companyId = $this->companyId();
        abort_unless($board->company_id === $companyId, 403);

        $validated = $request->validate([
            'column_id' => 'required|integer',
            'type' => 'required|in:story,task,bug,epic',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'assignee_id' => 'nullable|exists:users,id',
            'reporter_id' => 'nullable|exists:users,id',
            'priority' => 'required|in:low,medium,high,critical',
            'story_points' => 'nullable|integer|min:0',
            'due_date' => 'nullable|date',
            'sprint_id' => 'nullable|integer',
            'epic_id' => 'nullable|integer',
            'labels' => 'nullable|array',
        ]);

        $column = BoardColumn::where('id', $validated['column_id'])
            ->where('board_id', $board->id)
            ->where('company_id', $companyId)
            ->firstOrFail();

        $maxOrder = BoardCard::where('board_id', $board->id)
            ->where('column_id', $column->id)
            ->max('order');

        $card = BoardCard::create([
            ...$validated,
            'board_id' => $board->id,
            'column_id' => $column->id,
            'company_id' => $companyId,
            'reporter_id' => $validated['reporter_id'] ?? auth()->id(),
            'order' => ($maxOrder ?? -1) + 1,
        ]);

        return redirect()
            ->route('agile.board.show', $board)
            ->with('success', 'Card created successfully.');
    }

    public function edit(BoardCard $card)
    {
        $companyId = $this->companyId();
        abort_unless($card->company_id === $companyId, 403);

        $card->load(['board.columns', 'board.project', 'board.sprints', 'board.epics']);

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
        $companyId = $this->companyId();
        abort_unless($card->company_id === $companyId, 403);

        $validated = $request->validate([
            'column_id' => 'sometimes|integer',
            'type' => 'sometimes|in:story,task,bug,epic',
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'assignee_id' => 'nullable|exists:users,id',
            'priority' => 'sometimes|in:low,medium,high,critical',
            'story_points' => 'nullable|integer|min:0',
            'due_date' => 'nullable|date',
            'sprint_id' => 'nullable|integer',
            'epic_id' => 'nullable|integer',
            'labels' => 'nullable|array',
            'status' => 'nullable|string',
        ]);

        if (isset($validated['column_id'])) {
            BoardColumn::where('id', $validated['column_id'])
                ->where('board_id', $card->board_id)
                ->where('company_id', $companyId)
                ->firstOrFail();
        }

        $card->update($validated);

        if ($card->task_id && isset($validated['status'])) {
            $card->task()->update(['status' => $validated['status']]);
        }

        return back()->with('success', 'Card updated successfully.');
    }

    public function move(Request $request, BoardCard $card)
    {
        $companyId = $this->companyId();
        abort_unless($card->company_id === $companyId, 403);

        $validated = $request->validate([
            'column_id' => 'required|integer',
            'order' => 'required|integer|min:0',
        ]);

        BoardColumn::where('id', $validated['column_id'])
            ->where('board_id', $card->board_id)
            ->where('company_id', $companyId)
            ->firstOrFail();

        $card->update($validated);

        $cards = BoardCard::where('board_id', $card->board_id)
            ->where('column_id', $validated['column_id'])
            ->where('company_id', $companyId)
            ->where('id', '!=', $card->id)
            ->orderBy('order')
            ->get();

        $order = 0;
        foreach ($cards as $c) {
            if ($order === $validated['order']) {
                $order++;
            }
            $c->update(['order' => $order++]);
        }

        return response()->json(['success' => true]);
    }

    public function destroy(BoardCard $card)
    {
        $companyId = $this->companyId();
        abort_unless($card->company_id === $companyId, 403);

        $card->delete();

        return back()->with('success', 'Card deleted successfully.');
    }
}
