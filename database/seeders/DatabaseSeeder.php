<?php

namespace Database\Seeders;

use App\Models\Agent;
use App\Models\Client;
use App\Models\Produit;
use App\Models\Service;
use App\Models\Stock;
use App\Models\StockSuccursale;
use App\Models\User;
use App\Models\Currencie;
use App\Models\Depense;
use Database\Seeders\PointageSeeder as SeedersPointageSeeder;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
      /*  User::factory(5)->create();
        Produit::factory(120)->create();
        $this->call([
            HotelSeeder::class,
        ]);*/
        //\App\Models\Client::factory()->count(50)->create();
        //\App\Models\Client::factory()->count(50)->create();
        $this->call([
            //ClientSeeder::class,
            //ChambreSeeder::class, 
            //SalleSeeder::class,
            //ReservationSeeder::class,
            Stock::factory(120)->create(),
        ]);
       /*/ Créer 5 succursales
\App\Models\Succursale::factory()->count(3)->create();

// Créer 10 utilisateurs avec une succursale aléatoire
\App\Models\User::factory()->count(4)->create([
    'succursale_id' => \App\Models\Succursale::inRandomOrder()->first()->id
]);

 // Créer 50 clients avec une succursale et un utilisateur aléatoire
\App\Models\Client::factory()->count(50)->create([
    'succursale_id' => \App\Models\Succursale::inRandomOrder()->first()->id,
    'enregistrer_par_id' => \App\Models\User::inRandomOrder()->first()->id
]);
       // \App\Models\Succursale::factory()->count(5)->create();
        //\App\Models\Client::factory()->count(50)->create();
        Service::factory(20)->create();
        Stock::factory(120)->create();*/
        //StockSuccursale::factory(120)->create();*/
        /*$this->call([
            ServiceSeeder::class,
            ProduitSeeder::class,
        ]);*/
        //Currencie::factory()->count(5)->create();
        //$this->call(VenteSeeder::class);
        //$this->call([ClientsUpdateDateNaissanceSeeder::class,]);
        //$this->call(ServiceSeederBeta::class);
        //Agent::factory(10)->create();
        //$this->call(SeedersPointageSeeder::class);
        //Depense::factory(10)->create();
    }
}
