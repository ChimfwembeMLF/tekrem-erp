<?php

namespace Database\Factories;

use App\Models\Board;
use Illuminate\Database\Eloquent\Factories\Factory;

class BoardFactory extends Factory
{
    protected $model = Board::class;

    public function definition()
    {
        return [
            'project_id' => null, // Set in seeder
            'name' => $this->faker->unique()->words(2, true),
            'description' => $this->faker->sentence(),
            'type' => $this->faker->randomElement(['kanban', 'scrum']),
            'owner_id' => null, // Set in seeder
            'visibility' => $this->faker->randomElement(['public', 'private']),
            'settings' => [],
        ];
    }
}
