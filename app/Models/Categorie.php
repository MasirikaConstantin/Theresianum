<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categorie extends Model
{
    protected $fillable = [
        'nom',
        'description',
        'is_active',
        'ref',
        'created_by',
        'updated_by',
    ];
    
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->ref = (string) \Illuminate\Support\Str::uuid();
            if (auth()->check()) {
                $model->created_by = auth()->id();
            }
        });
    }
    public function produits()
    {
        return $this->hasMany(Produit::class);
    }
    public function enregistrePar()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    public function misAjourPar()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
