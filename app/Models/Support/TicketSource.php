<?php

namespace App\Models\Support;

use App\Models\Concerns\BelongsToOrganization;

use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class TicketSource extends Model
{
    use BelongsToOrganization, HasApiTokens;

    protected $fillable = [
        'organization_id',
        'name',
        'slug',
        'description',
        'is_active',
    ];

    /**
     * Scope a query to only include active sources.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
