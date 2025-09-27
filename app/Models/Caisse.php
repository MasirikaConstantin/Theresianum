<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Caisse extends Model
{
    use HasFactory;
    protected $fillable = ['succursale_id', 'solde', 'date_ouverture', 'date_fermeture', 'statut'];

    public function succursale()
    {
        return $this->belongsTo(Succursale::class);
    }

    public function ventes()
    {
        return $this->hasMany(Vente::class);
    }

    public function depenses()
    {
        return $this->hasMany(Depense::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'caisse_user');
    }
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            $model->ref = (string) \Illuminate\Support\Str::uuid();
        });
    }
}
