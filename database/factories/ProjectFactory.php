<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectFactory extends Factory
{
    protected $model = Project::class;

    public function definition()
    {
        $name = $this->faker->unique()->words(3, true);
        // Get a random user id if available, else null
        $userClass = \App\Models\User::class;
        $ownerId = $userClass::inRandomOrder()->value('id');
        return [
            'name' => $name,
            'slug' => \Str::slug($name . '-' . $this->faker->unique()->uuid),
            'description' => $this->faker->paragraph(),
            'owner_id' => $ownerId,
            'start_date' => $this->faker->date(),
            'end_date' => $this->faker->dateTimeBetween('+1 week', '+1 year'),
            'status' => $this->faker->randomElement(['active', 'completed', 'on hold', 'cancelled']),
            // Add other fields as needed
        ];
    }
}
