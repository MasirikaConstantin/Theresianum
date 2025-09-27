<?php

namespace Database\Seeders;

use App\Models\Produit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProduitSeeder extends Seeder
{
    public function run(): void
    {
        $produits = [
            ['name' => 'Shampoing hydratant', 'achat' => 300, 'vente' => 500],
            ['name' => 'Huile de ricin', 'achat' => 250, 'vente' => 400],
            ['name' => 'Beurre de karité pur', 'achat' => 350, 'vente' => 550],
            ['name' => 'Crème coiffante', 'achat' => 280, 'vente' => 450],
            ['name' => 'Gel coiffant', 'achat' => 200, 'vente' => 350],
            ['name' => 'Sérum anti-chute', 'achat' => 600, 'vente' => 900],
            ['name' => 'Tissage naturel 12"', 'achat' => 150, 'vente' => 250],
            ['name' => 'Lace wig 18" lisse', 'achat' => 300, 'vente' => 500],
            ['name' => 'Peigne démêlant', 'achat' => 80, 'vente' => 150],
            ['name' => 'Brosse ronde', 'achat' => 120, 'vente' => 200],
        ];

        foreach ($produits as $data) {
            Produit::create([
                'name' => $data['name'],
                'avatar' => null,
                'description' => null,
                'prix_achat' => $data['achat'],
                'prix_vente' => $data['vente'],
                'ref' => Str::uuid(),
                'user_id' => null,
            ]);
        }
    }
}
