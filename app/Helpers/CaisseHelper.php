<?php
namespace App\Helpers;

use App\Models\Caisse;
use App\Models\Vente;
use App\Models\Depense;
use Illuminate\Support\Facades\DB;

class CaisseHelper
{
    public static function updateSoldeCaisse($caisseId, $montant, $type = 'vente')
{
    $caisse = Caisse::findOrFail($caisseId);
    
    // Vérifier que la caisse est toujours ouverte
    if ($caisse->statut !== 'ouverte') {
        throw new \Exception("La caisse est fermée, impossible d'effectuer l'opération");
    }
    
    DB::transaction(function () use ($caisse, $montant, $type) {
        if ($type === 'vente') {
            $caisse->increment('solde', $montant);
        } elseif ($type === 'depense') {
            $caisse->decrement('solde', $montant);
        }
        
        $caisse->save();
    });
    
    return $caisse->fresh();
}

    public static function getOrCreateDailyCaisse()
{
    $today = now()->format('Y-m-d');
    
    $caisse = Caisse::whereDate('date_ouverture', $today)
        ->first();
    
    if (!$caisse) {
        Caisse::where('statut', 'ouverte')
            ->update(['statut' => 'fermee', 'date_fermeture' => now()]);
            
        $caisse = Caisse::create([
            'date_ouverture' => now(),
            'solde' => 0,
            'statut' => 'ouverte'
        ]);
    }
    
    return $caisse;
}
}   