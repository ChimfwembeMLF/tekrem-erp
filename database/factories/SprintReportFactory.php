<?php

namespace Database\Factories;

use App\Models\SprintReport;
use Illuminate\Database\Eloquent\Factories\Factory;

class SprintReportFactory extends Factory
{
    protected $model = SprintReport::class;

    public function definition()
    {
        return [
            'sprint_id' => null, // Set in seeder
            'summary' => $this->faker->paragraph(),
            'completed_points' => $this->faker->numberBetween(0, 100),
            'incomplete_points' => $this->faker->numberBetween(0, 100),
            'velocity' => $this->faker->randomFloat(2, 0, 10),
        ];
    }
}
