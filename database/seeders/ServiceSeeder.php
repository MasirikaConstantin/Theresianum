<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            ['name' => 'Shampoing + Brushing', 'duree' => 45, 'prix' => 7000],
            ['name' => 'Lissage Brésilien', 'duree' => 120, 'prix' => 30000],
            ['name' => 'Défrisage', 'duree' => 90, 'prix' => 15000],
            ['name' => 'Tresses Vanilles', 'duree' => 180, 'prix' => 20000],
            ['name' => 'Chignon Mariage', 'duree' => 90, 'prix' => 25000],
            ['name' => 'Pose Lace Wig', 'duree' => 60, 'prix' => 10000],
            ['name' => 'Coloration Cheveux', 'duree' => 75, 'prix' => 12000],
            ['name' => 'Soin Capillaire Profond', 'duree' => 45, 'prix' => 8000],
            ['name' => 'Manucure + Vernis', 'duree' => 30, 'prix' => 5000],
            ['name' => 'Maquillage de Soirée', 'duree' => 60, 'prix' => 15000],
        ];

        foreach ($services as $data) {
            Service::create([
                'name' => $data['name'],
                'description' => null,
                'duree_minutes' => $data['duree'],
                'prix' => $data['prix'],
                'ref' => Str::uuid(),
                'user_id' => null,
            ]);
        }
    }
}
