<?php

namespace App\Http\Controllers;
use Carbon\Carbon;

use App\Models\Client;
use App\Models\Espace;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReservationEspacesController extends Controller
{
    //ReservationsEspaces
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'statut']);
        
        $reservations = Reservation::with(['client:id,name,telephone', 'espace'])
            ->where('type_reservation', 'espace') // Uniquement les espaces
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('ref', 'like', '%'.$search.'%')
                      ->orWhereHas('client', function ($q) use ($search) {
                          $q->where('nom', 'like', '%'.$search.'%')
                            ->orWhere('prenom', 'like', '%'.$search.'%');
                      })
                      ->orWhereHas('espace', function ($q) use ($search) {
                          $q->where('nom', 'like', '%'.$search.'%');
                      });
                });
            })
            ->when(
                isset($filters['statut']) && $filters['statut'] !== 'all',
                function ($query) use ($filters) {
                    $query->where('statut', $filters['statut']);
                }
            )
            ->orderBy('created_at', 'desc')
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('ReservationsEspaces/Index', [
            'reservations' => $reservations,
            'filters' => $filters,
            'statuts' => ['confirmee', 'en_attente', 'annulee', 'terminee']
        ]);
    }

    public function create(Request $request)
{
    $espaceID = $request->get('espace_id');

    $espaces = Espace::where('disponible', true)->get();
    $clients = Client::orderBy('name')->select('id','ref','name', 'email', 'telephone')->get();
    $reservations = Reservation::whereNotNull('espace_id')
        ->where(function ($q) {
            $q->where('date_debut', '>=', now());
        })->select('id', 'client_id', 'espace_id', 'date_debut', 'date_fin', 'statut', 'prix_total', 'ref')
        ->get();

    return Inertia::render('ReservationsEspaces/Create', [
        'espaces' => $espaces,
        'clients' => $clients,
        'prefilledEspaceId' => $espaceID,
        'vocations' => ['journee', 'nuit'],
        'reservations' => $reservations->load(['espace' => function($query) {
            $query->select('id', 'nom');
        }])
    ]);
}

    public function store(Request $request)
    {
        try{
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'heure_debut' => 'required|date_format:H:i',
            'heure_fin' => 'required|date_format:H:i',
            'espace_id' => 'required|exists:espaces,id',
            'vocation' => 'required|in:journee,nuit',
            'prix_total' => 'required|numeric',
            'statut' => 'required|in:confirmee,en_attente,annulee,terminee'
        ]);
    } catch (\Exception $e) {
        dd($e->getMessage());
        DB::rollBack();
        return redirect()->back()
            ->with('error', 'Erreur lors de la création de la réservation: ' . $e->getMessage());
    }
        // Validation manuelle pour les heures sur la même journée
        if ($validated['date_debut'] === $validated['date_fin'] && 
            $validated['heure_debut'] >= $validated['heure_fin']) {
            return redirect()->back()
                ->withErrors(['heure_fin' => 'L\'heure de fin doit être postérieure à l\'heure de début pour une réservation sur la même journée.'])
                ->withInput();
        }

        DB::beginTransaction();

        try {
            // Combiner date et heure
            $validated['date_debut'] = $validated['date_debut'] . ' ' . $validated['heure_debut'];
            $validated['date_fin'] = $validated['date_fin'] . ' ' . $validated['heure_fin'];
            $validated['type_reservation'] = 'espace'; // Toujours une espace

            // Vérifier la disponibilité
            if (!$this->verifierDisponibilite($validated)) {
                return redirect()->back()
                    ->with('error', 'La espace n\'est pas disponible pour cette période')
                    ->withInput();
            }

            // Calcul du prix total

            $prixTotal = $validated['prix_total'];// $this->calculerPrixTotal($validated);

            // Création de la réservation
            $reservation = Reservation::create(($validated));

            DB::commit();

            return redirect()->route('espaces-reservations.index')
                ->with('success', 'Réservation créée avec succès');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Erreur lors de la création de la réservation: ' . $e->getMessage());
        }
    }

    public function show(string $reservation)
    {
        $reservation = Reservation::where('ref', $reservation)->first();
        
        $reservation->load(['historique','historique.operateur','client', 'espace','chambre','ventes'=>function($query){
            $query->with('client');
        }]);

        return Inertia::render('Reservations/Show', [
            'reservation' => $reservation
        ]);
    }


    public function edit(string $reservation)
    {
        $reservation = Reservation::where('ref', $reservation)->first();
        $espaces = Espace::where('disponible', true)->get();
        $clients = Client::orderBy('name')->get();
        
        // Récupérer toutes les réservations à venir (y compris celle en cours d'édition)
        $reservations = Reservation::whereNotNull('espace_id')
            ->where(function ($q) {
                $q->where('date_debut', '>=', now());
            })->select('id', 'client_id', 'espace_id', 'date_debut', 'date_fin', 'statut', 'prix_total', 'ref', 'vocation')
            ->get();

        return Inertia::render('Reservations/Edit', [
            'espaces' => $espaces,
            'clients' => $clients,
            'vocations' => ['journee', 'nuit'],
            'reservations' => $reservations->load(['espace' => function($query) {
                $query->select('id', 'nom');
            }]),
            'reservation' => $reservation->load(['espace', 'client'])
        ]);
    }

    public function update(Request $request, Reservation $reservation)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'heure_debut' => 'required|date_format:H:i',
            'heure_fin' => 'required|date_format:H:i',
            'espace_id' => 'required|exists:espaces,id',
            'vocation' => 'required|in:journee,nuit',
            'statut' => 'required|in:confirmee,en_attente,annulee,terminee'
        ]);

        DB::beginTransaction();
        try {
            // Combiner date et heure
            $validated['date_debut'] = $validated['date_debut'] . ' ' . $validated['heure_debut'];
            $validated['date_fin'] = $validated['date_fin'] . ' ' . $validated['heure_fin'];
            
            // Vérifier la disponibilité (en excluant la réservation actuelle)
            if (!$this->verifierDisponibiliteSalle($validated, $reservation->id)) {
                return redirect()->back()
                    ->with('error', 'La espace n\'est pas disponible pour cette période')
                    ->withInput();
            }

            // Calcul du prix total
            $prixTotal = $this->calculerPrixTotalSalle($validated);

            // Mise à jour de la réservation
            $reservation->update(array_merge($validated, [
                'prix_total' => $prixTotal
            ]));

            DB::commit();

            return redirect()->route('espaces-reservations.index')
                ->with('success', 'Réservation mise à jour avec succès');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Erreur lors de la mise à jour de la réservation: ' . $e->getMessage())
                ->withInput();
        }
    }

    private function verifierDisponibiliteSalle(array $data, $excludeReservationId = null): bool
    {
        $query = Reservation::where('espace_id', $data['espace_id'])
            ->where('statut', '!=', 'annulee')
            ->where(function ($query) use ($data) {
                $query->whereBetween('date_debut', [$data['date_debut'], $data['date_fin']])
                    ->orWhereBetween('date_fin', [$data['date_debut'], $data['date_fin']])
                    ->orWhere(function ($q) use ($data) {
                        $q->where('date_debut', '<=', $data['date_debut'])
                            ->where('date_fin', '>=', $data['date_fin']);
                    });
            });

        if ($excludeReservationId) {
            $query->where('id', '!=', $excludeReservationId);
        }

        return !$query->exists();
    }

    private function calculerPrixTotalSalle(array $data): float
    {
        $espace = Espace::find($data['espace_id']);
        $dateDebut = Carbon::parse($data['date_debut']);
        $dateFin = Carbon::parse($data['date_fin']);
        
        // Calcul précis en prenant en compte les heures
        $diffTime = $dateFin->diffInSeconds($dateDebut);
        $jours = ceil($diffTime / (24 * 3600)); // Arrondi au supérieur
        
        // Au moins 1 jour
        $jours = max(1, $jours);
        
        $prixParJour = $data['vocation'] === 'journee' ? $espace->prix_journee : $espace->prix_nuit;
        
        return $jours * $prixParJour;
    }

    public function destroy(Reservation $reservation)
    {
        // S'assurer que c'est une réservation de espace
        if ($reservation->type_reservation !== 'espace') {
            abort(404);
        }

        try {
            $reservation->delete();
            
            return redirect()->route('espaces-reservations.index')
                ->with('success', 'Réservation supprimée avec succès');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Erreur lors de la suppression de la réservation');
        }
    }
    public function updateStatus(Reservation $reservation, Request $request)
    {
        /*/ S'assurer que c'est une réservation de espace
        if ($reservation->type_reservation !== 'espace') {
            abort(404);
        }*/


        $request->validate([
            'statut' => 'required|in:confirmee,en_attente,annulee,terminee'
        ]);

        try {
            $reservation->update(['statut' => $request->statut]);
            
            return redirect()->back()
                ->with('success', 'Statut de la réservation mis à jour');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Erreur lors de la mise à jour du statut');
        }
    }

    private function verifierDisponibilite(array $data, $excludeReservationId = null): bool
    {
        $query = Reservation::where('espace_id', $data['espace_id'])
            ->where('statut', '!=', 'annulee')
            ->where(function ($query) use ($data) {
                $query->whereBetween('date_debut', [$data['date_debut'], $data['date_fin']])
                      ->orWhereBetween('date_fin', [$data['date_debut'], $data['date_fin']])
                      ->orWhere(function ($q) use ($data) {
                          $q->where('date_debut', '<=', $data['date_debut'])
                            ->where('date_fin', '>=', $data['date_fin']);
                      });
            });

        if ($excludeReservationId) {
            $query->where('id', '!=', $excludeReservationId);
        }

        return !$query->exists();
    }

    /*private function calculerPrixTotal(array $data): float
{
    $espace = Espace::find($data['espace_id']);
    $prixParJour = $data['vocation'] === 'journee' ? $espace->prix_journee : $espace->prix_nuit;
    
    $dateDebut = Carbon::parse($data['date_debut']);
    $dateFin = Carbon::parse($data['date_fin']);
    
    // Correction du calcul des jours
    $jours = $dateDebut->diffInDays($dateFin);
    
    // Si c'est la même journée ou si la fin est après le début, on compte au moins 1 jour
    if ($jours === 0 || $dateFin->gt($dateDebut)) {
        $jours = $jours + 1;
    }
    
    // Alternative plus simple :
    // $jours = $dateDebut->diffInDays($dateFin) + 1;
    
    return $jours * $prixParJour;
}*/
public function updateStatusPaiement(Request $request)
{
    $validated = $request->validate([
        'reservation_id' => 'required|exists:reservations,id',
        'statut_paiement' => 'required|in:paye,non_paye',
        'type_paiement' => 'required|in:espece,cheque,virement'
    ]);

    try {
        $reservation = Reservation::findOrFail($validated['reservation_id']);
        
        // Mettre à jour les informations de paiement
        if($validated['statut_paiement'] == 'paye') {
            $reservation->update([
                'statut_paiement' => $validated['statut_paiement'],
                'type_paiement' => $validated['type_paiement'],
                'montant_payer' => $reservation->prix_total
            ]);
        }else{
            $reservation->update([
                'statut_paiement' => $validated['statut_paiement'],
                'type_paiement' => $validated['type_paiement'],
            ]);
        }

        return redirect()->back()
            ->with('success', 'Statut de paiement mis à jour avec succès');

    } catch (\Exception $e) {
        return redirect()->back()
            ->with('error', 'Erreur lors de la mise à jour: ' . $e->getMessage());
    }
}

public function print($reservation)
{
   
    $reservation = Reservation::where('ref', $reservation)->first();
    if($reservation?->chambre_id ) {
        $reservation->load(['client', 'chambre','ventes'=>function($query){
            $query->with('client');
        }]);
    }elseif($reservation?->espace_id){
        $reservation->load(['client', 'espace','ventes'=>function($query){
            $query->with('client');
        }]);
    }
    

    return Inertia::render('ReservationsChambres/print', [
        'reservation' => $reservation
    ]);
}
}
