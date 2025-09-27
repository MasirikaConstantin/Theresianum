<?php

namespace Database\Factories;

use App\Models\VenteProduit;
use App\Models\Produit;
use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class VenteProduitFactory extends Factory
{
    protected $model = VenteProduit::class;

    public function definition(): array
    {
        $quantite = $this->faker->numberBetween(1, 5);
        $isProduit = $this->faker->boolean;

        if ($isProduit) {
            $item = Produit::inRandomOrder()->first();
        } else {
            $item = Service::inRandomOrder()->first();
        }

        $prix = $item?->prix ?? 100;
        $remise = $this->faker->randomFloat(2, 0, 10);

        return [
            'produit_id' => $isProduit ? $item->id : null,
            'service_id' => !$isProduit ? $item->id : null,
            'quantite' => $quantite,
            'prix_unitaire' => $prix,
            'remise' => $remise,
            'montant_total' => ($prix * $quantite) - $remise,
            'ref' => Str::uuid(),
            'created_at' => $this->faker->dateTimeBetween('2025-06-01', '2025-07-31'),
            'updated_at' => now(),
        ];
    }
}
