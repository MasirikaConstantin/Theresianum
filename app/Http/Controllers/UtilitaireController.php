<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Produit;
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

class UtilitaireController extends Controller
{
    public function index(Request $request)
    {
        $query = Produit::where('type', 'a_utiliser')->with(['user'])
            ->orderBy('name', 'asc');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $produits = $query->paginate(10);

        return Inertia::render('Utilitaires/Index', [
            'utilitaires' => $produits,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Utilitaires/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'avatar' => 'nullable|image|max:2048',
            'description' => 'nullable|string',
            'prix_achat' => 'required|numeric|min:0',
            'prix_vente' => 'required|numeric|min:0',
            'actif' => 'boolean',
            'type' => 'required|string',
        ]);

        $produit = Produit::create($validated);

        if ($request->hasFile('avatar')) {
            $produit->update([
                'avatar' => $request->file('avatar')->store('produits', 'public'),
            ]);
        }

        return redirect()->route('utilitaires.index')->with('success', 'Produit créé avec succès');
    }

    public function show(string $produit)
    {
        $produit = Produit::where('ref', $produit)->first();
        $produit->load(['user']);
        return Inertia::render('Utilitaires/Show', [
            'produit' => $produit,
        ]);
    }

    public function edit(string $produit)
    {
        $produit = Produit::where('ref', $produit)->first();
        return Inertia::render('Utilitaires/Edit', [
            'produit' => $produit,
        ]);
    }

    public function update(Request $request, string $produit)
{
    $produit = Produit::where('id', $produit)->first();
    try {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'avatar' => 'nullable|image|max:2048',
            'description' => 'nullable|string',
            'prix_achat' => 'required|numeric|min:0',
            'prix_vente' => 'required|numeric|min:0',
            'actif' => 'required|boolean',
            'type' => 'required|string',
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
    $produit->type = $validated['type'];

   

    $produit->save();

    return redirect()->route('utilitaires.index')->with([
        'success' => 'Produit mis à jour avec succès',
       
    ]);
}

    public function destroy(string $produit)
    {
        $produit = Produit::where('ref', $produit)->first();
        if($produit->avatar){
            Storage::delete($produit->avatar);
        }
        $produit->delete();

        return redirect()->route('utilitaires.index')->with('success', 'Produit supprimé avec succès');
    }
    
    public function updateStatus(Request $request, Produit $produit)
    {
        $produit->update([
            'actif' => $request->actif,
        ]);
        return redirect()->route('utilitaires.index')->with('success', 'Statut du produit mis à jour avec succès');
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

        // Statistiques de base
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

        // Nouvelles stats par succursale
        $ventesParSuccursale = VenteProduit::where('produit_id', $produit->id)
            ->whereHas('vente', fn($q) => $q->whereBetween('created_at', [$dateDebut, $dateFin]))
            ->select(
                'succursales.id',
                'succursales.nom',
                DB::raw('SUM(vente_produits.quantite) as total_quantite'),
                DB::raw('SUM(vente_produits.quantite * vente_produits.prix_unitaire) as total_ca'),
                DB::raw('SUM(vente_produits.quantite * (vente_produits.prix_unitaire - '.$produit->prix_achat.')) as marge')
            )
            ->join('ventes', 'vente_produits.vente_id', '=', 'ventes.id')
            ->join('succursales', 'ventes.succursale_id', '=', 'succursales.id')
            ->groupBy('succursales.id', 'succursales.nom')
            ->orderBy('total_quantite', 'desc')
            ->get();

        $data = [
            'produit' => $produit,
            'stats' => $stats,
            'ventes_par_periode' => $ventesParPeriode,
            'ventes_par_succursale' => $ventesParSuccursale,
            'date_debut' => $dateDebut->format('d/m/Y'),
            'date_fin' => $dateFin->format('d/m/Y')
        ];

        if ($request->has('export') && $request->export === 'pdf') {
             // Calcul précis de la hauteur (en points - 1mm = 2.83 points)
            $baseHeight = 175; // Hauteur de base en mm (sans articles)
            $perItemHeight = 6; // Hauteur par article en mm
            $totalHeight = $baseHeight + (count($data['ventes_par_succursale']) * $perItemHeight);
            
            // Conversion mm en points (1mm = 2.83 points)
            $widthInPoints = 80 * 2.83;  // 80mm en points
            $heightInPoints = $totalHeight * 2.83;
            $renderer = new ImageRenderer(
                new RendererStyle(100),
                new SvgImageBackEnd()
            );
            $writer = new Writer($renderer);
        
            $qrWeb = 'data:image/svg+xml;base64,' . base64_encode($writer->writeString('https://bellahairmakeup.com/'));  
            $qrFacebook = 'data:image/svg+xml;base64,' . base64_encode($writer->writeString('https://web.facebook.com/Bellawedding1'));  
            $qrInstagram = 'data:image/svg+xml;base64,' . base64_encode($writer->writeString('https://www.instagram.com/bella__hair_makeup/'));  
       
            $pdf = Pdf::loadView('pdf.produit-stats', [
                'data'=>$data,
                'entreprise' => [
                    'nom' => 'BELLA HAIR MAKEUP',
                    'rccm'=>'23-A-07022',
                    'id_national'=>'01-G4701-N300623',
                    //'adresse' => optional($vendeur->succursale)->adresse ?? 'Aucune adresse',
                    'telephone' => "+243970054889",
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
            return $pdf->stream('statistiques-produit-'.$produit->id.'.pdf');
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
