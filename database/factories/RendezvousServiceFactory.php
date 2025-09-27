<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class RendezvousServiceFactory extends Factory
{
    public function definition()
    {
        return [
            'prix_effectif' => $this->faker->randomFloat(2, 10, 100),
            'notes' => $this->faker->paragraph(),
            'ref' => Str::uuid(),
            'rendezvou_id' => null,
            'service_id' => null,
            'user_id' => null,
        ];
    }
}