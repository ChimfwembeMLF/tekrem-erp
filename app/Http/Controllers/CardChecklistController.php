<?php

namespace App\Http\Controllers;

use App\Models\BoardCard;
use App\Models\Board;
use App\Models\CardChecklist;
use App\Models\CardChecklistItem;
use Illuminate\Http\Request;
use App\Models\Project;
use App\Services\CardActivityTrait;
   
class CardChecklistController extends Controller
{
     use CardActivityTrait;
    public function store(Request $request, Project $project, Board $board, BoardCard $card)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
        ]);
        $data['card_id'] = $card->id;
        $checklist = CardChecklist::create($data);
        $this->logCardActivity($card, 'checklist_added', ['checklist_id' => $checklist->id]);
        // return redirect()->route('projects.boards.show', [$project, $board]);
        return redirect()->back()->with(['message' => 'Successful added checklist']);

    }

    public function storeItem(Request $request, Project $project, Board $board, CardChecklist $checklist)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
        ]);
        $data['checklist_id'] = $checklist->id;
        CardChecklistItem::create($data);
        // return redirect()->route('projects.boards.show', [$project, $board]);
        return redirect()->back()->with(['message' => 'Successful added checklist']);
    }

    public function toggleItem(Project $project, Board $board, CardChecklist $checklist, CardChecklistItem $item)
    {
        $item->is_completed = !$item->is_completed;
        $item->save();
        // return redirect()->route('projects.boards.show', [$project, $board]);
        return redirect()->back()->with(['message' => 'Successful added checklist']);
    }

    public function destroy(Project $project, Board $board, CardChecklist $checklist)
    {
        $card = BoardCard::find($checklist->card_id);
        $checklist->delete();
        if ($card) {
            $this->logCardActivity($card, 'checklist_removed', ['checklist_id' => $checklist->id]);
        }
        // return redirect()->route('projects.boards.show', [$project, $board]);
        return redirect()->back()->with(['message' => 'Successful added checklist']);
    }

    public function destroyItem(Project $project, Board $board, CardChecklist $checklist, CardChecklistItem $item)
    {
        $item->delete();
        // return redirect()->route('projects.boards.show', [$project, $board]);
        return redirect()->back()->with(['message' => 'Successful added checklist']);
    }
}
