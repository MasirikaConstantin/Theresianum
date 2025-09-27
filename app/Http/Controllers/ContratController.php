<?php

namespace App\Http\Controllers;

use App\Models\Contrat;
use App\Models\Agent;
use App\Models\Succursale;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContratController extends Controller
{
    public function index(Request $request)
    {
        $query = Contrat::with(['agent', 'succursale', 'createdBy'])
            ->latest();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('ref', 'like', "%{$search}%")
                  ->orWhere('type_contrat', 'like', "%{$search}%")
                  ->orWhereHas('agent', function($q) use ($search) {
                      $q->where('nom', 'like', "%{$search}%")
                        ->orWhere('postnom', 'like', "%{$search}%")
                        ->orWhere('prenom', 'like', "%{$search}%");
                  });
            });
        }

        $contrats = $query->paginate(15)->withQueryString();

        return Inertia::render('Contrats/Index', [
            'contrats' => $contrats,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Contrats/Create', [
            'agents' => Agent::active()->get(['id', 'nom', 'postnom', 'prenom']),
            'succursales' => Succursale::all(['id', 'nom']),
            'typesContrat' => ['CDI', 'CDD', 'Stage', 'Interim']
        ]);
    }

    public function store(Request $request)
    {
        ini_set('memory_limit', '256M');

        $validated = $request->validate([
            'agent_id' => 'required|exists:agents,id',
            'duree' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'nullable|date|after_or_equal:date_debut',
            'type_contrat' => 'required|string',
            'anciennete' => 'nullable|string',
            'fonction' => 'required|string',
            'salaire_base' => 'nullable|string',
            'succursale_id' => 'nullable|exists:succursales,id',
            'is_active' => 'boolean'
        ]);

        // Désactiver les autres contrats de l'agent
        if ($request->is_active) {
            Contrat::where('agent_id', $validated['agent_id'])
                ->update(['is_active' => false]);
        }
        $agent = Agent::find($validated['agent_id']);
        if($agent){
            $agent->role != $validated['fonction'];
            $agent->role = $validated['fonction'];
            $agent->save();
        }if($validated['succursale_id']){
            $agent->succursale_id = $validated['succursale_id'];
            $agent->save();
        }

        Contrat::create($validated);

        return redirect()->route('contrats.index')->with('success', 'Contrat créé avec succès.');
    }

    public function show(string $ref)
    {
        return Inertia::render('Contrats/Show', [
            'contrat' => Contrat::where('ref', $ref)->first()->load(['agent'=>function($query){
                $query->select('id','succursale_id', 'nom', 'postnom', 'prenom', 'matricule', 'email', 'telephone', 'role', 'statut', 'avatar', 'signature', 'created_at', 'updated_at', 'ref');
            }, 'agent.succursale'=>function($query){
                $query->select('id', 'nom', 'ref');
            },'succursale'=>function($query){
                $query->select('id', 'nom', 'ref');
            },
             'createdBy'=>function($query){
                $query->select('id', 'name', 'ref');
            }, 'updatedBy'=>function($query){
                $query->select('id', 'name', 'ref');
            }])
        ]);
    }

    public function edit(string $contrat)
    {
        $contrat = Contrat::where('ref',$contrat)->first();
        return Inertia::render('Contrats/Edit', [
            'contrat' => $contrat,
            'agents' => Agent::active()->get(['id', 'nom', 'postnom', 'prenom']),
            'succursales' => Succursale::all(['id', 'nom']),
            'typesContrat' => ['CDI', 'CDD', 'Stage', 'Interim']
        ]);
    }

    public function update(Request $request, Contrat $contrat)
    {
        $validated = $request->validate([
            'agent_id' => 'required|exists:agents,id',
            'duree' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'nullable|date|after_or_equal:date_debut',
            'type_contrat' => 'required|string',
            'anciennete' => 'nullable|string',
            'fonction' => 'required|string',
            'salaire_base' => 'nullable|string',
            'succursale_id' => 'nullable|exists:succursales,id',
            'is_active' => 'boolean'
        ]);

        // Désactiver les autres contrats de l'agent si ce contrat devient actif
        if ($request->is_active && !$contrat->is_active) {
            Contrat::where('agent_id', $validated['agent_id'])
                ->where('id', '!=', $contrat->id)
                ->update(['is_active' => false]);

                
        
        }
        if($request->is_active){
            $agent = Agent::find($request->agent_id);

            if($request->succursale_id != $agent->succursale_id){
                $agent->succursale_id = $request->succursale_id;
                $agent->save();
            }
        }
       
        $contrat->update($validated);

        return redirect()->route('contrats.index')->with('success', 'Contrat mis à jour avec succès.');
    }

    public function destroy(Contrat $contrat)
    {
        $contrat->delete();
        return redirect()->route('contrats.index')->with('success', 'Contrat supprimé avec succès.');
    }
}