<?php

namespace App\Http\Controllers;

use App\Helpers\CaisseHelper;
use App\Models\Caisse;
use Barryvdh\DomPDF\Facade\Pdf;

use App\Models\Client;
use App\Models\Configuration;
use App\Models\Currencie;
use App\Models\Produit;
use App\Models\Reservation;
use App\Models\Stock;
use App\Models\Vente;
use App\Models\VenteProduit;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class VenteController extends Controller
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
        if($this->user->role === 'admin' || $this->user->role === 'gerant'){
            $query = Vente::with(['client', 'vendeur', 'items.produit'])
            ->orderBy('created_at', 'desc');
        }elseif($this->user->role === 'vendeur'){
            $query = Vente::with(['client', 'vendeur', 'items.produit'])
            ->where('vendeur_id', $this->user->id)
            ->orderBy('created_at', 'desc');
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('ref', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%")
                  ->orWhereHas('client', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('client', function($q) use ($search) {
                    $q->where('telephone', 'like', "%{$search}%");
                })
                  ->orWhereHas('vendeur', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $ventes = $query->paginate(30);

        return Inertia::render('Ventes/Index', [
            'ventes' => $ventes,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        $produits = Produit::where('actif', true)
            ->whereHas('stock', function ($query) {
                $query->where('actif', true)
                    ->where('quantite', '>', 0); 
            })
            ->with(['stock' ])
            ->get();
            $reservations = Reservation::where('statut', 'confirmee')->select('id','client_id','salle_id','chambre_id','date_debut','date_fin','type_reservation','statut','prix_total','type_paiement','statut_paiement','vocation','ref')->get();
            $currencies = Currencie::where('is_active', true)->select('id','name','code','symbol', 'exchange_rate')->get();
        return Inertia::render('Ventes/Create', [
            'clients' => Client::with(['fidelite'=>function($query){
                            $query->select("id", 'ref', 'points', 'client_id');
                        }])->select('id','name','telephone','email','ref')->get(),
            'produits' => $produits,
            "configuration"=>Configuration::getActiveConfig(),
            'modes_paiement' => ['espèces', 'carte', 'chèque', 'autre'],
            'reservations' => $reservations->load(['client'=>function($query){
                                    $query->select("id", 'ref', 'name', 'telephone', 'email');
                                }, 'salle'=>function($query){
                                    $query->select("id", 'ref', 'nom');
                                }, 'chambre'=>function($query){
                                    $query->select("id", 'ref', 'nom');
                                }]),
            'currencies' => $currencies->toArray(),
            
        ]);
    }

    public function store(Request $request)
{
        $request->validate([
            'client_id' => 'nullable|exists:clients,id',
            'remise' => 'nullable|numeric|min:0',
            'montant_total' => 'required|numeric|min:0',
            'mode_paiement' => 'required|in:espèces,carte,chèque,autre',
            'reservation_id' => 'nullable|exists:reservations,id',
            'items' => 'required|array|min:1',
            'items.*.produit_id' => 'nullable|required_without:items.*.service_id|exists:produits,id',
            'items.*.quantite' => 'required|integer|min:1',
            'items.*.prix_unitaire' => 'required|numeric|min:0',
            'items.*.remise' => 'required|numeric|min:0',
            'items.*.montant_total' => 'required|numeric|min:0',

        ]);
    DB::transaction(function () use ($request) {
        // 1. Trouver ou créer la caisse ouverte 
        $caisse = CaisseHelper::getOrCreateDailyCaisse();
        // Création de la vente
        $vente = Vente::create([
            'client_id' => $request->client_id,
            'remise' => $request->remise,
            'montant_total' => $request->montant_total,
            'mode_paiement' => $request->mode_paiement,
            'reservation_id' => $request->reservation_id,
        ]+ ['caisse_id' => $caisse->id]);
        
        if ($request->mode_paiement !== 'autre') {
            CaisseHelper::updateSoldeCaisse($caisse->id, $request->montant_total, 'vente');
        } else {
            $client = Client::where('id', $request->client_id)->with('fidelite')->first();
            $configuration = Configuration::getActiveConfig();
            $fidelite = $client->fidelite;
            try {

                $fidelite =  $fidelite->update([
                    'points' => $fidelite->points - ( (int)$request->montant_total * $configuration->valeur_point),
                ]);
                   
            } catch (\Exception $e) {
                Log::error($e->getMessage());
            }
        }
        
        foreach ($request->items as $item) {
            // Enregistrement des produits de la vente
            $quantite = $item['quantite'];
            $prixUnitaire = $item['prix_unitaire'];
            $montantTotal = $item['montant_total'];

            $montantBrut = $quantite * $prixUnitaire;

            // Éviter division par zéro
            if ($montantBrut > 0) {
                $remise = (1 - ($montantTotal / $montantBrut)) * 100;
            } else {
                $remise = 0;
            }


            VenteProduit::create([
                'vente_id' => $vente->id,
                'produit_id' => $item['produit_id'],
                'quantite' => $quantite,
                'prix_unitaire' => $prixUnitaire,
                'remise' => round($remise, 2),
                'montant_total' => $montantTotal,
            ]);



            // Si c'est un produit, on décrémente le stock
            if (isset($item['produit_id'])) {
                $stock = Stock::where('produit_id', $item['produit_id'])
                    ->first();

                if ($stock) {
                    if ($stock->quantite < $item['quantite']) {
                        throw new \Exception("Stock insuffisant pour le produit ID: {$item['produit_id']}");
                    }

                    $stock->decrement('quantite', $item['quantite']);

                    // Désactiver le stock si on atteint le seuil (optionnel)
                    if ($stock->quantite <= $stock->seuil_alerte) {
                        $stock->update(['actif' => false]);
                    }
                } else {
                    throw new \Exception("Stock non trouvé pour le produit ID: {$item['produit_id']}");
                }
            }
        }
    });
    $vente = Vente::latest()->first();
    return redirect()->back()->with('success', 'Vente enregistrée avec succès');
   
}
public function getRecentVente(Request $request)
{
    $request->validate([
        'vendeur_id' => 'required|exists:users,id',
        
    ]);
    //$vente = Vente::where('vendeur_id', $request->vendeur_id)->latest()->first();
    $vente = Vente::where('vendeur_id', $request->vendeur_id)
    ->orderBy('id', 'DESC') // Second critère de tri au cas où
    ->first();
    return response()->json($vente->id);
}

    public function show(string $vente)
    {
        $vente = Vente::where('ref', $vente)->firstOrFail();
        $vente->load(['client', 'vendeur', 'items.produit']);

        $produits = $vente->items->filter(fn($item) => $item->produit_id);

        // Calculer le montant HT des produits
        $montant_produits_ht = $produits->sum('montant_total');

        // Calculer la TVA (16%)
        $tva = $montant_produits_ht * 0.16;

        // Montant TTC des produits
        $montant_produits_ttc = $montant_produits_ht + $tva;


        // Montant brut total AVEC TVA (produits TTC )
        $montant_brut_total = $montant_produits_ttc;
        return Inertia::render('Ventes/Show', [
            'vente' => $vente,
            'montant_brut_total' => $montant_brut_total,
            'montant_produits_ttc'=>$montant_produits_ttc,
            'tva'=>$tva
        ]);
    }

    public function destroy(Vente $vente)
    {
        $vente->delete();
        return redirect()->route('ventes.index')->with('success', 'Vente supprimée avec succès');
    }


    public function print(Vente $vente)
    { 
        $currency = Currencie::where('is_active', true)->where('code', 'CDF')->first();
        try{
            // Calcul précis de la hauteur (en points - 1mm = 2.83 points)
        $baseHeight = 150; // Hauteur de base en mm (sans articles)
        $perItemHeight = 8; // Hauteur par article en mm
        $totalHeight = $baseHeight + (count($vente->items) * $perItemHeight);
        
        // Conversion mm en points (1mm = 2.83 points)
        $widthInPoints = 80 * 2.83;  // 80mm en points
        $heightInPoints = $totalHeight * 2.83;

        $vente->load(['client'=>function($query){
            $query->select("id","name","ref", "telephone");
        }, 'vendeur'=>function($query){
            $query->select("id", 'name', "ref", "telephone");
        },
        
        'client.fidelite'=>function($query){
            $query->select("id","client_id" ,"points");

        }, 'items.produit', 'VenduePar'=>function($query){
            $query->select('id', 'name');
        }]);
        

        $pdf = PDF::loadView('factures.standard', [
            'vente' => $vente,
            'currency' => $currency,
            'entreprise' => [
                'nom' => 'ASBL Les Pères Carmes Centre Theresianum de Kinshasa  Ordre des Carmes Déchaux',
                'adresse'=>"C.Kintambo, Q. Nganda, AV. Chrétienne 39b",
                'Immatriculation'=>'ASBL : 376/CAB/MIN/J',
                'id_national'=>'01-G4701-N300623',
                'telephone' => "+243826646260",
                'telephone_reception' => "+243892247450",
                'email' => 'cthresianum@gmail.com',
                
            ],
            
        ])->setPaper([0, 0, $widthInPoints, $heightInPoints], 'portrait')
                    ->setOption('margin-top', 0)
                    ->setOption('margin-bottom', 0)
                    ->setOption('margin-left', 0)
                    ->setOption('margin-right', 0);
        }catch(\Exception $e){
            //dd($e->getMessage());
            Log::error($e->getMessage());
        }
        return $pdf->stream('facture-'.$vente->ref.'.pdf');
    }

    
public function edit(string $vente){
    $vente = Vente::where('ref', $vente)->firstOrFail();

    $vente->load(['client', 'vendeur', 'items.produit']);
    $produits = Produit::where('actif', true)
            ->whereHas('stock', function ($query) {
                $query->where('actif', true)
                    ->where('quantite', '>', 0); // Seulement si le stock est > 0
            })
            ->get();
            
        return Inertia::render('Ventes/Edit', [
            'clients' => Client::all(),
            'produits' => $produits,
            'modes_paiement' => ['espèces', 'carte', 'chèque', 'autre'],
            'vente' => $vente,
        ]);
}



public function update(Request $request, $id)
{
    $request->validate([
        'client_id' => 'nullable|exists:clients,id',
        'remise' => 'nullable|numeric|min:0',
        'montant_total' => 'required|numeric|min:0',
        'mode_paiement' => 'required|in:espèces,carte,chèque,autre',
        'reservation_id' => 'nullable|exists:reservations,id',
        'items' => 'required|array|min:1',
        'items.*.id' => 'nullable|exists:vente_produits,id', 
        'items.*.produit_id' => 'nullable|required_without:items.*.service_id|exists:produits,id',
        'items.*.quantite' => 'required|integer|min:1',
        'items.*.prix_unitaire' => 'required|numeric|min:0',
        'items.*.remise' => 'required|numeric|min:0',
        'items.*.montant_total' => 'required|numeric|min:0',
    ]);

    $vente = Vente::findOrFail($id);

    DB::transaction(function () use ($request, $vente) {
        // 1. Récupérer les items actuels de la vente
        $currentItems = $vente->items()->get();
        
        // 2. Restaurer les stocks pour les produits modifiés/supprimés
        foreach ($currentItems as $currentItem) {
            if ($currentItem->produit_id) {
                $stock = Stock::where('produit_id', $currentItem->produit_id)
                    ->first();

                if ($stock) {
                    $stock->increment('quantite', $currentItem->quantite);
                    $stock->update(['actif' => true]);
                }
            }
        }

        // 3. Supprimer tous les items existants
        $vente->items()->delete();

        // 4. Mettre à jour les informations de base de la vente
        $vente->update([
            'client_id' => $request->client_id,
            'remise' => $request->remise,
            'montant_total' => $request->montant_total,
            'mode_paiement' => $request->mode_paiement,
            'reservation_id' => $request->reservation_id,
        ]);

        // 5. Mettre à jour le solde de la caisse (différence entre ancien et nouveau montant)
        $difference = $request->montant_total - $vente->montant_total;
        if ($difference != 0) {
            CaisseHelper::updateSoldeCaisse($vente->caisse_id, abs($difference), $difference > 0 ? 'vente' : 'retrait_vente');
        }

        // 6. Recréer les items avec les nouvelles données
        foreach ($request->items as $item) {
            $quantite = $item['quantite'];
            $prixUnitaire = $item['prix_unitaire'];
            $montantTotal = $item['montant_total'];

            $montantBrut = $quantite * $prixUnitaire;
            $remise = $montantBrut > 0 ? (1 - ($montantTotal / $montantBrut)) * 100 : 0;

            VenteProduit::create([
                'vente_id' => $vente->id,
                'produit_id' => $item['produit_id'] ,
                'quantite' => $quantite,
                'prix_unitaire' => $prixUnitaire,
                'remise' => round($remise, 2),
                'montant_total' => $montantTotal,
            ]);

            // 7. Mettre à jour les stocks pour les nouveaux produits
            if (isset($item['produit_id'])) {
                $stock = Stock::where('produit_id', $item['produit_id'])
                    ->first();

                if ($stock) {
                    if ($stock->quantite < $item['quantite']) {
                        throw new \Exception("Stock insuffisant pour le produit ID: {$item['produit_id']}");
                    }

                    $stock->decrement('quantite', $item['quantite']);

                    if ($stock->quantite <= $stock->seuil_alerte) {
                        $stock->update(['actif' => false]);
                    }
                } else {
                    throw new \Exception("Stock non trouvé pour le produit ID: {$item['produit_id']}");
                }
            }
        }
    });

    return redirect()->back()->with('success', 'Vente mise à jour avec succès');
}


public function statsJournalieres(Request $request)
{
    $date = now()->toDateString();
    $user = $this->user;
    
    if ($user->role === 'vendeur' || $user->role === 'coiffeur') {
        // Récupérer les IDs des ventes du vendeur pour la date
        $venteIds = Vente::where('vendeur_id', $user->id)
            ->whereDate('created_at', $date)
            ->pluck('id');
    } elseif ($user->role === 'admin' || $user->role === 'gerant') {
        // Récupérer toutes les ventes pour la date
        $venteIds = Vente::whereDate('created_at', $date)
            ->pluck('id');
    } else {
        return response()->json([
            'produits' => 0,
            'total' => 0,
            'date' => $date
        ]);
    }


    // Calculer le total des produits (uniquement le montant des items de produit)
    $totalProduits = VenteProduit::whereIn('vente_id', $venteIds)
        ->whereNotNull('produit_id')
        ->sum('montant_total');

    return response()->json([
        'produits' => $totalProduits,
        'total' => $totalProduits,
        'date' => $date
    ]);
}
}