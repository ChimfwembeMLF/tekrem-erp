<?php
namespace App\Http\Controllers;

use App\Models\UserStory;
use Illuminate\Http\Request;

class UserStoryController extends Controller
{
    public function index()
    {
        return inertia('UserStories/Index',[
            'userStories' => UserStory::with('sprint')->get()
        ]);
    }


     public function create()
    {
        // Return a view or Inertia page for creating a User Story
        return inertia('UserStories/Create');
    }

    public function edit(UserStory $userStory)
    {
        // Return a view or Inertia page for editing a User Story
        return inertia('UserStories/Edit', ['userStory' => $userStory]);
    }
   

    public function store(Request $request)
    {
        $story = UserStory::create($request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'story_points' => 'required|integer',
            'status' => 'required|string',
            'sprint_id' => 'nullable|integer|exists:sprints,id',
            'project_id' => 'required|integer|exists:projects,id',
        ]));
        return response()->json($story, 201);
    }

    public function show(UserStory $userStory)
    {
        return response()->json($userStory->load('sprint'));
    }
  
    public function update(Request $request, UserStory $userStory)
    {
        $userStory->update($request->validate([
            'title' => 'sometimes|string',
            'description' => 'nullable|string',
            'story_points' => 'sometimes|integer',
            'status' => 'sometimes|string',
            'sprint_id' => 'nullable|integer|exists:sprints,id',
        ]));
        return response()->json($userStory);
    }

    public function destroy(UserStory $userStory)
    {
        $userStory->delete();
        return response()->json(['message' => 'User Story deleted']);
    }
}
