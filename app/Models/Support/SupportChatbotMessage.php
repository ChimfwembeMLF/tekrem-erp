<?php

namespace App\Models\Support;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupportChatbotMessage extends Model
{
    use HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'conversation_id',
        'role',
        'message',
        'attachments',
        'intent',
        'suggestions',
        'actions',
        'confidence',
        'requires_human',
        'rating',
        'feedback',
    ];

    protected $casts = [
        'attachments' => 'array',
        'suggestions' => 'array',
        'actions' => 'array',
        'confidence' => 'float',
        'requires_human' => 'boolean',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(SupportChatbotConversation::class, 'conversation_id');
    }

    public function toChatArray(): array
    {
        return [
            'id' => $this->id,
            'role' => $this->role,
            'message' => $this->message,
            'attachments' => $this->attachments ?? [],
            'intent' => $this->intent,
            'suggestions' => $this->suggestions ?? [],
            'actions' => $this->actions ?? [],
            'confidence' => $this->confidence,
            'requires_human' => $this->requires_human,
            'rating' => $this->rating,
            'feedback' => $this->feedback,
            'timestamp' => $this->created_at?->toISOString(),
        ];
    }
}
