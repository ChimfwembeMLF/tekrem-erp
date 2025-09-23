<?php

namespace Database\Factories;

use App\Models\CardActivityLog;
use Illuminate\Database\Eloquent\Factories\Factory;

class CardActivityLogFactory extends Factory
{
    protected $model = CardActivityLog::class;

    public function definition()
    {
        return [
            'card_id' => null, // Set in seeder
            'user_id' => null, // Set in seeder
            'action' => $this->faker->randomElement([
                'created', 'updated', 'moved', 'commented', 'assigned', 'completed', 'archived', 'restored', 'deleted', 'labelled', 'unlabelled', 'voted', 'subscribed', 'unsubscribed', 'reminded', 'attached', 'detached', 'checked', 'unchecked', 'mentioned', 'watched', 'unwatched', 'invited', 'joined', 'left', 'renamed', 'reordered', 'due_date_changed', 'priority_changed', 'status_changed', 'story_points_changed', 'epic_changed', 'sprint_changed', 'column_changed', 'board_changed', 'project_changed', 'visibility_changed', 'color_changed', 'settings_changed', 'custom_action'
            ]),
            'meta' => [],
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
