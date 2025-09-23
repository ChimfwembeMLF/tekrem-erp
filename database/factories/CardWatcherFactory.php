<?php

namespace Database\Factories;

use App\Models\CardWatcher;
use Illuminate\Database\Eloquent\Factories\Factory;

class CardWatcherFactory extends Factory
{
    protected $model = CardWatcher::class;

    public function definition()
    {
        return [
            'card_id' => null, // Set in seeder
            'user_id' => null, // Set in seeder
        ];
    }
}
