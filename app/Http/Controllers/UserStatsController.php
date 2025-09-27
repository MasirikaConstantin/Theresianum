<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Vente;
use App\Models\Pointage;
use App\Models\Conge;
use App\Models\Depense;
use App\Models\StockSuccursale;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class UserStatsController extends Controller
{
    public function show(string $userId)
    {

        $user = User::where('ref', $userId)->with('succursale')->firstOrFail();
        
        // Statistiques de ventes
        $ventes = Vente::where('vendeur_id', $userId)
            ->selectRaw('DATE(created_at) as date, SUM(montant_total) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();
            
        $ventesMensuelles = Vente::where('vendeur_id', $userId)
            ->selectRaw('MONTH(created_at) as month, YEAR(created_at) as year, SUM(montant_total) as total')
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();
            
        // Statistiques de pointage
        $pointages = Pointage::where('user_id', $userId)
            ->selectRaw('statut, COUNT(*) as count')
            ->groupBy('statut')
            ->get();
            
        $retards = Pointage::where('user_id', $userId)
            ->whereNotNull('heure_arrivee')
            ->selectRaw('DATE(date) as date, TIME(heure_arrivee) as heure_arrivee')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                $heureArrivee = Carbon::parse($item->heure_arrivee);
                $retard = $heureArrivee->diffInMinutes(Carbon::parse('08:00:00'));
                return [
                    'date' => $item->date,
                    'retard' => $retard > 0 ? $retard : 0
                ];
            });
            
        // Statistiques de congés
        $conges = Conge::where('user_id', $userId)
            ->selectRaw('type, COUNT(*) as count')
            ->groupBy('type')
            ->get();
            
        // Statistiques de stocks gérés
        $stocks = StockSuccursale::where('user_id', $userId)
            ->selectRaw('produit_id, quantite')
            ->with('produit')
            ->get();
            
        // Statistiques de dépenses (pour les caissiers)
        $depenses = Depense::where('user_id', $userId)
            ->selectRaw('DATE(created_at) as date, SUM(montant) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('Users/Stats', [
            'user' => $user,
            'ventesData' => $ventes,
            'ventesMensuellesData' => $ventesMensuelles,
            'pointagesData' => $pointages,
            'retardsData' => $retards,
            'congesData' => $conges,
            'stocksData' => $stocks,
            'depensesData' => $depenses,
        ]);
    }
}