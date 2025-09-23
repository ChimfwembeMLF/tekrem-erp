<?php

namespace Database\Factories;

use App\Models\CardRelation;
use Illuminate\Database\Eloquent\Factories\Factory;

class CardRelationFactory extends Factory
{
    protected $model = CardRelation::class;

    public function definition()
    {
        return [
            'card_id' => null, // Set in seeder
            'related_card_id' => null, // Set in seeder
            'type' => $this->faker->randomElement(['blocks', 'relates', 'duplicates', 'depends']),
        ];
    }
}
