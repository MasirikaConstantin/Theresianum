<?php

namespace Database\Factories;

use App\Models\Vente;
use App\Models\Client;
use App\Models\Succursale;
use App\Models\User;
use App\Models\Caisse;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class VenteFactory extends Factory
{
    protected $model = Vente::class;

    public function definition(): array
    {
        return [
            'client_id' => Client::inRandomOrder()->value('id'),
            'succursale_id' => Succursale::inRandomOrder()->value('id'),
            'vendeur_id' => User::inRandomOrder()->value('id'),
            'caisse_id' => Caisse::inRandomOrder()->value('id'),
            'remise' => $this->faker->randomFloat(2, 0, 50),
            'montant_total' => 0, // à calculer après via vente_produits
            'mode_paiement' => $this->faker->randomElement(['espèces', 'carte', 'chèque', 'autre']),
            'ref' => Str::uuid(),
            'code' => strtoupper(Str::random(10)),
            'created_at' => $this->faker->dateTimeBetween('2025-06-01', '2025-07-31'),
//            'created_at' => $this->faker->dateTimeBetween('2025-07-22 19:59:36', '2025-07-22 23:59:36'),
            'updated_at' => now(),
        ];
    }
}
