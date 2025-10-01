<?php

namespace App\Http\Controllers;
use Carbon\Carbon;
use App\Models\Vente;
use App\Models\Caisse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CaisseController extends Controller
{
    protected $user;

    public function __construct()
    {
        // S'assure que l'utilisateur est authentifié
        $this->middleware(function ($request, $next) {
            $this->user = Auth::user();
            return $next($request);
        });
    }
    public function index()
    {
        if($this->user->role === 'admin' || $this->user->role === 'gerant'){
            $caisses = Caisse::with('succursale')
            ->latest()
            ->paginate(10);
        }elseif($this->user->role === 'vendeur' ){
            $caisses = Caisse::with('succursale')
            ->where('succursale_id', $this->user->succursale_id)
            ->latest()
            ->paginate(10);
        }

        return Inertia::render('Caisses/Index', [
            'caisses' => $caisses
        ]);
    }

   

public function show(string $ref)
{
    $caisse = Caisse::with('succursale')
        ->where('ref', $ref)
        ->firstOrFail();

    // Date d'aujourd'hui (début et fin)
    $debutJour = Carbon::today();
    $finJour = Carbon::tomorrow(); // exclusif

    // Récupérer les ventes du jour pour cette caisse
    $ventesJour = Vente::where('caisse_id', $caisse->id)
        ->whereBetween('created_at', [$debutJour, $finJour])
        ->get();

    $transactions = Vente::where('caisse_id', $caisse->id)
        ->latest()
        ->limit(4)
        ->get()->map(function ($vente){
            return [
                'id' => $vente->id,
                'ref' => $vente->ref,
                'montant_total' => (float)$vente->montant_total,
                'created_at' => $vente->created_at->diffForHumans(),
                'updated_at' => $vente->updated_at->diffForHumans(),
                'client_id' => $vente->client_id,
                'succursale_id' => $vente->succursale_id,
                'vendeur_id' => $vente->vendeur_id,
                'remise' => $vente->remise,
                'mode_paiement' => $vente->mode_paiement,
                'code' => $vente->code,
                'caisse_id' => $vente->caisse_id,
                'client' => $vente->client,
                'succursale' => $vente->succursale,
                'vendeur' => $vente->vendeur,
                'caisse' => $vente->caisse,
            ];
        });

    // Calcul des statistiques
    $transactionsJour = $ventesJour->count();
    $montantTotalJour = $ventesJour->sum('montant_total');
    $moyenneTransaction = $transactionsJour > 0 
        ? round($montantTotalJour / $transactionsJour, 2)
        : 0;

    $stats = [
        'transactions_jour' => $transactionsJour,
        'montant_total_jour' => $montantTotalJour,
        'moyenne_transaction' => $moyenneTransaction,
    ];

    return Inertia::render('Caisses/Show', [
        'caisse' => $caisse,
        'stats' => $stats,
        'transactions' => $transactions
    ]);
}

}