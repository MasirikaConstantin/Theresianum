<?php

namespace App\Http\Controllers;

use App\Models\Depense;
use App\Models\Caisse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DepenseController extends Controller
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
    public function index()
{
    $user = $this->user;
    
    $query = Depense::with([
        'caisse:id,ref', 
        'user:id,name'
    ]);
    
    // Si l'utilisateur n'est PAS admin, on applique les filtres
    if ($user->role === 'admin' || $user->role === 'gerant') { 
    }elseif($user->role === 'vendeur' || $user->role === 'coiffeur'){
        $query->where('user_id', $user->id);
    }
    
    $depenses = $query->latest()->paginate(30);

    return Inertia::render('Depenses/Index', [
        'depenses' => $depenses
    ]);
}
    

    public function create()
    {
        $user = $this->user;
        
        if($user->role === 'vendeur' || $user->role === 'coiffeur' || $user->role === 'aucun'){
            $caisses = Caisse::where('statut', 'ouverte')->get();
        }else{
            $caisses = Caisse::where('statut', 'ouverte')->get();
        }

        return Inertia::render('Depenses/Create', [
            'caisses' => $caisses
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'caisse_id' => 'required|exists:caisses,id',
            'libelle' => 'required|string|max:255',
            'montant' => 'required|numeric|min:0.01',
            'description' => 'nullable|string'
        ]);

        $depense = Depense::create([
            ...$validated,
            'user_id' => $this->user->id,
            'ref' => \Illuminate\Support\Str::uuid()
        ]);

        // Mettre à jour le solde de la caisse
        $caisse = Caisse::find($validated['caisse_id']);
        $caisse->decrement('solde', $validated['montant']);

        return redirect()->route('depenses.show', $depense->ref)
            ->with('success', 'Dépense enregistrée avec succès');
    }

    public function show(string $depense)
    {   
        $depense = Depense::where('ref', $depense)->first();
        $depense->load(['caisse', 'user']);

        return Inertia::render('Depenses/Show', [
            'depense' => $depense
        ]);
    }

    public function destroy(Depense $depense)
    {
        // Rembourser la caisse avant suppression
        $depense->caisse()->increment('solde', $depense->montant);
        
        $depense->delete();

        return redirect()->route('depenses.index')
            ->with('success', 'Dépense supprimée avec succès');
    }
}