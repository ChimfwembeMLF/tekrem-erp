<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

class AdvancedSettingsController extends Controller
{
    public function updateSecurity(Request $request)
    {
        $data = $request->validate([
            'enable_2fa' => 'boolean',
            'password_min_length' => 'integer|min:6|max:128',
            'session_timeout' => 'integer|min:5|max:1440',
            'max_login_attempts' => 'integer|min:3|max:20',
            'lockout_duration' => 'integer|min:1|max:120',
        ]);
        // Save to config, .env, or database as needed
        // Example: Config::set('security.enable_2fa', $data['enable_2fa']);
        // ...
        return back()->with('success', 'Security settings updated!');
    }

    public function updatePerformance(Request $request)
    {
        $data = $request->validate([
            'cache_driver' => 'string|in:file,redis,memcached,database',
            'cache_expiration' => 'integer|min:60|max:86400',
            'enable_query_logging' => 'boolean',
            'max_workers' => 'integer|min:1|max:32',
        ]);
        // Save to config, .env, or database as needed
        // Example: Config::set('cache.default', $data['cache_driver']);
        // ...
        return back()->with('success', 'Performance settings updated!');
    }
}
