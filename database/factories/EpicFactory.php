<?php

namespace Database\Factories;

use App\Models\Epic;
use Illuminate\Database\Eloquent\Factories\Factory;

class EpicFactory extends Factory
{
    protected $model = Epic::class;

    public function definition()
    {
        return [
            'board_id' => null, // Set in seeder
            'name' => $this->faker->unique()->words(2, true),
            'description' => $this->faker->optional()->sentence(),
            'color' => $this->faker->safeColorName(),
        ];
    }
}
