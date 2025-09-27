<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    use HasFactory;
    protected $fillable = [
        'produit_id',
        'quantite',
        "quantite_alerte",
        "actif",
        "ref",
        "user_id",
    ];
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->ref = \Illuminate\Support\Str::uuid();
        });
    }
    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function scopeActive($query)
    {
        return $query->where('actif', true);
    }

}
