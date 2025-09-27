<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class VenteProduit extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'vente_id',
        'produit_id',
        'service_id',
        'quantite',
        'prix_unitaire',
        'remise',
        'montant_total',
        'promotion_id'
    ];

    protected $casts = [
        'prix_unitaire' => 'decimal:2',
        'remise' => 'decimal:2',
        'montant_total' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->ref = (string) \Illuminate\Support\Str::uuid();

            // Vérification et association de promotion pour les produits
            if ($model->produit_id) {
                $produit = Produit::find($model->produit_id);
                if ($produit && $model->prix_unitaire != $produit->prix_vente) {
                    $promotion = Promotion::where('is_active', true)->first();
                    if ($promotion) {
                        $model->promotion_id = $promotion->id;
                    }
                }
            }
            
            // Vérification et association de promotion pour les services
            if ($model->service_id) {
                $service = Service::find($model->service_id);
                if ($service && $model->prix_unitaire != $service->prix) {
                    $promotion = Promotion::where('is_active', true)->first();
                    if ($promotion) {
                        $model->promotion_id = $promotion->id;
                    }
                }
            }
        });
    }

    public function vente()
    {
        return $this->belongsTo(Vente::class);
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }
}