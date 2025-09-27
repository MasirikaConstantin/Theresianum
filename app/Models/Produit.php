<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Produit extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'prix_achat',
        'prix_vente',
        'actif',
        'user_id',
        'categorie_id',
        'stock_global'
    ];

    protected $casts = [
        'actif' => 'boolean',
        'prix_achat' => 'float',
        'prix_vente' => 'float',
        
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->ref = (string) \Illuminate\Support\Str::uuid();
            if (auth()->check()) {
                $model->user_id = auth()->id();
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function stocks()
    {
        return $this->hasMany(Stock::class);
    }
    public function categorie()
    {
        return $this->belongsTo(Categorie::class);
    }
    public function scopeActive($query)
    {
        return $query->orderBy("name", "asc")->where('actif', true);
    }
    public function updateStock(): void
    {
        $stockTotal = $this->stocks()->sum('quantite');
        $this->update(['stock_global' => $stockTotal]);
    }
    
    public function stock()
    {
        return $this->hasOne(Stock::class);
    }
}
