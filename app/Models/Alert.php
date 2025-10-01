<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Alert extends Model
{
    protected $fillable = [
        'notes',
        'produit_id',
        'is_read',
        'salle_id',
        'chambre_id',
    ];
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->ref = \Illuminate\Support\Str::uuid();
            $model->user_id = Auth::user()->id;
        });
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }
    public function salle()
    {
        return $this->belongsTo(Salle::class);
    }
    public function chambre()
    {
        return $this->belongsTo(Chambre::class);
    }
}
