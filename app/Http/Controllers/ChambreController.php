<?php

namespace App\Http\Controllers;

use App\Models\Chambre;
use App\Models\Occupation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ChambreController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'type', 'statut']);
        
        $chambres = Chambre::query()
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('numero', 'like', '%'.$search.'%')
                      ->orWhere('type', 'like', '%'.$search.'%')
                      ->orWhere('equipements', 'like', '%'.$search.'%');
                });
            })
            ->when($filters['type'] ?? null, function ($query, $type) {
                $query->where('type', $type);
            })
            ->when($filters['statut'] ?? null, function ($query, $statut) {
                $query->where('statut', $statut);
            })
            ->orderBy('numero')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Chambres/Index', [
            'chambres' => $chambres,
            'filters' => $filters,
            'types' => ['simple', 'double', 'suite', 'familiale'],
            'statuts' => ['disponible', 'occupee', 'nettoyage', 'maintenance']
        ]);
    }

    public function create()
    {
        return Inertia::render('Chambres/Create', [
            'types' => ['simple', 'double', 'suite', 'familiale']
        ]);
    }

    public function store(Request $request)
    {
        try {
        $validated = $request->validate([
            'numero' => 'required|string|unique:chambres,numero',
            'nom' => 'required|string|min:2|max:255',
            'type' => 'required|in:simple,double,suite,familiale',
            'prix' => 'required|numeric|min:0',
            'capacite' => 'required|integer|min:1',
            'equipements' => 'nullable|string',
            'statut' => 'required|in:disponible,occupee,nettoyage,maintenance'
        ]);

        
            Chambre::create($validated);
            
            return redirect()->route('chambres.index')
                ->with('success', 'Chambre créée avec succès');
                
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

// app/Http/Controllers/ChambreController.php
public function show(string $ref)
{
    $chambre = Chambre::where('ref', $ref)->first();
    // Charger les relations nécessaires
    $chambre->load([
        'reservations' => function ($query) {
            $query->orderBy('date_debut', 'desc')
                  ->with(['client', 'occupations']); // Charger aussi les occupations
        }
    ]);

    // Récupérer les occupations via les réservations
    $occupations = Occupation::whereHas('reservation', function ($query) use ($chambre) {
        $query->where('chambre_id', $chambre->id);
    })
    ->orderBy('date_occupation', 'desc')
    ->limit(7)
    ->get();

    return Inertia::render('Chambres/Show', [
        'chambre' => $chambre,
        'occupations' => $occupations
    ]);
}

    public function edit(string $ref)
    {
        $chambre = Chambre::where('ref', $ref)->first();
        return Inertia::render('Chambres/Edit', [
            'chambre' => $chambre,
            'types' => ['simple', 'double', 'suite', 'familiale'],
            'statuts' => ['disponible', 'occupee', 'nettoyage', 'maintenance']
        ]);
    }

    public function update(Request $request, string $ref)
    {
        $chambre = Chambre::where('ref', $ref)->first();
        $validated = $request->validate([
            'numero' => 'required|string|unique:chambres,numero,'.$chambre->id,
            'nom' => 'required|string|min:2|max:255',
            'type' => 'required|in:simple,double,suite,familiale',
            'prix' => 'required|numeric|min:0',
            'capacite' => 'required|integer|min:1',
            'equipements' => 'nullable|string',
            'statut' => 'required|in:disponible,occupee,nettoyage,maintenance'
        ]);

        try {
            $chambre->update($validated);
            
            return redirect()->route('chambres.index')
                ->with('success', 'Chambre modifiée avec succès');
                
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Erreur lors de la modification de la chambre');
        }
    }

    public function destroy(Chambre $chambre)
    {
        DB::beginTransaction();
        
        try {
            // Vérifier si la chambre a des réservations actives
            if ($chambre->reservations()->whereIn('statut', ['confirmee', 'en_attente'])->exists()) {
                return redirect()->back()
                    ->with('error', 'Impossible de supprimer une chambre avec des réservations actives');
            }

            $chambre->reservations()->delete();
            $chambre->occupations()->delete();
            $chambre->delete();
            
            DB::commit();
            
            return redirect()->route('chambres.index')
                ->with('success', 'Chambre supprimée avec succès');
                
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Erreur lors de la suppression de la chambre');
        }
    }

    public function updateStatus(Chambre $chambre, Request $request)
    {
        $request->validate([
            'statut' => 'required|in:disponible,occupee,nettoyage,maintenance'
        ]);

        try {
            $chambre->update(['statut' => $request->statut]);
            
            return redirect()->back()
                ->with('success', 'Statut de la chambre mis à jour');
                
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Erreur lors de la mise à jour du statut');
        }
    }
}