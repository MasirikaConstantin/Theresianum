<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use App\Models\Succursale;
use App\Models\Transfert;
use App\Models\TransfertStock;
use App\Models\Stock;
use App\Models\StockSuccursale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransfertControllerStock extends Controller
{
    public function index()
    {
        $transferts = Transfert::with(['transfertStocks.produit', 'transfertStocks.succursaleDestination', 'user'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Transferts/Transferts/Index', [
            'transferts' => $transferts,
        ]);
    }

    public function create()
    {
        $succursales = Succursale::all();
        $produits = Produit::orderBy('name', 'asc')->with(['stock'])->get();
        return Inertia::render('Transferts/Transferts/Create', [
            'succursales' => $succursales,
            'produits' => $produits,
        ]);
    }

    public function validateTransfert(string $transfert, Request $request)
{
    $transfert = Transfert::where('ref', $transfert)->firstOrFail();
   //dd($request);
   $request->validate([
        'action' => 'required|in:validé,refusé',
    ]);
   try {
    DB::transaction(function () use ($request, $transfert) {
        $transfert->load('transfertStocks');
        $statut = $request->action;


        foreach ($transfert->transfertStocks as $transfertStock) {
            // Vérifier à nouveau le stock (au cas où il aurait changé)
            $stock = Stock::where('produit_id', $transfertStock->produit_id)->first();
            
            if($statut==='validé'){
                // Ajouter au stock de la succursale destination
                DB::transaction(function () use ($transfertStock) {
                    $stockSuccursale = StockSuccursale::lockForUpdate()
                        ->firstOrNew([
                            'produit_id' => $transfertStock->produit_id,
                            'succursale_id' => $transfertStock->succursale_destination_id,
                        ]);
                    
                    $stockSuccursale->quantite = ($stockSuccursale->quantite ?? 0) + $transfertStock->quantite;
                    $stockSuccursale->save();
                });

                // Mettre à jour le statut
                $transfertStock->update([
                    'statut' => 'validé',
                    'date_validation' => now(),
                    'user_validateur_id' => auth()->id(),
                ]);
            }
            if($statut==='refusé'){
                 // Décrémenter le stock global
            $stock->increment('quantite', $transfertStock->quantite);
            // Mettre à jour le statut
            $transfertStock->update([
                'statut' => 'refusé',
                'date_validation' => now(),
                'user_validateur_id' => auth()->id(),
            ]);
            }
           

            
        }
    });
   } catch (\Exception $e) {
    return back()->with('error', $e->getMessage());
   }

    return back()->with('success', 'Transfert validé et stocks mis à jour');
}
public function store(Request $request)
{
    $request->validate([
        'note' => 'nullable|string',
        'items' => 'required|array|min:1',
        'items.*.produit_id' => 'required|exists:produits,id',
        'items.*.quantite' => 'required|integer|min:1',
        'items.*.succursale_destination_id' => 'required|exists:succursales,id',
    ]);

    DB::transaction(function () use ($request) {
        $transfert = Transfert::create([
            'note' => $request->note,
            'user_id' => auth()->id(),
        ]);

        foreach ($request->items as $item) {
            // Vérifier et décrémenter le stock disponible dans la table stocks
            $stock = Stock::where('produit_id', $item['produit_id'])->first();

            if (!$stock) {
                throw new \Exception('Produit non trouvé dans le stock: ' . $item['produit_id']);
            }

            if ($stock->quantite < $item['quantite']) {
                throw new \Exception('Stock insuffisant pour le produit: ' . $item['produit_id'] . '. Disponible: ' . $stock->quantite);
            }

            // Décrémenter le stock global immédiatement
            $stock->decrement('quantite', $item['quantite']);

            // Créer l'entrée de transfert
            TransfertStock::create([
                'transfert_id' => $transfert->id,
                'produit_id' => $item['produit_id'],
                'quantite' => $item['quantite'],
                'date_demande' => now(),
                'succursale_destination_id' => $item['succursale_destination_id'],
                'user_initiateur_id' => auth()->id(),
                'statut' => 'en attente', // Statut modifié car le stock est déjà déduit
            ]);

            /* / Ajouter au stock de la succursale destination
            $stockSuccursale = StockSuccursale::firstOrNew([
                'produit_id' => $item['produit_id'],
                'succursale_id' => $item['succursale_destination_id'],
            ]);

            $stockSuccursale->quantite = ($stockSuccursale->quantite ?? 0) + $item['quantite'];
            $stockSuccursale->save();*/
        }
    });

    return redirect()->route('transferts-central.index')->with('success', 'Transfert créé et stock mis à jour avec succès');
}

    public function rejectTransfert(Transfert $transfert)
    {
        $transfert->transfertStocks()->update([
            'statut' => 'refusé',
            'date_validation' => now(),
            'user_validateur_id' => auth()->id(),
        ]);

        return back()->with('success', 'Transfert refusé');
    }
}
/*
<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use App\Models\Succursale;
use App\Models\Transfert;
use App\Models\TransfertStock;
use App\Models\StockSuccursale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransfertControllerStock extends Controller
{
    public function index()
    {
        $transferts = Transfert::with(['transfertStocks.produit', 'transfertStocks.succursaleSource', 'transfertStocks.succursaleDestination', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Transferts/Transferts/Index', [
            'transferts' => $transferts,
        ]);
    }

    public function create()
    {
        $succursales = Succursale::all();
        $produits = Produit::with(['stockSuccursales'])->get();

        return Inertia::render('Transferts/Transferts/Create', [
            'succursales' => $succursales,
            'produits' => $produits,
        ]);
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'note' => 'nullable|string',
                'items' => 'required|array|min:1',
                'items.*.produit_id' => 'required|exists:produits,id',
                'items.*.quantite' => 'required|integer|min:1',
                
                'items.*.succursale_destination_id' => 'required|exists:succursales,id|different:items.*.succursale_source_id',
            ]);
        } catch (\Exception $e) {
            dd($e->getMessage());
            return redirect()->back()->withErrors($e->getMessage());
        }

        DB::transaction(function () use ($request) {
            $transfert = Transfert::create([
                'note' => $request->note,
                'user_id' => auth()->id(),
            ]);

            foreach ($request->items as $item) {
                // Vérifier le stock disponible
                $stockSource = StockSuccursale::where('produit_id', $item['produit_id'])
                    ->where('succursale_id', $item['succursale_source_id'])
                    ->first();

                if (!$stockSource || $stockSource->quantite < $item['quantite']) {
                    throw new \Exception('Stock insuffisant pour le produit: ' . $item['produit_id']);
                }

                TransfertStock::create([
                    'transfert_id' => $transfert->id,
                    'produit_id' => $item['produit_id'],
                    'quantite' => $item['quantite'],
                    'succursale_source_id' => $item['succursale_source_id'],
                    'succursale_destination_id' => $item['succursale_destination_id'],
                    'user_initiateur_id' => auth()->id(),
                ]);
            }
        });

        return redirect()->route('transferts-central.index')->with('success', 'Transfert créé avec succès');
    }

    public function validateTransfert(Transfert $transfert)
    {
        DB::transaction(function () use ($transfert) {
            $transfert->load('transfertStocks');

            foreach ($transfert->transfertStocks as $transfertStock) {
                // Diminuer le stock source
                $stockSource = StockSuccursale::where('produit_id', $transfertStock->produit_id)
                    ->where('succursale_id', $transfertStock->succursale_source_id)
                    ->first();

                if ($stockSource) {
                    $stockSource->decrement('quantite', $transfertStock->quantite);
                }

                // Augmenter ou créer le stock destination
                $stockDestination = StockSuccursale::firstOrNew([
                    'produit_id' => $transfertStock->produit_id,
                    'succursale_id' => $transfertStock->succursale_destination_id,
                ]);

                $stockDestination->quantite = ($stockDestination->quantite ?? 0) + $transfertStock->quantite;
                $stockDestination->save();

                // Mettre à jour le transfert
                $transfertStock->update([
                    'statut' => 'validé',
                    'date_validation' => now(),
                    'user_validateur_id' => auth()->id(),
                ]);
            }
        });

        return back()->with('success', 'Transfert validé avec succès');
    }

    public function rejectTransfert(Transfert $transfert)
    {
        $transfert->transfertStocks()->update([
            'statut' => 'refusé',
            'date_validation' => now(),
            'user_validateur_id' => auth()->id(),
        ]);

        return back()->with('success', 'Transfert refusé');
    }
}*/