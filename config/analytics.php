<?php

return [
    'enabled' => env('SITE_ANALYTICS_ENABLED', true),

    'cookie_name' => 'erp_vid',

    'cookie_lifetime_days' => 365,

    'geo_cache_ttl' => 60 * 60 * 24,

    'exclude_paths' => [
        'up',
        'session/ping',
        'broadcasting/auth',
        'sanctum/csrf-cookie',
        'livewire/*',
        '_debugbar/*',
        'telescope/*',
        'horizon/*',
        'guest-chat/*',
        'api/*',
        '*/messages',
        '*/typing',
        'notifications*',
        '*/receipt-data',
        '*/cart',
        'test-ai-service',
    ],

    'exclude_extensions' => [
        'js', 'css', 'map', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico',
        'woff', 'woff2', 'ttf', 'eot', 'json', 'xml', 'txt',
    ],

    'bot_patterns' => [
        'bot', 'crawl', 'spider', 'slurp', 'mediapartners', 'facebookexternalhit',
        'bingpreview', 'pingdom', 'monitor', 'headless', 'lighthouse',
    ],
];
