<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;

class ProformaInvoice extends Model
{
    /** @use HasFactory<\Database\Factories\ProformaInvoiceFactory> */
    use HasFactory;


    protected $fillable = [
        'numero_facture',
        'client_nom',
        'client_email',
        'client_telephone',
        'client_adresse',
        'date_facture',
        'date_echeance',
        'notes',
        'client_id',
        'montant_total',
        'created_by',
        'updated_by',
        'statut',
        'ref'
    ];

    protected $casts = [
        'date_facture' => 'date',
        'date_echeance' => 'date',
        'montant_total' => 'decimal:2',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(ProformaInvoiceItem::class);
    }
    public function client(){
        return $this->belongsTo(Client::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->ref = (string) \Illuminate\Support\Str::uuid();
            $model->created_by = Auth::user()->id;
            $model->updated_by = Auth::user()->id;
            if (empty($model->numero_facture)) {
                $model->numero_facture = 'PROF-' . date('Ymd') . '-' . str_pad(static::count() + 1, 4, '0', STR_PAD_LEFT);
            }


         // 1. Préfixe succursale (3 premières lettres)
         
         $prefix = strtoupper(substr("PRO", 0, 3));
         
         // 2. Date au format Ymd (20250731)
         $datePart = now()->format('ymd');
         
         // 3. Incrémentation quotidienne indépendante de l'ID
         $lastToday = static::whereDate('created_at', today())
                          ->where('numero_facture', 'like', $prefix.'-'.$datePart.'%')
                          ->latest()
                          ->first();
         
         $counter = 1;
         if ($lastToday && preg_match('/\d{4}$/', $lastToday->numero_facture)) {
             $lastCounter = (int)substr($lastToday->numero_facture, -4);
             $counter = $lastCounter + 1;
         }
         
         $sequentialNumber = str_pad($counter, 4, '0', STR_PAD_LEFT);
         
         // Format final: KIN-2025073100001
         $model->numero_facture = $prefix . '-' . $datePart . $sequentialNumber;
         
         
        });


        
    }
    public function createdBy(){
        return $this->belongsTo(User::class,'created_by','id');
    }

    public function updatedBy(){
        return $this->belongsTo(User::class,'updated_by','id');
    }
}