<?php

namespace Database\Factories;

use App\Models\CardVote;
use Illuminate\Database\Eloquent\Factories\Factory;

class CardVoteFactory extends Factory
{
    protected $model = CardVote::class;

    public function definition()
    {
        return [
            'card_id' => null, // Set in seeder
            'user_id' => null, // Set in seeder
            'vote' => $this->faker->randomElement([1, -1]),
        ];
    }
}
