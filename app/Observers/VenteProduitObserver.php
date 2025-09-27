<?php

namespace App\Observers;

use App\Models\VenteProduit;

class VenteProduitObserver
{
    public function saved(VenteProduit $item)
    {
        if ($item->vente) {
            $hasPromotion = $item->vente->items()
                                ->whereNotNull('promotion_id')
                                ->exists();
            $item->vente->update(['has_promotion' => $hasPromotion]);
        }
    }

    public function deleted(VenteProduit $item)
    {
        if ($item->vente) {
            $hasPromotion = $item->vente->items()
                                ->whereNotNull('promotion_id')
                                ->exists();
            $item->vente->update(['has_promotion' => $hasPromotion]);
        }
    }
}