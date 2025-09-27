<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contrat extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'agent_id',
        'duree',
        'date_debut',
        'date_fin',
        'type_contrat',
        'anciennete',
        'fonction',
        'salaire_base',
        'succursale_id',
        'ref',
        'is_active'
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
        'is_active' => 'boolean'
    ];

    public static function boot()
    {
        parent::boot();

        static::creating(function ($contrat) {
            $contrat->ref = \Illuminate\Support\Str::uuid();
            $contrat->created_by = auth()->id();
        });

        static::updating(function ($contrat) {
            $contrat->updated_by = auth()->id();
        });
    }

    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }

    public function succursale()
    {
        return $this->belongsTo(Succursale::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
    // Dans app/Models/Contrat.php
public function scopeActive($query)
{
    return $query->where('is_active', true)
        ->where(function($q) {
            $q->whereNull('date_fin')
              ->orWhere('date_fin', '>=', now());
        });
}

public function isActive(): bool
{
    return $this->is_active 
        && (is_null($this->date_fin) || $this->date_fin >= now());
}
}