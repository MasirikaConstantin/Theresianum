<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Chambre;
use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ReservationChambreController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'statut']);
        
        $reservations = Reservation::with(['client', 'chambre'])
            ->where('type_reservation', 'chambre')
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('ref', 'like', '%'.$search.'%')
                      ->orWhereHas('client', function ($q) use ($search) {
                          $q->where('name', 'like', '%'.$search.'%');
                      })
                      ->orWhereHas('chambre', function ($q) use ($search) {
                          $q->where('numero', 'like', '%'.$search.'%');
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

        return Inertia::render('ReservationsChambres/Index', [
            'reservations' => $reservations,
            'filters' => $filters,
            'statuts' => ['confirmee', 'en_attente', 'annulee', 'terminee']
        ]);
    }

    public function create(Request $request)
    {
        $chambreId = $request->get('chambre_id');

        $chambres = Chambre::where('statut', 'disponible')->get();
        $clients = Client::orderBy('name')->get();

        return Inertia::render('ReservationsChambres/Create', [
            'chambres' => $chambres,
            'clients' => $clients,
            'prefilledChambreId' => $chambreId
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'heure_debut' => 'required|date_format:H:i',
            'heure_fin' => 'required|date_format:H:i',
            'chambre_id' => 'required|exists:chambres,id',
            'statut' => 'required|in:confirmee,en_attente,annulee,terminee'
        ]);

        // Validation manuelle pour les heures sur la même journée
        if ($validated['date_debut'] === $validated['date_fin'] && 
            $validated['heure_debut'] >= $validated['heure_fin']) {
            return redirect()->back()
                ->withErrors(['heure_fin' => 'L\'heure de départ doit être postérieure à l\'heure d\'arrivée pour une réservation sur la même journée.'])
                ->withInput();
        }

        DB::beginTransaction();

        try {
            // Combiner date et heure
            $validated['date_debut'] = $validated['date_debut'] . ' ' . $validated['heure_debut'];
            $validated['date_fin'] = $validated['date_fin'] . ' ' . $validated['heure_fin'];
            $validated['type_reservation'] = 'chambre';
            $validated['vocation'] = 'mixte';

            // Vérifier la disponibilité
            if (!$this->verifierDisponibilite($validated)) {
                return redirect()->back()
                    ->with('error', 'La chambre n\'est pas disponible pour cette période')
                    ->withInput();
            }

            // Calcul du prix total
            $prixTotal = $this->calculerPrixTotal($validated);

            // Création de la réservation
            $reservation = Reservation::create(array_merge($validated, [
                'prix_total' => $prixTotal,
                'ref' => Str::uuid()
            ]));

            // Mettre à jour le statut de la chambre
            Chambre::find($validated['chambre_id'])->update(['statut' => 'occupee']);

            DB::commit();

            return redirect()->route('reservations-chambres.index')
                ->with('success', 'Réservation créée avec succès');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Erreur lors de la création de la réservation: ' . $e->getMessage());
        }
    }

    public function show(string $ref)
    {
        $reservations_chambre = Reservation::where('ref', $ref)->first();

        /*if ($reservations_chambre->type_reservation !== 'chambre') {
            abort(404);
        }*/

        $reservations_chambre->load(['client', 'chambre']);

        return Inertia::render('ReservationsChambres/Show', [
            'reservation' => $reservations_chambre
        ]);
    }

    public function edit(Reservation $reservations_chambre)
    {
        if ($reservations_chambre->type_reservation !== 'chambre') {
            abort(404);
        }

        $chambres = Chambre::all();
        $clients = Client::orderBy('name')->get();

        $reservations_chambre->load(['client', 'chambre']);

        // Extraire les dates et heures pour l'édition
        $dateDebut = Carbon::parse($reservations_chambre->date_debut);
        $dateFin = Carbon::parse($reservations_chambre->date_fin);

        $reservations_chambre->heure_debut = $dateDebut->format('H:i');
        $reservations_chambre->heure_fin = $dateFin->format('H:i');
        $reservations_chambre->date_debut_only = $dateDebut->format('Y-m-d');
        $reservations_chambre->date_fin_only = $dateFin->format('Y-m-d');

        return Inertia::render('ReservationsChambres/Edit', [
            'reservation' => $reservations_chambre,
            'chambres' => $chambres,
            'clients' => $clients,
            'statuts' => ['confirmee', 'en_attente', 'annulee', 'terminee']
        ]);
    }

    public function update(Request $request, Reservation $reservations_chambre)
    {
        if ($reservations_chambre->type_reservation !== 'chambre') {
            abort(404);
        }

        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'heure_debut' => 'required|date_format:H:i',
            'heure_fin' => 'required|date_format:H:i',
            'chambre_id' => 'required|exists:chambres,id',
            'statut' => 'required|in:confirmee,en_attente,annulee,terminee'
        ]);

        // Validation manuelle pour les heures sur la même journée
        if ($validated['date_debut'] === $validated['date_fin'] && 
            $validated['heure_debut'] >= $validated['heure_fin']) {
            return redirect()->back()
                ->withErrors(['heure_fin' => 'L\'heure de départ doit être postérieure à l\'heure d\'arrivée pour une réservation sur la même journée.'])
                ->withInput();
        }

        DB::beginTransaction();

        try {
            // Combiner date et heure
            $validated['date_debut'] = $validated['date_debut'] . ' ' . $validated['heure_debut'];
            $validated['date_fin'] = $validated['date_fin'] . ' ' . $validated['heure_fin'];

            // Vérifier la disponibilité (exclure la réservation actuelle)
            if (!$this->verifierDisponibilite($validated, $reservations_chambre->id)) {
                return redirect()->back()
                    ->with('error', 'La chambre n\'est pas disponible pour cette période')
                    ->withInput();
            }

            // Calcul du prix total
            $prixTotal = $this->calculerPrixTotal($validated);

            // Mise à jour de la réservation
            $reservations_chambre->update(array_merge($validated, [
                'prix_total' => $prixTotal
            ]));

            DB::commit();

            return redirect()->route('reservations-chambres.index')
                ->with('success', 'Réservation modifiée avec succès');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Erreur lors de la modification de la réservation: ' . $e->getMessage());
        }
    }

    public function destroy(Reservation $reservations_chambre)
    {
        if ($reservations_chambre->type_reservation !== 'chambre') {
            abort(404);
        }

        DB::beginTransaction();

        try {
            // Libérer la chambre
            if ($reservations_chambre->chambre_id) {
                $reservations_chambre->chambre->update(['statut' => 'disponible']);
            }
            
            // Supprimer la réservation
            $reservations_chambre->delete();

            DB::commit();

            return redirect()->route('reservations-chambres.index')
                ->with('success', 'Réservation supprimée avec succès');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Erreur lors de la suppression de la réservation');
        }
    }

    public function updateStatus(Reservation $reservations_chambre, Request $request)
    {
        if ($reservations_chambre->type_reservation !== 'chambre') {
            abort(404);
        }

        $request->validate([
            'statut' => 'required|in:confirmee,en_attente,annulee,terminee'
        ]);

        try {
            $reservations_chambre->update(['statut' => $request->statut]);

            // Si le statut devient "annulee" ou "terminee", libérer la chambre
            if (in_array($request->statut, ['annulee', 'terminee']) && $reservations_chambre->chambre_id) {
                $reservations_chambre->chambre->update(['statut' => 'disponible']);
            }

            return redirect()->back()
                ->with('success', 'Statut de la réservation mis à jour');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Erreur lors de la mise à jour du statut');
        }
    }

    private function verifierDisponibilite(array $data, $excludeReservationId = null): bool
    {
        $query = Reservation::where('chambre_id', $data['chambre_id'])
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

    private function calculerPrixTotal(array $data): float
    {
        $chambre = Chambre::find($data['chambre_id']);
        $dateDebut = Carbon::parse($data['date_debut']);
        $dateFin = Carbon::parse($data['date_fin']);
        
        // Calcul précis en prenant en compte les heures
        $diffTime = $dateFin->diffInSeconds($dateDebut);
        $nuits = ceil($diffTime / (24 * 3600)); // Arrondi au supérieur
        
        // Au moins 1 nuit
        $nuits = max(1, $nuits);
        
        return $nuits * $chambre->prix;
    }
}