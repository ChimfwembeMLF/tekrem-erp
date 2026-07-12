<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Concerns\BelongsToOrganization;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MessageComment extends Model
{
    use BelongsToOrganization, HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'organization_id',

        'message_id',
        'user_id',
        'comment',
    ];

    /**
     * Get the message that this comment belongs to.
     */
    public function message(): BelongsTo
    {
        return $this->belongsTo(Chat::class, 'message_id');
    }

    /**
     * Get the user who made this comment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
