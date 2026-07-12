<?php

/**
 * Business tables that belong to a single organization.
 * Used by migrations and model stamping — keep in sync.
 */
return [

    /*
    |--------------------------------------------------------------------------
    | Commerce, inventory, sales, procurement, POS
    |--------------------------------------------------------------------------
    */
    'product_categories',
    'products',
    'warehouses',
    'stock_levels',
    'stock_movements',
    'sales_orders',
    'sales_order_items',
    'ecommerce_carts',
    'ecommerce_cart_items',
    'shop_shipping_methods',
    'shop_coupons',
    'shop_wishlist_items',
    'shop_product_reviews',
    'shop_shipments',
    'shop_shipment_events',
    'shop_saved_addresses',
    'suppliers',
    'purchase_orders',
    'purchase_order_items',
    'goods_receipts',
    'goods_receipt_items',
    'pos_registers',
    'pos_sessions',
    'pos_sales',

    /*
    |--------------------------------------------------------------------------
    | CRM
    |--------------------------------------------------------------------------
    */
    'clients',
    'leads',
    'communications',
    'conversations',
    'chats',
    'tags',

    /*
    |--------------------------------------------------------------------------
    | Finance
    |--------------------------------------------------------------------------
    */
    'accounts',
    'transactions',
    'invoices',
    'invoice_items',
    'payments',
    'payment_methods',
    'expenses',
    'budgets',
    'categories',
    'quotations',
    'quotation_items',
    'finance_templates',
    'reports',
    'bank_statements',
    'bank_statement_transactions',
    'bank_reconciliations',
    'bank_reconciliation_items',
    'momo_transactions',
    'momo_providers',
    'momo_webhooks',
    'zra_configurations',
    'zra_smart_invoices',
    'zra_audit_logs',

    /*
    |--------------------------------------------------------------------------
    | Human resources
    |--------------------------------------------------------------------------
    */
    'hr_departments',
    'hr_employees',
    'hr_teams',
    'hr_attendances',
    'hr_leaves',
    'hr_leave_types',
    'hr_performances',
    'hr_trainings',
    'hr_training_enrollments',
    'hr_skills',
    'hr_payrolls',
    'payroll_components',
    'employee_payroll_components',
    'payroll_audits',
    'hr_documents',
    'hr_onboardings',
    'hr_offboardings',
    'hr_job_postings',
    'hr_job_applications',
    'hr_org_charts',

    /*
    |--------------------------------------------------------------------------
    | Projects & agile
    |--------------------------------------------------------------------------
    */
    'projects',
    'project_tasks',
    'project_milestones',
    'project_files',
    'project_time_logs',
    'project_templates',
    'boards',
    'board_columns',
    'board_cards',
    'board_members',
    'board_invitations',
    'sprints',
    'epics',
    'releases',
    'backlogs',
    'sprint_reports',
    'labels',
    'card_comments',
    'card_attachments',
    'card_activity_logs',
    'card_checklists',
    'card_checklist_items',
    'card_labels',
    'card_relations',
    'card_reminders',
    'card_subscribers',
    'card_votes',
    'card_watchers',

    /*
    |--------------------------------------------------------------------------
    | Support
    |--------------------------------------------------------------------------
    */
    'tickets',
    'ticket_comments',
    'ticket_escalations',
    'ticket_categories',
    'ticket_sources',
    's_l_a_s',
    'f_a_q_s',
    'knowledge_base_articles',
    'knowledge_base_categories',
    'automation_rules',
    'bot_knowledge_entries',
    'support_chatbot_conversations',
    'support_chatbot_messages',

    /*
    |--------------------------------------------------------------------------
    | AI
    |--------------------------------------------------------------------------
    */
    'ai_models',
    'ai_services',
    'ai_conversations',
    'ai_prompt_templates',
    'ai_usage_logs',

    /*
    |--------------------------------------------------------------------------
    | Approvals & analytics
    |--------------------------------------------------------------------------
    */
    'approval_workflows',
    'approval_requests',
    'approval_steps',
    'site_visitors',
    'site_page_views',
    'guest_sessions',
    'guest_inquiries',
    'guest_quote_requests',
    'guest_support_tickets',
    'guest_project_inquiries',
    'message_comments',

];
