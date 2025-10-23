<?php

namespace Database\Factories;

use App\Models\BoardInvitation;
use Illuminate\Database\Eloquent\Factories\Factory;

class BoardInvitationFactory extends Factory
{
    protected $model = BoardInvitation::class;

    public function definition()
    {
        return [
            'board_id' => null, // Set in seeder
            'email' => $this->faker->unique()->safeEmail(),
            'token' => $this->faker->unique()->sha256,
            'status' => $this->faker->randomElement(['pending', 'accepted', 'declined']),
            'invited_by' => null, // Set in seeder
        ];
    }
}
