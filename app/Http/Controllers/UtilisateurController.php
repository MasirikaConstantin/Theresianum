<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UtilisateurController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('utilisateurs/index');
    }

    public function updateSuccursale(Request $request, string $id)
    {
        $user = User::findOrFail($id);
        $user->succursale_id = $request->succursale_id;
        $user->save();
        return redirect()->route('utilisateurs.index')->with('success', 'Succursale mise à jour avec succès.');
    }
    public function updateStatus(Request $request, string $id)
    {
        $user = User::findOrFail($id);
        $user->is_active = $request->is_active;
        $user->save();
        return redirect()->route('utilisateurs.index')->with('success', 'Statut mise à jour avec succès.');
    }
    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('utilisateurs/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        return Inertia::render('utilisateurs/store');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return Inertia::render('utilisateurs/show');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        return Inertia::render('utilisateurs/edit');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        return Inertia::render('utilisateurs/update');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
            return Inertia::render('utilisateurs/destroy');
    }
    public function updateRole(Request $request, string $id)
    {
        $user = User::findOrFail($id);
        $user->role = $request->role;
        $user->save();
        return redirect()->route('utilisateurs.index')->with('success', 'Rôle mise à jour avec succès.');
    }
}
