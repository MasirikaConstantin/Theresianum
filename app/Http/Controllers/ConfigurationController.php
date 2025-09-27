<?php

namespace App\Http\Controllers;

use App\Models\Configuration;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConfigurationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render("Configurations/Index",[
            'activeConfig' => Configuration::where('actif', true)->first(),
            'configurations' => Configuration::all()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render("Configurations/Create",[
            'activeConfig' => Configuration::where('actif', true)->first()
        ]);
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
    public function show(Configuration $configuration)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Configuration $configuration)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'actif' => 'required|boolean',
            'ratio_achat' => 'required|numeric|min:0.01',
            'valeur_point' => 'required|numeric|min:0.01',
            'seuil_utilisation' => 'required|integer|min:1',
        ]);

        // Créer ou mettre à jour la configuration
        $config = Configuration::updateOrCreate(
            ['actif' => true],
            $validated
        );

        return redirect()->route('points.index')->with('success', 'Configuration mise à jour avec succès');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Configuration $configuration)
    {
        //
    }
}
