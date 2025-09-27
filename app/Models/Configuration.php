<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Configuration extends Model
{
    protected $fillable = [
        'actif',
        'ratio_achat', // ex: 7 (1 point pour chaque 7$)
        'valeur_point', // ex: 0.5 (1 point = 0.5$)
        'seuil_utilisation' // ex: 5 (minimum de points à utiliser)
    ];

    protected $casts = [
        'actif' => 'boolean',
        'ratio_achat' => 'float',
        'valeur_point' => 'float',
        'seuil_utilisation' => 'integer'
    ];

    public static function getActiveConfig()
    {
        return static::where('actif', true)->first();
    }

    protected static function booted()
    {
        static::creating(function ($config) {
            // Désactiver toutes les autres configs quand on en active une nouvelle
            if ($config->actif) {
                static::where('actif', true)->update(['actif' => false]);
            }
        });

        static::updating(function ($config) {
            // Si on active cette config, désactiver les autres
            if ($config->isDirty('actif')) {
                static::where('actif', true)->where('id', '!=', $config->id)->update(['actif' => false]);
            }
        });

        static::creating(function ($model) {
            $model->ref = (string) \Illuminate\Support\Str::uuid();
        });
    }
}
