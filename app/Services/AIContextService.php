<?php

namespace App\Services;

use App\Models\Client;
use App\Models\Lead;
use App\Models\Communication;
use App\Models\Project;
use App\Models\ProjectTask;
use App\Models\ProjectMilestone;
use App\Models\ProjectTimeLog;
use App\Models\ProjectFile;
use App\Models\Support\Ticket;
use App\Models\Support\TicketCategory;
use App\Models\Support\TicketComment;
use App\Models\Support\KnowledgeBaseArticle;
use App\Models\Support\FAQ;
use App\Models\Finance\Invoice;
use App\Models\Finance\InvoiceItem;
use App\Models\Finance\Expense;
use App\Models\Finance\Transaction;
use App\Models\Finance\Account;
use App\Models\Finance\Category;
use App\Models\Finance\Payment;
use App\Models\Finance\Quotation;
use App\Models\Finance\Budget;
use App\Models\HR\Employee;
use App\Models\HR\Department;
use App\Models\HR\Leave;
use App\Models\HR\LeaveType;
use App\Models\HR\Attendance;
use App\Models\HR\Payroll;
use App\Models\HR\Training;
use App\Models\HR\Performance;
use App\Models\User;
use App\Models\Setting;
use App\Models\Tag;
use App\Models\Module;
use App\Models\Role;
use App\Models\Permission;
use App\Models\AI\PromptTemplate;
use Illuminate\Support\Facades\DB;

// Project Management & Agile
use App\Models\Board;
use App\Models\BoardColumn;
use App\Models\BoardCard;
use App\Models\Sprint;
use App\Models\Epic;
use App\Models\Backlog;
use App\Models\Release;
use App\Models\BoardMember;
use App\Models\BoardInvitation;
use App\Models\CardChecklist;
use App\Models\CardChecklistItem;
use App\Models\CardComment;
use App\Models\CardLabel;
use App\Models\CardVote;
use App\Models\CardWatcher;
use App\Models\CardActivityLog;
use App\Models\CardRelation;
use App\Models\CardSubscriber;
use App\Models\CardReminder;
use App\Models\CardAttachment;

// Notification & Chat
use App\Models\Notification;
use App\Models\Chat;

// Social Media
use App\Models\SocialMedia\FacebookPage;
use App\Models\SocialMedia\FacebookLead;
use App\Models\SocialMedia\InstagramAccount;
use App\Models\SocialMedia\InstagramMedia;
use App\Models\SocialMedia\LinkedInCompany;
use App\Models\SocialMedia\LinkedInLead;
use App\Models\SocialMedia\SocialPost;
use App\Models\SocialMedia\SocialWebhook;
use App\Models\SocialMedia\Tweet;
use App\Models\SocialMedia\TwitterAccount;
use App\Models\SocialMedia\WhatsAppAccount;
use App\Models\SocialMedia\WhatsAppChat;
use App\Models\SocialMedia\WhatsAppContact;
use App\Models\SocialMedia\WhatsAppMessage;

// Approval
use App\Models\Approval\ApprovalRequest;
use App\Models\Approval\ApprovalStep;
use App\Models\Approval\ApprovalWorkflow;

// Guest
use App\Models\Guest\GuestInquiry;
use App\Models\Guest\GuestProjectInquiry;
use App\Models\Guest\GuestQuoteRequest;
use App\Models\Guest\GuestSupportTicket;

// CMS
use App\Models\CMS\Page;

// AI
use App\Models\AI\AIModel;
use App\Models\AI\Conversation;
use App\Models\AI\Service;
use App\Models\AI\UsageLog;

// Miscellaneous
use App\Models\UserNotificationPreference;

class AIContextService
{
    /**
     * Get available context types with their labels and icons
     */
    public function getAvailableContextTypes(): array
    {
        return [
            'crm' => [
                'label' => 'CRM - Customer Relationship Management',
                'description' => 'Access to clients, leads, and communications',
                'icon' => 'users',
                'color' => 'blue',
            ],
            'finance' => [
                'label' => 'Finance - Accounting & Billing',
                'description' => 'Access to invoices, expenses, transactions, and budgets',
                'icon' => 'dollar-sign',
                'color' => 'green',
            ],
            'projects' => [
                'label' => 'Projects - Project Management',
                'description' => 'Access to projects, tasks, milestones, and timelines',
                'icon' => 'briefcase',
                'color' => 'purple',
            ],
            'hr' => [
                'label' => 'HR - Human Resources',
                'description' => 'Access to employees, departments, leaves, and payroll',
                'icon' => 'user-check',
                'color' => 'orange',
            ],
            'support' => [
                'label' => 'Support - Customer Support',
                'description' => 'Access to tickets, knowledge base, and FAQs',
                'icon' => 'life-buoy',
                'color' => 'red',
            ],
            'social_media' => [
                'label' => 'Social Media',
                'description' => 'Access to social media accounts, posts, and integrations',
                'icon' => 'share-2',
                'color' => 'teal',
            ],
            'approval' => [
                'label' => 'Approval',
                'description' => 'Access to approval requests, steps, and workflows',
                'icon' => 'check-square',
                'color' => 'cyan',
            ],
            'guest' => [
                'label' => 'Guest',
                'description' => 'Access to guest inquiries, quote requests, and support tickets',
                'icon' => 'user',
                'color' => 'pink',
            ],
            'cms' => [
                'label' => 'CMS',
                'description' => 'Access to content management pages',
                'icon' => 'file-text',
                'color' => 'indigo',
            ],
            'general' => [
                'label' => 'General - System Wide',
                'description' => 'General assistance without specific module context',
                'icon' => 'message-square',
                'color' => 'gray',
            ],
        ];
    }

    /**
     * Get context data for a specific type and optional ID
     */
    public function getContextData(string $contextType, ?int $contextId = null): array
    {
        return match($contextType) {
            'crm' => $this->getCRMSchema(),
            'finance' => $this->getFinanceSchema(),
            'projects' => $this->getProjectsSchema(),
            'hr' => $this->getHRSchema(),
            'support' => $this->getSupportSchema(),
            'social_media' => $this->getSocialMediaSchema(),
            'approval' => $this->getApprovalSchema(),
            'guest' => $this->getGuestSchema(),
            'cms' => $this->getCMSSchema(),
            'general' => $this->getGeneralSchema(),
            default => [],
        };
    }

            /**
         * Get CMS module schema
         */
        private function getCMSSchema(): array
        {
            return [
                'Page' => [
                    'table' => 'pages',
                    'fillable' => (new Page())->getFillable(),
                    'relationships' => [],
                    'record_count' => Page::count(),
                ],
            ];
        }
    /**
     * Get Guest module schema
     */
    private function getGuestSchema(): array
    {
        return [
            'GuestInquiry' => [
                'table' => 'guest_inquiries',
                'fillable' => (new GuestInquiry())->getFillable(),
                'relationships' => [],
                'record_count' => GuestInquiry::count(),
            ],
            'GuestProjectInquiry' => [
                'table' => 'guest_project_inquiries',
                'fillable' => (new GuestProjectInquiry())->getFillable(),
                'relationships' => [],
                'record_count' => GuestProjectInquiry::count(),
            ],
            'GuestQuoteRequest' => [
                'table' => 'guest_quote_requests',
                'fillable' => (new GuestQuoteRequest())->getFillable(),
                'relationships' => [],
                'record_count' => GuestQuoteRequest::count(),
            ],
            'GuestSupportTicket' => [
                'table' => 'guest_support_tickets',
                'fillable' => (new GuestSupportTicket())->getFillable(),
                'relationships' => [],
                'record_count' => GuestSupportTicket::count(),
            ],
        ];
    }


    /**
     * Build AI prompt with context
     */
    public function buildContextualPrompt(string $userMessage, string $contextType, ?int $contextId = null): string
    {
        // Get system prompt template for this context type
        $template = PromptTemplate::system()
            ->where('slug', "system-prompt-{$contextType}")
            ->first();
        
        if (!$template) {
            // Fallback to default if no template found
            return $this->buildDefaultPrompt($userMessage, $contextType, $contextId);
        }
        
        $contextData = $this->getContextData($contextType, $contextId);
        $schemaInfo = $this->formatSchemaForAI($contextData);
        $contextInfo = $this->getAvailableContextTypes()[$contextType] ?? [];
        
        // Prepare template variables
        $variables = [
            'module_label' => $contextInfo['label'] ?? 'General',
            'module_description' => $contextInfo['description'] ?? '',
            'database_schema' => $schemaInfo,
            'user_message' => $userMessage,
        ];
        
        // Render template with variables
        $prompt = $template->render($variables);
        
        // Increment usage count
        $template->incrementUsage();
        
        return $prompt;
    }
    
    /**
     * Build default prompt (fallback when no template exists)
     */
    private function buildDefaultPrompt(string $userMessage, string $contextType, ?int $contextId = null): string
    {
        $contextData = $this->getContextData($contextType, $contextId);
        $systemContext = $this->buildSystemContext($contextType, $contextData);
        
        return "{$systemContext}\n\nUser Question: {$userMessage}\n\nIMPORTANT: Respond naturally and directly as a helpful assistant. Answer the user's question conversationally without explaining your limitations or capabilities. If you need to reference data, speak about it naturally (e.g., 'You have X clients' or 'Your invoices include...'). Avoid meta-explanations about what you can or cannot do.";
    }

    /**
     * Build system context section for AI
     */
    private function buildSystemContext(string $contextType, array $contextData): string
    {
        $contextInfo = $this->getAvailableContextTypes()[$contextType] ?? [];
        
        $context = "SYSTEM CONTEXT:\n";
        $context .= "You are an AI assistant integrated into TekRem ERP system.\n";
        $context .= "Module: " . ($contextInfo['label'] ?? 'General') . "\n";
        $context .= "Description: " . ($contextInfo['description'] ?? '') . "\n\n";
        
        $context .= "AVAILABLE DATABASE MODELS & SCHEMA:\n";
        $context .= $this->formatSchemaForAI($contextData);
        
        return $context;
    }

    /**
     * Format schema data for AI understanding
     */
    private function formatSchemaForAI(array $schemaData): string
    {
        $formatted = "";
        
        foreach ($schemaData as $modelName => $modelInfo) {
            $formatted .= "\n{$modelName}:\n";
            $formatted .= "  Table: {$modelInfo['table']}\n";
            $formatted .= "  Fields: " . implode(', ', $modelInfo['fillable']) . "\n";
            
            if (!empty($modelInfo['relationships'])) {
                $formatted .= "  Relationships: " . implode(', ', $modelInfo['relationships']) . "\n";
            }
            
            if (isset($modelInfo['record_count'])) {
                $formatted .= "  Total Records in Database: {$modelInfo['record_count']}\n";
            }
            
            // Include sample records if available
            if (!empty($modelInfo['sample_records'])) {
                $formatted .= "  Sample Records (showing " . count($modelInfo['sample_records']) . " of {$modelInfo['record_count']}):\n";
                foreach ($modelInfo['sample_records'] as $index => $record) {
                    $formatted .= "    " . ($index + 1) . ". " . json_encode($record, JSON_UNESCAPED_SLASHES) . "\n";
                }
                $formatted .= "  Note: You can reference and query all {$modelInfo['record_count']} records, not just these samples.\n";
            }
        }
        
        return $formatted;
    }

    /**
     * Get CRM module schema
     */
    private function getCRMSchema(): array
    {
        return [
            'Client' => [
                'table' => 'clients',
                'fillable' => (new Client())->getFillable(),
                'relationships' => ['user', 'projects', 'invoices', 'tickets', 'communications'],
                'record_count' => Client::count(),
                'sample_records' => Client::select('id', 'name', 'email', 'company', 'status', 'created_at')
                    ->limit(10)
                    ->get()
                    ->map(fn($c) => [
                        'id' => $c->id,
                        'name' => $c->name,
                        'email' => $c->email,
                        'company' => $c->company,
                        'status' => $c->status,
                        'created_at' => $c->created_at?->format('Y-m-d'),
                    ])
                    ->toArray(),
            ],
            'Lead' => [
                'table' => 'leads',
                'fillable' => (new Lead())->getFillable(),
                'relationships' => ['user', 'assignedTo', 'communications'],
                'record_count' => Lead::count(),
                'sample_records' => Lead::select('id', 'name', 'email', 'company', 'status', 'source', 'created_at')
                    ->limit(10)
                    ->get()
                    ->map(fn($l) => [
                        'id' => $l->id,
                        'name' => $l->name,
                        'email' => $l->email,
                        'company' => $l->company,
                        'status' => $l->status,
                        'source' => $l->source,
                        'created_at' => $l->created_at?->format('Y-m-d'),
                    ])
                    ->toArray(),
            ],
            'Communication' => [
                'table' => 'communications',
                'fillable' => (new Communication())->getFillable(),
                'relationships' => ['client', 'lead', 'user'],
                'record_count' => Communication::count(),
                'sample_records' => Communication::select('id', 'type', 'subject', 'direction', 'status', 'communication_date')
                    ->limit(10)
                    ->get()
                    ->map(fn($c) => [
                        'id' => $c->id,
                        'type' => $c->type,
                        'subject' => $c->subject,
                        'direction' => $c->direction,
                        'status' => $c->status,
                        'date' => $c->communication_date?->format('Y-m-d'),
                    ])
                    ->toArray(),
            ],
        ];
    }

    /**
     * Get Finance module schema
     */
    private function getFinanceSchema(): array
    {
        return [
            'Invoice' => [
                'table' => 'invoices',
                'fillable' => (new Invoice())->getFillable(),
                'relationships' => ['client', 'items', 'payments'],
                'record_count' => Invoice::count(),
                'sample_records' => Invoice::select('id', 'invoice_number', 'status', 'subtotal', 'tax_amount', 'total_amount', 'due_date')
                    ->limit(10)
                    ->get()
                    ->map(fn($i) => [
                        'id' => $i->id,
                        'invoice_number' => $i->invoice_number,
                        'status' => $i->status,
                        'subtotal' => $i->subtotal,
                        'tax_amount' => $i->tax_amount,
                        'total_amount' => $i->total_amount,
                        'due_date' => $i->due_date?->format('Y-m-d'),
                    ])
                    ->toArray(),
            ],
            'InvoiceItem' => [
                'table' => 'invoice_items',
                'fillable' => (new InvoiceItem())->getFillable(),
                'relationships' => ['invoice'],
                'record_count' => InvoiceItem::count(),
            ],
            'Expense' => [
                'table' => 'expenses',
                'fillable' => (new Expense())->getFillable(),
                'relationships' => ['category', 'user'],
                'record_count' => Expense::count(),
                'sample_records' => Expense::select('id', 'title', 'amount', 'category_id', 'expense_date', 'status')
                    ->limit(10)
                    ->get()
                    ->map(fn($e) => [
                        'id' => $e->id,
                        'title' => $e->title,
                        'amount' => $e->amount,
                        'category_id' => $e->category_id,
                        'expense_date' => $e->expense_date?->format('Y-m-d'),
                        'status' => $e->status,
                    ])
                    ->toArray(),
            ],
            'Transaction' => [
                'table' => 'transactions',
                'fillable' => (new Transaction())->getFillable(),
                'relationships' => ['account', 'category', 'transferToAccount', 'user'],
                'record_count' => Transaction::count(),
                'sample_records' => Transaction::select('id', 'type', 'amount', 'description', 'transaction_date', 'status')
                    ->limit(10)
                    ->get()
                    ->map(fn($t) => [
                        'id' => $t->id,
                        'type' => $t->type,
                        'amount' => $t->amount,
                        'description' => $t->description,
                        'transaction_date' => $t->transaction_date?->format('Y-m-d'),
                        'status' => $t->status,
                    ])
                    ->toArray(),
            ],
            'Account' => [
                'table' => 'accounts',
                'fillable' => (new Account())->getFillable(),
                'relationships' => ['user', 'transactions'],
                'record_count' => Account::count(),
            ],
            'Category' => [
                'table' => 'categories',
                'fillable' => (new Category())->getFillable(),
                'relationships' => ['transactions', 'expenses'],
                'record_count' => Category::count(),
            ],
            'Payment' => [
                'table' => 'payments',
                'fillable' => (new Payment())->getFillable(),
                'relationships' => ['invoice', 'user'],
                'record_count' => Payment::count(),
            ],
            'Quotation' => [
                'table' => 'quotations',
                'fillable' => (new Quotation())->getFillable(),
                'relationships' => ['client', 'items', 'user'],
                'record_count' => Quotation::count(),
            ],
            'Budget' => [
                'table' => 'budgets',
                'fillable' => (new Budget())->getFillable(),
                'relationships' => ['category', 'user'],
                'record_count' => Budget::count(),
            ],
        ];
    }

            /**
         * Get Approval module schema
         */
        private function getApprovalSchema(): array
        {
            return [
                'ApprovalRequest' => [
                    'table' => 'approval_requests',
                    'fillable' => (new ApprovalRequest())->getFillable(),
                    'relationships' => [],
                    'record_count' => ApprovalRequest::count(),
                ],
                'ApprovalStep' => [
                    'table' => 'approval_steps',
                    'fillable' => (new ApprovalStep())->getFillable(),
                    'relationships' => [],
                    'record_count' => ApprovalStep::count(),
                ],
                'ApprovalWorkflow' => [
                    'table' => 'approval_workflows',
                    'fillable' => (new ApprovalWorkflow())->getFillable(),
                    'relationships' => [],
                    'record_count' => ApprovalWorkflow::count(),
                ],
            ];
        }
    /**
     * Get Social Media module schema
     */
    private function getSocialMediaSchema(): array
    {
        return [
            'FacebookPage' => [
                'table' => 'facebook_pages',
                'fillable' => (new FacebookPage())->getFillable(),
                'relationships' => [],
                'record_count' => FacebookPage::count(),
            ],
            'FacebookLead' => [
                'table' => 'facebook_leads',
                'fillable' => (new FacebookLead())->getFillable(),
                'relationships' => [],
                'record_count' => FacebookLead::count(),
            ],
            'InstagramAccount' => [
                'table' => 'instagram_accounts',
                'fillable' => (new InstagramAccount())->getFillable(),
                'relationships' => [],
                'record_count' => InstagramAccount::count(),
            ],
            'InstagramMedia' => [
                'table' => 'instagram_media',
                'fillable' => (new InstagramMedia())->getFillable(),
                'relationships' => [],
                'record_count' => InstagramMedia::count(),
            ],
            'LinkedInCompany' => [
                'table' => 'linkedin_companies',
                'fillable' => (new LinkedInCompany())->getFillable(),
                'relationships' => [],
                'record_count' => LinkedInCompany::count(),
            ],
            'LinkedInLead' => [
                'table' => 'linkedin_leads',
                'fillable' => (new LinkedInLead())->getFillable(),
                'relationships' => [],
                'record_count' => LinkedInLead::count(),
            ],
            'SocialPost' => [
                'table' => 'social_posts',
                'fillable' => (new SocialPost())->getFillable(),
                'relationships' => [],
                'record_count' => SocialPost::count(),
            ],
            'SocialWebhook' => [
                'table' => 'social_webhooks',
                'fillable' => (new SocialWebhook())->getFillable(),
                'relationships' => [],
                'record_count' => SocialWebhook::count(),
            ],
            'Tweet' => [
                'table' => 'tweets',
                'fillable' => (new Tweet())->getFillable(),
                'relationships' => [],
                'record_count' => Tweet::count(),
            ],
            'TwitterAccount' => [
                'table' => 'twitter_accounts',
                'fillable' => (new TwitterAccount())->getFillable(),
                'relationships' => [],
                'record_count' => TwitterAccount::count(),
            ],
            'WhatsAppAccount' => [
                'table' => 'whatsapp_accounts',
                'fillable' => (new WhatsAppAccount())->getFillable(),
                'relationships' => [],
                'record_count' => WhatsAppAccount::count(),
            ],
            'WhatsAppChat' => [
                'table' => 'whatsapp_chats',
                'fillable' => (new WhatsAppChat())->getFillable(),
                'relationships' => [],
                'record_count' => WhatsAppChat::count(),
            ],
            'WhatsAppContact' => [
                'table' => 'whatsapp_contacts',
                'fillable' => (new WhatsAppContact())->getFillable(),
                'relationships' => [],
                'record_count' => WhatsAppContact::count(),
            ],
            'WhatsAppMessage' => [
                'table' => 'whatsapp_messages',
                'fillable' => (new WhatsAppMessage())->getFillable(),
                'relationships' => [],
                'record_count' => WhatsAppMessage::count(),
            ],
        ];
    }
    /**
     * Get Projects module schema
     */
    private function getProjectsSchema(): array
    {
        return [
            // ...existing code for Project, ProjectTask, etc.
            'Project' => [
                'table' => 'projects',
                'fillable' => (new Project())->getFillable(),
                'relationships' => ['client', 'tasks', 'team', 'milestones', 'timeLogs', 'files'],
                'record_count' => Project::count(),
                'sample_records' => Project::select('id', 'name', 'status', 'priority', 'progress', 'start_date', 'end_date')
                    ->limit(10)
                    ->get()
                    ->map(fn($p) => [
                        'id' => $p->id,
                        'name' => $p->name,
                        'status' => $p->status,
                        'priority' => $p->priority,
                        'progress' => $p->progress,
                        'start_date' => $p->start_date?->format('Y-m-d'),
                        'end_date' => $p->end_date?->format('Y-m-d'),
                    ])
                    ->toArray(),
            ],
            'ProjectTask' => [
                'table' => 'project_tasks',
                'fillable' => (new ProjectTask())->getFillable(),
                'relationships' => ['project', 'assignedTo', 'createdBy'],
                'record_count' => ProjectTask::count(),
                'sample_records' => ProjectTask::select('id', 'title', 'status', 'priority', 'progress', 'due_date')
                    ->limit(10)
                    ->get()
                    ->map(fn($t) => [
                        'id' => $t->id,
                        'title' => $t->title,
                        'status' => $t->status,
                        'priority' => $t->priority,
                        'progress' => $t->progress,
                        'due_date' => $t->due_date?->format('Y-m-d'),
                    ])
                    ->toArray(),
            ],
            'ProjectMilestone' => [
                'table' => 'project_milestones',
                'fillable' => (new ProjectMilestone())->getFillable(),
                'relationships' => ['project', 'tasks'],
                'record_count' => ProjectMilestone::count(),
            ],
            'ProjectTimeLog' => [
                'table' => 'project_time_logs',
                'fillable' => (new ProjectTimeLog())->getFillable(),
                'relationships' => ['project', 'task', 'user'],
                'record_count' => ProjectTimeLog::count(),
            ],
            'ProjectFile' => [
                'table' => 'project_files',
                'fillable' => (new ProjectFile())->getFillable(),
                'relationships' => ['project', 'uploadedBy'],
                'record_count' => ProjectFile::count(),
            ],
            // Agile/Board models
            'Board' => [
                'table' => 'boards',
                'fillable' => (new Board())->getFillable(),
                'relationships' => ['project', 'owner', 'columns', 'cards', 'sprints', 'epics', 'members'],
                'record_count' => Board::count(),
            ],
            'BoardColumn' => [
                'table' => 'board_columns',
                'fillable' => (new BoardColumn())->getFillable(),
                'relationships' => ['board', 'cards'],
                'record_count' => BoardColumn::count(),
            ],
            'BoardCard' => [
                'table' => 'board_cards',
                'fillable' => (new BoardCard())->getFillable(),
                'relationships' => ['board', 'column', 'sprint', 'epic', 'assignee', 'reporter', 'attachments', 'comments', 'checklists', 'activityLogs', 'watchers', 'relations', 'votes', 'subscribers', 'reminders', 'labels'],
                'record_count' => BoardCard::count(),
            ],
            'Sprint' => [
                'table' => 'sprints',
                'fillable' => (new Sprint())->getFillable(),
                'relationships' => ['board', 'cards'],
                'record_count' => Sprint::count(),
            ],
            'Epic' => [
                'table' => 'epics',
                'fillable' => (new Epic())->getFillable(),
                'relationships' => ['board', 'cards'],
                'record_count' => Epic::count(),
            ],
            'Backlog' => [
                'table' => 'backlogs',
                'fillable' => (new Backlog())->getFillable(),
                'relationships' => ['board', 'cards'],
                'record_count' => Backlog::count(),
            ],
            'Release' => [
                'table' => 'releases',
                'fillable' => (new Release())->getFillable(),
                'relationships' => ['project', 'cards'],
                'record_count' => Release::count(),
            ],
            'BoardMember' => [
                'table' => 'board_members',
                'fillable' => (new BoardMember())->getFillable(),
                'relationships' => ['board', 'user'],
                'record_count' => BoardMember::count(),
            ],
            'BoardInvitation' => [
                'table' => 'board_invitations',
                'fillable' => (new BoardInvitation())->getFillable(),
                'relationships' => ['board', 'user'],
                'record_count' => BoardInvitation::count(),
            ],
            'CardChecklist' => [
                'table' => 'card_checklists',
                'fillable' => (new CardChecklist())->getFillable(),
                'relationships' => ['card', 'items'],
                'record_count' => CardChecklist::count(),
            ],
            'CardChecklistItem' => [
                'table' => 'card_checklist_items',
                'fillable' => (new CardChecklistItem())->getFillable(),
                'relationships' => ['checklist'],
                'record_count' => CardChecklistItem::count(),
            ],
            'CardComment' => [
                'table' => 'card_comments',
                'fillable' => (new CardComment())->getFillable(),
                'relationships' => ['card', 'user'],
                'record_count' => CardComment::count(),
            ],
            'CardLabel' => [
                'table' => 'card_labels',
                'fillable' => (new CardLabel())->getFillable(),
                'relationships' => ['card'],
                'record_count' => CardLabel::count(),
            ],
            'CardVote' => [
                'table' => 'card_votes',
                'fillable' => (new CardVote())->getFillable(),
                'relationships' => ['card', 'user'],
                'record_count' => CardVote::count(),
            ],
            'CardWatcher' => [
                'table' => 'card_watchers',
                'fillable' => (new CardWatcher())->getFillable(),
                'relationships' => ['card', 'user'],
                'record_count' => CardWatcher::count(),
            ],
            'CardActivityLog' => [
                'table' => 'card_activity_logs',
                'fillable' => (new CardActivityLog())->getFillable(),
                'relationships' => ['card', 'user'],
                'record_count' => CardActivityLog::count(),
            ],
            'CardRelation' => [
                'table' => 'card_relations',
                'fillable' => (new CardRelation())->getFillable(),
                'relationships' => ['card', 'relatedCard'],
                'record_count' => CardRelation::count(),
            ],
            'CardSubscriber' => [
                'table' => 'card_subscribers',
                'fillable' => (new CardSubscriber())->getFillable(),
                'relationships' => ['card', 'user'],
                'record_count' => CardSubscriber::count(),
            ],
            'CardReminder' => [
                'table' => 'card_reminders',
                'fillable' => (new CardReminder())->getFillable(),
                'relationships' => ['card', 'user'],
                'record_count' => CardReminder::count(),
            ],
            'CardAttachment' => [
                'table' => 'card_attachments',
                'fillable' => (new CardAttachment())->getFillable(),
                'relationships' => ['card', 'user'],
                'record_count' => CardAttachment::count(),
            ],
        ];
    }

    /**
     * Get HR module schema
     */
    private function getHRSchema(): array
    {
        return [
            'Employee' => [
                'table' => 'hr_employees',
                'fillable' => (new Employee())->getFillable(),
                'relationships' => ['user', 'department', 'manager', 'leaves', 'attendances', 'payrolls'],
                'record_count' => Employee::count(),
                'sample_records' => Employee::select('id', 'employee_id', 'job_title', 'employment_status', 'hire_date', 'salary')
                    ->with('user:id,name,email')
                    ->limit(10)
                    ->get()
                    ->map(fn($e) => [
                        'id' => $e->id,
                        'employee_id' => $e->employee_id,
                        'name' => $e->user?->name,
                        'email' => $e->user?->email,
                        'job_title' => $e->job_title,
                        'employment_status' => $e->employment_status,
                        'hire_date' => $e->hire_date?->format('Y-m-d'),
                        'salary' => $e->salary,
                    ])
                    ->toArray(),
            ],
            'Department' => [
                'table' => 'hr_departments',
                'fillable' => (new Department())->getFillable(),
                'relationships' => ['employees', 'manager'],
                'record_count' => Department::count(),
                'sample_records' => Department::select('id', 'name', 'code', 'description', 'employee_count', 'is_active')
                    ->limit(10)
                    ->get()
                    ->map(fn($d) => [
                        'id' => $d->id,
                        'name' => $d->name,
                        'code' => $d->code,
                        'description' => $d->description,
                        'employee_count' => $d->employee_count,
                        'is_active' => $d->is_active,
                    ])
                    ->toArray(),
            ],
            'Leave' => [
                'table' => 'hr_leaves',
                'fillable' => (new Leave())->getFillable(),
                'relationships' => ['employee', 'leaveType', 'approvedBy'],
                'record_count' => Leave::count(),
                'sample_records' => Leave::select('id', 'employee_id', 'leave_type_id', 'start_date', 'end_date', 'days_requested', 'status')
                    ->limit(10)
                    ->get()
                    ->map(fn($l) => [
                        'id' => $l->id,
                        'employee_id' => $l->employee_id,
                        'leave_type_id' => $l->leave_type_id,
                        'start_date' => $l->start_date?->format('Y-m-d'),
                        'end_date' => $l->end_date?->format('Y-m-d'),
                        'days_requested' => $l->days_requested,
                        'status' => $l->status,
                    ])
                    ->toArray(),
            ],
            'LeaveType' => [
                'table' => 'hr_leave_types',
                'fillable' => (new LeaveType())->getFillable(),
                'relationships' => ['leaves'],
                'record_count' => LeaveType::count(),
                'sample_records' => LeaveType::select('id', 'name', 'code', 'days_per_year', 'is_paid', 'is_active')
                    ->limit(10)
                    ->get()
                    ->map(fn($lt) => [
                        'id' => $lt->id,
                        'name' => $lt->name,
                        'code' => $lt->code,
                        'days_per_year' => $lt->days_per_year,
                        'is_paid' => $lt->is_paid,
                        'is_active' => $lt->is_active,
                    ])
                    ->toArray(),
            ],
            'Attendance' => [
                'table' => 'hr_attendances',
                'fillable' => (new Attendance())->getFillable(),
                'relationships' => ['employee'],
                'record_count' => Attendance::count(),
                'sample_records' => Attendance::select('id', 'employee_id', 'date', 'clock_in', 'clock_out', 'total_hours', 'status')
                    ->limit(10)
                    ->get()
                    ->map(fn($a) => [
                        'id' => $a->id,
                        'employee_id' => $a->employee_id,
                        'date' => $a->date?->format('Y-m-d'),
                        'clock_in' => $a->clock_in,
                        'clock_out' => $a->clock_out,
                        'total_hours' => $a->total_hours,
                        'status' => $a->status,
                    ])
                    ->toArray(),
            ],
            'Payroll' => [
                'table' => 'hr_payrolls',
                'fillable' => (new Payroll())->getFillable(),
                'relationships' => ['employee'],
                'record_count' => Payroll::count(),
                'sample_records' => Payroll::select('id', 'employee_id', 'period', 'amount', 'created_at')
                    ->limit(10)
                    ->get()
                    ->map(fn($p) => [
                        'id' => $p->id,
                        'employee_id' => $p->employee_id,
                        'period' => $p->period,
                        'amount' => $p->amount,
                        'created_at' => $p->created_at?->format('Y-m-d'),
                    ])
                    ->toArray(),
            ],
            'Training' => [
                'table' => 'hr_trainings',
                'fillable' => (new Training())->getFillable(),
                'relationships' => ['instructor', 'enrollments'],
                'record_count' => Training::count(),
                'sample_records' => Training::select('id', 'title', 'type', 'start_date', 'end_date', 'max_participants', 'enrolled_count', 'status')
                    ->limit(10)
                    ->get()
                    ->map(fn($t) => [
                        'id' => $t->id,
                        'title' => $t->title,
                        'type' => $t->type,
                        'start_date' => $t->start_date?->format('Y-m-d'),
                        'end_date' => $t->end_date?->format('Y-m-d'),
                        'max_participants' => $t->max_participants,
                        'enrolled_count' => $t->enrolled_count,
                        'status' => $t->status,
                    ])
                    ->toArray(),
            ],
            'Performance' => [
                'table' => 'hr_performances',
                'fillable' => (new Performance())->getFillable(),
                'relationships' => ['employee', 'reviewer'],
                'record_count' => Performance::count(),
                'sample_records' => Performance::select('id', 'employee_id', 'reviewer_id', 'review_period', 'overall_rating', 'status', 'due_date')
                    ->limit(10)
                    ->get()
                    ->map(fn($p) => [
                        'id' => $p->id,
                        'employee_id' => $p->employee_id,
                        'reviewer_id' => $p->reviewer_id,
                        'review_period' => $p->review_period,
                        'overall_rating' => $p->overall_rating,
                        'status' => $p->status,
                        'due_date' => $p->due_date?->format('Y-m-d'),
                    ])
                    ->toArray(),
            ],
        ];
    }

    /**
     * Get Support module schema
     */
    private function getSupportSchema(): array
    {
        return [
            'Ticket' => [
                'table' => 'tickets',
                'fillable' => (new Ticket())->getFillable(),
                'relationships' => ['user', 'assignedTo', 'category', 'comments'],
                'record_count' => Ticket::count(),
                'sample_records' => Ticket::select('id', 'ticket_number', 'title', 'status', 'priority', 'created_at')
                    ->limit(10)
                    ->get()
                    ->map(fn($t) => [
                        'id' => $t->id,
                        'ticket_number' => $t->ticket_number,
                        'title' => $t->title,
                        'status' => $t->status,
                        'priority' => $t->priority,
                        'created_at' => $t->created_at?->format('Y-m-d H:i'),
                    ])
                    ->toArray(),
            ],
            'TicketCategory' => [
                'table' => 'ticket_categories',
                'fillable' => (new TicketCategory())->getFillable(),
                'relationships' => ['tickets'],
                'record_count' => TicketCategory::count(),
                'sample_records' => TicketCategory::select('id', 'name', 'description', 'is_active')
                    ->withCount('tickets')
                    ->limit(10)
                    ->get()
                    ->map(fn($c) => [
                        'id' => $c->id,
                        'name' => $c->name,
                        'description' => $c->description,
                        'tickets_count' => $c->tickets_count ?? 0,
                        'is_active' => $c->is_active,
                    ])
                    ->toArray(),
            ],
            'TicketComment' => [
                'table' => 'ticket_comments',
                'fillable' => (new TicketComment())->getFillable(),
                'relationships' => ['ticket', 'user'],
                'record_count' => TicketComment::count(),
            ],
            'KnowledgeBaseArticle' => [
                'table' => 'knowledge_base_articles',
                'fillable' => (new KnowledgeBaseArticle())->getFillable(),
                'relationships' => ['category', 'author'],
                'record_count' => KnowledgeBaseArticle::count(),
                'sample_records' => KnowledgeBaseArticle::select('id', 'title', 'slug', 'status', 'view_count', 'is_featured', 'published_at')
                    ->limit(10)
                    ->get()
                    ->map(fn($a) => [
                        'id' => $a->id,
                        'title' => $a->title,
                        'slug' => $a->slug,
                        'status' => $a->status,
                        'view_count' => $a->view_count,
                        'is_featured' => $a->is_featured,
                        'published_at' => $a->published_at?->format('Y-m-d'),
                    ])
                    ->toArray(),
            ],
        ];
    }

    /**
     * Get General system schema
     */
    private function getGeneralSchema(): array
    {
        return [
            'User' => [
                'table' => 'users',
                'fillable' => (new User())->getFillable(),
                'relationships' => ['roles', 'permissions', 'teams', 'clients', 'projects'],
                'record_count' => User::count(),
            ],
            'Setting' => [
                'table' => 'settings',
                'fillable' => ['key', 'value', 'type'],
                'relationships' => [],
                'record_count' => Setting::count(),
            ],
            'Role' => [
                'table' => 'roles',
                'fillable' => (new Role())->getFillable(),
                'relationships' => ['permissions', 'users'],
                'record_count' => Role::count(),
            ],
            'Permission' => [
                'table' => 'permissions',
                'fillable' => (new Permission())->getFillable(),
                'relationships' => ['roles'],
                'record_count' => Permission::count(),
            ],
            'Tag' => [
                'table' => 'tags',
                'fillable' => (new Tag())->getFillable(),
                'relationships' => ['taggables'],
                'record_count' => Tag::count(),
            ],
            'Module' => [
                'table' => 'modules',
                'fillable' => (new Module())->getFillable(),
                'relationships' => [],
                'record_count' => Module::count(),
            ],
            // Notification & Chat
            'Notification' => [
                'table' => 'notifications',
                'fillable' => (new Notification())->getFillable(),
                'relationships' => [],
                'record_count' => Notification::count(),
            ],
            'Chat' => [
                'table' => 'chats',
                'fillable' => (new Chat())->getFillable(),
                'relationships' => [],
                'record_count' => Chat::count(),
            ],
            // Miscellaneous
            'UserNotificationPreference' => [
                'table' => 'user_notification_preferences',
                'fillable' => (new UserNotificationPreference())->getFillable(),
                'relationships' => [],
                'record_count' => UserNotificationPreference::count(),
            ],
        ];
    }

    /**
     * Get context options for dropdowns (ID and name)
     */
    public function getContextOptions(string $contextType): array
    {
        return match($contextType) {
            'crm' => Client::select('id', 'name', 'company')
                ->orderBy('name')
                ->get()
                ->map(fn($c) => [
                    'value' => $c->id,
                    'label' => $c->name . ($c->company ? " ({$c->company})" : ''),
                ])
                ->toArray(),
            
            'finance' => Invoice::select('id', 'invoice_number', 'total_amount', 'status')
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get()
                ->map(fn($i) => [
                    'value' => $i->id,
                    'label' => $i->invoice_number . " - $" . number_format($i->total_amount, 2) . " ({$i->status})",
                ])
                ->toArray(),
            
            'projects' => Project::select('id', 'name', 'status')
                ->orderBy('name')
                ->get()
                ->map(fn($p) => [
                    'value' => $p->id,
                    'label' => $p->name . " ({$p->status})",
                ])
                ->toArray(),
            
            'hr' => Employee::select('id', 'employee_id', 'job_title')
                ->with('user:id,name')
                ->orderBy('employee_id')
                ->get()
                ->map(fn($e) => [
                    'value' => $e->id,
                    'label' => ($e->user?->name ?? 'Unknown') . " ({$e->employee_id}) - {$e->job_title}",
                ])
                ->toArray(),
            
            'support' => Ticket::select('id', 'ticket_number', 'title', 'status')
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get()
                ->map(fn($t) => [
                    'value' => $t->id,
                    'label' => $t->ticket_number . " - {$t->title} ({$t->status})",
                ])
                ->toArray(),
            
            default => [],
        };
    }
}
