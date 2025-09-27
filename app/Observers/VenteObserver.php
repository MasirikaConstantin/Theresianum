<?php

namespace App\Observers;

use App\Models\ClientFidelite;
use App\Models\Configuration;
use App\Models\Vente;
class VenteObserver
{
    public function created(Vente $vente)
    {
            if ($vente->client_id) {
                $config = Configuration::getActiveConfig();
                if (!$config){
                $fidelite = ClientFidelite::firstOrCreate(['client_id' => $vente->client_id]);
                    $fidelite->update([
                        'points' => $fidelite->points + 0,
                        'dernier_achat' => now(),
                        'nombre_achats' => $fidelite->nombre_achats + 1,
                        'montant_total_achats' => $fidelite->montant_total_achats + 0,
                    ]);
                } elseif ($vente->mode_paiement === 'autre') {
                    return;
                } else {
                    $fidelite = ClientFidelite::firstOrCreate(['client_id' => $vente->client_id]);
        
                $points = floor($vente->montant_total / $config->ratio_achat);
        
                $fidelite->update([
                    'points' => $fidelite->points + $points,
                    'dernier_achat' => now(),
                    'nombre_achats' => $fidelite->nombre_achats + 1,
                    'montant_total_achats' => $fidelite->montant_total_achats + $vente->montant_total,
                ]);
                }
            }
    }
}
