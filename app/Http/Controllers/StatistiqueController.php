<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use App\Models\Succursale;
use App\Models\Vente;
use App\Models\Pointage;
use App\Models\Conge;
use App\Models\Depense;
use App\Models\Produit;
use App\Models\StockSuccursale;
use App\Models\User;
use App\Models\VenteProduit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StatistiqueController extends Controller
{
    public function index(Request $request)
    {
        $succursales = Succursale::all();
        $filters = $request->only([
            'succursale',
            'date_debut',
            'date_fin',
            'periode'
        ]);

        // Statistiques de ventes
        $ventesQuery = Vente::query()
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(montant_total) as total'),
                'succursale_id'
            )
            ->groupBy('date', 'succursale_id')
            ->orderBy('date');

        if ($request->succursale) {
            $ventesQuery->where('succursale_id', $request->succursale);
        }

        if ($request->date_debut && $request->date_fin) {
            $ventesQuery->whereBetween('created_at', [
                $request->date_debut,
                Carbon::parse($request->date_fin)->endOfDay()
            ]);
        } else {
            // Par défaut, afficher les 30 derniers jours
            $ventesQuery->where('created_at', '>=', now()->subDays(30));
        }

        $ventes = $ventesQuery->get();

        // Préparer les données pour le graphique
        $ventesData = [];
        $ventesParSuccursale = [];

        foreach ($ventes as $vente) {
            $date = Carbon::parse($vente->date)->format('Y-m-d');
            $ventesData[$date] = ($ventesData[$date] ?? 0) + $vente->total;
            
            if (!isset($ventesParSuccursale[$vente->succursale_id])) {
                $ventesParSuccursale[$vente->succursale_id] = [];
            }
            $ventesParSuccursale[$vente->succursale_id][$date] = $vente->total;
        }

        // Statistiques des employés
        $employesStats = User::query()
            ->select('role', DB::raw('COUNT(*) as count'))
            ->groupBy('role')
            ->get()
            ->pluck('count', 'role');

        // Statistiques des pointages
        $pointagesStats = Pointage::query()
            ->select('statut', DB::raw('COUNT(*) as count'))
            ->groupBy('statut')
            ->get()
            ->pluck('count', 'statut');

        // Statistiques des congés
        $congesStats = Conge::query()
            ->select('type', DB::raw('COUNT(*) as count'))
            ->groupBy('type')
            ->get()
            ->pluck('count', 'type');

        // Statistiques des dépenses
        $depensesStats = Depense::query()
            ->select(DB::raw('SUM(montant) as total'))
            ->first()
            ->total ?? 0;

        return inertia('Statistiques/Index', [
            'succursales' => $succursales,
            'filters' => $filters,
            'ventesData' => $ventesData,
            'ventesParSuccursale' => $ventesParSuccursale,
            'employesStats' => $employesStats,
            'pointagesStats' => $pointagesStats,
            'congesStats' => $congesStats,
            'depensesStats' => $depensesStats,
        ]);
    }


    // StatisticsController.php
public function produitsParCategorie()
{
    // Statistiques globales
    $statsGlobales = [
        'totalProduits' => Produit::count(),
        'totalVentes' => VenteProduit::sum('quantite'),
        'chiffreAffaire' => Vente::sum('montant_total'),
        'produitsEnRupture' => StockSuccursale::where('quantite', '<=', 'seuil_alerte')->count()
    ];

    // Statistiques par catégorie
    $statsParCategorie = Categorie::with(['produits'])
        ->get()
        ->map(function ($categorie) {
            $produitsIds = $categorie->produits->pluck('id');
            
            $totalVentes = VenteProduit::whereIn('produit_id', $produitsIds)->sum('quantite');
            $chiffreAffaire = VenteProduit::whereIn('produit_id', $produitsIds)
                ->get()
                ->sum(fn($vp) => $vp->quantite * $vp->prix_unitaire);
            
            $stocks = StockSuccursale::whereIn('produit_id', $produitsIds)->get();
            
            return [
                'categorie_id' => $categorie->id,
                'categorie_nom' => $categorie->nom,
                'total_produits' => $categorie->produits->count(),
                'total_ventes' => $totalVentes,
                'chiffre_affaire' => $chiffreAffaire,
                'stock_moyen' => $stocks->avg('quantite') ?? 0,
                'produits_en_alerte' => $stocks->where('quantite', '<=', 'seuil_alerte')->count(),
                'marge_moyenne' => $categorie->produits->avg(fn($p) => $p->prix_vente - $p->prix_achat) ?? 0,
                'top_produits' => VenteProduit::whereIn('produit_id', $produitsIds)
                    ->selectRaw('produit_id, SUM(quantite) as total_ventes')
                    ->with('produit:id,name')
                    ->groupBy('produit_id')
                    ->orderByDesc('total_ventes')
                    ->limit(5)
                    ->get()
                    ->map(fn($vp) => [
                        'id' => $vp->produit_id,
                        'nom' => $vp->produit->name,
                        'ventes' => $vp->total_ventes
                    ]),
                'evolution_mensuelle' => VenteProduit::whereIn('produit_id', $produitsIds)
                    ->selectRaw('YEAR(created_at) as annee, MONTH(created_at) as mois, SUM(quantite) as ventes, SUM(quantite * prix_unitaire) as chiffre_affaire')
                    ->groupBy('annee', 'mois')
                    ->orderBy('annee')
                    ->orderBy('mois')
                    ->get()
                    ->map(fn($stat) => [
                        'mois' => $stat->mois . '/' . $stat->annee,
                        'ventes' => $stat->ventes,
                        'chiffre_affaire' => $stat->chiffre_affaire
                    ])
            ];
        });

    return Inertia::render('Statistiques/ProduitsParCategorie', [
        'categories' => Categorie::all(),
        'statsGlobales' => $statsGlobales,
        'statsParCategorie' => $statsParCategorie
    ]);
}
}