<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Epic extends Model
{
    protected $fillable = [
        'title',
        'description',
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
