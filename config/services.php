<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_CALLBACK_URL'),
    ],

    'fcm' => [
        'server_key' => ''
    ],
    
    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'recaptcha' => [
    'site' => env('RECAPTCHA_SITE_KEY'),
    'secret' => env('RECAPTCHA_SECRET_KEY'),
    ],

    'openai' => [
        'api_key' => env('OPENAI_API_KEY'),
        'api_url' => env('OPENAI_API_URL', 'https://api.openai.com/v1/chat/completions'),
        'model' => env('OPENAI_MODEL', 'gpt-4o-mini'),
    ],

    'anthropic' => [
        'api_key' => env('ANTHROPIC_API_KEY'),
        'api_url' => env('ANTHROPIC_API_URL', 'https://api.anthropic.com/v1/messages'),
        'model' => env('ANTHROPIC_MODEL', 'claude-3-5-sonnet-20241022'),
    ],

    'mistral' => [
        'api_key' => env('MISTRAL_API_KEY'),
        'api_url' => env('MISTRAL_API_URL', 'https://api.mistral.ai/v1/chat/completions'),
        'model' => env('MISTRAL_MODEL', 'mistral-small'),
    ],

    'pawapay' => [
        // Runtime config is loaded from the `settings` table via PawaPayService.
        // These env values are only used until credentials are saved in Finance Settings.
        'env' => env('PAWAPAY_ENV', 'sandbox'),
        'api_token' => env('PAWAPAY_API_TOKEN', env('PAWAPAY_API_KEY')),
        'base_url' => env('PAWAPAY_ENV', 'sandbox') === 'production'
            ? env('PAWAPAY_BASE_URL_PROD', 'https://api.pawapay.io/v2')
            : env('PAWAPAY_BASE_URL_SANDBOX', env('PAWAPAY_BASE_URL', 'https://api.sandbox.pawapay.io/v2')),
        'private_key' => env('PAWAPAY_PRIVATE_KEY'),
        'public_key_id' => env('PAWAPAY_PUBLIC_KEY_ID'),
        'callback_url' => env('PAWAPAY_CALLBACK_URL', env('APP_URL')),
        'timeout' => (int) env('PAWAPAY_TIMEOUT', 30),
        'enable_logging' => env('PAWAPAY_ENABLE_LOGGING', true),
    ],

    'mako' => [
        'api_url' => env('MAKO_API_URL', 'https://mako.tekreminnovations.com/'),
        'campaign_id' => env('MAKO_CAMPAIGN_ID', 'widget_qpzp8iu5mr83h8cp'),
    ],

];

