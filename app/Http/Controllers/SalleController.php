<?php

namespace App\Http\Controllers;

use App\Models\Salle;
use App\Models\Occupation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SalleController extends Controller
{
    public function index(Request $request)
{
    $filters = $request->only(['search', 'vocation', 'disponible']);
    
    $salles = Salle::query()
        ->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('nom', 'like', '%'.$search.'%')
                  ->orWhere('equipements', 'like', '%'.$search.'%');
            });
        })
        ->when(
            isset($filters['vocation']) && $filters['vocation'] !== 'all',
            function ($query) use ($filters) {
                $query->where('vocation', $filters['vocation']);
            }
        )
        ->when(
            isset($filters['disponible']) && $filters['disponible'] !== 'all',
            function ($query) use ($filters) {
                $query->where('disponible', $filters['disponible']);
            }
        )
        ->orderBy('nom')
        ->paginate(30)
        ->withQueryString();

    return Inertia::render('Salles/Index', [
        'salles'    => $salles,
        'filters'   => $filters,
        'vocations' => ['journee', 'nuit', 'mixte']
    ]);
}


    public function create()
    {
        return Inertia::render('Salles/Create', [
            'vocations' => ['journee', 'nuit', 'mixte']
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'capacite_max' => 'required|integer|min:1',
            'vocation' => 'required|in:journee,nuit,mixte',
            'prix_journee' => 'required|numeric|min:0',
            'prix_nuit' => 'required|numeric|min:0',
            'equipements' => 'required|string',
            'disponible' => 'boolean'
        ]);

        try {
            Salle::create(array_merge($validated, [
                'ref' => Str::uuid()
            ]));
            
            return redirect()->route('salles.index')
                ->with('success', 'Salle créée avec succès');
                
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Erreur lors de la création de la salle');
        }
    }

    public function show(string $salle)
    {
        $salle = Salle::where("ref",$salle)->firstOrFail();
        // Charger les relations nécessaires
        $salle->load([
            'reservations' => function ($query) {
                $query->orderBy('date_debut', 'desc')
                      ->with(['client', 'occupations']);
            }
        ]);

        // Récupérer les occupations via les réservations
        $occupations = Occupation::whereHas('reservation', function ($query) use ($salle) {
            $query->where('salle_id', $salle->id);
        })
        ->orderBy('date_occupation', 'desc')
        ->limit(7)
        ->get();

        return Inertia::render('Salles/Show', [
            'salle' => $salle,
            'occupations' => $occupations
        ]);
    }

    public function edit(string $salle)
    {
        $salle = Salle::where("ref",$salle)->firstOrFail();

        return Inertia::render('Salles/Edit', [
            'salle' => $salle,
            'vocations' => ['journee', 'nuit', 'mixte']
        ]);
    }

    public function update(Request $request, Salle $salle)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'capacite_max' => 'required|integer|min:1',
            'vocation' => 'required|in:journee,nuit,mixte',
            'prix_journee' => 'required|numeric|min:0',
            'prix_nuit' => 'required|numeric|min:0',
            'equipements' => 'required|string',
            'disponible' => 'boolean'
        ]);

        try {
            $salle->update($validated);
            
            return redirect()->route('salles.index')
                ->with('success', 'Salle modifiée avec succès');
                
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Erreur lors de la modification de la salle');
        }
    }

    public function destroy(Salle $salle)
    {
        DB::beginTransaction();
        
        try {
            // Vérifier si la salle a des réservations actives
            if ($salle->reservations()->whereIn('statut', ['confirmee', 'en_attente'])->exists()) {
                return redirect()->back()
                    ->with('error', 'Impossible de supprimer une salle avec des réservations actives');
            }

            $salle->reservations()->delete();
            $salle->delete();
            
            DB::commit();
            
            return redirect()->route('salles.index')
                ->with('success', 'Salle supprimée avec succès');
                
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Erreur lors de la suppression de la salle');
        }
    }

    public function updateStatus(Salle $salle, Request $request)
    {
        $request->validate([
            'disponible' => 'required|boolean'
        ]);

        try {
            $salle->update(['disponible' => $request->disponible]);
            
            return redirect()->back()
                ->with('success', 'Statut de la salle mis à jour');
                
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Erreur lors de la mise à jour du statut');
        }
    }
}