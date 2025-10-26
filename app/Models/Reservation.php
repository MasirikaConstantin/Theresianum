<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
class Reservation extends Model
{
    use HasFactory;
    protected $fillable = [
        'client_id', 'chambre_id', 'salle_id','espace_id', 'date_debut', 'date_fin',
        'type_reservation', 'statut', 'prix_total', 'specifications', 'ref','operateur_id','vocation','type_paiement','statut_paiement','montant_payer'
    ];

    protected $casts = [
        'specifications' => 'array',
    ];
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->ref = (string) \Illuminate\Support\Str::uuid();
            $model->operateur_id = Auth::user()->id;
        });
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
    public function ventes()
    {
        return $this->hasMany(Vente::class);
    }

    public function chambre()
    {
        return $this->belongsTo(Chambre::class);
    }

    public function salle()
    {
        return $this->belongsTo(Salle::class);
    }

    public function occupations()
    {
        return $this->hasMany(Occupation::class);
    }

    public function calculerPrixTotal()
    {
        if ($this->type_reservation === 'chambre') {
            $nuits = Carbon::parse($this->date_debut)->diffInDays($this->date_fin);
            return $nuits * $this->chambre->prix_nuit;
        } else {
            $vocation = $this->specifications['vocation'] ?? 'journee';
            $jours = Carbon::parse($this->date_debut)->diffInDays($this->date_fin);
            return $jours * $this->salle->getPrixParVocation($vocation);
        }
    }
    public function espace()
    {
        return $this->belongsTo(Espace::class);
    }

    public function scopeAcomptes($query)
    {
        return $query->where('statut_paiement', 'non_paye')
            ->orWhereColumn('montant_payer', '!=', 'prix_total')
            ;
    
    }
    public function operateur()
    {
        return $this->belongsTo(User::class, 'operateur_id');
    }
    public function historique()
    {
        return $this->hasMany(HistoriquePaiement::class);
    }
}