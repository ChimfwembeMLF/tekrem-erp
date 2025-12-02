<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\HR\Skill;

class SkillController extends Controller
{
  public function index(Request $request)
{
    $query = Skill::query();

    // Filter by name
    if ($request->filled('search')) {
        $search = $request->search;
        $query->where('name', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
    }

    // Filter by category
    if ($request->filled('category')) {
        $query->where('category', $request->category);
    }

    // Filter by type
    if ($request->filled('type')) {
        $query->where('type', $request->type);
    }

    // Optionally include active/inactive filter
    if ($request->filled('status')) {
        $query->where('is_active', $request->status === 'active');
    }

    // Pagination
    $skills = $query->orderBy('name')->paginate(10)->withQueryString();
    $categories = Skill::select('category')->distinct()->pluck('category');

    return Inertia::render('HR/Skills/Index', [
        'skills' => $skills,
        'filters' => $request->only(['search', 'category', 'type', 'status']),
        'categories' => $categories,
    ]);
}


    public function create()
    {
        return Inertia::render('HR/Skills/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);
        Skill::create($data);
        return redirect()->route('hr.skills.index')->with('success', 'Skill created.');
    }

    public function show(Skill $skill)
    {
        return Inertia::render('HR/Skills/Show', [
            'skill' => $skill,
        ]);
    }

    public function edit(Skill $skill)
    {
        return Inertia::render('HR/Skills/Edit', [
            'skill' => $skill,
        ]);
    }

    public function update(Request $request, Skill $skill)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);
        $skill->update($data);
        return redirect()->route('hr.skills.index')->with('success', 'Skill updated.');
    }

    public function destroy(Skill $skill)
    {
        $skill->delete();
        return redirect()->route('hr.skills.index')->with('success', 'Skill deleted.');
    }
}
