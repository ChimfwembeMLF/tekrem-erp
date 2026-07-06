<?php

namespace App\Models\Analytics;

use App\Models\Concerns\BelongsToOrganization;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SiteVisitor extends Model
{
    use BelongsToOrganization;
    protected $fillable = [
        'organization_id',
        'visitor_key',
        'user_id',
        'ip_address',
        'user_agent',
        'device_type',
        'browser',
        'os',
        'country_code',
        'country_name',
        'region',
        'city',
        'latitude',
        'longitude',
        'age',
        'referrer_host',
        'landing_path',
        'page_views_count',
        'is_bot',
        'first_seen_at',
        'last_seen_at',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'age' => 'integer',
        'page_views_count' => 'integer',
        'is_bot' => 'boolean',
        'first_seen_at' => 'datetime',
        'last_seen_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function pageViews(): HasMany
    {
        return $this->hasMany(SitePageView::class);
    }

    public function locationLabel(): string
    {
        $parts = array_filter([$this->city, $this->region, $this->country_name]);

        return $parts ? implode(', ', $parts) : 'Unknown';
    }
}
