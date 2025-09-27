<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class CategorieController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Categories/Index', [
            'categories' => Categorie::with('enregistrePar', 'misAjourPar')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Categories/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $category = Categorie::create([
            ...$validated,
            'ref' => Str::uuid(),
            'created_by' => Auth::user()->id,
            'updated_by' => Auth::user()->id
        ]);

        return redirect()->route('categories.index')->with('success', 'Categorie créée avec succès');
    }

public function update(Request $request, Categorie $category)
{
    $validated = $request->validate([
        'nom' => 'required|string|max:255',
        'description' => 'nullable|string',
        'is_active' => 'boolean'
    ]);

    $category->update([
        ...$validated,
        'updated_by' => Auth::user()->id
    ]);

    return redirect()->route('categories.index')->with('success', 'Categorie mise à jour avec succès');
}
    /**
     * Display the specified resource.
     */
    public function show(Categorie $categorie)
    {
        return Inertia::render('Categories/Show', [
            'categorie' => $categorie,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Categorie $categorie)
    {
        return Inertia::render('Categories/Edit', [
            'categorie' => $categorie,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $ref)
    {
        $categorie = Categorie::where('ref', $ref)->first();
        $categorie->delete();
        return redirect()->route('categories.index')->with('success', 'Categorie supprimé avec succès');
    }
}
