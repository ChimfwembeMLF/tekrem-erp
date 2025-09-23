<?php

namespace Database\Factories;

use App\Models\Label;
use Illuminate\Database\Eloquent\Factories\Factory;

class LabelFactory extends Factory
{
    protected $model = Label::class;

    public function definition()
    {
        return [
            'board_id' => null, // Set in seeder
            'name' => $this->faker->unique()->word(),
            'color' => $this->faker->safeColorName(),
        ];
    }
}
