<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Epic extends Model
{
    use HasFactory;

    protected $fillable = [
        'board_id',
        'project_id',
        'name',
        'description',
        'color',
    ];

    public function board()
    {
        return $this->belongsTo(Board::class);
    }

    public function cards()
    {
        return $this->hasMany(BoardCard::class, 'epic_id');
    }

    /**
     * Get the releases associated with this epic.
     */
    public function releases()
    {
        return $this->belongsToMany(Release::class, 'epic_release')
            ->withTimestamps();
    }

    public function project()
    {
        return $this->board ? $this->board->project() : null;
    }

    /**
     * Get the total story points for this epic.
     */
    public function getTotalStoryPointsAttribute()
    {
        return $this->cards()->sum('story_points');
    }

    /**
     * Get the completed story points for this epic.
     */
    public function getCompletedStoryPointsAttribute()
    {
        return $this->cards()->where('status', 'done')->sum('story_points');
    }

    /**
     * Get the percent complete for this epic (0-100).
     */
    public function getPercentCompleteAttribute()
    {
        $total = $this->total_story_points;
        if ($total == 0) return 0;
        return round(($this->completed_story_points / $total) * 100);
    }

    /**
     * Get card counts by status for this epic.
     */
    public function getCardStatusCountsAttribute()
    {
        return $this->cards()
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');
    }
}
