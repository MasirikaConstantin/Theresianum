<?php

namespace App\Http\Controllers\Api;

use App\Models\Vente;
use App\Models\Produit;
use App\Models\Service;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\VenteProduit;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class VenteController extends Controller
{
    /**
     * Récupère les ventes récentes
     */
    public function ventesRecentes()
    {
        $ventes = Vente::with(['client', 'vendeur', 'produits'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json($ventes);
    }

    /**
     * Récupère le résumé des ventes pour une période
     */
    public function resumeVentes(Request $request)
    {
        $request->validate([
            'debut' => 'required|date',
            'fin' => 'required|date|after_or_equal:debut'
        ]);

        $debut = Carbon::parse($request->debut);
        $fin = Carbon::parse($request->fin);

        $resume = Vente::select(
                DB::raw('SUM(montant_total) as chiffre_affaires'),
                DB::raw('COUNT(*) as nombre_ventes'),
                DB::raw('AVG(montant_total) as panier_moyen'),
                'mode_paiement'
            )
            ->whereBetween('created_at', [$debut, $fin])
            ->groupBy('mode_paiement')
            ->get();

        return response()->json([
            'periode' => [
                'debut' => $debut->toDateString(),
                'fin' => $fin->toDateString()
            ],
            'resume' => $resume,
            'produits_vendus' => $this->getProduitsVendus($debut, $fin)
        ]);
    }

    private function getProduitsVendus($debut, $fin)
    {
        return VenteProduit::select(
                'produit_id',
                DB::raw('SUM(quantite) as quantite_totale'),
            )
            ->with('produit')
            ->whereHas('vente', function($query) use ($debut, $fin) {
                $query->whereBetween('created_at', [$debut, $fin]);
            })
            ->groupBy('produit_id')
            ->orderBy('quantite_totale', 'desc')
            ->get();
    }

    /**
     * Crée une nouvelle vente
     */
    public function creerVente(Request $request)
    {
        $request->validate([
            'client_id' => 'nullable|exists:clients,id',
            'vendeur_id' => 'required|exists:users,id',
            'produits' => 'required|array',
            'produits.*.id' => 'required|exists:produits,id',
            'produits.*.quantite' => 'required|integer|min:1',
            'remise' => 'numeric|min:0'
        ]);

        return DB::transaction(function() use ($request) {
            // Calcul du montant total
            $montantTotal = 0;
            $produits = [];

            foreach ($request->produits as $produit) {
                $produitModel = Produit::findOrFail($produit['id']);
                $prixTotal = $produitModel->prix_vente * $produit['quantite'];
                
                $produits[$produit['id']] = [
                    'quantite' => $produit['quantite'],
                    'prix_unitaire' => $produitModel->prix_vente,
                    'prix_total' => $prixTotal
                ];

                $montantTotal += $prixTotal;
            }

            // Application de la remise
            $montantTotal -= $request->remise ?? 0;

            // Création de la vente
            $vente = Vente::create([
                'client_id' => $request->client_id,
                'vendeur_id' => $request->vendeur_id,
                'montant_total' => $montantTotal,
                'remise' => $request->remise ?? 0,
                'mode_paiement' => $request->mode_paiement ?? 'espèces',
                'ref' => \Illuminate\Support\Str::uuid(),
                'code' => 'V-' . time()
            ]);

            // Ajout des produits
            $vente->produits()->attach($produits);

            return response()->json($vente->load('produits'), 201);
        });
    }
}