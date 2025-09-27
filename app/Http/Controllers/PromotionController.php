<?php

namespace App\Http\Controllers;

use App\Models\Promotion;
use App\Models\Vente;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Exception;

class PromotionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $promotion = Promotion::first();
        return Inertia::render('Promotion/Index', [
            'promotion' => $promotion,
            'ventes' => Vente::where('has_promotion', true)->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try{
            $validated = $request->validate([
                'is_active' => 'required|boolean',
            ]);
        
            $promotion = Promotion::firstOrCreate([
                'name' => 'Promotion principale',
            ], $validated);
            // Si aucune promotion n'existe, on crée une nouvelle avec l'ID 1
            if (!$promotion->exists) {
                $promotion = Promotion::updateOrCreate(
                    [
                        'is_active' => $validated['is_active'],
                        'name' => 'Promotion principale',
                    ]
                );
            } else {
                $promotion->update($validated);
            }
        }catch(Exception $e){
            dd($e->getMessage());
            return back()->with([
                'error' => "Une erreur est survenue lors de la mise à jour de la promotion",
            ]);
        }
    
        return back()->with([
            'success' => "Promotion mise à jour avec succès",
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Promotion $promotion)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Promotion $promotion)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Promotion $promotion)
{
    dd("dede");
    $validated = $request->validate([
        'is_active' => 'required|boolean',
    ]);

    dd($request->all());
    // Si aucune promotion n'existe, on crée une nouvelle avec l'ID 1
    if (!$promotion->exists) {
        $promotion = Promotion::updateOrCreate(
            ['id' => 1],
            [
                'is_active' => $validated['is_active'],
                'name' => 'Promotion principale',
            ]
        );
    } else {
        $promotion->update($validated);
    }

    return response()->json([
        'success' => true,
        'promotion' => $promotion,
    ]);
}

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Promotion $promotion)
    {
        //
    }
}
