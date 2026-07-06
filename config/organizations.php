<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Central application domains
    |--------------------------------------------------------------------------
    |
    | Requests on these hosts without a tenant subdomain use the default
    | organization (see default_organization_slug).
    |
    */
    'central_domains' => array_filter(array_map(
        'trim',
        explode(',', env('ORGANIZATION_CENTRAL_DOMAINS', 'localhost,127.0.0.1'))
    )),

    'app_domain' => env('ORGANIZATION_APP_DOMAIN'),

    /*
    |--------------------------------------------------------------------------
    | Local subdomain development
    |--------------------------------------------------------------------------
    |
    | Example .env for Valet / nginx wildcard testing:
    |
    |   ORGANIZATION_APP_DOMAIN=erp.test
    |   ORGANIZATION_CENTRAL_DOMAINS=localhost,127.0.0.1,erp.test
    |   APP_URL=http://erp.test
    |   SESSION_DOMAIN=.erp.test
    |
    | Then map hosts (e.g. /etc/hosts):
    |   127.0.0.1 erp.test tekrem.erp.test wise-and-hebert-co.erp.test
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Default organization
    |--------------------------------------------------------------------------
    |
    | Used when no subdomain match and no session org is set (local dev, legacy).
    |
    */
    'default_organization_slug' => env('DEFAULT_ORGANIZATION_SLUG', 'tekrem'),

    /*
    |--------------------------------------------------------------------------
    | Available ERP modules for plan packaging
    |--------------------------------------------------------------------------
    */
    'modules' => [
        'commerce' => 'Ecommerce & shop',
        'inventory' => 'Inventory',
        'sales' => 'Sales orders',
        'pos' => 'Point of sale',
        'crm' => 'CRM',
        'finance' => 'Finance',
        'projects' => 'Projects',
        'hr' => 'Human resources',
        'support' => 'Support',
        'ai' => 'AI assistant',
    ],

    /*
    |--------------------------------------------------------------------------
    | Organization member roles (within a tenant)
    |--------------------------------------------------------------------------
    */
    'roles' => [
        'owner' => 'Owner',
        'admin' => 'Administrator',
        'member' => 'Member',
    ],

    /*
    |--------------------------------------------------------------------------
    | Self-serve organization signup
    |--------------------------------------------------------------------------
    */
    'self_serve_signup' => env('ORGANIZATION_SELF_SERVE_SIGNUP', true),

    /*
    |--------------------------------------------------------------------------
    | Organization onboarding checklist
    |--------------------------------------------------------------------------
    */
    'onboarding' => [
        'industries' => [
            'retail' => 'Retail & ecommerce',
            'wholesale' => 'Wholesale & distribution',
            'manufacturing' => 'Manufacturing',
            'services' => 'Professional services',
            'hospitality' => 'Hospitality & food',
            'healthcare' => 'Healthcare',
            'education' => 'Education',
            'technology' => 'Technology',
            'agriculture' => 'Agriculture',
            'construction' => 'Construction',
            'other' => 'Other',
        ],
        'countries' => [
            'ZM' => 'Zambia',
        ],
    ],

];
