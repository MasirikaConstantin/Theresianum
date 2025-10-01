<?php

namespace App\Http\Controllers;

use App\Models\Transfert;
use App\Models\TransfertStock;
use App\Models\Produit;
use App\Models\Succursale;
use App\Models\StockSuccursale;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TransfertController extends Controller
{

    protected $user;

    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $this->user = Auth::user();
            return $next($request);
        });
    }
    public function index(Request $request)
    {
        $user = $this->user; 
        if ($user->role === 'admin' || $user->role === 'gerant') {
            $query = Transfert::with(['user', 'transfertStocks'])
            ->latest();
        } else {
            $query = Transfert::with(['user', 'transfertStocks'])
            ->whereHas('transfertStocks', function ($q) use ($user) {
                $q->where('succursale_source_id', $user->succursale_id)
                ->orWhere('succursale_destination_id', $user->succursale_id);
            })
            ->latest();
           
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('ref', 'like', "%{$search}%")
                ->orWhere('note', 'like', "%{$search}%")
                ->orWhereHas('user', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
            });
        }

        $transferts = $query->paginate(25);

        return inertia('Transferts/Index', [
            'transferts' => $transferts,
            'filters' => $request->only(['search']),
        ]);
    }


    public function create()
    {
        $user = $this->user;

        if ($user->role === 'vendeur' || $user->role === 'coiffeur' || $user->role === 'aucun') {
            // Produits actifs avec stock > 0 dans la succursale de l'utilisateur
            $produits = Produit::where('actif', true)
            ->whereHas('stockSuccursales', function ($query) use ($user) {
                $query->where('succursale_id', $user->succursale_id)
                    ->where('quantite', '>', 0);
            })
            ->with(['stockSuccursales' => function ($query) use ($user) {
                $query->where('succursale_id', $user->succursale_id);
            }])->orderBy('name', 'asc')
        ->get();
        $succursales = Succursale::all();
        $masuccursales = Succursale::where('id', $user->succursale_id)->get();

        } else {
            $produits = Produit::where('actif', true)->orderBy('name', 'asc')->get();
            $succursales = Succursale::all();
        }
        

        $users = User::where('is_active', true)->get();

          // Récupérer les stocks pour tous les produits dans toutes les succursales
        $stocksData = StockSuccursale::all();
        
        // Formater les données de stock pour le frontend
        $stocks = [];
        foreach ($stocksData as $stock) {
            if (!isset($stocks[$stock->produit_id])) {
                $stocks[$stock->produit_id] = [];
            }
            $stocks[$stock->produit_id][$stock->succursale_id] = $stock->quantite;
        }

        return Inertia::render('Transferts/Create', [
            'produits' => $produits,
            'succursales' => $succursales,
            'masuccursales' => $masuccursales,
            'users' => $users,
            'stocks' => $stocks
        ]);
    }


    public function store(Request $request)
    {
        $request->validate([
            'note' => 'nullable|string|max:255',
            'items' => 'required|array|min:1',
            'items.*.produit_id' => 'required|exists:produits,id',
            'items.*.quantite' => 'required|integer|min:1',
            'items.*.succursale_source_id' => 'required|exists:succursales,id',
            'items.*.succursale_destination_id' => 'required|exists:succursales,id|different:items.*.succursale_source_id',
        ]);

        DB::transaction(function() use ($request) {
            $transfert = Transfert::create([
                'note' => $request->note,
                'user_id' => auth()->id(),
            ]);

            foreach ($request->items as $item) {
                // Vérifier le stock disponible
                $stock = StockSuccursale::where('produit_id', $item['produit_id'])
                    ->where('succursale_id', $item['succursale_source_id'])
                    ->first();

                if (!$stock || $stock->quantite < $item['quantite']) {
                    throw new \Exception("Stock insuffisant pour le produit: {$item['produit_id']}");
                }

                TransfertStock::create([
                    'transfert_id' => $transfert->id,
                    'produit_id' => $item['produit_id'],
                    'quantite' => $item['quantite'],
                    'succursale_source_id' => $item['succursale_source_id'],
                    'succursale_destination_id' => $item['succursale_destination_id'],
                    'user_initiateur_id' => auth()->id(),
                    'date_demande' => now(),
                    'statut' => 'en attente',
                ]);
            }
        });

        return redirect()->route('transferts.index')
            ->with('success', 'Transfert créé avec succès');
    }

    public function show(string $transfert)
    {
        $transfert = Transfert::where('ref', $transfert)->firstOrFail();
        return inertia('Transferts/Show', [
            'transfert' => $transfert->load([
                'user',
                'transfertStocks.produit',
                'transfertStocks.succursaleSource',
                'transfertStocks.succursaleDestination',
                'transfertStocks.initiateur',
                'transfertStocks.validateur'
            ]),
        ]);
    }

    public function validateTransfert(Request $request, string $transfert)
    {
        $transfert = Transfert::where('ref', $transfert)->firstOrFail();
        $request->validate([
            'action' => 'required|in:validé,refusé',
        ]);

        DB::transaction(function() use ($request, $transfert) {
            $statut = $request->action;
            $dateValidation = $statut === 'validé' ? now() : null;

            $transfert->transfertStocks()->update([
                'statut' => $statut,
                'date_validation' => $dateValidation,
                'user_validateur_id' => auth()->id(),
            ]);

            if ($statut === 'validé') {
                foreach ($transfert->transfertStocks as $item) {
                    // Diminuer le stock source
                    StockSuccursale::where('produit_id', $item->produit_id)
                        ->where('succursale_id', $item->succursale_source_id)
                        ->decrement('quantite', $item->quantite);

                    // Augmenter le stock destination (ou créer si n'existe pas)
                    StockSuccursale::updateOrCreate(
                        [
                            'produit_id' => $item->produit_id,
                            'succursale_id' => $item->succursale_destination_id,
                        ],
                        [
                            'quantite' => DB::raw("quantite + {$item->quantite}"),
                            'seuil_alerte' => 5, // Valeur par défaut
                            'user_id' => auth()->id(),
                        ]
                    );
                }
            }
        });

        return redirect()->route('transferts.show', $transfert->ref)
            ->with('success', "Transfert {$request->action} avec succès");
    }

    public function destroy(string $transfert)
    {
        $transfert = Transfert::where('ref', $transfert)->firstOrFail();
        if ($transfert->transfertStocks()->where('statut', 'validé')->exists()) {
            return back()->with('error', 'Impossible de supprimer un transfert déjà validé');
        }

        $transfert->delete();

        return redirect()->route('transferts.index')
            ->with('success', 'Transfert supprimé avec succès');
    }
}