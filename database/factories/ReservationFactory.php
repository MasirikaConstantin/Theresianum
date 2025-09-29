<?php

namespace Database\Factories;

use App\Models\Reservation;
use App\Models\Client;
use App\Models\Chambre;
use App\Models\Salle;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ReservationFactory extends Factory
{
    protected $model = Reservation::class;

    public function definition()
    {
        // Déterminer aléatoirement le type de réservation
        $typeReservation = $this->faker->randomElement(['chambre', 'salle']);
        
        // Récupérer un client existant aléatoire
        $client = Client::inRandomOrder()->first();
        
        // Variables pour les relations et données spécifiques
        $chambreId = null;
        $salleId = null;
        $vocation = null;
        $prixTotal = 0;
        
        // Générer des dates aléatoires CORRECTES (début avant fin)
        $dateDebut = $this->faker->dateTimeBetween('-1 month', '+1 month');
        // S'assurer que la date de fin est après la date de début
        $dateFin = $this->faker->dateTimeBetween(
            Carbon::parse($dateDebut)->addDay(), // Au moins 1 jour après
            Carbon::parse($dateDebut)->addDays(30) // Maximum 30 jours après
        );
        
        if ($typeReservation === 'chambre') {
            // Récupérer une chambre existante aléatoire
            $chambre = Chambre::inRandomOrder()->first();
            $chambreId = $chambre->id ?? null;
            
            // Calcul du prix pour une chambre (par nuit)
            $nuits = Carbon::parse($dateDebut)->diffInDays(Carbon::parse($dateFin));
            $nuits = max(1, $nuits); // Au moins 1 nuit
            $prixTotal = $chambre ? $nuits * $chambre->prix : $this->faker->randomFloat(2, 50, 500);
            
            $vocation = 'mixte';
            
        } else {
            // Récupérer une salle existante aléatoire
            $salle = Salle::inRandomOrder()->first();
            $salleId = $salle->id ?? null;
            
            // Déterminer la vocation pour une salle
            $vocation = $this->faker->randomElement(['journee', 'nuit']);
            
            // Calcul du prix pour une salle
            $jours = Carbon::parse($dateDebut)->diffInDays(Carbon::parse($dateFin)) + 1; // +1 pour inclure le jour de début
            $prixParJour = $vocation === 'nuit' ? ($salle->prix_nuit ?? 0) : ($salle->prix_journee ?? 0);
            $prixTotal = $jours * $prixParJour;
        }
        
        return [
            'client_id' => $client->id,
            'chambre_id' => $chambreId,
            'salle_id' => $salleId,
            'date_debut' => $dateDebut,
            'date_fin' => $dateFin,
            'type_reservation' => $typeReservation,
            'statut' => $this->faker->randomElement(['confirmee', 'en_attente', 'annulee', 'terminee']),
            'prix_total' => $prixTotal,
            'vocation' => $vocation,
            'ref' => Str::uuid(),
            'created_at' => $this->faker->dateTimeBetween('-3 months', 'now'),
            'updated_at' => $this->faker->dateTimeBetween('-3 months', 'now'),
        ];
    }

    // États (States) pour des scénarios spécifiques
    public function configure()
    {
        return $this->afterMaking(function (Reservation $reservation) {
            // Validation supplémentaire après création
            if ($reservation->type_reservation === 'chambre' && !$reservation->chambre_id) {
                $chambre = Chambre::inRandomOrder()->first();
                if ($chambre) {
                    $reservation->chambre_id = $chambre->id;
                    
                    // Recalculer le prix si nécessaire
                    $nuits = Carbon::parse($reservation->date_debut)->diffInDays(Carbon::parse($reservation->date_fin));
                    $reservation->prix_total = $nuits * $chambre->prix;
                }
            }
            
            if ($reservation->type_reservation === 'salle' && !$reservation->salle_id) {
                $salle = Salle::inRandomOrder()->first();
                if ($salle) {
                    $reservation->salle_id = $salle->id;
                    
                    // Recalculer le prix si nécessaire
                    $jours = Carbon::parse($reservation->date_debut)->diffInDays(Carbon::parse($reservation->date_fin)) + 1;
                    $prixParJour = $reservation->vocation === 'nuit' ? $salle->prix_nuit : $salle->prix_journee;
                    $reservation->prix_total = $jours * $prixParJour;
                }
            }
            
            // S'assurer que date_fin > date_debut
            if (Carbon::parse($reservation->date_fin)->lte(Carbon::parse($reservation->date_debut))) {
                $reservation->date_fin = Carbon::parse($reservation->date_debut)->addDays(1);
            }
        });
    }

    // États (States) pour des types spécifiques - CORRIGÉS
    public function chambre()
    {
        return $this->state(function (array $attributes) {
            $chambre = Chambre::inRandomOrder()->first();
            $dateDebut = $this->faker->dateTimeBetween('-1 month', '+1 month');
            // S'assurer que date_fin > date_debut
            $dateFin = $this->faker->dateTimeBetween(
                Carbon::parse($dateDebut)->addDay(),
                Carbon::parse($dateDebut)->addDays(15)
            );
            $nuits = Carbon::parse($dateDebut)->diffInDays(Carbon::parse($dateFin));
            $nuits = max(1, $nuits);
            
            return [
                'type_reservation' => 'chambre',
                'chambre_id' => $chambre->id,
                'salle_id' => null,
                'date_debut' => $dateDebut,
                'date_fin' => $dateFin,
                'vocation' => 'mixte',
                'prix_total' => $chambre ? $nuits * $chambre->prix : $this->faker->randomFloat(2, 50, 300),
            ];
        });
    }

    public function salle()
    {
        return $this->state(function (array $attributes) {
            $salle = Salle::inRandomOrder()->first();
            $dateDebut = $this->faker->dateTimeBetween('-1 month', '+1 month');
            // S'assurer que date_fin > date_debut
            $dateFin = $this->faker->dateTimeBetween(
                Carbon::parse($dateDebut)->addDay(),
                Carbon::parse($dateDebut)->addDays(7)
            );
            $vocation = $this->faker->randomElement(['journee', 'nuit']);
            $jours = Carbon::parse($dateDebut)->diffInDays(Carbon::parse($dateFin)) + 1;
            $prixParJour = $vocation === 'nuit' ? ($salle->prix_nuit ?? 0) : ($salle->prix_journee ?? 0);
            
            return [
                'type_reservation' => 'salle',
                'chambre_id' => null,
                'salle_id' => $salle->id,
                'date_debut' => $dateDebut,
                'date_fin' => $dateFin,
                'vocation' => $vocation,
                'prix_total' => $jours * $prixParJour,
            ];
        });
    }

    // États pour des plages de dates spécifiques
    public function avecDates($dateDebut, $dateFin)
    {
        return $this->state(function (array $attributes) use ($dateDebut, $dateFin) {
            // S'assurer que date_fin > date_debut
            if (Carbon::parse($dateFin)->lte(Carbon::parse($dateDebut))) {
                $dateFin = Carbon::parse($dateDebut)->addDay();
            }
            
            return [
                'date_debut' => $dateDebut,
                'date_fin' => $dateFin,
            ];
        });
    }

    public function future()
    {
        return $this->state(function (array $attributes) {
            $dateDebut = $this->faker->dateTimeBetween('+1 day', '+1 month');
            $dateFin = $this->faker->dateTimeBetween(
                Carbon::parse($dateDebut)->addDay(),
                Carbon::parse($dateDebut)->addDays(14)
            );
            
            return [
                'date_debut' => $dateDebut,
                'date_fin' => $dateFin,
                'statut' => 'en_attente', // Les réservations futures sont souvent en attente
            ];
        });
    }

    public function passee()
    {
        return $this->state(function (array $attributes) {
            $dateDebut = $this->faker->dateTimeBetween('-3 months', '-1 week');
            $dateFin = $this->faker->dateTimeBetween(
                Carbon::parse($dateDebut)->addDay(),
                Carbon::parse($dateDebut)->addDays(10)
            );
            
            return [
                'date_debut' => $dateDebut,
                'date_fin' => $dateFin,
                'statut' => 'terminee', // Les réservations passées sont terminées
            ];
        });
    }

    // États pour les statuts
    public function confirmee()
    {
        return $this->state(function (array $attributes) {
            return [
                'statut' => 'confirmee',
            ];
        });
    }

    public function enAttente()
    {
        return $this->state(function (array $attributes) {
            return [
                'statut' => 'en_attente',
            ];
        });
    }

    public function annulee()
    {
        return $this->state(function (array $attributes) {
            return [
                'statut' => 'annulee',
            ];
        });
    }

    public function terminee()
    {
        return $this->state(function (array $attributes) {
            return [
                'statut' => 'terminee',
            ];
        });
    }

    // États pour les vocations (salles seulement)
    public function journee()
    {
        return $this->state(function (array $attributes) {
            return [
                'vocation' => 'journee',
                'type_reservation' => 'salle',
                'chambre_id' => null,
            ];
        });
    }

    public function nuit()
    {
        return $this->state(function (array $attributes) {
            return [
                'vocation' => 'nuit',
                'type_reservation' => 'salle',
                'chambre_id' => null,
            ];
        });
    }
}