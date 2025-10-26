<?php

namespace App\Http\Controllers;

use App\Helpers\CaisseHelper;
use App\Models\HistoriquePaiement;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Jmrashed\Zkteco\Lib\ZKTeco;

class AcompteController extends Controller
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
            $query = Reservation::acomptes()->with(['client', 'operateur'])
            ->orderBy('created_at', 'desc');
        }elseif($this->user->role === 'caissier' || $this->user->role === 'coiffeur'){
            $query = Reservation::acomptes()->with(['client', 'operateur'])
            ->where('operateur_id', $this->user->id)
            ->orderBy('created_at', 'desc');
        }
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('ref', 'like', "%{$search}%")
                  ->orWhereHas('client', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('client', function($q) use ($search) {
                    $q->where('telephone', 'like', "%{$search}%");
                })
                  ->orWhereHas('operateur', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }
        $reservations = $query->paginate(30);
        return Inertia::render('Acomptes/Index', [
            'reservations' => $reservations,
            'filters' => $request->only(['search']),

        ]);
    }

    public function destroy(string $ref)
    {
        $reservation = Reservation::where('ref', $ref)->first();
        if (!$reservation) {
            return redirect()->back()->with('error', 'Reservation non trouvée');
        }
        $reservation->delete();
        return redirect()->route('acomptes.index')->with('success', 'Reservation supprimée avec succès');
    }

    public function show(string $ref)
    {
        $reservation = Reservation::where('ref', $ref)->firstOrFail();
        $reservation->load(['client', 'operateur']);

       

        // Calculer le montant HT des produits
        $montant_produits_ht = $reservation->prix_total;

        // Calculer la TVA (16%)
        $tva = $montant_produits_ht * 0.16;

        // Montant TTC des produits
        $montant_produits_ttc = $montant_produits_ht + $tva;

        // Montant des services (pas de TVA)
        $montant_services = $reservation->prix_total;

        // Montant brut total AVEC TVA (produits TTC + services)
        $montant_brut_total = $montant_produits_ttc + $montant_services;
        return Inertia::render('Acomptes/Show', [
            'reservation' => $reservation,
            'montant_brut_total' => $montant_brut_total,
            'montant_produits_ttc'=>$montant_produits_ttc,
            'tva'=>$tva
        ]);
    }





   
    public function showPaiement(string $ref)
{
    $reservation = Reservation::where('ref', $ref)->firstOrFail();
    /*if ($vente->statut_paiement === 'payer') {
        return redirect()->route('acomptes.show', $vente->ref)
            ->with('error', 'Cette vente est déjà entièrement payée.');
    }*/

    $historiquePaiements = HistoriquePaiement::where('reservation_id', $reservation->id)
        ->with('operateur')
        ->orderBy('created_at', 'desc')
        ->get();

    return Inertia::render('Acomptes/Paiement', [
        'reservation' => $reservation->load(['client'=>function($query){
            $query->select('id','name','telephone','ref');
        }]),
        'historiquePaiements' => $historiquePaiements,
    ]);
}

public function processPaiement(Request $request, string $ref)
{
   
    $reservation = Reservation::where('ref', $ref)->firstOrFail();
    // Validation
    $request->validate([
        'montant' => [
            'required', 
            'numeric', 
            'min:0.01',
            function ($attribute, $value, $fail) use ($reservation) {
                // Convertir en centimes pour éviter les erreurs flottantes
                $resteAPayerCents = (int) round($reservation->prix_total * 100) - (int) round($reservation->montant_payer * 100);
                $montantCents = (int) round($value * 100);
                
                if ($montantCents > $resteAPayerCents) {
                    $resteAPayer = $resteAPayerCents / 100;
                    $fail("Le montant ne peut pas dépasser le reste à payer : " . number_format($resteAPayer, 4) . " $");
                }
            }
        ],
        'mode_paiement' => 'required|in:espèces,carte,chèque,autre',
    ]);

    DB::transaction(function () use ($request, $reservation) {
        $montant = round($request->montant, 2);
        
        // Travailler en centimes pour les calculs
        $montantTotalCents = (int) round($reservation->prix_total * 100);
        $montantPayeCents = (int) round($reservation->montant_payer * 100);
        $montantCents = (int) round($montant * 100);
        
        $nouveauMontantPayeCents = $montantPayeCents + $montantCents;
        
        // Vérifier si la vente est complètement payée
        $estCompletementPaye = $nouveauMontantPayeCents >= $montantTotalCents;
        
        $estatutPaiement = $estCompletementPaye ? 'paye' : 'non_paye';
        $statutpayer = $estCompletementPaye ? 'confirmer' : 'en_attente';

        
        $reservation->update([
            'montant_payer' => $nouveauMontantPayeCents / 100,
            'statut_paiement' => $estatutPaiement,
            'statut' => $statutpayer
        ]);

        // 2. Créer l'entrée dans l'historique des paiements
        HistoriquePaiement::create([
            'ref' => Str::uuid(),
            'reservation_id' => $reservation->id,
            'operateur_id' => Auth::user()->id,
            'succursale_id' => $reservation->succursale_id,
            'montant' => $montant,
            'mode_paiement' => $request->mode_paiement,
        ]);

        // 3. Mettre à jour la caisse si le mode de paiement n'est pas "autre"
        if ($request->mode_paiement !== 'autre') {
            $caisse = CaisseHelper::getOrCreateDailyCaisse($reservation->succursale_id);
            CaisseHelper::updateSoldeCaisse($caisse->id, $montant, 'paiement_vente');
        } else {
            // Si paiement par points de fidélité
            $client = $reservation->client;
            if ($client && $client->fidelite) {
                $configuration = \App\Models\Configuration::getActiveConfig();
                $pointsUtilises = $montant / $configuration->valeur_point;
                
                $client->fidelite->decrement('points', $pointsUtilises);
            }
        }
    });

    return redirect()->route('acomptes.paiement.show', $reservation->ref)
        ->with('success', 'Paiement enregistré avec succès.');
}


public function historique(Request $request)
{
    $query = HistoriquePaiement::with(['operateur'=>function($query){
        $query->select('id','name','ref');
    }, 'reservation'=>function($query){
        $query->select('id','ref','client_id','chambre_id','salle_id');
    },'reservation.chambre'=>function($query){
        $query->select('id','nom','ref');
    },
    'reservation.salle'=>function($query){
        $query->select('id','nom','ref');
    }])->orderBy('created_at', 'desc');

    if ($request->has('search')) {
        $search = $request->search;
        $query->where(function($q) use ($search) {
            $q->where('ref', 'like', "%{$search}%")
            ->orWhere('montant', 'like', "%{$search}%")
              ->orWhereHas('reservation', function($q) use ($search) {
                  $q->where('ref', 'like', "%{$search}%");
              })
              ->orWhereHas('reservation.salle', function($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                ->orWhereHas('reservation.chambre', function($q) use ($search) {
                    $q->where('nom', 'like', "%{$search}%");
                });
            })
              ->orWhereHas('operateur', function($q) use ($search) {
                  $q->where('name', 'like', "%{$search}%");
              });
        });
    }
    $historiquePaiements = $query->paginate(30);
    
    return Inertia::render('Acomptes/Historique', [
        'historiquePaiements' => $historiquePaiements,
        'filters' => $request->only(['search']),
    ]);
}

public function ztk(){
        $zk = new ZKTeco('10.121.81.33');
        try {
            $connected = $zk->connect();
            $attendanceLog = $zk->getAttendance();
      
            // Get today's date
            $todayDate = date('Y-m-d');
      
            // Filter attendance records for today
            $todayRecords = [];
            foreach ($attendanceLog as $record) {
                // Extract the date from the timestamp
                $recordDate = substr($record['timestamp'], 0, 10);
      
                // Check if the date matches today's date
                if ($recordDate === $todayDate) {
                    $todayRecords[] = $record;
                }
            }
      
            return response()->json([
                "success" => true,
                "error" => false,
                "message" => "Attendance records retrieved successfully",
                "data" => $todayRecords,
                "total" => count($todayRecords)
            ]);
            
        } catch (\Exception $e) {
            Log::error("Erreur ZKTeco pour l'IP 10.121.81.33: " . $e->getMessage());
            
            return response()->json([
                "success" => false,
                "error" => true,
                "message" => $e->getMessage(),
                "data" => []
            ], 500);
        }
}

}
