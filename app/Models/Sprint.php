<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sprint extends Model
{
    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'goal',
        'project_id',
    ];

    public function userStories()
    {
        return $this->hasMany(UserStory::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
