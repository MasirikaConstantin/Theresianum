<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\Conge;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CongeController extends Controller
{
    public function index(Request $request)
    {
        $conges = Conge::with(['agent', 'createur', 'approbateur'])
            ->latest()
            ->filter($request->only('search', 'statut', 'type', 'month', 'year'))
            ->paginate(10);


        return Inertia::render('Conge/Index', [
            'conges' => $conges,
            'filters' => $request->all('search', 'statut', 'type', 'month', 'year'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Conge/Create', [
            'agents' => Agent::active()->get(),
            'types' => ['annuel', 'maladie', 'maternite', 'exceptionnel', 'sans_solde'],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'agent_id' => 'required|exists:agents,id',
            'type' => 'required|in:annuel,maladie,maternite,exceptionnel,sans_solde',
            'date_debut' => 'required|date|after_or_equal:today',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'motif' => 'required|string|max:500',
        ]);
        $date_debut = now()->parse($request->date_debut);
        $date_fin = now()->parse($request->date_fin);
        $request->merge([
            'date_debut' => $date_debut->format('Y-m-d'),
            'date_fin' => $date_fin->format('Y-m-d'),
        ]);
        //dd($date_debut, $date_fin);

        $duree = now()->parse($request->date_debut)->diffInDays($request->date_fin) + 1;

        Conge::create([
            ...$request->only('agent_id', 'type', 'date_debut', 'date_fin', 'motif'),
            'duree_jours' => $duree,
            'created_by' => auth()->id(),
            'statut' => 'en_attente',
        ]);

        return redirect()->route('conges.index')->with('success', 'Demande de congé enregistrée.');
    }

    public function show(string $ref)
    {
        $conge = Conge::where('ref', $ref)->firstOrFail();
        $conge->load(['agent','agent.contrats', 'createur', 'approbateur']);
        
        return Inertia::render('Conge/Show', [
            'conge' => $conge,
            'canApprove' => auth()->user()->role === 'admin' || auth()->user()->role === 'gerant',

        ]);
    }

    public function edit(string $ref)
    {
        $conge = Conge::where('ref', $ref)->firstOrFail();
        return Inertia::render('Conge/Edit', [
            'conge' => $conge,
            'agents' => Agent::active()->get(),
            'types' => ['annuel', 'maladie', 'maternite', 'exceptionnel', 'sans_solde'],
            'statuts' => ['en_attente', 'approuve', 'rejete'],
        ]);
    }

    public function update(Request $request, string $ref)
    {
        $conge = Conge::where('ref', $ref)->firstOrFail();
        $request->validate([
            'agent_id' => 'required|exists:agents,id',
            'type' => 'required|in:annuel,maladie,maternite,exceptionnel,sans_solde',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'motif' => 'required|string|max:500',
            'statut' => 'required|in:en_attente,approuve,rejete',
            'commentaire' => 'nullable|string|max:500',
        ]);

        $duree = now()->parse($request->date_debut)->diffInDays($request->date_fin) + 1;

        $conge->update([
            ...$request->only('agent_id', 'type', 'date_debut', 'date_fin', 'motif', 'statut', 'commentaire'),
            'duree_jours' => $duree,
            'approved_by' => $request->statut !== 'en_attente' ? auth()->id() : null,
        ]);

        return redirect()->route('conges.index')->with('success', 'Congé mis à jour.');
    }

    public function destroy(Conge $conge)
    {
        $conge->delete();
        return redirect()->route('conges.index')->with('success', 'Congé supprimé.');
    }

    public function approve(Conge $conge)
    {
        $conge->update([
            'statut' => 'approuve',
            'approved_by' => auth()->id(),
        ]);

        return back()->with('success', 'Congé approuvé.');
    }

    public function reject(Conge $conge)
    {
        $conge->update([
            'statut' => 'rejete',
            'approved_by' => auth()->id(),
        ]);

        return back()->with('success', 'Congé rejeté.');
    }

    public function print(string $conge)
{
    $conge = Conge::where('ref', $conge)->first();
    $conge->load(['agent'=>function($query){
        $query->select('id', 'nom', 'postnom', 'prenom', 'matricule', 'ref','succursale_id');
    },'agent.succursale'=>function($query){
        $query->select('id', 'nom', 'ref', 'adresse', 'telephone');
    }]);
    $conge->load(['agent.contrats'=>function($query){
        $query->where('is_active', true)->select('id', 'agent_id','is_active', 'fonction', 'ref');
    }]);
    return inertia('Conge/Print', [
        'conge' => $conge,
        'entreprise' => [
            'name' => config('app.name'),
            'address' => $conge->agent->succursale->adresse,
            'phone' => $conge->agent->succursale->telephone,
            'email' => $conge->agent->succursale->email ? $conge->agent->succursale->email :"" ,
            'logo' => asset('images/logo.png'), // Chemin vers votre logo
        ]
    ]);
}
}