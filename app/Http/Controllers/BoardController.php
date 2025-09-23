<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Project;
use App\Models\BoardMember;
use App\Models\BoardInvitation;
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

        return redirect()->route('pm.projects.show', $project->id);
    }

public function index(Project $project)
{
    $board = $project->boards()
        ->with([
            'columns.cards.labels',
            'columns.cards.assignee',
            'columns.cards.reporter',
            'columns.cards.checklists.items',
            'columns.cards.attachments',
            'columns.cards.activityLogs',
            'columns.cards.relations.relatedCard',
            'columns.cards.votes',
            'columns.cards.subscribers',
            'columns.cards.reminders',
            'columns.cards.comments.user',
            'sprints.cards',
            'epics.cards',
            'labels.cards',
            'members.user',
            'owner',
            'invitations',
        ])
        ->first();

    $activities = [];
    if ($board) {
        $activities = $board->columns->flatMap(function ($col) {
            return $col->cards->map(function ($card) use ($col) {
                return [
                    'title' => $card->title,
                    'column' => $col->name,
                    'date' => optional($card->updated_at)->format('Y-m-d'),
                    'type' => $card->type ?? 'Card',
                ];
            });
        })->toArray();
    }

    return Inertia::render('PM/Boards/Index', [
        'board' => $board ? [
            'id' => $board->id,
            'project_id' => $board->project_id,
            'name' => $board->name,
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
                            'description' => $card->description,
                            'type' => $card->type,
                            'priority' => $card->priority,
                            'status' => $card->status,
                            'assignee' => $card->assignee ? [
                                'id' => $card->assignee->id,
                                'name' => $card->assignee->name,
                                'email' => $card->assignee->email,
                            ] : null,
                            'reporter' => $card->reporter ? [
                                'id' => $card->reporter->id,
                                'name' => $card->reporter->name,
                                'email' => $card->reporter->email,
                            ] : null,
                            'labels' => $card->labels->map(fn($label) => [
                                'id' => $label->id,
                                'name' => $label->name,
                                'color' => $label->color,
                            ]),
                            'checklists' => $card->checklists->map(fn($cl) => [
                                'id' => $cl->id,
                                'title' => $cl->title,
                                'items' => $cl->items->map(fn($item) => [
                                    'id' => $item->id,
                                    'title' => $item->title,
                                    'is_completed' => $item->is_completed,
                                ]),
                            ]),
                            'attachments' => $card->attachments->map(fn($a) => [
                                'id' => $a->id,
                                'filename' => $a->filename,
                                'path' => $a->path,
                                'mime_type' => $a->mime_type,
                                'size' => $a->size,
                            ]),
                            'activity_logs' => $card->activityLogs->map(fn($log) => [
                                'id' => $log->id,
                                'action' => $log->action,
                                'meta' => $log->meta,
                                'user' => $log->user ? [
                                    'id' => $log->user->id,
                                    'name' => $log->user->name,
                                ] : null,
                            ]),
                            'relations' => $card->relations->map(fn($rel) => [
                                'id' => $rel->id,
                                'type' => $rel->type,
                                'related_card' => $rel->relatedCard ? [
                                    'id' => $rel->relatedCard->id,
                                    'title' => $rel->relatedCard->title,
                                ] : null,
                            ]),
                            'votes' => $card->votes->count(),
                            'subscribers' => $card->subscribers->count(),
                            'reminders' => $card->reminders->map(fn($r) => [
                                'id' => $r->id,
                                'remind_at' => $r->remind_at,
                                'note' => $r->note,
                            ]),
                            'comments' => $card->comments->map(fn($c) => [
                                'id' => $c->id,
                                'comment' => $c->comment,
                                'user' => $c->user ? [
                                    'id' => $c->user->id,
                                    'name' => $c->user->name,
                                ] : null,
                            ]),
                        ];
                    }),
                ];
            }),
            'sprints' => $board->sprints->map(fn($sprint) => [
                'id' => $sprint->id,
                'name' => $sprint->name,
                'status' => $sprint->status,
                'start_date' => optional($sprint->start_date)->format('Y-m-d'),
                'end_date' => optional($sprint->end_date)->format('Y-m-d'),
                'cards' => $sprint->cards->pluck('id'),
            ]),
            'epics' => $board->epics->map(fn($epic) => [
                'id' => $epic->id,
                'name' => $epic->name,
                'description' => $epic->description,
                'color' => $epic->color,
                'cards' => $epic->cards->pluck('id'),
            ]),
            'labels' => $board->labels->map(fn($label) => [
                'id' => $label->id,
                'name' => $label->name,
                'color' => $label->color,
            ]),
            'members' => $board->members->map(fn($member) => [
                'id' => $member->id,
                'role' => $member->role,
                'user' => $member->user ? [
                    'id' => $member->user->id,
                    'name' => $member->user->name,
                    'email' => $member->user->email,
                ] : null,
            ]),
            'owner' => $board->owner ? [
                'id' => $board->owner->id,
                'name' => $board->owner->name,
                'email' => $board->owner->email,
            ] : null,
            'invitations' => $board->invitations->map(fn($inv) => [
                'id' => $inv->id,
                'email' => $inv->email,
                'status' => $inv->status,
                'token' => $inv->token,
            ]),
            'activities' => $activities,
        ] : null,
    ]);
}

    public function create(Project $project)
    {
        return Inertia::render('PM/Boards/Create', [
            'project' => $project,
        ]);
    }

    public function store(Request $request, Project $project): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:kanban,scrum',
        ]);
        $data['project_id'] = $project->id;
        $data['owner_id'] = Auth::id();
        $board = Board::create($data);
        BoardMember::create([
            'board_id' => $board->id,
            'user_id' => Auth::id(),
            'role' => 'admin',
        ]);
        return redirect()->route('projects.boards.show', [$project, $board]);
    }

    public function show(Project $project, Board $board)
    {
        $board->load('columns.cards', 'members.user', 'owner');
        return Inertia::render('PM/Boards/Show', [
            'project' => $project,
            'board' => $board,
        ]);
    }

    public function edit(Project $project, Board $board)
    {
        return Inertia::render('PM/Boards/Edit', [
            'project' => $project,
            'board' => $board,
        ]);
    }

    public function update(Request $request, Project $project, Board $board): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:kanban,scrum',
        ]);
        $board->update($data);
        return redirect()->route('projects.boards.show', [$project, $board]);
    }

    public function destroy(Project $project, Board $board): RedirectResponse
    {
        $board->delete();
        return redirect()->route('projects.boards.index', $project);
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
}
