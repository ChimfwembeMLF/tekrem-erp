<?php

namespace Database\Factories;

use App\Models\CardComment;
use Illuminate\Database\Eloquent\Factories\Factory;

class CardCommentFactory extends Factory
{
    protected $model = CardComment::class;

    public function definition()
    {
        return [
            'card_id' => null, // Set in seeder
            'user_id' => null, // Set in seeder
            'comment' => $this->faker->sentence(10),
        ];
    }
}
