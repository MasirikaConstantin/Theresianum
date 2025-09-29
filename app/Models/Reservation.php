<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    protected $fillable = [
        'client_id', 'chambre_id', 'salle_fete_id', 'date_debut', 'date_fin',
        'type_reservation', 'statut', 'prix_total', 'specifications'
    ];

    protected $casts = [
        'specifications' => 'array',
        'date_debut' => 'date',
        'date_fin' => 'date',
    ];
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->ref = (string) \Illuminate\Support\Str::uuid();
        });
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function chambre()
    {
        return $this->belongsTo(Chambre::class);
    }

    public function salleFete()
    {
        return $this->belongsTo(Salle::class);
    }

    public function occupations()
    {
        return $this->hasMany(Occupation::class);
    }

    public function calculerPrixTotal()
    {
        if ($this->type_reservation === 'chambre') {
            $nuits = Carbon::parse($this->date_debut)->diffInDays($this->date_fin);
            return $nuits * $this->chambre->prix_nuit;
        } else {
            $vocation = $this->specifications['vocation'] ?? 'journee';
            $jours = Carbon::parse($this->date_debut)->diffInDays($this->date_fin);
            return $jours * $this->salle->getPrixParVocation($vocation);
        }
    }
}