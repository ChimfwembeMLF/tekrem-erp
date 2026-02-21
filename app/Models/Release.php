<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Release extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'project_id',
        'name',
        'version_number',
        'description',
        'release_notes',
        'planned_date',
        'released_date',
        'status',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'planned_date' => 'date',
        'released_date' => 'date',
    ];

    /**
     * Get the project that owns the release.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the sprints associated with this release.
     */
    public function sprints(): BelongsToMany
    {
        return $this->belongsToMany(Sprint::class, 'release_sprint')
            ->withTimestamps();
    }

    /**
     * Get the epics associated with this release.
     */
    public function epics(): BelongsToMany
    {
        return $this->belongsToMany(Epic::class, 'epic_release')
            ->withTimestamps();
    }

    /**
     * Scope to get released versions.
     */
    public function scopeReleased($query)
    {
        return $query->where('status', 'released')->whereNotNull('released_date');
    }

    /**
     * Scope to get upcoming releases.
     */
    public function scopeUpcoming($query)
    {
        return $query->whereIn('status', ['planned', 'in_progress'])
            ->orderBy('planned_date');
    }

    /**
     * Check if release is overdue.
     */
    public function isOverdue(): bool
    {
        return $this->status !== 'released' 
            && $this->planned_date 
            && $this->planned_date->isPast();
    }

    /**
     * Mark release as released.
     */
    public function markAsReleased(): void
    {
        $this->update([
            'status' => 'released',
            'released_date' => now(),
        ]);
    }


    /**
     * Get all cards associated with this release (via sprints and epics).
     */
    public function allCards()
    {
        // Cards from sprints
        $sprintCards = $this->sprints->flatMap(function ($sprint) {
            return $sprint->cards;
        });
        // Cards from epics (not already in sprints)
        $epicCards = $this->epics->flatMap(function ($epic) {
            return $epic->cards;
        });
        // Merge and unique by card id
        $all = $sprintCards->merge($epicCards)->unique('id');
        return $all;
    }

    /**
     * Get the total story points for this release.
     */
    public function getTotalStoryPointsAttribute()
    {
        return $this->allCards()->sum('story_points');
    }

    /**
     * Get the completed story points for this release.
     */
    public function getCompletedStoryPointsAttribute()
    {
        return $this->allCards()->where('status', 'done')->sum('story_points');
    }

    /**
     * Get the percent complete for this release (0-100).
     */
    public function getPercentCompleteAttribute()
    {
        $total = $this->total_story_points;
        if ($total == 0) return 0;
        return round(($this->completed_story_points / $total) * 100);
    }

    /**
     * Get card counts by status for this release.
     */
    public function getCardStatusCountsAttribute()
    {
        return $this->allCards()
            ->groupBy('status')
            ->map->count();
    }
}
