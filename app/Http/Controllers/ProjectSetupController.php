<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectSetupController extends Controller
{
    /**
     * Display the Projects module setup page.
     */
    public function index(): Response
    {
        $user = auth()->user();
        if (!$user || !$user->company_id) {
            abort(404);
        }
        return Inertia::render('Projects/Setup/Index', [
            'generalSettings' => $this->getGeneralSettings($user->company_id),
            'taskSettings' => $this->getTaskSettings($user->company_id),
            'timeTrackingSettings' => $this->getTimeTrackingSettings($user->company_id),
            'milestoneSettings' => $this->getMilestoneSettings($user->company_id),
            'collaborationSettings' => $this->getCollaborationSettings($user->company_id),
            'aiSettings' => $this->getAISettings($user->company_id),
        ]);
    }

    /**
     * Update general project settings.
     */
    public function updateGeneral(Request $request)
    {
        $user = auth()->user();
        if (!$user || !$user->company_id) {
            abort(404);
        }
        $validated = $request->validate([
            'project_id_format' => 'required|string|max:50',
            'project_prefix' => 'nullable|string|max:10',
            'enable_project_templates' => 'boolean',
            'enable_project_categories' => 'boolean',
            'enable_project_tags' => 'boolean',
            'enable_project_budgets' => 'boolean',
            'enable_client_access' => 'boolean',
            'enable_project_analytics' => 'boolean',
            'default_project_status' => 'required|string|max:50',
            'auto_archive_completed' => 'boolean',
            'archive_delay_days' => 'nullable|integer|min:1|max:365',
            'enable_project_approval' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            Setting::setForCompany($user->company_id, "projects.general.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'General project settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update task settings.
     */
    public function updateTasks(Request $request)
    {
        $user = auth()->user();
        if (!$user || !$user->company_id) {
            abort(404);
        }
        $validated = $request->validate([
            'enable_task_dependencies' => 'boolean',
            'enable_task_priorities' => 'boolean',
            'enable_task_estimates' => 'boolean',
            'enable_task_comments' => 'boolean',
            'enable_task_attachments' => 'boolean',
            'enable_subtasks' => 'boolean',
            'enable_task_templates' => 'boolean',
            'auto_assign_tasks' => 'boolean',
            'task_assignment_method' => 'required|in:manual,round_robin,workload_based',
            'enable_task_notifications' => 'boolean',
            'default_task_priority' => 'required|string|max:20',
        ]);

        foreach ($validated as $key => $value) {
            Setting::setForCompany($user->company_id, "projects.tasks.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Task settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update time tracking settings.
     */
    public function updateTimeTracking(Request $request)
    {
        $user = auth()->user();
        if (!$user || !$user->company_id) {
            abort(404);
        }
        $validated = $request->validate([
            'enable_time_tracking' => 'boolean',
            'enable_manual_time_entry' => 'boolean',
            'enable_timer_tracking' => 'boolean',
            'enable_time_approval' => 'boolean',
            'minimum_time_increment' => 'required|integer|min:1|max:60',
            'enable_billable_hours' => 'boolean',
            'default_hourly_rate' => 'nullable|numeric|min:0',
            'enable_overtime_tracking' => 'boolean',
            'overtime_threshold_hours' => 'nullable|integer|min:1|max:24',
            'enable_time_reports' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            Setting::setForCompany($user->company_id, "projects.time_tracking.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Time tracking settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update milestone settings.
     */
    public function updateMilestones(Request $request)
    {
        $user = auth()->user();
        if (!$user || !$user->company_id) {
            abort(404);
        }
        $validated = $request->validate([
            'enable_milestones' => 'boolean',
            'enable_milestone_dependencies' => 'boolean',
            'enable_milestone_budgets' => 'boolean',
            'enable_milestone_approval' => 'boolean',
            'auto_create_milestones' => 'boolean',
            'milestone_notification_days' => 'nullable|integer|min:1|max:90',
            'enable_milestone_reports' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            Setting::setForCompany($user->company_id, "projects.milestones.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Milestone settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update collaboration settings.
     */
    public function updateCollaboration(Request $request)
    {
        $user = auth()->user();
        if (!$user || !$user->company_id) {
            abort(404);
        }
        $validated = $request->validate([
            'enable_team_chat' => 'boolean',
            'enable_file_sharing' => 'boolean',
            'enable_document_collaboration' => 'boolean',
            'enable_project_discussions' => 'boolean',
            'enable_activity_feeds' => 'boolean',
            'enable_mentions' => 'boolean',
            'enable_email_notifications' => 'boolean',
            'max_file_size_mb' => 'nullable|integer|min:1|max:100',
            'allowed_file_types' => 'nullable|array',
        ]);

        foreach ($validated as $key => $value) {
            Setting::setForCompany($user->company_id, "projects.collaboration.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Collaboration settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update AI settings.
     */
    public function updateAI(Request $request)
    {
        $user = auth()->user();
        if (!$user || !$user->company_id) {
            abort(404);
        }
        $validated = $request->validate([
            'enable_ai_planning' => 'boolean',
            'enable_ai_task_generation' => 'boolean',
            'enable_ai_milestone_generation' => 'boolean',
            'enable_ai_insights' => 'boolean',
            'enable_ai_risk_analysis' => 'boolean',
            'enable_ai_resource_optimization' => 'boolean',
            'enable_ai_timeline_estimation' => 'boolean',
            'ai_confidence_threshold' => 'nullable|integer|min:1|max:100',
        ]);

        foreach ($validated as $key => $value) {
            Setting::setForCompany($user->company_id, "projects.ai.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'AI settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Get general settings.
     */
    private function getGeneralSettings($companyId): array
    {
        return [
            'project_id_format' => Setting::getForCompany($companyId, 'projects.general.project_id_format', 'PRJ-{YYYY}-{####}'),
            'project_prefix' => Setting::getForCompany($companyId, 'projects.general.project_prefix', 'PRJ'),
            'enable_project_templates' => Setting::getForCompany($companyId, 'projects.general.enable_project_templates', true),
            'enable_project_categories' => Setting::getForCompany($companyId, 'projects.general.enable_project_categories', true),
            'enable_project_tags' => Setting::getForCompany($companyId, 'projects.general.enable_project_tags', true),
            'enable_project_budgets' => Setting::getForCompany($companyId, 'projects.general.enable_project_budgets', true),
            'enable_client_access' => Setting::getForCompany($companyId, 'projects.general.enable_client_access', true),
            'enable_project_analytics' => Setting::getForCompany($companyId, 'projects.general.enable_project_analytics', true),
            'default_project_status' => Setting::getForCompany($companyId, 'projects.general.default_project_status', 'planning'),
            'auto_archive_completed' => Setting::getForCompany($companyId, 'projects.general.auto_archive_completed', false),
            'archive_delay_days' => Setting::getForCompany($companyId, 'projects.general.archive_delay_days', 30),
            'enable_project_approval' => Setting::getForCompany($companyId, 'projects.general.enable_project_approval', false),
        ];
    }

    /**
     * Get task settings.
     */
    private function getTaskSettings($companyId): array
    {
        return [
            'enable_task_dependencies' => Setting::getForCompany($companyId, 'projects.tasks.enable_task_dependencies', true),
            'enable_task_priorities' => Setting::getForCompany($companyId, 'projects.tasks.enable_task_priorities', true),
            'enable_task_estimates' => Setting::getForCompany($companyId, 'projects.tasks.enable_task_estimates', true),
            'enable_task_comments' => Setting::getForCompany($companyId, 'projects.tasks.enable_task_comments', true),
            'enable_task_attachments' => Setting::getForCompany($companyId, 'projects.tasks.enable_task_attachments', true),
            'enable_subtasks' => Setting::getForCompany($companyId, 'projects.tasks.enable_subtasks', true),
            'enable_task_templates' => Setting::getForCompany($companyId, 'projects.tasks.enable_task_templates', true),
            'auto_assign_tasks' => Setting::getForCompany($companyId, 'projects.tasks.auto_assign_tasks', false),
            'task_assignment_method' => Setting::getForCompany($companyId, 'projects.tasks.task_assignment_method', 'manual'),
            'enable_task_notifications' => Setting::getForCompany($companyId, 'projects.tasks.enable_task_notifications', true),
            'default_task_priority' => Setting::getForCompany($companyId, 'projects.tasks.default_task_priority', 'medium'),
        ];
    }

    /**
     * Get time tracking settings.
     */
    private function getTimeTrackingSettings($companyId): array
    {
        return [
            'enable_time_tracking' => Setting::getForCompany($companyId, 'projects.time_tracking.enable_time_tracking', true),
            'enable_manual_time_entry' => Setting::getForCompany($companyId, 'projects.time_tracking.enable_manual_time_entry', true),
            'enable_timer_tracking' => Setting::getForCompany($companyId, 'projects.time_tracking.enable_timer_tracking', true),
            'enable_time_approval' => Setting::getForCompany($companyId, 'projects.time_tracking.enable_time_approval', false),
            'minimum_time_increment' => Setting::getForCompany($companyId, 'projects.time_tracking.minimum_time_increment', 15),
            'enable_billable_hours' => Setting::getForCompany($companyId, 'projects.time_tracking.enable_billable_hours', true),
            'default_hourly_rate' => Setting::getForCompany($companyId, 'projects.time_tracking.default_hourly_rate', 50),
            'enable_overtime_tracking' => Setting::getForCompany($companyId, 'projects.time_tracking.enable_overtime_tracking', false),
            'overtime_threshold_hours' => Setting::getForCompany($companyId, 'projects.time_tracking.overtime_threshold_hours', 8),
            'enable_time_reports' => Setting::getForCompany($companyId, 'projects.time_tracking.enable_time_reports', true),
        ];
    }

    /**
     * Get milestone settings.
     */
    private function getMilestoneSettings($companyId): array
    {
        return [
            'enable_milestones' => Setting::getForCompany($companyId, 'projects.milestones.enable_milestones', true),
            'enable_milestone_dependencies' => Setting::getForCompany($companyId, 'projects.milestones.enable_milestone_dependencies', true),
            'enable_milestone_budgets' => Setting::getForCompany($companyId, 'projects.milestones.enable_milestone_budgets', true),
            'enable_milestone_approval' => Setting::getForCompany($companyId, 'projects.milestones.enable_milestone_approval', false),
            'auto_create_milestones' => Setting::getForCompany($companyId, 'projects.milestones.auto_create_milestones', false),
            'milestone_notification_days' => Setting::getForCompany($companyId, 'projects.milestones.milestone_notification_days', 7),
            'enable_milestone_reports' => Setting::getForCompany($companyId, 'projects.milestones.enable_milestone_reports', true),
        ];
    }

    /**
     * Get collaboration settings.
     */
    private function getCollaborationSettings($companyId): array
    {
        return [
            'enable_team_chat' => Setting::getForCompany($companyId, 'projects.collaboration.enable_team_chat', true),
            'enable_file_sharing' => Setting::getForCompany($companyId, 'projects.collaboration.enable_file_sharing', true),
            'enable_document_collaboration' => Setting::getForCompany($companyId, 'projects.collaboration.enable_document_collaboration', true),
            'enable_project_discussions' => Setting::getForCompany($companyId, 'projects.collaboration.enable_project_discussions', true),
            'enable_activity_feeds' => Setting::getForCompany($companyId, 'projects.collaboration.enable_activity_feeds', true),
            'enable_mentions' => Setting::getForCompany($companyId, 'projects.collaboration.enable_mentions', true),
            'enable_email_notifications' => Setting::getForCompany($companyId, 'projects.collaboration.enable_email_notifications', true),
            'max_file_size_mb' => Setting::getForCompany($companyId, 'projects.collaboration.max_file_size_mb', 10),
            'allowed_file_types' => Setting::getForCompany($companyId, 'projects.collaboration.allowed_file_types', ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx']),
        ];
    }

    /**
     * Get AI settings.
     */
    private function getAISettings($companyId): array
    {
        return [
            'enable_ai_planning' => Setting::getForCompany($companyId, 'projects.ai.enable_ai_planning', true),
            'enable_ai_task_generation' => Setting::getForCompany($companyId, 'projects.ai.enable_ai_task_generation', true),
            'enable_ai_milestone_generation' => Setting::getForCompany($companyId, 'projects.ai.enable_ai_milestone_generation', true),
            'enable_ai_insights' => Setting::getForCompany($companyId, 'projects.ai.enable_ai_insights', true),
            'enable_ai_risk_analysis' => Setting::getForCompany($companyId, 'projects.ai.enable_ai_risk_analysis', true),
            'enable_ai_resource_optimization' => Setting::getForCompany($companyId, 'projects.ai.enable_ai_resource_optimization', true),
            'enable_ai_timeline_estimation' => Setting::getForCompany($companyId, 'projects.ai.enable_ai_timeline_estimation', true),
            'ai_confidence_threshold' => Setting::getForCompany($companyId, 'projects.ai.ai_confidence_threshold', 75),
        ];
    }
}
