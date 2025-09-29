<?php

namespace Database\Seeders;

use App\Models\Reservation;
use App\Models\Client;
use App\Models\Chambre;
use App\Models\Salle;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReservationSeeder extends Seeder
{
    public function run()
    {
        // Vérifier qu'il y a des clients, chambres et salles
        $clientCount = Client::count();
        $chambreCount = Chambre::count();
        $salleCount = Salle::count();

        if ($clientCount === 0) {
            $this->command->error('Aucun client trouvé. Veuillez exécuter ClientSeeder d\'abord.');
            return;
        }

        if ($chambreCount === 0 && $salleCount === 0) {
            $this->command->error('Aucune chambre ou salle trouvée. Veuillez exécuter ChambreSeeder et SalleSeeder d\'abord.');
            return;
        }

        $this->command->info("Création des réservations...");
        
        // Créer un mélange de réservations de chambres et de salles
        Reservation::factory()->count(20)->chambre()->create();
        Reservation::factory()->count(15)->salle()->create();
        
        // Créer quelques réservations avec statuts spécifiques
        Reservation::factory()->count(5)->chambre()->confirmee()->create();
        Reservation::factory()->count(3)->salle()->terminee()->create();
        Reservation::factory()->count(2)->chambre()->annulee()->create();
        
        $this->command->info('Réservations créées avec succès!');
        
        // Afficher un résumé
        $totalReservations = Reservation::count();
        $reservationsChambres = Reservation::where('type_reservation', 'chambre')->count();
        $reservationsSalles = Reservation::where('type_reservation', 'salle')->count();
        
        $this->command->info("Résumé des réservations créées:");
        $this->command->info("- Total: {$totalReservations}");
        $this->command->info("- Chambres: {$reservationsChambres}");
        $this->command->info("- Salles: {$reservationsSalles}");
    }
}