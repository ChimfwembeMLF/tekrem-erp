<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserStory extends Model
{
    protected $fillable = [
        'title',
        'description',
        'story_points',
        'status',
        'sprint_id',
        'project_id',
    ];

    public function sprint()
    {
        return $this->belongsTo(Sprint::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
