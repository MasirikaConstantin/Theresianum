<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\Succursale;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AgentController extends Controller
{
    public function index(Request $request)
{
    ini_set('memory_limit', '256M');
        $query = Agent::query()
            ->with([
                'succursale:id,nom'
            ])
            ->orderBy('created_at', 'desc')
            ->select([
                'id',
                'ref',
                'matricule',
                'nom',
                'postnom',
                'prenom',
                'email',
                'role',
                'statut',
                'succursale_id'
            ]);

        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('nom', 'like', "%{$request->search}%")
                  ->orWhere('postnom', 'like', "%{$request->search}%")
                  ->orWhere('prenom', 'like', "%{$request->search}%")
                  ->orWhere('matricule', 'like', "%{$request->search}%");
            });
        }

        $agents = $query->paginate(20);

        return Inertia::render('Agents/Index', [
            'agents' => $agents,
            'filters' => $request->only(['search']),
        ]);
}

    public function create()
    {
        return Inertia::render('Agents/Create', [
            'succursales' => Succursale::all(),
        ]);
    }

    public function store(Request $request)
    {
            try{
                $validated = $request->validate([
                    'nom' => 'required|string|max:255',
                    'postnom' => 'required|string|max:255',
                    'prenom' => 'required|string|max:255',
                    'sexe' => 'required|string|in:M,F',
                    'telephone' => 'nullable|string|max:20',
                    'adresse' => 'nullable|string',
                    'date_naissance' => 'nullable|date',
                    'lieu_naissance' => 'nullable|string',
                    'numero_cnss' => 'nullable|string|max:255',
                    'etat_civil' => 'nullable|string',
                    'province_origine' => 'nullable|string',
                    'territoire_origine' => 'nullable|string',
                    'district_origine' => 'nullable|string',
                    'commune_origine' => 'nullable|string',
                    'email' => 'required|email|unique:agents',
                    'role' => 'nullable|string',
                    'succursale_id' => 'nullable|exists:succursales,id',
                    'statut' => 'required|string',
                    'avatar' => 'nullable|image|max:2048',
                    'signature' => 'nullable|image|max:2048',
                    'nombre_enfant' => 'nullable|numeric',
                ]);
            }catch(Exception $e){
                dd($e->getMessage());
            }
        
        $validated['matricule'] = 'AGT' . rand(1000, 9999);
        if ($request->hasFile('avatar')) {
            $validated['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        if ($request->hasFile('signature')) {
            $validated['signature'] = $request->file('signature')->store('signatures', 'public');
        }

        Agent::create($validated);
    

        return redirect()->route('personnels.index')->with('success', 'Agent créé avec succès.');
    }

    public function show(string $ref)
    {
        $agent = Agent::where('ref', $ref)->first();
        
        return Inertia::render('Agents/Show', [
            'agent' => $agent->load(['createdBy'=>function($query){
                $query->select('id', 'name','ref');
            }, 'updatedBy'=>function($query){
                $query->select('id', 'name','ref');
            }, 'succursale'=>function($query){
                $query->select('id', 'nom','ref');
            }, 'contrats'=>function($query){
                $query->orderBy('created_at', 'desc');
            },'contrats.createdBy'=>function($query){
                $query->select('id', 'name','ref');
            },'contrats.updatedBy'=>function($query){
                $query->select('id', 'name','ref');
            },'contrats.succursale'=>function($query){
                $query->select('id', 'nom','ref');
            }]),
        ]);
    }

    public function edit(string $ref)
    {
        $agent = Agent::where('ref', $ref)->first();
        return Inertia::render('Agents/Edit', [
            'agent' => $agent,
            'succursales' => Succursale::select('id', 'nom','ref')->get(),
        ]);
    }

    public function update(Request $request, string $ref)
    {
        ini_set('memory_limit', '256M');
        $agent = Agent::where('ref', $ref)->first();
try{
    $validated = $request->validate([
        'nom' => 'required|string|max:255',
        'postnom' => 'required|string|max:255',
        'prenom' => 'required|string|max:255',
        'sexe' => 'required|string|in:M,F',
        'numero_cnss' => 'nullable|string|max:255',
        'telephone' => 'nullable|string|max:20',
        'adresse' => 'nullable|string',
        'date_naissance' => 'nullable|date',
        'lieu_naissance' => 'nullable|string',
        'etat_civil' => 'nullable|string',
        'province_origine' => 'nullable|string',
        'territoire_origine' => 'nullable|string',
        'district_origine' => 'nullable|string',
        'commune_origine' => 'nullable|string',
        'email' => 'required|email|unique:agents,email,' . $agent->id,
        'role' => 'nullable|string',
        'succursale_id' => 'nullable|exists:succursales,id',
        'statut' => 'required|string',
        'avatar' => 'nullable|image|max:2048',
        'signature' => 'nullable|image|max:2048',
        'nombre_enfant' => 'nullable|integer',
    ]);
}catch(Exception $e){
    dd($e);
}

        if ($request->hasFile('avatar')) {
            $validated['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        if ($request->hasFile('signature')) {
            $validated['signature'] = $request->file('signature')->store('signatures', 'public');
        }

        $agent->update($validated);

        return redirect()->route('personnels.index')->with('success', 'Agent mis à jour avec succès.');
    }

    public function destroy(Agent $agent)
    {
        $agent->delete();

        return redirect()->route('personnels.index')->with('success', 'Agent supprimé avec succès.');
    }
    
    public function updateMedia(Request $request, string $ref)
    {
        $agent = Agent::where('ref', $ref)->first();
    ini_set('memory_limit', '256M');

        $request->validate([
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'signature' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);
    
        try {
            $updates = [];
            
            if ($request->hasFile('avatar')) {
                // Supprime l'ancien avatar s'il existe
                if ($agent->avatar) {
                    Storage::delete($agent->avatar);
                }
                // Stocke le nouveau fichier
                $updates['avatar'] = $request->file('avatar')->store('avatars', 'public');
            }
    
            if ($request->hasFile('signature')) {
                // Supprime l'ancienne signature si elle existe
                if ($agent->signature) {
                    Storage::delete($agent->signature);
                }
                // Stocke le nouveau fichier
                $updates['signature'] = $request->file('signature')->store('signatures', 'public');
            }
    
            // Met à jour uniquement les champs modifiés
            if (!empty($updates)) {
                $agent->update($updates);
                return redirect()->back()->with('success', 'Médias mis à jour avec succès.');
            }
    
            return redirect()->back()->with('info', 'Aucun média à mettre à jour.');
    
        } catch (\Exception $e) {
            Log::error("Erreur lors de la mise à jour des médias: " . $e->getMessage());
            return redirect()->back()->with('error', 'Une erreur est survenue lors de la mise à jour des médias.');
        }
    }

    
}