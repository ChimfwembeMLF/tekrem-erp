<?php

namespace Database\Factories;

use App\Models\CardSubscriber;
use Illuminate\Database\Eloquent\Factories\Factory;

class CardSubscriberFactory extends Factory
{
    protected $model = CardSubscriber::class;

    public function definition()
    {
        return [
            'card_id' => null, // Set in seeder
            'user_id' => null, // Set in seeder
        ];
    }
}
