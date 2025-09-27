<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\User;
use App\Models\VenteProduit;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Service::with(['user'=>function($query){
            $query->select('id','name');
        }])
            ->orderBy('name', 'asc');

        // Ajout de la recherche
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $services = $query->paginate(25);

        return Inertia::render('Services/Index', [
            'services' => $services,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Services/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'duree_minutes' => 'required|integer|min:1',
            'prix' => 'required|numeric|min:0',
            'actif' => 'boolean',
        ]);

        Service::create($validated);

        return redirect()->route('services.index')->with('success', 'Service créé avec succès');
    }

    public function show(string $service)
    {
        $service = Service::where('ref', $service)->first();
        $service->load(['user'=>function($query){
            $query->select('id','name','ref');
        }]);
        return Inertia::render('Services/Show', [
            'service' => $service,
        ]);
    }

    public function edit(string $ref)
    {
        $service = Service::where('ref', $ref)->first();
        return Inertia::render('Services/Edit', [
            'service' => $service,
        ]);
    }

    public function update(Request $request, Service $service)
    {

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'duree_minutes' => 'required|integer|min:1',
            'prix' => 'required|numeric|min:0',
            'actif' => 'boolean',
        ]);

        $service->update($validated);

        return redirect()->route('services.index')->with('success', 'Service mis à jour avec succès');
    }

    public function updateStatus(Request $request, Service $service)
    {
        $validated = $request->validate([
            'actif' => 'boolean',
        ]);

        $service->update([
            'actif' => $validated['actif'],
        ]);

        return redirect()->route('services.index')->with('success', 'Statut du service mis à jour avec succès');
    }
    
    public function destroy(string $ref)
    {
        $service = Service::where('ref', $ref)->first();
        $service->delete();
        return redirect()->route('services.index')->with('success', 'Service supprimé avec succès');
    }
    
    public function getUpdateImage(Request $request, string $ref)
    {
        $service = Service::where('ref', $ref)->first();
        return Inertia::render('Services/UpdateImage', [
            'service' => $service,
        ]);
    }
    public function updateImage(Request $request, string $ref)
    {
        $service = Service::where('ref', $ref)->firstOrFail();
        // Augmente temporairement les limites
    ini_set('upload_max_filesize', '16M');
    ini_set('post_max_size', '16M');
    ini_set('memory_limit', '32M');
        try {
          
            $validated = $request->validate([
                'image' => 'required|image|mimes:jpeg,JPEG,png,PNG,jpg,JPG,gif,GIF,webp,WEBP|max:15048',
            ]);
        } catch (\Exception $e) {
            \Log::error('Upload failed', [
                'error' => $request->file('image')->getErrorMessage(),
                'clientOriginalName' => $request->file('image')->getClientOriginalName(),
                'size' => $request->file('image')->getSize(),
            ]);
            return redirect()->back()->with('error', 'Une erreur est survenue lors de la validation de l\'image.'.$e->getMessage());
        }
    
        // Suppression de l'ancienne image si elle existe
        if ($service->image) {
            Storage::disk('public')->delete($service->image);
        }
    
        // Stockage de la nouvelle image (retourne le chemin relatif)
        $imagePath = $request->file('image')->store('services', 'public');
        
        // On stocke uniquement le chemin relatif dans la BDD
        $service->update([
            'image' => $imagePath, // Ex: "services/6Nan6k2uRs74zKqmiPJ6qwiIfA6JtY119AQ54g5r.png"
        ]);
    
        return redirect()
               ->route('services.show', $service->ref)
               ->with('success', 'Image mise à jour avec succès');
    }


    public function list(Request $request)
{
    
    $services = Service::orderBy('name', 'asc')->get();
    
    return Inertia::render('Statistiques/Services', [
        'services' => $services,
    ]);
}

public function stats(Request $request)
{
    ini_set('memory_limit', '256M');
    $request->validate([
        'service_id' => 'required|exists:services,id',
        'date_debut' => 'nullable|date',
        'date_fin' => 'nullable|date|after_or_equal:date_debut'
    ]);

    $service = Service::find($request->service_id);

    // Période par défaut (ce mois)
    $dateDebut = $request->date_debut ? Carbon::parse($request->date_debut) : now()->startOfMonth();
    $dateFin = $request->date_fin ? Carbon::parse($request->date_fin) : now()->endOfMonth();

    $stats = [
        'total_vendu' => VenteProduit::where('service_id', $service->id)
            ->whereHas('vente', fn($q) => $q->whereBetween('created_at', [$dateDebut, $dateFin]))
            ->sum('quantite'),
        'chiffre_affaires' => VenteProduit::where('service_id', $service->id)
            ->whereHas('vente', fn($q) => $q->whereBetween('created_at', [$dateDebut, $dateFin]))
            ->sum(DB::raw('quantite * prix_unitaire')),
        'marge' => VenteProduit::where('service_id', $service->id)
            ->whereHas('vente', fn($q) => $q->whereBetween('created_at', [$dateDebut, $dateFin]))
            ->sum(DB::raw('quantite * (prix_unitaire - '.$service->prix.')')),
    ];

    // Ventes par période pour le graphique
    $ventesParPeriode = VenteProduit::where('service_id', $service->id)
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
    $ventesParSuccursale = VenteProduit::where('service_id', $service->id)
        ->whereHas('vente', fn($q) => $q->whereBetween('created_at', [$dateDebut, $dateFin]))
        ->select(
            'succursales.id',
            'succursales.nom',
            DB::raw('SUM(vente_produits.quantite) as total_quantite'),
            DB::raw('SUM(vente_produits.quantite * vente_produits.prix_unitaire) as total_ca'),
            DB::raw('SUM(vente_produits.quantite * (vente_produits.prix_unitaire - '.$service->prix.')) as marge')
        )
        ->join('ventes', 'vente_produits.vente_id', '=', 'ventes.id')
        ->join('succursales', 'ventes.succursale_id', '=', 'succursales.id')
        ->groupBy('succursales.id', 'succursales.nom')
        ->orderBy('total_quantite', 'desc')
        ->get();

    $data = [
        'service' => $service,
        'stats' => $stats,
        'ventes_par_periode' => $ventesParPeriode,
        'ventes_par_succursale' => $ventesParSuccursale,
        'date_debut' => $dateDebut->format('Y-m-d'),
        'date_fin' => $dateFin->format('Y-m-d')
    ];

    // Si on demande un export PDF
    if ($request->has('export') && $request->export === 'pdf') {
        return Inertia::render('Services/Stats', [
            'data' => $data,
            'entreprise' => [
                'nom' => 'BELLA HAIR MAKEUP',
                'rccm' => '23-A-07022',
                'id_national' => '01-G4701-N300623',
                'telephone' => "+243970054889",
                'adresse' => 'Galerie Saint Pierre Avenue Colonel Mondjiba, 374 Kinshasa Ngaliema',
                'logo_url' => asset('images/logo.png'),
                'email' => 'info@bellahairmakeup.com',
            ],
            'qrWeb' => $qrWeb ?? '',
            'qrFacebook' => $qrFacebook ?? '',
            'qrInstagram' => $qrInstagram ?? ''
        ]);
    }

    return response()->json($data);
}
}