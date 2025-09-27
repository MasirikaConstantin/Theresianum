<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StockSuccursale;
use App\Models\Produit;
use App\Models\Succursale;
use Illuminate\Support\Facades\Auth;

class AccessoiresController extends Controller
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
    public function index(Request $request)
    {
        // Construire la requête de base
    if ($this->user->role === 'caissier' || $this->user->role === 'coiffeur' || $this->user->role === 'aucun') {
        $query = StockSuccursale::with(['produit', 'succursale', 'user'])
            ->where('succursale_id', $this->user->succursale_id)
            ->whereHas('produit', function($q) {
                $q->where('type', 'a_utiliser'); // <-- Filtre sur les produits à utiliser
            })
            ->latest();
    } else {
        $query = StockSuccursale::with(['produit', 'succursale', 'user'])
            ->whereHas('produit', function($q) {
                $q->where('type', 'a_utiliser'); // <-- Filtre sur les produits à utiliser
            })
            ->latest();
    }

    // Ajouter la recherche si nécessaire
    if ($request->has('search')) {
        $search = $request->search;
        $query->where(function($q) use ($search) {
            $q->whereHas('produit', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->where('type', 'a_utiliser'); // <-- Conserve le filtre pendant la recherche
            })->orWhereHas('succursale', function($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%");
            });
        });
    }

    $stocks = $query->orderBy('created_at', 'desc')->paginate(10);

    return inertia('StockSuccursales/Accessoire', [
        'stocks' => $stocks,
        'produits' => Produit::active()->where('type', 'a_utiliser')->get(), // <-- Filtre ici aussi
        'succursales' => Succursale::all(),
        'filters' => $request->only(['search']),
    ]);
    }

    public function create()
    {
        return inertia('StockSuccursales/Create', [
            'produits' => Produit::active()->get(),
            'succursales' => Succursale::all(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'produit_id' => 'required|exists:produits,id',
            'succursale_id' => 'required|exists:succursales,id',
            'quantite' => 'required|integer|min:0',
            'seuil_alerte' => 'required|integer|min:1',
        ]);

        // Vérifier l'unicité
        $exists = StockSuccursale::where('produit_id', $request->produit_id)
            ->where('succursale_id', $request->succursale_id)
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'produit_id' => 'Ce produit a déjà un stock pour cette succursale'
            ]);
        }

        StockSuccursale::create([
            'produit_id' => $request->produit_id,
            'succursale_id' => $request->succursale_id,
            'quantite' => $request->quantite,
            'seuil_alerte' => $request->seuil_alerte,
            'user_id' => auth()->id(),
        ]);

        return redirect()->route('stock-succursales.index')
            ->with('success', 'Stock en succursale créé avec succès');
    }

    public function show(string $stockSuccursale)
    {
        $stockSuccursale = StockSuccursale::where('ref', $stockSuccursale)->with('produit', 'succursale', 'user')->firstOrFail();
        return inertia('StockSuccursales/Show', [
            'stock' => $stockSuccursale,
        ]);
    }

    public function edit(string $stockSuccursale)
    {
        $stockSuccursale = StockSuccursale::where('ref', $stockSuccursale)->with('produit', 'succursale', 'user')->firstOrFail();
        return inertia('StockSuccursales/Edit', [
            'stock' => $stockSuccursale,
            //'produits' => Produit::active()->get(),
            //'succursales' => Succursale::all(),
        ]);
    }

    public function update(Request $request, string $stockSuccursale)
    {
        $stockSuccursale = StockSuccursale::where('ref', $stockSuccursale)->firstOrFail();
        $request->validate([
            'quantite' => 'required|integer|min:0',
            'seuil_alerte' => 'required|integer|min:1',
        ]);

        $stockSuccursale->update([
            'quantite' => $request->quantite,
            'seuil_alerte' => $request->seuil_alerte,
        ]);

        return redirect()->route('stock-succursales.index')
            ->with('success', 'Stock en succursale mis à jour avec succès');
    }

    public function destroy(string $stockSuccursale)
    {
        $stockSuccursale = StockSuccursale::where('ref', $stockSuccursale)->firstOrFail();
        $stockSuccursale->delete();

        return redirect()->route('stock-succursales.index')
            ->with('success', 'Stock en succursale supprimé avec succès');
    }

    public function accessoire(Request $request)
{
    // Construire la requête de base
    if ($this->user->role === 'caissier' || $this->user->role === 'coiffeur' || $this->user->role === 'aucun') {
        $query = StockSuccursale::with(['produit', 'succursale', 'user'])
            ->where('succursale_id', $this->user->succursale_id)
            ->whereHas('produit', function($q) {
                $q->where('type', 'a_utiliser'); // <-- Filtre sur les produits à utiliser
            })
            ->latest();
    } else {
        $query = StockSuccursale::with(['produit', 'succursale', 'user'])
            ->whereHas('produit', function($q) {
                $q->where('type', 'a_utiliser'); // <-- Filtre sur les produits à utiliser
            })
            ->latest();
    }

    // Ajouter la recherche si nécessaire
    if ($request->has('search')) {
        $search = $request->search;
        $query->where(function($q) use ($search) {
            $q->whereHas('produit', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->where('type', 'a_utiliser'); // <-- Conserve le filtre pendant la recherche
            })->orWhereHas('succursale', function($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%");
            });
        });
    }

    $stocks = $query->orderBy('created_at', 'desc')->paginate(10);

    return inertia('StockSuccursales/Accessoire', [
        'stocks' => $stocks,
        'produits' => Produit::active()->where('type', 'a_utiliser')->get(), // <-- Filtre ici aussi
        'succursales' => Succursale::all(),
        'filters' => $request->only(['search']),
    ]);
}
}
