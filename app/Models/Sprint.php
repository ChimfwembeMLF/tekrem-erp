<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sprint extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'board_id',
        'name',
        'goal',
        'planned_story_points',
        'completed_story_points',
        'velocity',
        'team_capacity',
        'daily_progress',
        'start_date',
        'end_date',
        'status',
    ];

    /**
     * Get the company that owns the sprint.
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'planned_story_points' => 'integer',
        'completed_story_points' => 'integer',
        'velocity' => 'decimal:2',
        'team_capacity' => 'integer',
        'daily_progress' => 'array',
    ];

    public function board()
    {
        return $this->belongsTo(Board::class);
    }

    public function cards()
    {
        return $this->hasMany(BoardCard::class, 'sprint_id');
    }

    public function reports()
    {
        return $this->hasMany(SprintReport::class);
    }

    /**
     * Calculate and update sprint velocity.
     */
    public function calculateVelocity(): float
    {
        $sprintDays = $this->start_date->diffInDays($this->end_date);
        $daysElapsed = now()->diffInDays($this->start_date);
        
        if ($sprintDays <= 0) {
            return 0;
        }

        // Velocity = completed story points / days elapsed (capped at sprint duration)
        $effectiveDays = min($daysElapsed, $sprintDays);
        $velocity = $effectiveDays > 0 ? $this->completed_story_points / $effectiveDays : 0;
        
        $this->velocity = round($velocity, 2);
        $this->save();
        
        return $this->velocity;
    }

    /**
     * Get completion percentage.
     */
    public function getCompletionPercentageAttribute(): int
    {
        if ($this->planned_story_points <= 0) {
            return 0;
        }
        
        return (int) min(100, ($this->completed_story_points / $this->planned_story_points) * 100);
    }

    /**
     * Check if sprint is on track.
     */
    public function isOnTrack(): bool
    {
        $totalDays = $this->start_date->diffInDays($this->end_date);
        $daysElapsed = $this->start_date->diffInDays(now(), false);
        $daysElapsed = max(0, $daysElapsed);
        
        if ($totalDays <= 0 || $daysElapsed <= 0) {
            return true;
        }

        $expectedProgress = ($daysElapsed / $totalDays) * 100;
        $actualProgress = $this->completion_percentage;
        
        // On track if within 10% of expected progress
        return abs($actualProgress - $expectedProgress) <= 10;
    }

    /**
     * Get backlog items for this sprint.
     */
    public function backlogItems()
    {
        return $this->hasMany(Backlog::class);
    }

    /**
     * Get releases this sprint belongs to.
     */
    public function releases()
    {
        return $this->belongsToMany(Release::class, 'release_sprint')
            ->withTimestamps();
    }
}
