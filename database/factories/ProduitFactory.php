<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProduitFactory extends Factory
{
    public function definition()
    {
        return [
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->paragraph(),
            'prix_achat' => $this->faker->randomFloat(2, 2, 1250),
            'prix_vente' => $this->faker->randomFloat(2, 5, 2300),
            'actif' => $this->faker->boolean(90),
            'ref' => Str::uuid(),
            'user_id' => null,
        ];
    }
}