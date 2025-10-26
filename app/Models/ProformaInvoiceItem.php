<?php
// app/Models/ProformaInvoiceItem.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProformaInvoiceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'proforma_invoice_id',
        'type',
        'item_id',
        'designation',
        'quantite',
        'prix_unitaire',
        'montant_total',
        'date_item'
    ];

    protected $casts = [
        'date_item' => 'date',
        'prix_unitaire' => 'decimal:2',
        'montant_total' => 'decimal:2',
    ];

    public function proformaInvoice(): BelongsTo
    {
        return $this->belongsTo(ProformaInvoice::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($model) {
            $model->montant_total = $model->quantite * $model->prix_unitaire;
        });
    }
}