<?php

namespace Database\Factories;

use App\Models\CardReminder;
use Illuminate\Database\Eloquent\Factories\Factory;

class CardReminderFactory extends Factory
{
    protected $model = CardReminder::class;

    public function definition()
    {
        return [
            'card_id' => null, // Set in seeder
            'user_id' => null, // Set in seeder
            'remind_at' => $this->faker->dateTimeBetween('+1 day', '+1 month'),
        ];
    }
}
