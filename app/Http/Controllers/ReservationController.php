<?php

namespace App\Http\Controllers;

use App\Models\Chambre;
use App\Models\Occupation;
use App\Models\Reservation;
use App\Models\Salle;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReservationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Reservation $reservation)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Reservation $reservation)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Reservation $reservation)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Reservation $reservation)
    {
        //
    }


    public function verifierDisponibilite(Request $request)
    {
        $request->validate([
            'type' => 'required|in:chambre,salle_fete',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after:date_debut',
            'vocation' => 'required_if:type,salle_fete|in:journee,nuit'
        ]);

        if ($request->type === 'chambre') {
            $chambres = Chambre::where('statut', 'disponible')
                ->get()
                ->filter(function($chambre) use ($request) {
                    return $chambre->estDisponible($request->date_debut, $request->date_fin);
                });

            return response()->json(['chambres_disponibles' => $chambres]);
        } else {
            $salles = Salle::where('disponible', true)
                ->get()
                ->filter(function($salle) use ($request) {
                    return $salle->estDisponible($request->date_debut, $request->vocation);
                });

            return response()->json(['salles_disponibles' => $salles]);
        }
    }

    public function creerReservation(Request $request)
    {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'type_reservation' => 'required|in:chambre,salle_fete',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after:date_debut',
            'chambre_id' => 'required_if:type_reservation,chambre|exists:chambres,id',
            'salle_fete_id' => 'required_if:type_reservation,salle_fete|exists:salles_fetes,id',
            'vocation' => 'required_if:type_reservation,salle_fete|in:journee,nuit'
        ]);

        DB::beginTransaction();

        try {
            $reservation = new Reservation($request->all());
            
            if ($request->type_reservation === 'chambre') {
                $chambre = Chambre::find($request->chambre_id);
                if (!$chambre->estDisponible($request->date_debut, $request->date_fin)) {
                    return response()->json(['error' => 'Chambre non disponible'], 400);
                }
            } else {
                $salle = Salle::find($request->salle_fete_id);
                $reservation->specifications = ['vocation' => $request->vocation];
            }

            $reservation->prix_total = $reservation->calculerPrixTotal();
            $reservation->save();

            // Créer les occupations pour les chambres
            if ($request->type_reservation === 'chambre') {
                $this->creerOccupations($reservation);
            }

            DB::commit();

            return response()->json(['reservation' => $reservation], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function creerOccupations(Reservation $reservation)
    {
        $dateDebut = Carbon::parse($reservation->date_debut);
        $dateFin = Carbon::parse($reservation->date_fin);

        for ($date = $dateDebut; $date->lt($dateFin); $date->addDay()) {
            Occupation::create([
                'reservation_id' => $reservation->id,
                'chambre_id' => $reservation->chambre_id,
                'date_occupation' => $date->format('Y-m-d'),
                'statut' => 'occupee'
            ]);
        }

        // Mettre à jour le statut de la chambre
        $reservation->chambre->update(['statut' => 'occupee']);
    }
}
