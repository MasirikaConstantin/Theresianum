<?php

namespace Database\Seeders;

use App\Models\Chambre;
use App\Models\Espace;
use App\Models\Salle;
use Illuminate\Database\Seeder;

// database/seeders/HotelSeeder.php
class HotelSeeder extends Seeder
{
    public function run()
    {
        // Créer des chambres
        Chambre::create([
            'nom' => 'Chambre 101',
            'numero' => '101',
            'type' => 'simple',
            'prix' => 80.00,
            'capacite' => 1,
            'equipements' => 'TV, WiFi, Salle de bain privée'
        ]);

        Chambre::create([
            'nom' => 'Chambre 201',
            'numero' => '201',
            'type' => 'double',
            'prix' => 120.00,
            'capacite' => 2,
            'equipements' => 'TV, WiFi, Salle de bain privée, Mini-bar'
        ]);
        // Créer des salles de fête
        Espace::create([
            'nom' => 'Salle Cristal',
            'capacite_max' => 100,
            'vocation' => 'mixte',
            'prix_journee' => 500.00,
            'prix_nuit' => 800.00,
            'equipements' => 'Sonorisation, Projecteur, Cuisine équipée'
        ]);
        Espace::create([
            'nom' => 'Espace 1',
            'capacite_max' => 10,
            'vocation' => 'mixte',
            'prix_journee' => 50.00,
            'prix_nuit' => 80.00,
            'equipements' => 'Sonorisation, Projecteur, Cuisine équipée'
        ]);

        Espace::create([
            'nom' => 'Espace 2',
            'capacite_max' => 10,
            'vocation' => 'mixte',
            'prix_journee' => 350.00,
            'prix_nuit' => 500.00,
            'equipements' => 'Sonorisation, Projecteur, Cuisine équipée'
        ]);

        Espace::create([
            'nom' => 'Espace 3',
            'capacite_max' => 300,
            'vocation' => 'mixte',
            'prix_journee' => 800.00,
            'prix_nuit' => 1200.00,
            'equipements' => 'Sonorisation, Cuisine équipée'
        ]);
    }
}