<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use App\Models\Produit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Models\VenteProduit;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Barryvdh\DomPDF\Facade\Pdf;

class ProduitController extends Controller
{
    public function index(Request $request)
    {
        $query = Produit::with(['user','categorie'=>function($q){
            $q->select('id', 'nom');
        }])
            ->orderBy('name', 'asc');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $produits = $query->paginate(10);

        return Inertia::render('Produits/Index', [
            'produits' => $produits,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Produits/Create', [
            'categories' => Categorie::select('id', 'nom')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'prix_achat' => 'required|numeric|min:0',
            'prix_vente' => 'required|numeric|min:0',
            'actif' => 'boolean',
            'categorie_id' => 'nullable|exists:categories,id',
            ]);

        $produit = Produit::create($validated);

        return redirect()->route('produits.index')->with('success', 'Produit créé avec succès');
    }

    public function show(string $produit)
    {
        $produit = Produit::where('ref', $produit)->first();
        $produit->load(['user','categorie'=>function($q){
            $q->select('id', 'nom');
        }]);
        return Inertia::render('Produits/Show', [
            'produit' => $produit,
        ]);
    }

    public function edit(string $produit)
    {
        $produit = Produit::where('ref', $produit)->first();
        return Inertia::render('Produits/Edit', [
            'produit' => $produit,
            'categories' => Categorie::select('id', 'nom')->get(),
        ]);
    }

    public function update(Request $request, Produit $produit)
{
    try {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'prix_achat' => 'required|numeric|min:0',
            'prix_vente' => 'required|numeric|min:0',
            'actif' => 'required|boolean',
            'categorie_id' => 'nullable|exists:categories,id',
        ]);
    
    } catch (\Exception $e) {
        dd($e);
        return redirect()->back()->withErrors($e->getMessage());
    }
    // Mettre à jour les champs standards
    $produit->name = $validated['name'];
    $produit->description = $validated['description'];
    $produit->prix_achat = $validated['prix_achat'];
    $produit->prix_vente = $validated['prix_vente'];
    $produit->actif = $validated['actif'];
    $produit->categorie_id = $validated['categorie_id'];

    $produit->save();

    return redirect()->route('produits.index')->with([
        'success' => 'Produit mis à jour avec succès',
        // Conserver les données du formulaire en cas de redirection
        'data' => $request->except('avatar')
    ]);
}

    public function destroy(string $produit)
    {
        $produit = Produit::where('ref', $produit)->first();
        $produit->delete();

        return redirect()->route('produits.index')->with('success', 'Produit supprimé avec succès');
    }
    
    public function updateStatus(Request $request, Produit $produit)
    {
        $produit->update([
            'actif' => $request->actif,
        ]);
        return redirect()->route('produits.index')->with('success', 'Statut du produit mis à jour avec succès');
    }

    public function stats(Request $request)
{
    $request->validate([
        'produit_id' => 'required|exists:produits,id',
        'date_debut' => 'nullable|date',
        'date_fin' => 'nullable|date|after_or_equal:date_debut'
    ]);

    $produit = Produit::find($request->produit_id);

    // Période par défaut (ce mois)
    $dateDebut = $request->date_debut ? Carbon::parse($request->date_debut) : now()->startOfMonth();
    $dateFin = $request->date_fin ? Carbon::parse($request->date_fin) : now()->endOfMonth();

    $stats = [
        'total_vendu' => VenteProduit::where('produit_id', $produit->id)
            ->whereHas('vente', fn($q) => $q->whereBetween('created_at', [$dateDebut, $dateFin]))
            ->sum('quantite'),
        'chiffre_affaires' => VenteProduit::where('produit_id', $produit->id)
            ->whereHas('vente', fn($q) => $q->whereBetween('created_at', [$dateDebut, $dateFin]))
            ->sum(DB::raw('quantite * prix_unitaire')),
        'marge' => VenteProduit::where('produit_id', $produit->id)
            ->whereHas('vente', fn($q) => $q->whereBetween('created_at', [$dateDebut, $dateFin]))
            ->sum(DB::raw('quantite * (prix_unitaire - '.$produit->prix_achat.')')),
    ];

    // Ventes par période pour le graphique
    $ventesParPeriode = VenteProduit::where('produit_id', $produit->id)
        ->whereHas('vente', fn($q) => $q->whereBetween('created_at', [$dateDebut, $dateFin]))
        ->select(
            DB::raw('DATE(ventes.created_at) as date'),
            DB::raw('SUM(quantite) as total_quantite'),
            DB::raw('SUM(quantite * prix_unitaire) as total_ca')
        )
        ->join('ventes', 'vente_produits.vente_id', '=', 'ventes.id')
        ->groupBy('date')
        ->orderBy('date')
        ->get();

   

    $data = [
        'produit' => $produit,
        'stats' => $stats,
        'ventes_par_periode' => $ventesParPeriode,
        'date_debut' => $dateDebut,
        'date_fin' => $dateFin
    ];

    // Si on demande un export PDF
    if ($request->has('export') && $request->export === 'pdf') {
        return Inertia::render('Produits/Stats', [
        'data' => $data,
        'entreprise' => [
            'nom1' => "ASBL Les Pères Carmes",
            "nom2"=> "Centre Theresianum de Kinshasa",
            "nom3"=>'Ordre des Carmes Déchaux',
            'adresse'=>"C.Kintambo, Q. Nganda, AV. Chrétienne 39b",
            'Immatriculation'=>'ASBL : 376/CAB/MIN/J',
            'telephone' => "+243826646260",
            'telephone_reception' => "+243892247450",
            'email' => 'cthresianum@gmail.com',
            'logo_url' => asset('images/logo.png'),
        ],
        
    ]);
    }
    return response()->json($data);

    
}
public function list(Request $request)
{
    
    $produits = Produit::orderBy('name', 'asc')->get();
    return Inertia::render('Statistiques/Produits', [
        'produits' => $produits,
    ]);
}
}