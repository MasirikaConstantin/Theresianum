<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Paie extends Model
{
    use HasFactory;

    protected $fillable = [
        'agent_id',
        'matricule',
        'nom_complet',
        'nombre_enfants',
        'fonction',
        'affectation',
        'numero_cnss',
        'anciennete',
        'date_debut_periode',
        'date_fin_periode',
        'date_emission',
        'salaire_base',
        'heures_supplementaires',
        'conges_payes',
        'pecule_conge',
        'gratification',
        'prime_fidelite',
        'prime_diverse',
        'allocation_familiale',
        'allocation_epouse',
        'afm_gratification',
        'cotisation_cnss',
        'impot_revenu',
        'prets_retenus',
        'avance_salaire',
        'paie_negative',
        'autres_regularisations',
        'remuneration_brute',
        'total_retenues',
        'net_imposable',
        'net_a_payer',
        'ref',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'date_debut_periode' => 'date',
        'date_fin_periode' => 'date',
        'date_emission' => 'date',
        'salaire_base' => 'decimal:2',
        'heures_supplementaires' => 'decimal:2',
        'conges_payes' => 'decimal:2',
        'pecule_conge' => 'decimal:2',
        'gratification' => 'decimal:2',
        'prime_fidelite' => 'decimal:2',
        'prime_diverse' => 'decimal:2',
        'allocation_familiale' => 'decimal:2',
        'allocation_epouse' => 'decimal:2',
        'afm_gratification' => 'decimal:2',
        'cotisation_cnss' => 'decimal:2',
        'impot_revenu' => 'decimal:2',
        'prets_retenus' => 'decimal:2',
        'avance_salaire' => 'decimal:2',
        'paie_negative' => 'decimal:2',
        'autres_regularisations' => 'decimal:2',
        'remuneration_brute' => 'decimal:2',
        'total_retenues' => 'decimal:2',
        'net_imposable' => 'decimal:2',
        'net_a_payer' => 'decimal:2',
    ];

    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    public static function boot()
    {
        parent::boot();
    
        static::creating(function ($paie) {
            $paie->ref = (string) \Illuminate\Support\Str::uuid();
        });
    
       
    }
    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Méthodes pour calculs selon la loi congolaise
    public function calculateCnssContribution(): float
    {
        // CNSS: 5% salaire brut (employé) + 5% (employeur) 
        return $this->salaire_base * 0.05;
    }

    public function calculateIncomeTax(): float
    {
        // Barème progressif selon législation RDC (exemple simplifié)
        $netImposable = $this->remuneration_brute - $this->cotisation_cnss;
        
        if ($netImposable <= 1500) return 0;
        if ($netImposable <= 5000) return $netImposable * 0.15;
        if ($netImposable <= 10000) return $netImposable * 0.20;
        if ($netImposable <= 15000) return $netImposable * 0.25;
        return $netImposable * 0.30;
    }

    public function calculateFamilyAllocations(): float
    {
        // Allocation familiale: 7% du salaire brut par enfant (max 5 enfants)
        $nbEnfants = min($this->nombre_enfants, 5);
        return $this->salaire_base * 0.07 * $nbEnfants;
    }
}