<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Salle extends Model
{
    protected $fillable = [
        'nom', 'capacite_max', 'vocation', 'prix_journee', 'prix_nuit', 'equipements', 'disponible'
    ];
    protected $casts = [
        'disponible' => 'boolean',
        'prix_journee' => 'decimal:2',
        'prix_nuit' => 'decimal:2',
    ];

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function getPrixParVocation($vocation)
    {
        return $vocation === 'journee' ? $this->prix_journee : $this->prix_nuit;
    }

    public function estDisponible($date, $vocation)
    {
        return !$this->reservations()
            ->where('date_debut', '<=', $date)
            ->where('date_fin', '>=', $date)
            ->where('specifications->vocation', $vocation)
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
}
