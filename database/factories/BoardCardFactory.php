<?php

namespace Database\Factories;

use App\Models\BoardCard;
use Illuminate\Database\Eloquent\Factories\Factory;

class BoardCardFactory extends Factory
{
    protected $model = BoardCard::class;

    public function definition()
    {
        return [
            'board_id' => null, // Set in seeder
            'column_id' => null, // Set in seeder
            'sprint_id' => null,
            'epic_id' => null,
            'type' => $this->faker->randomElement(['task', 'bug', 'story']),
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'assignee_id' => null,
            'reporter_id' => null,
            'priority' => $this->faker->randomElement(['low', 'medium', 'high', 'critical']),
            'story_points' => $this->faker->randomElement([null, 1, 2, 3, 5, 8, 13]),
            'due_date' => $this->faker->optional()->date(),
            'status' => $this->faker->randomElement(['todo', 'in progress', 'done']),
            'labels' => [],
            'dependencies' => [],
            'order' => $this->faker->numberBetween(0, 20),
        ];
    }
}
