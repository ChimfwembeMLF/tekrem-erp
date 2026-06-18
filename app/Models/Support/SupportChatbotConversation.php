<?php

namespace App\Models\Support;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SupportChatbotConversation extends Model
{
    use HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'ticket_id',
        'status',
        'metadata',
        'escalated_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'escalated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(SupportChatbotMessage::class, 'conversation_id')->orderBy('created_at');
    }
}
