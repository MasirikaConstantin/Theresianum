<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Espace extends Model
{
    /** @use HasFactory<\Database\Factories\EspaceFactory> */
    use HasFactory;
    
    protected $fillable = [
        'nom',
        'capacite_max',
        'vocation',
        'prix_journee',
        'prix_nuit',
        'equipements',
        'disponible',
        'ref',
    ];
    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->ref = (string) \Illuminate\Support\Str::uuid();
        });
    }
}
