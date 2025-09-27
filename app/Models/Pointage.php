<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Pointage extends Model
{
    use HasFactory;

    protected $fillable = [
        'agent_id',
        'date',
        'heure_arrivee',
        'heure_depart',
        'statut',
        'statut_arrivee',
        'statut_depart',
        'justifie',
        'justification',
        'notes', 'ref',
        'created_by',
        'updated_by'
    ];
    
    protected $casts = [
        'date' => 'date',
        'justifie' => 'boolean',
    ];

    public static function boot()
    {
        parent::boot();

        static::creating(function ($pointage) {
            $pointage->ref = (string) \Illuminate\Support\Str::uuid();
            if (auth()->check()) {
                $pointage->created_by = auth()->id();
            }
        });
    }
    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }

    public function calculateRetard()
    {
        if (!$this->heure_arrivee) return null;
        
        $dayOfWeek = $this->date->dayOfWeek;
        $heureArrivee = $this->heure_arrivee;
        
        // Dimanche
        if ($dayOfWeek === 0) {
            $retardTime = '13:30:00';
        } 
        // Lundi
        elseif ($dayOfWeek === 1) {
            $retardTime = '10:30:00';
            //$retardTime = '16:30:00';
        }
        // Vendredi ou Samedi
        elseif ($dayOfWeek === 5 || $dayOfWeek === 6) {
            $retardTime = '08:30:00';
        }
        // Mardi, Mercredi, Jeudi
        else {
            $retardTime = '09:30:00';
        }
        
        return $heureArrivee > $retardTime ? 'en-retard' : 'a-lheure';
    }

    public function calculateDepartPrecoce()
    {
        if (!$this->heure_depart) return null;
        
        $dayOfWeek = $this->date->dayOfWeek;
        $heureDepart = $this->heure_depart;
        
        // Dimanche
        if ($dayOfWeek === 0) {
            $heureNormale = '18:00:00';
        } 
        // Lundi
        elseif ($dayOfWeek === 1) {
            $heureNormale = '18:00:00';
            //$heureNormale = '16:30:00';
        }
        // Vendredi ou Samedi
        elseif ($dayOfWeek === 5 || $dayOfWeek === 6) {
            $heureNormale = '20:00:00';
        }
        // Mardi, Mercredi, Jeudi
        else {
            $heureNormale = '19:00:00';
        }
        
        return $heureDepart < $heureNormale ? 'parti-tot' : "a-lheure";
    }
}