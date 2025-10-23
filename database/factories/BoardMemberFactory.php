<?php

namespace Database\Factories;

use App\Models\BoardMember;
use Illuminate\Database\Eloquent\Factories\Factory;

class BoardMemberFactory extends Factory
{
    protected $model = BoardMember::class;

    public function definition()
    {
        return [
            'board_id' => null, // Set in seeder
            'user_id' => null, // Set in seeder
            'role' => $this->faker->randomElement(['member', 'admin', 'viewer']),
        ];
    }
}
