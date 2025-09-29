<?php

namespace Database\Factories;

use App\Models\Stock;
use App\Models\Produit;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class StockFactory extends Factory
{
    protected $model = Stock::class;

    public function definition(): array
    {
        return [
            'produit_id' => Produit::inRandomOrder()->value('id'), // produit existant aléatoire
            'quantite' => $this->faker->numberBetween(1, 200),
            'quantite_alerte' => $this->faker->numberBetween(1, 50),
            'actif' => $this->faker->boolean(90), // 90% chance d’être actif
            'ref' => (string) Str::uuid(),
            'user_id' => User::inRandomOrder()->value('id'), // utilisateur existant aléatoire
        ];
    }
}
