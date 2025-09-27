<?php

namespace App\Http\Controllers;

use App\Helpers\CaisseHelper;
use App\Models\Caisse;
use Barryvdh\DomPDF\Facade\Pdf;

use App\Models\Client;
use App\Models\Configuration;
use App\Models\Produit;
use App\Models\Service;
use App\Models\StockSuccursale;
use App\Models\Succursale;
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
            $query = Vente::with(['client', 'succursale', 'vendeur', 'items.produit', 'items.service'])
            ->orderBy('created_at', 'desc');
        }/*elseif($this->user->role === 'gerant'){
            $query = Vente::with(['client', 'succursale', 'vendeur', 'items.produit', 'items.service'])
            ->where('succursale_id', $this->user->succursale_id)
            ->orderBy('created_at', 'desc');
        }*/elseif($this->user->role === 'caissier' || $this->user->role === 'coiffeur'){
            $query = Vente::with(['client', 'succursale', 'vendeur', 'items.produit', 'items.service'])
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
        $succursaleId = auth()->user()->succursale_id;
        
        $produits = Produit::where('actif', true)
            ->where('type', 'a_vendre')
            ->whereHas('stock_succursales', function ($query) use ($succursaleId) {
                $query->where('succursale_id', $succursaleId)
                    ->where('actif', true)
                    ->where('quantite', '>', 0); // Seulement si le stock est > 0
            })
            ->with(['stock_succursales' => function($query) use ($succursaleId) {
                $query->where('succursale_id', $succursaleId);
            }])
            ->get();
            
        return Inertia::render('Ventes/Create', [
            'clients' => Client::with(['fidelite'=>function($query){
                $query->select("id", 'ref', 'points', 'client_id');
            }])->select('id','name','telephone','email','ref')->get(),
            'succursales' => Succursale::select('id', 'nom')->get(),
            'produits' => $produits,
            "configuration"=>Configuration::getActiveConfig(),
            'services' => Service::where('actif', true)->get(),
            'modes_paiement' => ['espèces', 'carte', 'chèque', 'autre'],
        ]);
    }

    public function store(Request $request)
{
        $request->validate([
            'client_id' => 'nullable|exists:clients,id',
            'succursale_id' => 'required|exists:succursales,id',
            'remise' => 'nullable|numeric|min:0',
            'montant_total' => 'required|numeric|min:0',
            'mode_paiement' => 'required|in:espèces,carte,chèque,autre',
            'items' => 'required|array|min:1',
            'items.*.produit_id' => 'nullable|required_without:items.*.service_id|exists:produits,id',
            'items.*.service_id' => 'nullable|required_without:items.*.produit_id|exists:services,id',
            'items.*.quantite' => 'required|integer|min:1',
            'items.*.prix_unitaire' => 'required|numeric|min:0',
            'items.*.remise' => 'required|numeric|min:0',
            'items.*.montant_total' => 'required|numeric|min:0',
        ],[
            'succursale_id.required' => 'Vous devez appartenir à une succursale pour effectuer une vente.'
        ]);
        $vente = new Vente();
    DB::transaction(function () use ($request) {
        // 1. Trouver ou créer la caisse ouverte pour cette succursale
        $caisse = CaisseHelper::getOrCreateDailyCaisse($request->succursale_id);
        // Création de la vente
        $vente = Vente::create([
            'client_id' => $request->client_id,
            'succursale_id' => $request->succursale_id,
            'remise' => $request->remise,
            'montant_total' => $request->montant_total,
            'mode_paiement' => $request->mode_paiement,
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
            // Enregistrement des produits/services de la vente
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
                'produit_id' => $item['produit_id'] ?? null,
                'service_id' => $item['service_id'] ?? null,
                'quantite' => $quantite,
                'prix_unitaire' => $prixUnitaire,
                'remise' => round($remise, 2), // par exemple 15.00
                'montant_total' => $montantTotal,
            ]);



            // Si c'est un produit, on décrémente le stock
            if (isset($item['produit_id'])) {
                $stock = StockSuccursale::where('produit_id', $item['produit_id'])
                    ->where('succursale_id', $request->succursale_id)
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
                    throw new \Exception("Stock non trouvé pour le produit ID: {$item['produit_id']} et la succursale ID: {$request->succursale_id}");
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
        $vente->load(['client', 'succursale', 'vendeur', 'items.produit', 'items.service']);

        $produits = $vente->items->filter(fn($item) => $item->produit_id);
        $services = $vente->items->filter(fn($item) => $item->service_id);

        // Calculer le montant HT des produits
        $montant_produits_ht = $produits->sum('montant_total');

        // Calculer la TVA (16%)
        $tva = $montant_produits_ht * 0.16;

        // Montant TTC des produits
        $montant_produits_ttc = $montant_produits_ht + $tva;

        // Montant des services (pas de TVA)
        $montant_services = $services->sum('montant_total');

        // Montant brut total AVEC TVA (produits TTC + services)
        $montant_brut_total = $montant_produits_ttc + $montant_services;
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
    { ini_set('memory_limit', '256M');

        try{
            // Calcul précis de la hauteur (en points - 1mm = 2.83 points)
        $baseHeight = 180; // Hauteur de base en mm (sans articles)
        $perItemHeight = 8; // Hauteur par article en mm
        $totalHeight = $baseHeight + (count($vente->items) * $perItemHeight);
        
        // Conversion mm en points (1mm = 2.83 points)
        $widthInPoints = 80 * 2.83;  // 80mm en points
        $heightInPoints = $totalHeight * 2.83;

        $vente->load(['client'=>function($query){
            $query->select("id","name","ref", "telephone", 'succursale_id');
        }, 'vendeur'=>function($query){
            $query->select("id", 'name', "ref", "telephone", "succursale_id");
        },
        
        'client.fidelite'=>function($query){
            $query->select("id","client_id" ,"points");

        }, 'items.produit', 'items.service','VenduePar'=>function($query){
            $query->select('id', 'name','succursale_id');
        },'succursale'=>function($query){
            $query->select('id', 'nom','adresse','telephone');
        }]);
        $renderer = new ImageRenderer(
            new RendererStyle(100),
            new SvgImageBackEnd()
        );
        $writer = new Writer($renderer);

        $qrWeb = 'data:image/svg+xml;base64,' . base64_encode($writer->writeString('https://bellahairmakeup.com/'));  
        $qrFacebook = 'data:image/svg+xml;base64,' . base64_encode($writer->writeString('https://web.facebook.com/Bellawedding1'));  
        $qrInstagram = 'data:image/svg+xml;base64,' . base64_encode($writer->writeString('https://www.instagram.com/bella__hair_makeup/'));  
        $pdf = PDF::loadView('factures.standard', [
            'vente' => $vente,
            'entreprise' => [
                'nom' => 'BELLA HAIR MAKEUP',
                'rccm'=>'23-A-07022',
                'id_national'=>'01-G4701-N300623',
                'adresse' => $vente->succursale->adresse,
                'telephone' => $vente->succursale? $vente->succursale->telephone :  "+243970054889",
                'email' => 'info@bellahairmakeup.com',
                
            ],
            'qrWeb' => $qrWeb,
            'qrFacebook' => $qrFacebook,
            'qrInstagram' => $qrInstagram
        ])->setPaper([0, 0, $widthInPoints, $heightInPoints], 'portrait')
                    ->setOption('margin-top', 0)
                    ->setOption('margin-bottom', 0)
                    ->setOption('margin-left', 0)
                    ->setOption('margin-right', 0);
        }catch(\Exception $e){
            dd($e->getMessage());
            Log::error($e->getMessage());
        }
        return $pdf->stream('facture-'.$vente->ref.'.pdf');
    }
public function edit(string $vente){
    $vente = Vente::where('ref', $vente)->firstOrFail();

    $succursaleId = auth()->user()->succursale_id;
    $vente->load(['client', 'succursale', 'vendeur', 'items.produit', 'items.service']);
    $produits = Produit::where('actif', true)
            ->where('type', 'a_vendre')
            ->whereHas('stock_succursales', function ($query) use ($succursaleId) {
                $query->where('succursale_id', $succursaleId)
                    ->where('actif', true)
                    ->where('quantite', '>', 0); // Seulement si le stock est > 0
            })
            ->with(['stock_succursales' => function($query) use ($succursaleId) {
                $query->where('succursale_id', $succursaleId);
            }])
            ->get();
            
        return Inertia::render('Ventes/Edit', [
            'clients' => Client::all(),
            'succursales' => Succursale::select('id', 'nom')->get(),
            'produits' => $produits,
            'services' => Service::where('actif', true)->get(),
            'modes_paiement' => ['espèces', 'carte', 'chèque', 'autre'],
            'vente' => $vente,
        ]);
}



public function update(Request $request, $id)
{
    $request->validate([
        'client_id' => 'nullable|exists:clients,id',
        'succursale_id' => 'required|exists:succursales,id',
        'remise' => 'nullable|numeric|min:0',
        'montant_total' => 'required|numeric|min:0',
        'mode_paiement' => 'required|in:espèces,carte,chèque,autre',
        'items' => 'required|array|min:1',
        'items.*.id' => 'nullable|exists:vente_produits,id', // Pour les items existants
        'items.*.produit_id' => 'nullable|required_without:items.*.service_id|exists:produits,id',
        'items.*.service_id' => 'nullable|required_without:items.*.produit_id|exists:services,id',
        'items.*.quantite' => 'required|integer|min:1',
        'items.*.prix_unitaire' => 'required|numeric|min:0',
        'items.*.remise' => 'required|numeric|min:0',
        'items.*.montant_total' => 'required|numeric|min:0',
    ], [
        'succursale_id.required' => 'Vous devez appartenir à une succursale pour effectuer une vente.'
    ]);

    $vente = Vente::findOrFail($id);

    DB::transaction(function () use ($request, $vente) {
        // 1. Récupérer les items actuels de la vente
        $currentItems = $vente->items()->get();
        
        // 2. Restaurer les stocks pour les produits modifiés/supprimés
        foreach ($currentItems as $currentItem) {
            if ($currentItem->produit_id) {
                $stock = StockSuccursale::where('produit_id', $currentItem->produit_id)
                    ->where('succursale_id', $vente->succursale_id)
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
            'succursale_id' => $request->succursale_id,
            'remise' => $request->remise,
            'montant_total' => $request->montant_total,
            'mode_paiement' => $request->mode_paiement,
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
                'produit_id' => $item['produit_id'] ?? null,
                'service_id' => $item['service_id'] ?? null,
                'quantite' => $quantite,
                'prix_unitaire' => $prixUnitaire,
                'remise' => round($remise, 2),
                'montant_total' => $montantTotal,
            ]);

            // 7. Mettre à jour les stocks pour les nouveaux produits
            if (isset($item['produit_id'])) {
                $stock = StockSuccursale::where('produit_id', $item['produit_id'])
                    ->where('succursale_id', $request->succursale_id)
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
                    throw new \Exception("Stock non trouvé pour le produit ID: {$item['produit_id']} et la succursale ID: {$request->succursale_id}");
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
    
    if ($user->role === 'caissier' || $user->role === 'coiffeur') {
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
            'services' => 0,
            'produits' => 0,
            'total' => 0,
            'date' => $date
        ]);
    }

    // Calculer le total des services (uniquement le montant des items de service)
    $totalServices = VenteProduit::whereIn('vente_id', $venteIds)
        ->whereNotNull('service_id')
        ->sum('montant_total');

    // Calculer le total des produits (uniquement le montant des items de produit)
    $totalProduits = VenteProduit::whereIn('vente_id', $venteIds)
        ->whereNotNull('produit_id')
        ->sum('montant_total');

    return response()->json([
        'services' => $totalServices,
        'produits' => $totalProduits,
        'total' => $totalServices + $totalProduits,
        'date' => $date
    ]);
}
}