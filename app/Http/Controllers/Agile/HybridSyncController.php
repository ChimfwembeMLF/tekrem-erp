<?php

namespace App\Http\Controllers\Agile;

use App\Http\Controllers\Controller;
use App\Models\BoardCard;
use App\Models\ProjectTask;
use Illuminate\Http\Request;

class HybridSyncController extends Controller
{
    public function linkTaskToCard(Request $request, ProjectTask $task)
    {
        $this->authorize('update', $task->project);

        $validated = $request->validate([
            'card_id' => 'required|exists:board_cards,id',
        ]);

        $companyId = session('current_company_id');
        $card = BoardCard::where('id', $validated['card_id'])->where('company_id', $companyId)->firstOrFail();

        // Verify both belong to the same project
        if ($task->company_id !== $companyId || $card->company_id !== $companyId) {
            return back()->with('error', 'Task and card must belong to the same company.');
        }

        // Check if already linked
        if ($task->card_id || $card->task_id) {
            return back()->with('error', 'Task or card is already linked.');
        }

        $task->update(['card_id' => $card->id]);
        $card->update(['task_id' => $task->id]);

        return back()->with('success', 'Task linked to card successfully.');
    }

    public function linkCardToTask(Request $request, BoardCard $card)
    {
        $this->authorize('update', $card->board->project);

        $validated = $request->validate([
            'task_id' => 'required|exists:project_tasks,id',
        ]);

        $companyId = session('current_company_id');
        $task = ProjectTask::where('id', $validated['task_id'])->where('company_id', $companyId)->firstOrFail();

        // Verify both belong to the same project
        if ($task->company_id !== $companyId || $card->company_id !== $companyId) {
            return back()->with('error', 'Task and card must belong to the same company.');
        }

        // Check if already linked
        if ($task->card_id || $card->task_id) {
            return back()->with('error', 'Task or card is already linked.');
        }

        $card->update(['task_id' => $task->id]);
        $task->update(['card_id' => $card->id]);

        return back()->with('success', 'Card linked to task successfully.');
    }

    public function unlinkTask(ProjectTask $task)
    {
        $this->authorize('update', $task->project);

        if (!$task->card_id) {
            return back()->with('error', 'Task is not linked to any card.');
        }

        $companyId = session('current_company_id');
        $card = $task->card;
        if ($card && $card->company_id !== $companyId) {
            return back()->with('error', 'Unauthorized.');
        }
        
        $task->update(['card_id' => null]);
        if ($card) {
            $card->update(['task_id' => null]);
        }

        return back()->with('success', 'Task unlinked successfully.');
    }

    public function unlinkCard(BoardCard $card)
    {
        $this->authorize('update', $card->board->project);

        if (!$card->task_id) {
            return back()->with('error', 'Card is not linked to any task.');
        }

        $companyId = session('current_company_id');
        $task = $card->task;
        if ($task && $task->company_id !== $companyId) {
            return back()->with('error', 'Unauthorized.');
        }
        
        $card->update(['task_id' => null]);
        if ($task) {
            $task->update(['card_id' => null]);
        }

        return back()->with('success', 'Card unlinked successfully.');
    }
}
