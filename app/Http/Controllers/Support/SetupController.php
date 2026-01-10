<?php

namespace App\Http\Controllers\Support;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SetupController extends Controller
{
    /**
     * Display the Support module setup page.
     */
    public function index(): Response
    {
        // $this->authorize('manage-support-settings');

        return Inertia::render('Support/Setup/Index', [
            'ticketSettings' => $this->getTicketSettings(),
            'slaSettings' => $this->getSLASettings(),
            'knowledgeBaseSettings' => $this->getKnowledgeBaseSettings(),
            'chatbotSettings' => $this->getChatbotSettings(),
            'automationSettings' => $this->getAutomationSettings(),
            'notificationSettings' => $this->getNotificationSettings(),
        ]);
    }

    /**
     * Update ticket settings.
     */
    protected function getCompanyId()
    {
        return currentCompanyId();
    }

    public function updateTickets(Request $request)
    {
        $companyId = $this->getCompanyId();
        $validated = $request->validate([
            'ticket_id_format' => 'required|string|max:50',
            'ticket_prefix' => 'nullable|string|max:10',
            'auto_assign_tickets' => 'boolean',
            'assignment_method' => 'required|in:round_robin,manual,skill_based,workload_based',
            'enable_ticket_priorities' => 'boolean',
            'enable_ticket_categories' => 'boolean',
            'enable_ticket_tags' => 'boolean',
            'enable_customer_portal' => 'boolean',
            'allow_guest_tickets' => 'boolean',
            'require_registration' => 'boolean',
            'enable_ticket_merging' => 'boolean',
            'enable_ticket_escalation' => 'boolean',
            'default_ticket_status' => 'required|string|max:50',
            'default_priority' => 'required|string|max:20',
        ]);
        foreach ($validated as $key => $value) {
            Setting::setForCompany($companyId, "support.tickets.{$key}", $value);
        }
        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Ticket settings updated successfully!'
        ]);
        return redirect()->back();
    }

    /**
     * Update SLA settings.
     */
    public function updateSLA(Request $request)
    {
        $companyId = $this->getCompanyId();
        $validated = $request->validate([
            'enable_sla' => 'boolean',
            'enable_sla_escalation' => 'boolean',
            'enable_sla_notifications' => 'boolean',
            'sla_warning_threshold' => 'nullable|integer|min:1|max:100',
            'business_hours_enabled' => 'boolean',
            'business_start_time' => 'nullable|string',
            'business_end_time' => 'nullable|string',
            'business_days' => 'nullable|array',
            'exclude_weekends' => 'boolean',
            'exclude_holidays' => 'boolean',
            'auto_pause_sla' => 'boolean',
        ]);
        foreach ($validated as $key => $value) {
            Setting::setForCompany($companyId, "support.sla.{$key}", $value);
        }
        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'SLA settings updated successfully!'
        ]);
        return redirect()->back();
    }

    /**
     * Update knowledge base settings.
     */
    public function updateKnowledgeBase(Request $request)
    {
        $companyId = $this->getCompanyId();
        $validated = $request->validate([
            'enable_knowledge_base' => 'boolean',
            'enable_public_kb' => 'boolean',
            'enable_article_rating' => 'boolean',
            'enable_article_comments' => 'boolean',
            'enable_article_search' => 'boolean',
            'enable_article_suggestions' => 'boolean',
            'auto_suggest_articles' => 'boolean',
            'enable_article_analytics' => 'boolean',
            'require_approval' => 'boolean',
            'enable_versioning' => 'boolean',
        ]);
        foreach ($validated as $key => $value) {
            Setting::setForCompany($companyId, "support.knowledge_base.{$key}", $value);
        }
        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Knowledge base settings updated successfully!'
        ]);
        return redirect()->back();
    }

    /**
     * Update chatbot settings.
     */
    public function updateChatbot(Request $request)
    {
        $companyId = $this->getCompanyId();
        $validated = $request->validate([
            'enable_chatbot' => 'boolean',
            'enable_ai_responses' => 'boolean',
            'enable_human_handoff' => 'boolean',
            'auto_handoff_threshold' => 'nullable|integer|min:1|max:10',
            'enable_sentiment_analysis' => 'boolean',
            'enable_conversation_logging' => 'boolean',
            'chatbot_greeting' => 'nullable|string|max:500',
            'handoff_message' => 'nullable|string|max:500',
            'enable_proactive_chat' => 'boolean',
            'proactive_delay_seconds' => 'nullable|integer|min:5|max:300',
        ]);
        foreach ($validated as $key => $value) {
            Setting::setForCompany($companyId, "support.chatbot.{$key}", $value);
        }
        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Chatbot settings updated successfully!'
        ]);
        return redirect()->back();
    }

    /**
     * Update automation settings.
     */
    public function updateAutomation(Request $request)
    {
        $companyId = $this->getCompanyId();
        $validated = $request->validate([
            'enable_auto_responses' => 'boolean',
            'enable_workflow_automation' => 'boolean',
            'enable_ticket_routing' => 'boolean',
            'enable_auto_categorization' => 'boolean',
            'enable_auto_tagging' => 'boolean',
            'enable_auto_escalation' => 'boolean',
            'enable_auto_closure' => 'boolean',
            'auto_closure_days' => 'nullable|integer|min:1|max:365',
            'enable_satisfaction_surveys' => 'boolean',
            'survey_delay_hours' => 'nullable|integer|min:1|max:168',
        ]);
        foreach ($validated as $key => $value) {
            Setting::setForCompany($companyId, "support.automation.{$key}", $value);
        }
        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Automation settings updated successfully!'
        ]);
        return redirect()->back();
    }

    /**
     * Update notification settings.
     */
    public function updateNotifications(Request $request)
    {
        $companyId = $this->getCompanyId();
        $validated = $request->validate([
            'enable_email_notifications' => 'boolean',
            'enable_sms_notifications' => 'boolean',
            'enable_push_notifications' => 'boolean',
            'notify_on_new_ticket' => 'boolean',
            'notify_on_status_change' => 'boolean',
            'notify_on_assignment' => 'boolean',
            'notify_on_escalation' => 'boolean',
            'notify_customer_updates' => 'boolean',
            'notify_agent_updates' => 'boolean',
            'notification_frequency' => 'required|in:immediate,hourly,daily',
        ]);
        foreach ($validated as $key => $value) {
            Setting::setForCompany($companyId, "support.notifications.{$key}", $value);
        }
        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Notification settings updated successfully!'
        ]);
        return redirect()->back();
    }

    /**
     * Get ticket settings.
     */
    private function getTicketSettings(): array
    {
        $companyId = $this->getCompanyId();
        return [
            'ticket_id_format' => Setting::getForCompany($companyId, 'support.tickets.ticket_id_format', 'TKT-{YYYY}-{####}'),
            'ticket_prefix' => Setting::getForCompany($companyId, 'support.tickets.ticket_prefix', 'TKT'),
            'auto_assign_tickets' => Setting::getForCompany($companyId, 'support.tickets.auto_assign_tickets', true),
            'assignment_method' => Setting::getForCompany($companyId, 'support.tickets.assignment_method', 'round_robin'),
            'enable_ticket_priorities' => Setting::getForCompany($companyId, 'support.tickets.enable_ticket_priorities', true),
            'enable_ticket_categories' => Setting::getForCompany($companyId, 'support.tickets.enable_ticket_categories', true),
            'enable_ticket_tags' => Setting::getForCompany($companyId, 'support.tickets.enable_ticket_tags', true),
            'enable_customer_portal' => Setting::getForCompany($companyId, 'support.tickets.enable_customer_portal', true),
            'allow_guest_tickets' => Setting::getForCompany($companyId, 'support.tickets.allow_guest_tickets', true),
            'require_registration' => Setting::getForCompany($companyId, 'support.tickets.require_registration', false),
            'enable_ticket_merging' => Setting::getForCompany($companyId, 'support.tickets.enable_ticket_merging', true),
            'enable_ticket_escalation' => Setting::getForCompany($companyId, 'support.tickets.enable_ticket_escalation', true),
            'default_ticket_status' => Setting::getForCompany($companyId, 'support.tickets.default_ticket_status', 'open'),
            'default_priority' => Setting::getForCompany($companyId, 'support.tickets.default_priority', 'medium'),
        ];
    }

    /**
     * Get SLA settings.
     */
    private function getSLASettings(): array
    {
        $companyId = $this->getCompanyId();
        return [
            'enable_sla' => Setting::getForCompany($companyId, 'support.sla.enable_sla', true),
            'enable_sla_escalation' => Setting::getForCompany($companyId, 'support.sla.enable_sla_escalation', true),
            'enable_sla_notifications' => Setting::getForCompany($companyId, 'support.sla.enable_sla_notifications', true),
            'sla_warning_threshold' => Setting::getForCompany($companyId, 'support.sla.sla_warning_threshold', 80),
            'business_hours_enabled' => Setting::getForCompany($companyId, 'support.sla.business_hours_enabled', true),
            'business_start_time' => Setting::getForCompany($companyId, 'support.sla.business_start_time', '09:00'),
            'business_end_time' => Setting::getForCompany($companyId, 'support.sla.business_end_time', '17:00'),
            'business_days' => Setting::getForCompany($companyId, 'support.sla.business_days', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']),
            'exclude_weekends' => Setting::getForCompany($companyId, 'support.sla.exclude_weekends', true),
            'exclude_holidays' => Setting::getForCompany($companyId, 'support.sla.exclude_holidays', true),
            'auto_pause_sla' => Setting::getForCompany($companyId, 'support.sla.auto_pause_sla', true),
        ];
    }

    /**
     * Get knowledge base settings.
     */
    private function getKnowledgeBaseSettings(): array
    {
        $companyId = $this->getCompanyId();
        return [
            'enable_knowledge_base' => Setting::getForCompany($companyId, 'support.knowledge_base.enable_knowledge_base', true),
            'enable_public_kb' => Setting::getForCompany($companyId, 'support.knowledge_base.enable_public_kb', true),
            'enable_article_rating' => Setting::getForCompany($companyId, 'support.knowledge_base.enable_article_rating', true),
            'enable_article_comments' => Setting::getForCompany($companyId, 'support.knowledge_base.enable_article_comments', false),
            'enable_article_search' => Setting::getForCompany($companyId, 'support.knowledge_base.enable_article_search', true),
            'enable_article_suggestions' => Setting::getForCompany($companyId, 'support.knowledge_base.enable_article_suggestions', true),
            'auto_suggest_articles' => Setting::getForCompany($companyId, 'support.knowledge_base.auto_suggest_articles', true),
            'enable_article_analytics' => Setting::getForCompany($companyId, 'support.knowledge_base.enable_article_analytics', true),
            'require_approval' => Setting::getForCompany($companyId, 'support.knowledge_base.require_approval', true),
            'enable_versioning' => Setting::getForCompany($companyId, 'support.knowledge_base.enable_versioning', true),
        ];
    }

    /**
     * Get chatbot settings.
     */
    private function getChatbotSettings(): array
    {
        $companyId = $this->getCompanyId();
        return [
            'enable_chatbot' => Setting::getForCompany($companyId, 'support.chatbot.enable_chatbot', true),
            'enable_ai_responses' => Setting::getForCompany($companyId, 'support.chatbot.enable_ai_responses', true),
            'enable_human_handoff' => Setting::getForCompany($companyId, 'support.chatbot.enable_human_handoff', true),
            'auto_handoff_threshold' => Setting::getForCompany($companyId, 'support.chatbot.auto_handoff_threshold', 3),
            'enable_sentiment_analysis' => Setting::getForCompany($companyId, 'support.chatbot.enable_sentiment_analysis', true),
            'enable_conversation_logging' => Setting::getForCompany($companyId, 'support.chatbot.enable_conversation_logging', true),
            'chatbot_greeting' => Setting::getForCompany($companyId, 'support.chatbot.chatbot_greeting', 'Hello! How can I help you today?'),
            'handoff_message' => Setting::getForCompany($companyId, 'support.chatbot.handoff_message', 'Let me connect you with a human agent.'),
            'enable_proactive_chat' => Setting::getForCompany($companyId, 'support.chatbot.enable_proactive_chat', false),
            'proactive_delay_seconds' => Setting::getForCompany($companyId, 'support.chatbot.proactive_delay_seconds', 30),
        ];
    }

    /**
     * Get automation settings.
     */
    private function getAutomationSettings(): array
    {
        $companyId = $this->getCompanyId();
        return [
            'enable_auto_responses' => Setting::getForCompany($companyId, 'support.automation.enable_auto_responses', true),
            'enable_workflow_automation' => Setting::getForCompany($companyId, 'support.automation.enable_workflow_automation', true),
            'enable_ticket_routing' => Setting::getForCompany($companyId, 'support.automation.enable_ticket_routing', true),
            'enable_auto_categorization' => Setting::getForCompany($companyId, 'support.automation.enable_auto_categorization', true),
            'enable_auto_tagging' => Setting::getForCompany($companyId, 'support.automation.enable_auto_tagging', true),
            'enable_auto_escalation' => Setting::getForCompany($companyId, 'support.automation.enable_auto_escalation', true),
            'enable_auto_closure' => Setting::getForCompany($companyId, 'support.automation.enable_auto_closure', false),
            'auto_closure_days' => Setting::getForCompany($companyId, 'support.automation.auto_closure_days', 30),
            'enable_satisfaction_surveys' => Setting::getForCompany($companyId, 'support.automation.enable_satisfaction_surveys', true),
            'survey_delay_hours' => Setting::getForCompany($companyId, 'support.automation.survey_delay_hours', 24),
        ];
    }

    /**
     * Get notification settings.
     */
    private function getNotificationSettings(): array
    {
        $companyId = $this->getCompanyId();
        return [
            'enable_email_notifications' => Setting::getForCompany($companyId, 'support.notifications.enable_email_notifications', true),
            'enable_sms_notifications' => Setting::getForCompany($companyId, 'support.notifications.enable_sms_notifications', false),
            'enable_push_notifications' => Setting::getForCompany($companyId, 'support.notifications.enable_push_notifications', true),
            'notify_on_new_ticket' => Setting::getForCompany($companyId, 'support.notifications.notify_on_new_ticket', true),
            'notify_on_status_change' => Setting::getForCompany($companyId, 'support.notifications.notify_on_status_change', true),
            'notify_on_assignment' => Setting::getForCompany($companyId, 'support.notifications.notify_on_assignment', true),
            'notify_on_escalation' => Setting::getForCompany($companyId, 'support.notifications.notify_on_escalation', true),
            'notify_customer_updates' => Setting::getForCompany($companyId, 'support.notifications.notify_customer_updates', true),
            'notify_agent_updates' => Setting::getForCompany($companyId, 'support.notifications.notify_agent_updates', false),
            'notification_frequency' => Setting::getForCompany($companyId, 'support.notifications.notification_frequency', 'immediate'),
        ];
    }
}
