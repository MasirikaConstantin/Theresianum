<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $query = Client::with(['enregistrePar'=>function($query){
            $query->select('id', 'name');
        }])
            ->orderBy('created_at', 'desc');

        // Ajout de la recherche
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('telephone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $clients = $query->paginate(15);

        return Inertia::render('Clients/Index', [
            'clients' => $clients,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Clients/Create', [
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'telephone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'notes' => 'nullable|string',
            'date_naissance' => 'nullable|date',
        ]);

        Client::create($validated);
        //return back()->with('success', 'Client créé avec succès');
        return redirect()->route('clients.index')->with('success', 'Client créé avec succès');
    }

    

    public function edit(string $ref)
    {
        $client = Client::where('ref', $ref)->first();
        return Inertia::render('Clients/Edit', [
            'client' => $client,
        ]);
    }

    public function update(Request $request, string $ref)
    {
        $client = Client::where('ref', $ref)->first();
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'telephone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'notes' => 'nullable|string',
            'date_naissance' => 'nullable|date',
        ]);

        $client->update($validated);

        return redirect()->route('clients.index')->with('success', 'Client mis à jour avec succès');
    }

    public function destroy(string $ref)
    {
        $client = Client::where('ref', $ref)->first();
        $client->delete();
        return redirect()->route('clients.index')->with('success', 'Client supprimé avec succès');
    }


    public function quickCreate(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:clients,email',
            'telephone' => 'nullable|string|max:20',
            'date_naissance' => 'nullable|date',
        ]);

        $client = Client::create([
            'name' => $request->name,
            'email' => $request->email,
            'telephone' => $request->telephone,
            'date_naissance' => $request->date_naissance,
            'enregistrer_par_id' => Auth::id(), // facultatif mais souvent utile
        ]);

        return response()->json([
            'success' => true,
            'client' => $client,
            'message' => 'Client créé avec succès'
        ]);
    }


    public function show(string $ref)
    {
        $client = Client::with(['enregistre_par', 'fidelite'])
            ->where('ref', $ref)
            ->firstOrFail();

        // Calculer l'âge si date de naissance existe
        if ($client->date_naissance) {
            $client->age = Carbon::parse($client->date_naissance)->age;
        }

        // Statistiques générales
        $statistiquesGenerales = $this->getStatistiquesGenerales($client->id);

        // Données pour les graphiques
        $ventesParMois = $this->getVentesParMois($client->id);
        $produitsPopulaires = $this->getProduitsPopulaires($client->id);
        $modesPaiement = $this->getModesPaiement($client->id);
        $evolutionFidelite = $this->getEvolutionFidelite($client->id);

        return Inertia::render('Clients/Show', [
            'client' => $client,
            'statistiquesGenerales' => $statistiquesGenerales,
            'ventesParMois' => $ventesParMois,
            'produitsPopulaires' => $produitsPopulaires,
            'modesPaiement' => $modesPaiement,
            'evolutionFidelite' => $evolutionFidelite,
        ]);
    }

    private function getStatistiquesGenerales($clientId)
    {
        $stats = DB::table('ventes')
            ->where('client_id', $clientId)
            ->selectRaw('
                COUNT(*) as total_achats,
                SUM(montant_total) as montant_total,
                SUM(remise) as total_remises,
                AVG(montant_total) as panier_moyen
            ')
            ->first();

        return [
            'total_achats' => $stats->total_achats ?? 0,
            'montant_total' => $stats->montant_total ?? 0,
            'montant_total_format' => number_format($stats->montant_total ?? 0, 0, ',', ' ') . ' $',
            'total_remises' => $stats->total_remises ?? 0,
            'total_remises_format' => number_format($stats->total_remises ?? 0, 0, ',', ' ') . ' $',
            'panier_moyen' => $stats->panier_moyen ?? 0,
            'panier_moyen_format' => number_format($stats->panier_moyen ?? 0, 0, ',', ' ') . ' $',
        ];
    }

    private function getVentesParMois($clientId)
    {
        $ventesParMois = DB::table('ventes')
            ->where('client_id', $clientId)
            ->where('created_at', '>=', Carbon::now()->subMonths(12))
            ->selectRaw('
                DATE_FORMAT(created_at, "%Y-%m") as periode,
                DATE_FORMAT(created_at, "%m/%Y") as mois,
                COUNT(*) as nombre_ventes,
                SUM(montant_total) as montant,
                SUM(remise) as remises
            ')
            ->groupBy('periode', 'mois')
            ->orderBy('periode')
            ->get();

        // Créer un tableau avec tous les mois des 12 derniers mois
        $moisComplets = collect();
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $periode = $date->format('Y-m');
            $moisLabel = $date->format('m/Y');
            
            $venteExistante = $ventesParMois->firstWhere('periode', $periode);
            
            $moisComplets->push([
                'mois' => $moisLabel,
                'periode' => $periode,
                'nombre_ventes' => $venteExistante->nombre_ventes ?? 0,
                'montant' => $venteExistante->montant ?? 0,
                'remises' => $venteExistante->remises ?? 0,
            ]);
        }

        return $moisComplets->toArray();
    }

    private function getProduitsPopulaires($clientId)
    {
        return DB::table('vente_produits')
            ->join('ventes', 'vente_produits.vente_id', '=', 'ventes.id')
            ->join('produits', 'vente_produits.produit_id', '=', 'produits.id')
            ->where('ventes.client_id', $clientId)
            ->selectRaw('
                produits.name as produit_nom,
                SUM(vente_produits.quantite) as quantite_totale,
                COUNT(DISTINCT ventes.id) as nombre_achats,
                SUM(vente_produits.montant_total) as montant_total
            ')
            ->groupBy('produits.id', 'produits.name')
            ->orderByDesc('quantite_totale')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'produit_nom' => $item->produit_nom,
                    'quantite_totale' => $item->quantite_totale,
                    'nombre_achats' => $item->nombre_achats,
                    'montant_total' => $item->montant_total,
                ];
            })
            ->toArray();
    }

    private function getModesPaiement($clientId)
    {
        $modes = DB::table('ventes')
            ->where('client_id', $clientId)
            ->selectRaw('
                mode_paiement,
                COUNT(*) as count,
                SUM(montant_total) as montant_total
            ')
            ->groupBy('mode_paiement')
            ->orderByDesc('count')
            ->get();

        return $modes->map(function ($mode) {
            return [
                'mode_paiement' => $this->formatModePaiement($mode->mode_paiement),
                'count' => $mode->count,
                'montant_total' => $mode->montant_total,
            ];
        })->toArray();
    }

    private function getEvolutionFidelite($clientId)
    {
        // Récupérer toutes les ventes du client triées par date
        $ventes = DB::table('ventes')
            ->where('client_id', $clientId)
            ->selectRaw('
                DATE(created_at) as date,
                SUM(montant_total) as montant_journalier
            ')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $evolutionPoints = collect();
        $pointsCumules = 0;

        foreach ($ventes as $vente) {
            // Supposons 1 point pour chaque 1000 $ dépensés
            $pointsGagnes = floor($vente->montant_journalier / 1000);
            $pointsCumules += $pointsGagnes;

            $evolutionPoints->push([
                'date' => Carbon::parse($vente->date)->format('d/m'),
                'points_gagnes' => $pointsGagnes,
                'points_cumules' => $pointsCumules,
                'montant_journalier' => $vente->montant_journalier,
            ]);
        }

        // Garder seulement les 20 dernières entrées pour la lisibilité
        return $evolutionPoints->take(-20)->values()->toArray();
    }

    private function formatModePaiement($mode)
    {
        $modes = [
            'cash' => 'Espèces',
            'card' => 'Carte',
            'mobile_money' => 'Mobile Money',
            'cheque' => 'Chèque',
            'virement' => 'Virement',
            'credit' => 'Crédit',
        ];

        return $modes[$mode] ?? ucfirst($mode);
    }



}