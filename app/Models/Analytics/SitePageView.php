<?php

namespace App\Models\Analytics;

use App\Models\Concerns\BelongsToOrganization;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SitePageView extends Model
{
    use BelongsToOrganization;
    public $timestamps = false;

    protected $fillable = [
        'organization_id',
        'site_visitor_id',
        'user_id',
        'path',
        'route_name',
        'referrer_host',
        'method',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function visitor(): BelongsTo
    {
        return $this->belongsTo(SiteVisitor::class, 'site_visitor_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
