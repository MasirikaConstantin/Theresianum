<?php

namespace App\Http\Controllers;

use App\Models\Alert;
use App\Models\Chambre;
use App\Models\Produit;
use App\Models\Salle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AlertController extends Controller
{
    public function index()
    {
        $alerts = Alert::with(['user', 'produit'])
            ->latest()
            ->paginate(15);

        return Inertia::render('Alerts/Index', [
            'alerts' => $alerts,
        ]);
    }

    public function create()
    {
        return Inertia::render('Alerts/Create', [
            'produits' => Produit::select('id', 'name','ref')->get(),
            'salles' => Salle::select('id','nom','ref')->get(),
            'chambres' => Chambre::select('id','nom','ref')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'notes' => 'nullable|string',
            'produit_id' => 'nullable|exists:produits,id',
            'salle_id' => 'nullable|exists:salles,id',
            'chambre_id' => 'nullable|exists:chambres,id',
        ]);

        Alert::create([
            'notes' => $request->notes,
            'user_id' => Auth::user()->id,
            'produit_id' => $request->produit_id,
            'salle_id' => $request->salle_id,
            'chambre_id' => $request->chambre_id,
        ]);

        return redirect()->route('alerts.index')
            ->with('success', 'Alerte créée avec succès');
    }

    public function show(string $alert)
    {
        $alert = Alert::where('ref', $alert)->firstOrFail();
        return Inertia::render('Alerts/Show', [
            'alert' => $alert->load(['user', 'produit']),
        ]);
    }

    public function edit(string $alert)
    {
        $alert = Alert::where('ref', $alert)->firstOrFail();
        return Inertia::render('Alerts/Edit', [
            'alert' => $alert,
            'produits' => Produit::all(),
            'salles' => Salle::all(),
            'chambres' => Chambre::all(),
        ]);
    }

    public function update(Request $request, string $alert)
    {
        $alert = Alert::where('ref', $alert)->firstOrFail();
        $request->validate([
            'notes' => 'nullable|string',
            'produit_id' => 'nullable|exists:produits,id',
            'salle_id' => 'nullable|exists:salles,id',
            'chambre_id' => 'nullable|exists:chambres,id',
        ]);

        $alert->update($request->only(['notes', 'produit_id', 'salle_id', 'chambre_id']));

        return redirect()->route('alerts.index')
            ->with('success', 'Alerte mise à jour avec succès');
    }

    public function destroy(string $alert)
    {
        $alert = Alert::where('ref', $alert)->firstOrFail();
        $alert->delete();

        return redirect()->route('alerts.index')
            ->with('success', 'Alerte supprimée avec succès');
    }
    public function markAsRead(string $alert)
    {
        $alert = Alert::where('ref', $alert)->firstOrFail();
        if($alert->is_read){
           $alert->update([
            'is_read' => false,
        ]);
        return back()->with('success', 'Alerte marquée comme non lue');
        }
        $alert->update([
            'is_read' => true,
        ]);

        return back()->with('success', 'Alerte marquée comme lue');
    }
}