<?php

namespace App\Http\Controllers\Agile;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\BoardColumn;
use Illuminate\Http\Request;

class BoardColumnController extends Controller
{
    public function store(Request $request, Board $board)
    {
        // $this->authorize('update', $board->project);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'wip_limit' => 'nullable|integer|min:1',
        ]);

        $validated['order'] = $board->columns()->max('order') + 1;

        $column = $board->columns()->create($validated);

        return back()->with('success', 'Column created successfully.');
    }

    public function update(Request $request, BoardColumn $column)
    {
        // $this->authorize('update', $column->board->project);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'wip_limit' => 'nullable|integer|min:1',
            'order' => 'sometimes|integer|min:0',
        ]);

        $column->update($validated);

        return back()->with('success', 'Column updated successfully.');
    }

    public function destroy(BoardColumn $column)
    {
        // $this->authorize('update', $column->board->project);

        // Check if column has cards
        if ($column->cards()->count() > 0) {
            return back()->with('error', 'Cannot delete column with cards. Please move or delete cards first.');
        }

        $column->delete();

        return back()->with('success', 'Column deleted successfully.');
    }
}
