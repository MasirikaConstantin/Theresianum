<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rendezvou extends Model
{
    protected $fillable = [
        'client_id',
        'produit_id',
        'date_heure',
        'duree_prevue',
        'statut',
        "ref",
        "notes",
        "services",
        "date_rdv",
        "heure_debut",
        "heure_fin",
        "succursale_id",
    ];
    protected $casts = [
        'services' => 'array',
        'date_rdv' => 'date',
    ];
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->ref = \Illuminate\Support\Str::uuid();
        });
    }
    public function services()
    {
        return $this->belongsToMany(Service::class, 'services');
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
    public function succursale()
    {
        return $this->belongsTo(Succursale::class);
    }
    public function rendezvou_services()
    {
        return $this->hasMany(RendezvousService::class);
    }
    
}
