<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ClientFidelite extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'client_id',
        'points',
        'dernier_achat',
        'nombre_achats',
        'montant_total_achats',
        'a_recu_cadeau_anniversaire'
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
}