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
        if ($project->company_id !== currentCompanyId() || $board->company_id !== currentCompanyId() || $card->company_id !== currentCompanyId()) {
            abort(404);
        }
        $data = $request->validate([
            'title' => 'required|string|max:255',
        ]);
        $data['card_id'] = $card->id;
        $data['company_id'] = currentCompanyId();
        CardChecklist::create($data);
        return redirect()->route('projects.boards.show', [$project, $board]);
    }

    public function addItem(Request $request, Project $project, Board $board, CardChecklist $checklist)
    {
        if ($project->company_id !== currentCompanyId() || $board->company_id !== currentCompanyId() || $checklist->company_id !== currentCompanyId()) {
            abort(404);
        }
        $data = $request->validate([
            'title' => 'required|string|max:255',
        ]);
        $data['checklist_id'] = $checklist->id;
        $data['company_id'] = currentCompanyId();
        CardChecklistItem::create($data);
        return redirect()->route('projects.boards.show', [$project, $board]);
    }

    public function toggleItem(Project $project, Board $board, CardChecklist $checklist, CardChecklistItem $item)
    {
        if ($project->company_id !== currentCompanyId() || $board->company_id !== currentCompanyId() || $checklist->company_id !== currentCompanyId() || $item->company_id !== currentCompanyId()) {
            abort(404);
        }
        $item->is_completed = !$item->is_completed;
        $item->save();
        return redirect()->route('projects.boards.show', [$project, $board]);
    }

    public function destroy(Project $project, Board $board, CardChecklist $checklist)
    {
        if ($project->company_id !== currentCompanyId() || $board->company_id !== currentCompanyId() || $checklist->company_id !== currentCompanyId()) {
            abort(404);
        }
        $checklist->delete();
        return redirect()->route('projects.boards.show', [$project, $board]);
    }

    public function destroyItem(Project $project, Board $board, CardChecklist $checklist, CardChecklistItem $item)
    {
        if ($project->company_id !== currentCompanyId() || $board->company_id !== currentCompanyId() || $checklist->company_id !== currentCompanyId() || $item->company_id !== currentCompanyId()) {
            abort(404);
        }
        $item->delete();
        return redirect()->route('projects.boards.show', [$project, $board]);
    }
}
