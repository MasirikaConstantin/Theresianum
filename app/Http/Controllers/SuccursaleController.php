<?php

namespace App\Http\Controllers;

use App\Models\Succursale;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Inertia\Inertia;

class SuccursaleController extends Controller
{
    use HasFactory, SoftDeletes;
    public function index()
    {
        $succursales = Succursale::orderBy('created_at', 'desc')->get();
        return Inertia::render('Succursales/Index', [
            'succursales' => $succursales,
        ]);
    }

    public function create()
    {
        return Inertia::render('Succursales/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'adresse' => 'required|string',
            'telephone' => 'required|string|max:20',
            'email' => 'nullable|email|max:100',
        ]);

        Succursale::create($validated);

        return redirect()->route('succursales.index')->with('success', 'Succursale créée avec succès');
    }

    public function edit(string $succursale)
    {
        $succursale = Succursale::where('ref', $succursale)->first();
        return Inertia::render('Succursales/Edit', [
            'succursale' => $succursale,
        ]);
    }

    public function update(Request $request, Succursale $succursale)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'adresse' => 'required|string',
            'telephone' => 'required|string|max:20',
            'email' => 'nullable|email|max:100',
        ]);

        $succursale->update($validated);

        return redirect()->route('succursales.index')->with('success', 'Succursale mise à jour avec succès');
    }

    public function destroy(Succursale $succursale)
    {
        $succursale->delete();
        return redirect()->route('succursales.index')->with('success', 'Succursale supprimée avec succès');
    }
}