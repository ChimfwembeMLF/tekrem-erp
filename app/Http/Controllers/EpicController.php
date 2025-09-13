<?php

namespace App\Http\Controllers;

use App\Models\Epic;
use Illuminate\Http\Request;

class EpicController extends Controller
{
    public function index()
   {
        return inertia('Epics/Index',[
            'epics' => Epic::with('userStories')->get()
        ]);
    }

      public function create()
    {
        // Return a view or Inertia page for creating an Epic
        return inertia('Epics/Create');
    }

   
   
    public function store(Request $request)
    {
        $epic = Epic::create($request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'project_id' => 'required|integer|exists:projects,id',
        ]));
        return response()->json($epic, 201);
    }

    public function show(Epic $epic)
   {
        return response()->json($epic->load('userStories'));
    }

    public function edit(Epic $epic)
    {
        // Return a view or Inertia page for editing an Epic
        return inertia('Epics/Edit', ['epic' => $epic]);
    }

    public function update(Request $request, Epic $epic)
    {
        $epic->update($request->validate([
            'title' => 'sometimes|string',
            'description' => 'nullable|string',
        ]));
        return response()->json($epic);
    }

    public function destroy(Epic $epic)
    {
        $epic->delete();
        return response()->json(['message' => 'Epic deleted']);
    }
}
