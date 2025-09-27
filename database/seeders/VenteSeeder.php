<?php

namespace Database\Seeders;

use App\Models\Vente;
use App\Models\VenteProduit;
use Illuminate\Database\Seeder;

class VenteSeeder extends Seeder
{
    public function run(): void
    {
        Vente::factory()
            ->count(120)
            ->create()
            ->each(function ($vente) {
                $total = 0;

                $items = VenteProduit::factory()
                    ->count(rand(3, 10))
                    ->make(); // make = ne pas encore insérer

                foreach ($items as $item) {
                    $item->vente_id = $vente->id;
                    $item->save();
                    $total += $item->montant_total;
                }

                $vente->update(['montant_total' => $total]);
            });
    }
}
