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
        'notify_on_checkpoint' => true,
    ],

    /*
    | Shipment checkpoint statuses (in journey order).
    | Keys are stored on shop_shipments.status and shop_shipment_events.status.
    */
    'shipment_statuses' => [
        'pending' => 'Order received',
        'processing' => 'Processing at warehouse',
        'picked_up' => 'Picked up by carrier',
        'in_transit' => 'In transit',
        'at_hub' => 'Arrived at regional hub',
        'out_for_delivery' => 'Out for delivery',
        'delivered' => 'Delivered',
        'cancelled' => 'Shipment cancelled',
    ],

    'shipment_default_descriptions' => [
        'pending' => 'Order received and awaiting dispatch',
        'processing' => 'Items are being picked and packed',
        'picked_up' => 'Package collected by carrier',
        'in_transit' => 'Package is on the way',
        'at_hub' => 'Package arrived at sorting hub',
        'out_for_delivery' => 'Courier is delivering today',
        'delivered' => 'Package delivered successfully',
        'cancelled' => 'Shipment was cancelled',
    ],
];
