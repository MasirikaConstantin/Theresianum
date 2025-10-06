<?php

namespace App\Observers;

use App\Models\Reservation;
use Carbon\Carbon;

class ReservationObserver
{
    public function retrieved(Reservation $reservation)
    {
        // Vérifier à chaque fois qu'une réservation est récupérée
        $this->checkAndUpdateStatus($reservation);
    }

    private function checkAndUpdateStatus(Reservation $reservation)
    {
        $now = Carbon::now();
        
        if ($reservation->date_fin <= $now && 
            !in_array($reservation->statut, ['terminee', 'annulee'])) {
            
            $reservation->update(['statut' => 'terminee']);
        }
    }
}