<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ServiceFactory extends Factory
{
    public function definition()
    {
        return [
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->paragraph(),
            'duree_minutes' => $this->faker->numberBetween(15, 120),
            'prix' => $this->faker->randomFloat(2, 5, 200),
            'actif' => $this->faker->boolean(90),
            'ref' => Str::uuid(),
            'user_id' => null,
        ];
    }
}