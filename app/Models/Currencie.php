<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Currencie extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'code',
        'symbol',
        'exchange_rate',
        'is_active',
        'is_default'
    ];

    protected $casts = [
        'exchange_rate' => 'decimal:4',
        'is_active' => 'boolean',
        'is_default' => 'boolean'
    ];

    public static function getDefaultCurrency()
    {
        return self::where('is_default', true)->first();
    }

    public static function convertToDollars($amount, $currencyCode)
    {
        $currency = self::where('code', $currencyCode)->first();
        if (!$currency) {
            throw new \Exception("Devise non trouvée");
        }
        return $amount / $currency->exchange_rate;
    }

    public static function convertFromDollars($amount, $currencyCode)
    {
        $currency = self::where('code', $currencyCode)->first();
        if (!$currency) {
            throw new \Exception("Devise non trouvée");
        }
        return $amount * $currency->exchange_rate;
    }
}