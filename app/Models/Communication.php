<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Communication extends Model
{
    use BelongsToOrganization, HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'organization_id',
        'type',
        'content',
        'subject',
        'communication_date',
        'direction',
        'status',
        'communicable_id',
        'communicable_type',
        'user_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'communication_date' => 'datetime',
        'attachments' => 'array',
    ];

    /**
     * Get the parent communicable model (client or lead).
     */
    public function communicable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the user that created the communication.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
