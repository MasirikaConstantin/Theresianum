<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockSuccursale extends Model
{
    use SoftDeletes, HasFactory;

    protected $fillable = [
        'produit_id',
        'succursale_id',
        'quantite',
        'seuil_alerte',
        'ref',
        'user_id'
    ];

    protected $casts = [
        'deleted_at' => 'datetime',
    ];

    public function produit(): BelongsTo
    {
        return $this->belongsTo(Produit::class);
    }

    public function succursale(): BelongsTo
    {
        return $this->belongsTo(Succursale::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->ref = (string) \Illuminate\Support\Str::uuid();
            $model->user_id = auth()->id();
        });
    }
}
