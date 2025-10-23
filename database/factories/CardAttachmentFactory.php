<?php

namespace Database\Factories;

use App\Models\CardAttachment;
use Illuminate\Database\Eloquent\Factories\Factory;

class CardAttachmentFactory extends Factory
{
    protected $model = CardAttachment::class;

    public function definition()
    {
        return [
            'card_id' => null, // Set in seeder
            'user_id' => null, // Set in seeder
            'filename' => $this->faker->word() . '.jpg',
            'path' => $this->faker->filePath(),
            'mime_type' => 'image/jpeg',
            'size' => $this->faker->numberBetween(10000, 5000000),
        ];
    }
}
