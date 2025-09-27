<?php

namespace Database\Factories;

use App\Models\Produit;
use App\Models\Succursale;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class StockSuccursaleFactory extends Factory
{
    public function definition()
    {
        return [
            'quantite' => $this->faker->numberBetween(0, 50),
            'seuil_alerte' => $this->faker->numberBetween(2, 10),
            'ref' => Str::uuid(),
            'produit_id' => Produit::inRandomOrder()->id,
            'succursale_id' => Succursale::inRandomOrder()->first()->id,
            'user_id' => User::inRandomOrder()->first()->id,
        ];
    }
}