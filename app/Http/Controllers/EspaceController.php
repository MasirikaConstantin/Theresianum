<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEspaceRequest;
use App\Http\Requests\UpdateEspaceRequest;
use App\Models\Espace;
use App\Models\Occupation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class EspaceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'vocation', 'disponible']);
    
    $salles = Espace::query()
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
        return Inertia::render('Espaces/Index', [
            'espaces' => $salles,
            'filters' => $filters,
            'vocations' => ['journee', 'nuit', 'mixte']
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Espaces/Create',[
            'vocations' => ['journee', 'nuit', 'mixte']

        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEspaceRequest $request)
    {
        $validated = $request->validated();

        try {
            Espace::create(array_merge($validated, [
                'ref' => Str::uuid()
            ]));
            
            return redirect()->route('espaces.index')
                ->with('success', 'Espace crée avec succès');
                
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Erreur lors de la création de l\'espace');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $espace)
    {
        $espace = Espace::where("ref",$espace)->firstOrFail();
        // Charger les relations nécessaires
        $espace->load([
            'reservations' => function ($query) {
                $query->orderBy('date_debut', 'desc')
                      ->with(['client', 'occupations']);
            }
        ]);

        // Récupérer les occupations via les réservations
        $occupations = Occupation::whereHas('reservation', function ($query) use ($espace) {
            $query->where('espace_id', $espace->id);
        })
        ->orderBy('date_occupation', 'desc')
        ->limit(7)
        ->get();
        return Inertia::render('Espaces/Show', [
            'espace' => $espace,
            'occupations' => $occupations
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $espace)
    {
        $espace = Espace::where("ref",$espace)->firstOrFail();

        return Inertia::render('Espaces/Edit', [
            'espace' => $espace,
            'vocations' => ['journee', 'nuit', 'mixte']
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEspaceRequest $request, Espace $espace)
    {
        $validated = $request->validated();

        try {
            $espace->update($validated);
            
            return redirect()->route('espaces.index')
                ->with('success', 'Salle modifiée avec succès');
                
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Erreur lors de la modification de la salle');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Espace $espace)
    {
        DB::beginTransaction();
        
        try {
            // Vérifier si la salle a des réservations actives
            if ($espace->reservations()->whereIn('statut', ['confirmee', 'en_attente'])->exists()) {
                return redirect()->back()
                    ->with('error', 'Impossible de supprimer un espace avec des réservations actives');
            }

            $espace->reservations()->delete();
            $espace->delete();
            
            DB::commit();
            
            return redirect()->route('espaces.index')
                ->with('success', 'Espace supprimé avec succès');
                
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Erreur lors de la suppression de l\'espace');
        }
    }
}
