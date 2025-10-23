<?php

namespace App\Http\Controllers;

use App\Models\BoardCard;
use App\Models\CardChecklist;
use App\Models\CardChecklistItem;
use Illuminate\Http\Request;
use App\Models\Project;

class CardChecklistController extends Controller
{
    public function store(Request $request, Project $project, Board $board, BoardCard $card)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
        ]);
        $data['card_id'] = $card->id;
        CardChecklist::create($data);
        return redirect()->route('projects.boards.show', [$project, $board]);
    }

    public function addItem(Request $request, Project $project, Board $board, CardChecklist $checklist)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
        ]);
        $data['checklist_id'] = $checklist->id;
        CardChecklistItem::create($data);
        return redirect()->route('projects.boards.show', [$project, $board]);
    }

    public function toggleItem(Project $project, Board $board, CardChecklist $checklist, CardChecklistItem $item)
    {
        $item->is_completed = !$item->is_completed;
        $item->save();
        return redirect()->route('projects.boards.show', [$project, $board]);
    }

    public function destroy(Project $project, Board $board, CardChecklist $checklist)
    {
        $checklist->delete();
        return redirect()->route('projects.boards.show', [$project, $board]);
    }

    public function destroyItem(Project $project, Board $board, CardChecklist $checklist, CardChecklistItem $item)
    {
        $item->delete();
        return redirect()->route('projects.boards.show', [$project, $board]);
    }
}
