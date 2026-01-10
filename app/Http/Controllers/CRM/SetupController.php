<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SetupController extends Controller
{
    /**
     * Display the CRM module setup page.
     */
    public function index(): Response
    {
        // $this->authorize('manage-crm-settings');

        return Inertia::render('CRM/Setup/Index', [
            'leadSettings' => $this->getLeadSettings(),
            'clientSettings' => $this->getClientSettings(),
            'communicationSettings' => $this->getCommunicationSettings(),
            'liveChatSettings' => $this->getLiveChatSettings(),
            'pipelineSettings' => $this->getPipelineSettings(),
            'automationSettings' => $this->getAutomationSettings(),
        ]);
    }

    /**
     * Update lead settings.
     */
    public function updateLeads(Request $request)
    {
        // $this->authorize('manage-crm-settings');
        $companyId = currentCompanyId();
        $validated = $request->validate([
            'auto_assign_leads' => 'boolean',
            'lead_scoring_enabled' => 'boolean',
            'lead_qualification_required' => 'boolean',
            'duplicate_detection_enabled' => 'boolean',
            'lead_source_tracking' => 'boolean',
            'auto_follow_up_enabled' => 'boolean',
            'follow_up_interval_days' => 'nullable|integer|min:1|max:365',
            'lead_expiry_days' => 'nullable|integer|min:1|max:365',
            'require_lead_approval' => 'boolean',
            'enable_lead_import' => 'boolean',
            'enable_web_forms' => 'boolean',
            'default_lead_status' => 'required|string|max:50',
            'lead_assignment_method' => 'required|in:round_robin,manual,territory,random',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set("crm.leads.{$key}", $value, $companyId);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Lead settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update client settings.
     */
    public function updateClients(Request $request)
    {
        // $this->authorize('manage-crm-settings');
        $companyId = currentCompanyId();
        $validated = $request->validate([
            'client_id_format' => 'required|string|max:50',
            'client_id_prefix' => 'nullable|string|max:10',
            'enable_client_portal' => 'boolean',
            'enable_client_documents' => 'boolean',
            'enable_client_billing' => 'boolean',
            'enable_client_projects' => 'boolean',
            'client_approval_required' => 'boolean',
            'enable_client_feedback' => 'boolean',
            'enable_client_analytics' => 'boolean',
            'default_client_status' => 'required|string|max:50',
            'enable_client_categories' => 'boolean',
            'enable_client_tags' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set("crm.clients.{$key}", $value, $companyId);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Client settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update communication settings.
     */
    public function updateCommunication(Request $request)
    {
        // $this->authorize('manage-crm-settings');
        $companyId = currentCompanyId();
        $validated = $request->validate([
            'enable_email_tracking' => 'boolean',
            'enable_call_logging' => 'boolean',
            'enable_meeting_scheduling' => 'boolean',
            'enable_sms_integration' => 'boolean',
            'auto_log_emails' => 'boolean',
            'email_template_enabled' => 'boolean',
            'enable_email_sequences' => 'boolean',
            'enable_communication_analytics' => 'boolean',
            'default_email_template' => 'nullable|string',
            'communication_reminder_enabled' => 'boolean',
            'reminder_interval_hours' => 'nullable|integer|min:1|max:168',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set("crm.communication.{$key}", $value, $companyId);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Communication settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update live chat settings.
     */
    public function updateLiveChat(Request $request)
    {
        // $this->authorize('manage-crm-settings');
        $companyId = currentCompanyId();
        $validated = $request->validate([
            'enable_live_chat' => 'boolean',
            'enable_guest_chat' => 'boolean',
            'enable_file_sharing' => 'boolean',
            'enable_emoji_reactions' => 'boolean',
            'enable_message_editing' => 'boolean',
            'enable_message_pinning' => 'boolean',
            'enable_ai_responses' => 'boolean',
            'auto_assign_conversations' => 'boolean',
            'conversation_timeout_minutes' => 'nullable|integer|min:5|max:1440',
            'max_file_size_mb' => 'nullable|integer|min:1|max:100',
            'allowed_file_types' => 'nullable|array',
            'enable_conversation_export' => 'boolean',
            'enable_chat_analytics' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set("crm.livechat.{$key}", $value, $companyId);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Live chat settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update pipeline settings.
     */
    public function updatePipeline(Request $request)
    {
        // $this->authorize('manage-crm-settings');
        $companyId = currentCompanyId();
        $validated = $request->validate([
            'enable_sales_pipeline' => 'boolean',
            'enable_custom_stages' => 'boolean',
            'enable_stage_automation' => 'boolean',
            'enable_pipeline_analytics' => 'boolean',
            'default_pipeline_stages' => 'nullable|array',
            'stage_probability_enabled' => 'boolean',
            'enable_deal_forecasting' => 'boolean',
            'enable_pipeline_reports' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set("crm.pipeline.{$key}", $value, $companyId);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Pipeline settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update automation settings.
     */
    public function updateAutomation(Request $request)
    {
        // $this->authorize('manage-crm-settings');
        $companyId = currentCompanyId();
        $validated = $request->validate([
            'enable_workflow_automation' => 'boolean',
            'enable_email_automation' => 'boolean',
            'enable_task_automation' => 'boolean',
            'enable_lead_scoring' => 'boolean',
            'enable_ai_insights' => 'boolean',
            'auto_create_tasks' => 'boolean',
            'auto_send_welcome_emails' => 'boolean',
            'enable_trigger_based_actions' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set("crm.automation.{$key}", $value, $companyId);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Automation settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Get lead settings.
     */
    private function getLeadSettings(): array
    {
        $companyId = currentCompanyId();
        return [
            'auto_assign_leads' => Setting::get('crm.leads.auto_assign_leads', true, $companyId),
            'lead_scoring_enabled' => Setting::get('crm.leads.lead_scoring_enabled', true, $companyId),
            'lead_qualification_required' => Setting::get('crm.leads.lead_qualification_required', false, $companyId),
            'duplicate_detection_enabled' => Setting::get('crm.leads.duplicate_detection_enabled', true, $companyId),
            'lead_source_tracking' => Setting::get('crm.leads.lead_source_tracking', true, $companyId),
            'auto_follow_up_enabled' => Setting::get('crm.leads.auto_follow_up_enabled', true, $companyId),
            'follow_up_interval_days' => Setting::get('crm.leads.follow_up_interval_days', 3, $companyId),
            'lead_expiry_days' => Setting::get('crm.leads.lead_expiry_days', 90, $companyId),
            'require_lead_approval' => Setting::get('crm.leads.require_lead_approval', false, $companyId),
            'enable_lead_import' => Setting::get('crm.leads.enable_lead_import', true, $companyId),
            'enable_web_forms' => Setting::get('crm.leads.enable_web_forms', true, $companyId),
            'default_lead_status' => Setting::get('crm.leads.default_lead_status', 'new', $companyId),
            'lead_assignment_method' => Setting::get('crm.leads.lead_assignment_method', 'round_robin', $companyId),
        ];
    }

    /**
     * Get client settings.
     */
    private function getClientSettings(): array
    {
        $companyId = currentCompanyId();
        return [
            'client_id_format' => Setting::get('crm.clients.client_id_format', 'CL-{YYYY}-{####}', $companyId),
            'client_id_prefix' => Setting::get('crm.clients.client_id_prefix', 'CL', $companyId),
            'enable_client_portal' => Setting::get('crm.clients.enable_client_portal', true, $companyId),
            'enable_client_documents' => Setting::get('crm.clients.enable_client_documents', true, $companyId),
            'enable_client_billing' => Setting::get('crm.clients.enable_client_billing', true, $companyId),
            'enable_client_projects' => Setting::get('crm.clients.enable_client_projects', true, $companyId),
            'client_approval_required' => Setting::get('crm.clients.client_approval_required', false, $companyId),
            'enable_client_feedback' => Setting::get('crm.clients.enable_client_feedback', true, $companyId),
            'enable_client_analytics' => Setting::get('crm.clients.enable_client_analytics', true, $companyId),
            'default_client_status' => Setting::get('crm.clients.default_client_status', 'active', $companyId),
            'enable_client_categories' => Setting::get('crm.clients.enable_client_categories', true, $companyId),
            'enable_client_tags' => Setting::get('crm.clients.enable_client_tags', true, $companyId),
        ];
    }

    /**
     * Get communication settings.
     */
    private function getCommunicationSettings(): array
    {
        $companyId = currentCompanyId();
        return [
            'enable_email_tracking' => Setting::get('crm.communication.enable_email_tracking', true, $companyId),
            'enable_call_logging' => Setting::get('crm.communication.enable_call_logging', true, $companyId),
            'enable_meeting_scheduling' => Setting::get('crm.communication.enable_meeting_scheduling', true, $companyId),
            'enable_sms_integration' => Setting::get('crm.communication.enable_sms_integration', false, $companyId),
            'auto_log_emails' => Setting::get('crm.communication.auto_log_emails', true, $companyId),
            'email_template_enabled' => Setting::get('crm.communication.email_template_enabled', true, $companyId),
            'enable_email_sequences' => Setting::get('crm.communication.enable_email_sequences', true, $companyId),
            'enable_communication_analytics' => Setting::get('crm.communication.enable_communication_analytics', true, $companyId),
            'default_email_template' => Setting::get('crm.communication.default_email_template', 'default', $companyId),
            'communication_reminder_enabled' => Setting::get('crm.communication.communication_reminder_enabled', true, $companyId),
            'reminder_interval_hours' => Setting::get('crm.communication.reminder_interval_hours', 24, $companyId),
        ];
    }

    /**
     * Get live chat settings.
     */
    private function getLiveChatSettings(): array
    {
        $companyId = currentCompanyId();
        return [
            'enable_live_chat' => Setting::get('crm.livechat.enable_live_chat', true, $companyId),
            'enable_guest_chat' => Setting::get('crm.livechat.enable_guest_chat', true, $companyId),
            'enable_file_sharing' => Setting::get('crm.livechat.enable_file_sharing', true, $companyId),
            'enable_emoji_reactions' => Setting::get('crm.livechat.enable_emoji_reactions', true, $companyId),
            'enable_message_editing' => Setting::get('crm.livechat.enable_message_editing', true, $companyId),
            'enable_message_pinning' => Setting::get('crm.livechat.enable_message_pinning', true, $companyId),
            'enable_ai_responses' => Setting::get('crm.livechat.enable_ai_responses', true, $companyId),
            'auto_assign_conversations' => Setting::get('crm.livechat.auto_assign_conversations', true, $companyId),
            'conversation_timeout_minutes' => Setting::get('crm.livechat.conversation_timeout_minutes', 30, $companyId),
            'max_file_size_mb' => Setting::get('crm.livechat.max_file_size_mb', 10, $companyId),
            'allowed_file_types' => Setting::get('crm.livechat.allowed_file_types', ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'], $companyId),
            'enable_conversation_export' => Setting::get('crm.livechat.enable_conversation_export', true, $companyId),
            'enable_chat_analytics' => Setting::get('crm.livechat.enable_chat_analytics', true, $companyId),
        ];
    }

    /**
     * Get pipeline settings.
     */
    private function getPipelineSettings(): array
    {
        $companyId = currentCompanyId();
        return [
            'enable_sales_pipeline' => Setting::get('crm.pipeline.enable_sales_pipeline', true, $companyId),
            'enable_custom_stages' => Setting::get('crm.pipeline.enable_custom_stages', true, $companyId),
            'enable_stage_automation' => Setting::get('crm.pipeline.enable_stage_automation', true, $companyId),
            'enable_pipeline_analytics' => Setting::get('crm.pipeline.enable_pipeline_analytics', true, $companyId),
            'default_pipeline_stages' => Setting::get('crm.pipeline.default_pipeline_stages', ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'], $companyId),
            'stage_probability_enabled' => Setting::get('crm.pipeline.stage_probability_enabled', true, $companyId),
            'enable_deal_forecasting' => Setting::get('crm.pipeline.enable_deal_forecasting', true, $companyId),
            'enable_pipeline_reports' => Setting::get('crm.pipeline.enable_pipeline_reports', true, $companyId),
        ];
    }

    /**
     * Get automation settings.
     */
    private function getAutomationSettings(): array
    {
        $companyId = currentCompanyId();
        return [
            'enable_workflow_automation' => Setting::get('crm.automation.enable_workflow_automation', true, $companyId),
            'enable_email_automation' => Setting::get('crm.automation.enable_email_automation', true, $companyId),
            'enable_task_automation' => Setting::get('crm.automation.enable_task_automation', true, $companyId),
            'enable_lead_scoring' => Setting::get('crm.automation.enable_lead_scoring', true, $companyId),
            'enable_ai_insights' => Setting::get('crm.automation.enable_ai_insights', true, $companyId),
            'auto_create_tasks' => Setting::get('crm.automation.auto_create_tasks', true, $companyId),
            'auto_send_welcome_emails' => Setting::get('crm.automation.auto_send_welcome_emails', true, $companyId),
            'enable_trigger_based_actions' => Setting::get('crm.automation.enable_trigger_based_actions', true, $companyId),
        ];
    }
}
