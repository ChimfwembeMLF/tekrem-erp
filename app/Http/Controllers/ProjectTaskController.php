<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectTask;
use App\Models\User;
use App\Models\Tag;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProjectTaskController extends Controller
{
    /**
     * Display a listing of tasks for a project.
     */
    public function index(Request $request, Project $project)
    {
        $query = $project->tasks()->with(['assignee', 'creator', 'milestone', 'tags']);

        // Apply filters
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        $tasks = $query->orderBy('order')->paginate(15);

        // Get staff users for filter dropdown (only admin and staff roles)
        $staffUsers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['super_user', 'admin', 'staff']);
        })->select('id', 'name')->get();

        return Inertia::render('Projects/Tasks/Index', [
            'project' => $project,
            'tasks' => $tasks,
            'staffUsers' => $staffUsers,
            'filters' => $request->only(['search', 'status', 'type', 'priority', 'assigned_to']),
            'settings' => [
                'enable_task_priorities' => Setting::get('projects.tasks.enable_task_priorities', true),
                'enable_task_estimates' => Setting::get('projects.tasks.enable_task_estimates', true),
                'enable_subtasks' => Setting::get('projects.tasks.enable_subtasks', true),
            ],
        ]);
    }

    /**
     * Show the form for creating a new task.
     */
    public function create(Project $project)
    {
        $milestones = $project->milestones()->select('id', 'name')->get();
        
        // Get staff users only (super user, admin and staff roles)
        $staffUsers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['super_user', 'admin', 'staff']);
        })->select('id', 'name')->get();

        // Check settings
        $enableDependencies = Setting::get('projects.tasks.enable_task_dependencies', true);
        $enableSubtasks = Setting::get('projects.tasks.enable_subtasks', true);
        $enablePriorities = Setting::get('projects.tasks.enable_task_priorities', true);
        $enableEstimates = Setting::get('projects.tasks.enable_task_estimates', true);
        $enableComments = Setting::get('projects.tasks.enable_task_comments', true);
        $enableAttachments = Setting::get('projects.tasks.enable_task_attachments', true);
        $defaultPriority = Setting::get('projects.tasks.default_task_priority', 'medium');

        $availableTasks = $enableDependencies ? $project->tasks()->select('id', 'title')->get() : collect();
        $tags = Tag::active()->ofType('task')->select('id', 'name', 'color')->get();

        return Inertia::render('Projects/Tasks/Create', [
            'project' => $project,
            'milestones' => $milestones,
            'staffUsers' => $staffUsers,
            'availableTasks' => $availableTasks,
            'tags' => $tags,
            'settings' => [
                'enable_task_dependencies' => $enableDependencies,
                'enable_subtasks' => $enableSubtasks,
                'enable_task_priorities' => $enablePriorities,
                'enable_task_estimates' => $enableEstimates,
                'enable_task_comments' => $enableComments,
                'enable_task_attachments' => $enableAttachments,
                'default_task_priority' => $defaultPriority,
            ],
        ]);
    }

    /**
     * Store a newly created task.
     */
    public function store(Request $request, Project $project)
    {
        // Check settings
        $enableDependencies = Setting::get('projects.tasks.enable_task_dependencies', true);
        $enableSubtasks = Setting::get('projects.tasks.enable_subtasks', true);
        $enablePriorities = Setting::get('projects.tasks.enable_task_priorities', true);
        $enableEstimates = Setting::get('projects.tasks.enable_task_estimates', true);
        $defaultPriority = Setting::get('projects.tasks.default_task_priority', 'medium');
        $autoAssign = Setting::get('projects.tasks.auto_assign_tasks', false);
        $assignmentMethod = Setting::get('projects.tasks.task_assignment_method', 'manual');

        $rules = [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:task,issue,bug,feature,improvement',
            'milestone_id' => 'nullable|exists:project_milestones,id',
            'due_date' => 'nullable|date',
            'start_date' => 'nullable|date',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
        ];

        if ($enablePriorities) {
            $rules['priority'] = 'required|in:low,medium,high,critical';
        }
        if ($enableEstimates) {
            $rules['estimated_hours'] = 'nullable|numeric|min:0';
        }
        if ($enableDependencies) {
            $rules['dependencies'] = 'nullable|array';
            $rules['dependencies.*'] = 'exists:project_tasks,id';
        }
        if ($enableSubtasks) {
            $rules['parent_task_id'] = 'nullable|exists:project_tasks,id';
        }
        if (!$autoAssign) {
            $rules['assigned_to'] = 'nullable|exists:users,id';
        }

        $validated = $request->validate($rules);

        // Use default priority if not provided and priorities are enabled
        if ($enablePriorities && !isset($validated['priority'])) {
            $validated['priority'] = $defaultPriority;
        }

        // Validate that assigned user is staff/admin
        if ($validated['assigned_to']) {
            $user = User::find($validated['assigned_to']);
            if (!$user->hasRole(['super_user', 'admin', 'staff'])) {
                return back()->withErrors(['assigned_to' => 'Tasks can only be assigned to staff members or administrators.']);
            }
        }

        // Set the order as the next in sequence
        $validated['order'] = $project->tasks()->max('order') + 1;
        $validated['project_id'] = $project->id;
        $validated['created_by'] = Auth::id();

        $task = ProjectTask::create($validated);

        // Attach tags if provided
        if (!empty($validated['tags'])) {
            $task->tags()->attach($validated['tags']);
        }

        return redirect()->route('projects.tasks.show', [$project, $task])
            ->with('success', 'Task created successfully.');
    }

    /**
     * Display the specified task.
     */
    public function show(Project $project, ProjectTask $task)
    {
        $task->load(['assignee', 'creator', 'milestone', 'parentTask', 'subtasks', 'tags', 'timeLogs.user']);

        return Inertia::render('Projects/Tasks/Show', [
            'project' => $project,
            'task' => $task,
            'settings' => [
                'enable_task_comments' => Setting::get('projects.tasks.enable_task_comments', true),
                'enable_task_attachments' => Setting::get('projects.tasks.enable_task_attachments', true),
                'enable_task_priorities' => Setting::get('projects.tasks.enable_task_priorities', true),
                'enable_task_estimates' => Setting::get('projects.tasks.enable_task_estimates', true),
                'enable_task_dependencies' => Setting::get('projects.tasks.enable_task_dependencies', true),
                'enable_subtasks' => Setting::get('projects.tasks.enable_subtasks', true),
            ],
        ]);
    }

    /**
     * Show the form for editing the task.
     */
    public function edit(Project $project, ProjectTask $task)
    {
        $task->load('tags');
        $milestones = $project->milestones()->select('id', 'name')->get();
        
        // Get staff users only
        $staffUsers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['super_user', 'admin', 'staff']);
        })->select('id', 'name')->get();

        // Check settings
        $enableDependencies = Setting::get('projects.tasks.enable_task_dependencies', true);
        $enableSubtasks = Setting::get('projects.tasks.enable_subtasks', true);
        $enablePriorities = Setting::get('projects.tasks.enable_task_priorities', true);
        $enableEstimates = Setting::get('projects.tasks.enable_task_estimates', true);

        $availableTasks = $enableDependencies ? $project->tasks()
            ->where('id', '!=', $task->id)
            ->select('id', 'title')
            ->get() : collect();
        
        $tags = Tag::active()->ofType('task')->select('id', 'name', 'color')->get();

        return Inertia::render('Projects/Tasks/Edit', [
            'project' => $project,
            'task' => $task,
            'milestones' => $milestones,
            'staffUsers' => $staffUsers,
            'availableTasks' => $availableTasks,
            'tags' => $tags,
            'settings' => [
                'enable_task_dependencies' => $enableDependencies,
                'enable_subtasks' => $enableSubtasks,
                'enable_task_priorities' => $enablePriorities,
                'enable_task_estimates' => $enableEstimates,
            ],
        ]);
    }

    /**
     * Update the specified task.
     */
    public function update(Request $request, Project $project, ProjectTask $task)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:task,issue,bug,feature,improvement',
            'status' => 'required|in:todo,in-progress,review,testing,done,cancelled',
            'priority' => 'required|in:low,medium,high,critical',
            'milestone_id' => 'nullable|exists:project_milestones,id',
            'assigned_to' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
            'start_date' => 'nullable|date',
            'progress' => 'nullable|integer|min:0|max:100',
            'estimated_hours' => 'nullable|numeric|min:0',
            'actual_hours' => 'nullable|numeric|min:0',
            'dependencies' => 'nullable|array',
            'dependencies.*' => 'exists:project_tasks,id',
            'parent_task_id' => 'nullable|exists:project_tasks,id',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
        ]);

        // Validate that assigned user is staff/admin
        if ($validated['assigned_to']) {
            $user = User::find($validated['assigned_to']);
            if (!$user->hasRole(['super_user', 'admin', 'staff'])) {
                return back()->withErrors(['assigned_to' => 'Tasks can only be assigned to staff members or administrators.']);
            }
        }

        $task->update($validated);

        // Sync tags
        if (isset($validated['tags'])) {
            $task->tags()->sync($validated['tags']);
        }

        // Update task status based on progress
        $task->updateStatus();

        return redirect()->route('projects.tasks.show', [$project, $task])
            ->with('success', 'Task updated successfully.');
    }

    /**
     * Remove the specified task.
     */
    public function destroy(Project $project, ProjectTask $task)
    {
        $task->delete();

        return redirect()->route('projects.tasks.index', $project)
            ->with('success', 'Task deleted successfully.');
    }

    /**
     * Update task status.
     */
    public function updateStatus(Request $request, Project $project, ProjectTask $task)
    {
        $validated = $request->validate([
            'status' => 'required|in:todo,in-progress,review,testing,done,cancelled',
            'progress' => 'nullable|integer|min:0|max:100',
        ]);

        $task->update($validated);

        if ($validated['status'] === 'done') {
            $task->markCompleted();
        } else {
            $task->updateStatus();
        }

        return back()->with('success', 'Task status updated successfully.');
    }

    /**
     * Get my tasks (assigned to current user).
     */
    public function myTasks(Request $request)
    {
        $user = Auth::user();        
        $query = ProjectTask::with(['project', 'milestone', 'tags'])
            ->where('assigned_to', $user->id);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        $tasks = $query->orderBy('due_date')->paginate(15);
        // dd($tasks);

        return Inertia::render('Projects/Tasks/MyTasks', [
            'tasks' => $tasks,
            'filters' => $request->only(['status', 'priority']),
        ]);
    }

    /**
     * Auto-assign a task based on the configured method.
     */
    private function autoAssignTask(Project $project, string $method): ?int
    {
        $teamMembers = $project->team_members ?? [];
        
        if (empty($teamMembers)) {
            return null;
        }

        switch ($method) {
            case 'round_robin':
                // Get last assigned user and pick next in rotation
                $lastTask = $project->tasks()->latest()->first();
                $lastAssignedIndex = $lastTask && $lastTask->assigned_to 
                    ? array_search($lastTask->assigned_to, $teamMembers) 
                    : -1;
                $nextIndex = ($lastAssignedIndex + 1) % count($teamMembers);
                return $teamMembers[$nextIndex];

            case 'workload_based':
                // Assign to team member with least number of open tasks
                $taskCounts = [];
                foreach ($teamMembers as $memberId) {
                    $taskCounts[$memberId] = ProjectTask::where('assigned_to', $memberId)
                        ->whereNotIn('status', ['done', 'cancelled'])
                        ->count();
                }
                return array_key_exists(min($taskCounts), $taskCounts) 
                    ? array_search(min($taskCounts), $taskCounts) 
                    : $teamMembers[0];

            case 'manual':
            default:
                return null;
        }
    }
}
