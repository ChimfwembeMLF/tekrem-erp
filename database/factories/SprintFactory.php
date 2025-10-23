<?php

namespace Database\Factories;

use App\Models\Sprint;
use Illuminate\Database\Eloquent\Factories\Factory;

class SprintFactory extends Factory
{
    protected $model = Sprint::class;

    public function definition()
    {
        return [
            'board_id' => null, // Set in seeder
            'name' => $this->faker->unique()->words(2, true),
            'goal' => $this->faker->optional()->sentence(),
            'start_date' => $this->faker->optional()->date(),
            'end_date' => $this->faker->optional()->date(),
            'status' => $this->faker->randomElement(['planned', 'active', 'completed', 'archived']),
        ];
    }
}
