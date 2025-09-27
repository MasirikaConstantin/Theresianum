<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransfertStock extends Model
{
    protected $fillable = [
        'produit_id',
        'transfert_id',
        'quantite',
        'succursale_source_id',
        'succursale_destination_id',
        'user_initiateur_id',
        'user_validateur_id',
        'date_demande',
        'date_validation',
        'statut'
    ];

    protected $casts = [
        'date_demande' => 'datetime',
        'date_validation' => 'datetime',
    ];

    public function produit(): BelongsTo
    {
        return $this->belongsTo(Produit::class);
    }

    public function transfert(): BelongsTo
    {
        return $this->belongsTo(Transfert::class);
    }

    public function succursaleSource(): BelongsTo
    {
        return $this->belongsTo(Succursale::class, 'succursale_source_id');
    }

    public function succursaleDestination(): BelongsTo
    {
        return $this->belongsTo(Succursale::class, 'succursale_destination_id');
    }

    public function initiateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_initiateur_id');
    }

    public function validateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_validateur_id');
    }
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->ref = \Illuminate\Support\Str::uuid();
        });
    }
}
