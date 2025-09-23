<?php

namespace Database\Factories;

use App\Models\BoardColumn;
use Illuminate\Database\Eloquent\Factories\Factory;

class BoardColumnFactory extends Factory
{
    protected $model = BoardColumn::class;

    public function definition()
    {
        return [
            'board_id' => null, // Set in seeder
            'name' => $this->faker->unique()->word(),
            'order' => $this->faker->numberBetween(0, 10),
            'color' => $this->faker->safeColorName(),
            'is_done_column' => $this->faker->boolean(20),
        ];
    }
}
