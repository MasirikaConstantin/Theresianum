<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vente extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'client_id',
        'succursale_id',
        'vendeur_id',
        'remise',
        'montant_total',
        'mode_paiement',
        'code',
        'caisse_id',
        'has_promotion',
        'reservation_id'
    ];

    protected $casts = [
        'montant_total' => 'decimal:2',
        'remise' => 'decimal:2',
    ];

    
    protected static function boot()
{
    parent::boot();

    static::creating(function ($model) {
        $model->ref = (string) \Illuminate\Support\Str::uuid();
        
        // 1. Préfixe succursale (3 premières lettres)
        $succursaleName = auth()->user()->succursale->nom ?? 'DEF';
        $prefix = strtoupper(substr($succursaleName, 0, 3));
        
        // 2. Date au format Ymd (20250731)
        $datePart = now()->format('ymd');
        
        // 3. Incrémentation quotidienne indépendante de l'ID
        $lastToday = static::whereDate('created_at', today())
                         ->where('code', 'like', $prefix.'-'.$datePart.'%')
                         ->latest()
                         ->first();
        
        $counter = 1;
        if ($lastToday && preg_match('/\d{4}$/', $lastToday->code)) {
            $lastCounter = (int)substr($lastToday->code, -4);
            $counter = $lastCounter + 1;
        }
        
        $sequentialNumber = str_pad($counter, 4, '0', STR_PAD_LEFT);
        
        // Format final: KIN-2025073100001
        $model->code = $prefix . '-' . $datePart . $sequentialNumber;
        
        if (auth()->check()) {
            $model->vendeur_id = auth()->id();
        }
   
    });
}


    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function succursale()
    {
        return $this->belongsTo(Succursale::class);
    }

    public function vendeur()
    {
        return $this->belongsTo(User::class, 'vendeur_id');
    }

    public function produits()
    {
        return $this->hasMany(VenteProduit::class)->whereNotNull('produit_id');
    }

    public function services()
    {
        return $this->hasMany(VenteProduit::class)->whereNotNull('service_id');
    }

    public function items()
    {
        return $this->hasMany(VenteProduit::class);
    }
    public function VenduePar()
    {
        return $this->belongsTo(User::class, 'vendeur_id');
    }
    public function venteProduits()
    {
        return $this->hasMany(VenteProduit::class);
    }

   
    
}
