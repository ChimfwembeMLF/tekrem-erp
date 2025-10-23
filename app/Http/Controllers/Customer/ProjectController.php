<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectTask;
use App\Models\ProjectMilestone;
use App\Models\ProjectTimeEntry;
use App\Models\CRM\Conversation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    /**
     * Display customer's projects.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();

        // Get projects where user is client or team member
        $query = Project::where(function ($q) use ($user) {
            $q->where('client_id', $user->id)
              ->orWhereHas('teamMembers', function ($teamQ) use ($user) {
                  $teamQ->where('user_id', $user->id);
              })
              ->orWhereJsonContains('team_members', $user->id);
        })->with(['client', 'teamMembers.user', 'milestones']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        $projects = $query->orderBy('created_at', 'desc')->paginate(12);

        // Get project statistics for customer's accessible projects
        $baseQuery = Project::where(function ($q) use ($user) {
            $q->where('client_id', $user->id)
              ->orWhereHas('teamMembers', function ($teamQ) use ($user) {
                  $teamQ->where('user_id', $user->id);
              })
              ->orWhereJsonContains('team_members', $user->id);
        });

        $stats = [
            'total' => $baseQuery->count(),
            'active' => (clone $baseQuery)->where('status', 'active')->count(),
            'completed' => (clone $baseQuery)->where('status', 'completed')->count(),
            'on_hold' => (clone $baseQuery)->where('status', 'on_hold')->count(),
            'planning' => (clone $baseQuery)->where('status', 'planning')->count(),
        ];

        return Inertia::render('Customer/Projects/Index', [
            'projects' => $projects,
            'stats' => $stats,
            'filters' => $request->only(['status', 'search', 'priority']),
        ]);
    }

    /**
     * Display the specified project.
     */
    public function show(Project $project): Response
    {
        $user = Auth::user();

        // Ensure user can access this project
        if (!$this->canAccessProject($project, $user)) {
            abort(403, 'Access denied.');
        }

        $project->load([
            'client',
            'teamMembers.user',
            'milestones' => function ($query) {
                $query->orderBy('due_date', 'asc');
            },
            'tasks' => function ($query) {
                $query->where('is_visible_to_client', true)
                      ->with(['assignedTo', 'milestone'])
                      ->orderBy('created_at', 'desc');
            },
            'timeEntries' => function ($query) {
                $query->where('is_billable', true)
                      ->with(['user', 'task'])
                      ->orderBy('date', 'desc');
            },
            'attachments',
            'communications' => function ($query) {
                $query->where('is_internal', false)
                      ->with('user')
                      ->orderBy('created_at', 'desc');
            }
        ]);

        // Calculate project progress
        $totalTasks = $project->tasks->count();
        $completedTasks = $project->tasks->where('status', 'completed')->count();
        $progress = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 0;

        // Calculate total billable hours
        $totalHours = $project->timeEntries->sum('hours');
        $totalAmount = $project->timeEntries->sum(function ($entry) {
            return $entry->hours * $entry->hourly_rate;
        });

        return Inertia::render('Customer/Projects/Show', [
            'project' => $project,
            'progress' => $progress,
            'totalHours' => $totalHours,
            'totalAmount' => $totalAmount,
        ]);
    }

    /**
     * Display project tasks.
     */
    public function tasks(Project $project, Request $request): Response
    {
        $user = Auth::user();

        // Ensure user can access this project
        if (!$this->canAccessProject($project, $user)) {
            abort(403, 'Access denied.');
        }

        $query = $project->tasks()
            ->where('is_visible_to_client', true)
            ->with(['assignedTo', 'milestone', 'comments' => function ($q) {
                $q->where('is_internal', false)->with('user');
            }]);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('milestone_id')) {
            $query->where('milestone_id', $request->milestone_id);
        }

        $tasks = $query->orderBy('created_at', 'desc')->paginate(20);

        $milestones = $project->milestones()->orderBy('due_date', 'asc')->get();

        return Inertia::render('Customer/Projects/Tasks', [
            'project' => $project,
            'tasks' => $tasks,
            'milestones' => $milestones,
            'filters' => $request->only(['status', 'milestone_id']),
        ]);
    }

    /**
     * Display project milestones.
     */
    public function milestones(Project $project): Response
    {
        $user = Auth::user();

        // Ensure user can access this project
        if (!$this->canAccessProject($project, $user)) {
            abort(403, 'Access denied.');
        }

        $milestones = $project->milestones()
            ->with(['tasks' => function ($query) {
                $query->where('is_visible_to_client', true);
            }])
            ->orderBy('due_date', 'asc')
            ->get();

        // Calculate progress for each milestone
        $milestones->each(function ($milestone) {
            $totalTasks = $milestone->tasks->count();
            $completedTasks = $milestone->tasks->where('status', 'completed')->count();
            $milestone->progress = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 0;
        });

        return Inertia::render('Customer/Projects/Milestones', [
            'project' => $project,
            'milestones' => $milestones,
        ]);
    }

    /**
     * Display project time tracking.
     */
    public function timeTracking(Project $project, Request $request): Response
    {
        $user = Auth::user();

        // Ensure user can access this project
        if (!$this->canAccessProject($project, $user)) {
            abort(403, 'Access denied.');
        }

        $query = $project->timeEntries()
            ->where('is_billable', true)
            ->with(['user', 'task']);

        // Apply date filters
        if ($request->filled('start_date')) {
            $query->where('date', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->where('date', '<=', $request->end_date);
        }

        $timeEntries = $query->orderBy('date', 'desc')->paginate(50);

        // Calculate summary statistics
        $totalHours = $timeEntries->sum('hours');
        $totalAmount = $timeEntries->sum(function ($entry) {
            return $entry->hours * $entry->hourly_rate;
        });

        // Group by user for summary
        $userSummary = $timeEntries->groupBy('user_id')->map(function ($entries) {
            return [
                'user' => $entries->first()->user,
                'total_hours' => $entries->sum('hours'),
                'total_amount' => $entries->sum(function ($entry) {
                    return $entry->hours * $entry->hourly_rate;
                }),
            ];
        });

        return Inertia::render('Customer/Projects/TimeTracking', [
            'project' => $project,
            'timeEntries' => $timeEntries,
            'totalHours' => $totalHours,
            'totalAmount' => $totalAmount,
            'userSummary' => $userSummary,
            'filters' => $request->only(['start_date', 'end_date']),
        ]);
    }

    /**
     * Display project files and attachments.
     */
    public function files(Project $project): Response
    {
        $user = Auth::user();

        // Ensure user can access this project
        if (!$this->canAccessProject($project, $user)) {
            abort(403, 'Access denied.');
        }

        $attachments = $project->attachments()
            ->where('is_visible_to_client', true)
            ->with('uploadedBy')
            ->orderBy('created_at', 'desc')
            ->get();

        // Group attachments by type
        $groupedAttachments = $attachments->groupBy(function ($attachment) {
            $extension = pathinfo($attachment->file_name, PATHINFO_EXTENSION);
            
            if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                return 'images';
            } elseif (in_array($extension, ['pdf'])) {
                return 'documents';
            } elseif (in_array($extension, ['zip', 'rar', '7z'])) {
                return 'archives';
            } else {
                return 'other';
            }
        });

        return Inertia::render('Customer/Projects/Files', [
            'project' => $project,
            'attachments' => $attachments,
            'groupedAttachments' => $groupedAttachments,
        ]);
    }

    /**
     * Download project file.
     */
    public function downloadFile(Project $project, $attachmentId)
    {
        $user = Auth::user();

        // Ensure user can access this project
        if (!$this->canAccessProject($project, $user)) {
            abort(403, 'Access denied.');
        }

        $attachment = $project->attachments()
            ->where('id', $attachmentId)
            ->where('is_visible_to_client', true)
            ->firstOrFail();

        return response()->download(storage_path('app/' . $attachment->file_path), $attachment->file_name);
    }

    /**
     * Display project chat interface.
     */
    public function chat(Project $project): Response
    {
        $user = Auth::user();

        // Ensure user can access this project
        if (!$this->canAccessProject($project, $user)) {
            abort(403, 'Access denied.');
        }

        // Find or create a conversation for this project
        $conversation = Conversation::where('conversable_type', Project::class)
            ->where('conversable_id', $project->id)
            ->where('status', '!=', 'archived')
            ->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'title' => 'Project: ' . $project->name,
                'conversable_type' => Project::class,
                'conversable_id' => $project->id,
                'status' => 'active',
                'created_by' => $user->id,
                'client_id' => $user->id, // Customer is the client
            ]);

            // Add customer as participant
            $conversation->participants()->create([
                'user_id' => $user->id,
                'role' => 'customer',
                'joined_at' => now(),
            ]);

            // Add project manager as participant if exists
            if ($project->manager_id) {
                $conversation->participants()->create([
                    'user_id' => $project->manager_id,
                    'role' => 'staff',
                    'joined_at' => now(),
                ]);
            }
        }

        // Load conversation with messages and participants
        $conversation->load([
            'participants.user',
            'messages' => function ($query) {
                $query->with(['user', 'attachments'])
                      ->orderBy('created_at', 'asc');
            }
        ]);

        // Get pinned messages
        $pinnedMessages = $conversation->messages()
            ->where('is_pinned', true)
            ->with(['user', 'attachments'])
            ->orderBy('pinned_at', 'desc')
            ->limit(3)
            ->get();

        // Mark messages as read for current user
        $conversation->markAsReadFor($user);

        // For customers, we don't show client/lead/staff lists
        $clients = [];
        $leads = [];
        $staff = [];

        return Inertia::render('CRM/LiveChat/Conversation', [
            'conversation' => $conversation,
            'pinnedMessages' => $pinnedMessages,
            'clients' => $clients,
            'leads' => $leads,
            'staff' => $staff,
            'userRole' => 'customer',
            // Add project-specific data
            'project' => $project->load(['client', 'manager']),
            'isProjectChat' => true,
            'isCustomerView' => true, // Flag to customize the UI for customer context
        ]);
    }

    /**
     * Check if user can access the project.
     */
    private function canAccessProject(Project $project, $user): bool
    {
        // Check if user is the client
        if ($project->client_id === $user->id) {
            return true;
        }

        // Check if user is in team members (pivot table)
        if ($project->teamMembers->contains('user_id', $user->id)) {
            return true;
        }

        // Check if user is in team members (JSON array)
        if ($project->team_members && in_array($user->id, $project->team_members)) {
            return true;
        }

        return false;
    }
}
