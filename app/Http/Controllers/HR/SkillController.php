<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\HR\Skill;

class SkillController extends Controller
{
    public function index()
    {
        $skills = Skill::all();
        return Inertia::render('HR/Skills/Index', [
            'skills' => $skills,
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
