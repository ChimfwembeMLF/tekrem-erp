<?php

namespace App\Http\Controllers;

use App\Models\BoardCard;
use App\Models\CardChecklist;
use App\Models\CardChecklistItem;
use App\Services\CardActivityTrait;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CardChecklistController extends Controller
{
    use CardActivityTrait;

    public function store(Request $request, BoardCard $card): RedirectResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $checklist = CardChecklist::create([
            'card_id' => $card->id,
            'title' => $data['title'],
        ]);

        $this->logCardActivity($card, 'checklist_added', ['checklist_id' => $checklist->id]);

        return redirect()->back()->with('success', 'Checklist added.');
    }

    public function storeItem(Request $request, BoardCard $card, CardChecklist $checklist): RedirectResponse
    {
        $this->assertChecklistBelongsToCard($checklist, $card);

        $data = $request->validate([
            'title' => 'nullable|string|max:255',
            'name' => 'nullable|string|max:255',
        ]);

        $title = trim($data['title'] ?? $data['name'] ?? '');
        if ($title === '') {
            return redirect()->back()->withErrors(['title' => 'Item title is required.']);
        }

        CardChecklistItem::create([
            'checklist_id' => $checklist->id,
            'card_checklist_id' => $checklist->id,
            'title' => $title,
            'is_completed' => false,
        ]);

        return redirect()->back()->with('success', 'Checklist item added.');
    }

    public function updateItem(
        Request $request,
        BoardCard $card,
        CardChecklist $checklist,
        CardChecklistItem $item,
    ): RedirectResponse {
        $this->assertChecklistBelongsToCard($checklist, $card);
        $this->assertItemBelongsToChecklist($item, $checklist);

        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'name' => 'sometimes|string|max:255',
            'completed' => 'sometimes|boolean',
            'is_completed' => 'sometimes|boolean',
        ]);

        if (array_key_exists('name', $data)) {
            $item->title = $data['name'];
        } elseif (array_key_exists('title', $data)) {
            $item->title = $data['title'];
        }

        if (array_key_exists('completed', $data)) {
            $item->is_completed = (bool) $data['completed'];
        } elseif (array_key_exists('is_completed', $data)) {
            $item->is_completed = (bool) $data['is_completed'];
        }

        $item->save();

        return redirect()->back()->with('success', 'Checklist item updated.');
    }

    public function destroy(BoardCard $card, CardChecklist $checklist): RedirectResponse
    {
        $this->assertChecklistBelongsToCard($checklist, $card);

        $checklist->delete();
        $this->logCardActivity($card, 'checklist_removed', ['checklist_id' => $checklist->id]);

        return redirect()->back()->with('success', 'Checklist removed.');
    }

    public function destroyItem(
        BoardCard $card,
        CardChecklist $checklist,
        CardChecklistItem $item,
    ): RedirectResponse {
        $this->assertChecklistBelongsToCard($checklist, $card);
        $this->assertItemBelongsToChecklist($item, $checklist);

        $item->delete();

        return redirect()->back()->with('success', 'Checklist item removed.');
    }

    private function assertChecklistBelongsToCard(CardChecklist $checklist, BoardCard $card): void
    {
        abort_unless((int) $checklist->card_id === (int) $card->id, 404);
    }

    private function assertItemBelongsToChecklist(CardChecklistItem $item, CardChecklist $checklist): void
    {
        $belongs = (int) $item->checklist_id === (int) $checklist->id
            || (int) $item->card_checklist_id === (int) $checklist->id;

        abort_unless($belongs, 404);
    }
}
