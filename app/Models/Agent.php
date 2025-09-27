<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Agent extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'matricule',
        'nom',
        'postnom',
        'prenom',
        'sexe',
        'telephone',
        'adresse',
        'date_naissance',
        'lieu_naissance',
        'etat_civil',
        'province_origine',
        'territoire_origine',
        'district_origine',
        'commune_origine',
        'email',
        'role',
        'succursale_id',
        'statut',
        'avatar',
        'signature',
        'created_by',
        'updated_by',
        'ref',
        'nombre_enfant',
        'numero_cnss'
    ];

    

    protected $appends = [
        'avatar_url',
        'signature_url'
    ];
    protected $hidden = [
        'avatar',
        'signature',
    ];
    
    public static function boot()
{
    parent::boot();

    static::creating(function ($agent) {
        $agent->ref = (string) \Illuminate\Support\Str::uuid();
        $agent->created_by = Auth::id();
        $agent->updated_by = Auth::id();
        do {
            $matricule =  rand(10000, 99999);
        } while (self::where('matricule', $matricule)->exists());
        
        $agent->matricule = $matricule;
    });

    
    

    static::updating(function ($agent) {
        $agent->updated_by = Auth::id();
    });

    static::deleting(function ($agent) {
        if ($agent->avatar) {
            Storage::delete($agent->avatar);
        }
        if ($agent->signature) {
            Storage::delete($agent->signature);
        }
    });
}

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function succursale()
    {
        return $this->belongsTo(Succursale::class);
    }
    public function getAvatarUrlAttribute()
    {
        return $this->avatar ? Storage::disk('public')->url($this->avatar) : null;
    }
    public function getSignatureUrlAttribute()
    {
        return $this->signature ? Storage::disk('public')->url($this->signature) : null;
    }
    // Dans app/Models/Agent.php
public function scopeActive($query)
{
    return $query->where('statut', 'actif');
}

public function hasContratActif(): bool
{
    return $this->contrats()
        ->where('is_active', true)
        ->where(function($q) {
            $q->whereNull('date_fin')
              ->orWhere('date_fin', '>=', now());
        })
        ->exists();
}

public function scopeHasContratActif($query)
{
    return $query->whereHas('contrats', function ($q) {
        $q->where('is_active', true)
          ->where(function($q) {
              $q->whereNull('date_fin')
                ->orWhere('date_fin', '>=', now());
          });
    });
}

    public function references(){
        return $this->hasMany(Reference::class);
    }
    public function contrats(){
        return $this->hasMany(Contrat::class, 'agent_id', 'id');
    }
    public function pointages(){
        return $this->hasMany(Pointage::class, 'agent_id', 'id');
    }
}