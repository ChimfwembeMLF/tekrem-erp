<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Backlog extends Model
{
    use SoftDeletes;

    protected $table = 'backlogs';

    protected $fillable = [
        'project_id',
        'card_id',
        'epic_id',
        'type',
        'sprint_id',
        'title',
        'description',
        'priority',
        'story_points',
        'status',
        'assigned_to',
        'order',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'priority' => 'integer',
        'story_points' => 'integer',
        'order' => 'integer',
    ];

    /**
     * Get the project that owns the backlog item.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the card associated with this backlog item.
     */
    public function card(): BelongsTo
    {
        return $this->belongsTo(BoardCard::class, 'card_id');
    }

    /**
     * Get the epic this backlog item belongs to.
     */
    public function epic(): BelongsTo
    {
        return $this->belongsTo(Epic::class);
    }

    /**
     * Get the sprint this backlog item is assigned to.
     */
    public function sprint(): BelongsTo
    {
        return $this->belongsTo(Sprint::class);
    }

    /**
     * Get the user assigned to this backlog item.
     */
    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Scope to get product backlog items.
     */
    public function scopeProductBacklog($query)
    {
        return $query->where('type', 'product')->where('status', '!=', 'removed');
    }

    /**
     * Scope to get sprint backlog items.
     */
    public function scopeSprintBacklog($query, $sprintId = null)
    {
        $query = $query->where('type', 'sprint')->where('status', '!=', 'removed');
        
        if ($sprintId) {
            $query->where('sprint_id', $sprintId);
        }
        
        return $query;
    }

    /**
     * Scope to get ready items.
     */
    public function scopeReady($query)
    {
        return $query->where('status', 'ready');
    }

    /**
     * Scope ordered by priority (highest first).
     */
    public function scopeByPriority($query)
    {
        return $query->orderBy('priority', 'desc')->orderBy('order');
    }
}
