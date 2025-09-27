<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'duree_minutes',
        'prix',
        'actif',
        'user_id',
        'image'
    ];

    protected $casts = [
        'actif' => 'boolean',
        'prix' => 'decimal:2',
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
    public function rendezvou_services()
    {
        return $this->hasMany(RendezvousService::class);
    }
    protected $appends = ['image_url'];
    public function getImageUrlAttribute()
    {
        
        return $this->image ? Storage::disk('public')->url($this->image) : null;
    }
}
