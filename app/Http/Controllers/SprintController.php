<?php
namespace App\Http\Controllers;

use App\Models\Sprint;
use Illuminate\Http\Request;

class SprintController extends Controller
{
    public function index()
    {
        return Inertia::render("Sprint/Index",[
            'sprints' => Sprint::with('userStories')->get()
        ]);
    }

       public function create()
    {
        // Return a view or Inertia page for creating a Sprint
        return inertia('Sprints/Create');
    }
   

    public function store(Request $request)
    {
        $sprint = Sprint::create($request->validate([
            'name' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'goal' => 'nullable|string',
            'project_id' => 'required|integer|exists:projects,id',
        ]));
        return response()->json($sprint, 201);
    }

    public function show(Sprint $sprint)
  {
        return response()->json($sprint->load('userStories'));
    }

     public function edit(Sprint $sprint)
    {
        // Return a view or Inertia page for editing a Sprint
        return inertia('Sprints/Edit', ['sprint' => $sprint]);
    }
    

    public function update(Request $request, Sprint $sprint)
    {
        $sprint->update($request->validate([
            'name' => 'sometimes|string',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date',
            'goal' => 'nullable|string',
        ]));
        return response()->json($sprint);
    }

    public function destroy(Sprint $sprint)
    {
        $sprint->delete();
        return response()->json(['message' => 'Sprint deleted']);
    }
}
