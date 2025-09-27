<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class StockMouvement extends Model
{
    protected $fillable = [
        'stock_id',
        'quantite',
        'type',
        'ref',
        'user_id',
        'prix',
        'description',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->ref = (string) \Illuminate\Support\Str::uuid();
            $model->user_id = Auth::user()->id;
        });
    }
}
