<?php

namespace Database\Factories;

use App\Models\CardChecklist;
use Illuminate\Database\Eloquent\Factories\Factory;

class CardChecklistFactory extends Factory
{
    protected $model = CardChecklist::class;

    public function definition()
    {
        return [
            'card_id' => null, // Set in seeder
            'title' => $this->faker->sentence(3),
        ];
    }
}
