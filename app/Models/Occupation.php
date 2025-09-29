<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Occupation extends Model
{
    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }

    // Relation indirecte vers la chambre via la réservation
    public function chambre()
    {
        return $this->hasOneThrough(
            Chambre::class,
            Reservation::class,
            'id', // Clé étrangère sur reservations
            'id', // Clé étrangère sur chambres
            'reservation_id', // Clé locale sur occupations
            'chambre_id' // Clé locale sur reservations
        );
    }
}
