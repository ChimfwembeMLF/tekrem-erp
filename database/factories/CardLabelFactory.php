<?php

namespace Database\Factories;

use App\Models\CardLabel;
use Illuminate\Database\Eloquent\Factories\Factory;

class CardLabelFactory extends Factory
{
    protected $model = CardLabel::class;

    public function definition()
    {
        return [
            'card_id' => null, // Set in seeder
            'label_id' => null, // Set in seeder
        ];
    }
}
