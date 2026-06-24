<?php

namespace App\Support;

use App\Models\Project;

class ProjectNav
{
    public static function boardId(Project $project): ?int
    {
        if ($project->relationLoaded('boards') && $project->boards->isNotEmpty()) {
            return $project->boards->first()->id;
        }

        return $project->boards()->value('id');
    }
}
