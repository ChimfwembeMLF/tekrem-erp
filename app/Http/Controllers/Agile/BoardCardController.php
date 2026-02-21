<?php

namespace App\Http\Controllers\Agile;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\BoardCard;
use App\Models\BoardColumn;
use App\Models\BoardComment;
use App\Models\BoardAttachment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class BoardCardController extends Controller
{
      /**
     * Display a listing of the board cards.
     */
    public function index(Request $request)
    {
        // Optionally filter by board, project, sprint, etc.
        $query = BoardCard::query();

        if ($request->has('board_id')) {
            $query->where('board_id', $request->input('board_id'));
        }
        if ($request->has('column_id')) {
            $query->where('column_id', $request->input('column_id'));
        }
        // Add more filters as needed

        $cards = $query->with(['assignee', 'reporter', 'column', 'board', 'sprint', 'epic', 'task'])->get();

        // Return as Inertia page or JSON depending on request
        if ($request->wantsJson()) {
            return response()->json(['cards' => $cards]);
        }

        return Inertia::render('Projects/Cards/Index', [
            'cards' => $cards,
        ]);
    }

    public function storeComment(Request $request, BoardCard $card)
    {
        // $this->authorize('update', $card->board->project);

        $data = $request->validate([
            'comment' => ['required', 'string', 'max:5000'],
        ]);

        $card->comments()->create([
            'user_id' => $request->user()->id,
            'comment' => $data['comment'],
        ]);

        return back()->with('success', 'Comment added.');
    }

    public function destroyComment(BoardCard $card, BoardCardComment $comment)
    {
        // $this->authorize('update', $card->board->project);

        // ensure comment belongs to this card
        abort_unless((int) $comment->board_card_id === (int) $card->id, 404);

        // optional: only owner/admin can delete
        abort_unless($comment->user_id === auth()->id(), 403);

        $comment->delete();

        return back()->with('success', 'Comment deleted.');
    }

    public function storeAttachment(Request $request, BoardCard $card)
    {
        // $this->authorize('update', $card->board->project);

        $data = $request->validate([
            'file' => ['required', 'file', 'max:10240'], // 10MB
            'name' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $file = $data['file'];

        $dir = "cards/{$card->id}";
        $originalName = $file->getClientOriginalName();
        $ext = $file->getClientOriginalExtension();
        $safeBase = Str::slug(pathinfo($originalName, PATHINFO_FILENAME));
        $filename = $safeBase . '-' . Str::random(8) . ($ext ? ".{$ext}" : '');

        $path = $file->storeAs($dir, $filename, 'public');

        $attachment = $card->attachments()->create([
            'user_id' => $request->user()->id,
            'card_id' => $card->id,
            'filename' => $filename,
            'path' => $path,
            'mime_type' => $file->getClientMimeType(),
            'size' => $file->getSize(),
        ]);

        return back()->with('success', 'Attachment uploaded.');
    }

    public function destroyAttachment(BoardCard $card, BoardAttachment $attachment)
    {
        // $this->authorize('update', $card->board->project);

        abort_unless((int) $attachment->board_card_id === (int) $card->id, 404);

        if ($attachment->disk && $attachment->path) {
            Storage::disk($attachment->disk)->delete($attachment->path);
        }

        $attachment->delete();

        return back()->with('success', 'Attachment deleted.');
    }

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

        return Inertia::render('Projects/Cards/Show', [
            'card' => $card,
            'project' => $card->board->project,
        ]);
    }

    public function create(Request $request)
    {
        $board = Board::findOrFail($request->board);
        // $this->authorize('update', $board->project);

        $column = $request->column ? BoardColumn::find($request->column) : null;

        return Inertia::render('Projects/Cards/Create', [
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

        return redirect()->back()
            ->with('success', 'Card created successfully.');
    }

    public function edit(BoardCard $card)
    {
        // $this->authorize('update', $card->board->project);

        $card->load(['board.columns', 'board.project']);

        return Inertia::render('Projects/Cards/Edit', [
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

        return redirect()->back()->with(['success' => true]);
    }

    public function destroy(BoardCard $card)
    {
        // $this->authorize('update', $card->board->project);

        $card->delete();

        return back()->with('success', 'Card deleted successfully.');
    }
}
