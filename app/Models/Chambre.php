<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chambre extends Model
{
    protected $fillable = [
        'numero', 'type', 'prix', 'capacite', 'equipements', 'statut', 'nom'
    ];

    public function estDisponible($dateDebut, $dateFin)
    {
        return !$this->reservations()
            ->where(function($query) use ($dateDebut, $dateFin) {
                $query->whereBetween('date_debut', [$dateDebut, $dateFin])
                      ->orWhereBetween('date_fin', [$dateDebut, $dateFin])
                      ->orWhere(function($q) use ($dateDebut, $dateFin) {
                          $q->where('date_debut', '<=', $dateDebut)
                            ->where('date_fin', '>=', $dateFin);
                      });
            })
            ->whereIn('statut', ['confirmee', 'en_attente'])
            ->exists();
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->ref = (string) \Illuminate\Support\Str::uuid();
        });
    }
    // app/Models/Chambre.php
public function reservations()
{
    return $this->hasMany(Reservation::class);
}

// Nouvelle méthode pour récupérer les occupations via les réservations
public function occupations()
{
    return $this->hasManyThrough(
        Occupation::class,
        Reservation::class,
        'chambre_id', // Clé étrangère sur reservations
        'reservation_id', // Clé étrangère sur occupations
        'id', // Clé locale sur chambres
        'id' // Clé locale sur reservations
    );
}
}
