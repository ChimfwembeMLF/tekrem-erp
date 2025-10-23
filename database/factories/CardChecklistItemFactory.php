<?php

namespace Database\Factories;

use App\Models\CardChecklistItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class CardChecklistItemFactory extends Factory
{
    protected $model = CardChecklistItem::class;

    public function definition()
    {
        return [
            'card_checklist_id' => null, // Set in seeder
            'title' => $this->faker->sentence(3),
            'is_completed' => $this->faker->boolean(20),
        ];
    }
}
