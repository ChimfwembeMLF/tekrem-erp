<?php

return [
    'currency' => 'ZMW',
    'currency_symbol' => 'K',

    'hero' => [
        'min_width' => 1280,
        'min_height' => 360,
        'max_width' => 4096,
        'max_height' => 1600,
        'recommended_width' => 2560,
        'recommended_height' => 840,
        'recommended_aspect_ratio' => '3:1',
        'aspect_ratio_min' => 2.4,
        'aspect_ratio_max' => 3.6,
        'max_file_size_kb' => 5120,
        'allowed_mimes' => ['jpg', 'jpeg', 'png', 'webp'],
    ],

    'order' => [
        'auto_approve_reviews_for_auth_users' => true,
        'guest_tracking_enabled' => true,
    ],
];
