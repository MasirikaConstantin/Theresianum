<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class HistoriquePaiement extends Model
{
    /** @use HasFactory<\Database\Factories\HistoriquePaiementFactory> */
    use HasFactory;
    protected $fillable = [
        'montant',
        'mode_paiement',
        'code',
        'statut_paiement',
        'montant_payer',
        'caisse_id',
        'reservation_id',
        'operateur_id',
    ];
    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }
   

    public function operateur()
    {
        return $this->belongsTo(User::class);
    }
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->ref = \Illuminate\Support\Str::uuid();
            $model->operateur_id = Auth::user()->id;
        });
    }
}
