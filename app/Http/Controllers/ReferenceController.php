<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Reference;
use App\Models\Agent;
use Illuminate\Http\Request;

class ReferenceController extends Controller
{
    public function index(Agent $agent)
    {
        $references = $agent->references()->latest()->get();
        return response()->json($references);
    }

    public function store(Request $request, Agent $agent)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'telephone' => 'required|string|max:20',
            'email' => 'nullable|email',
            'fonction' => "required|string|max:255"
        ]);

         $agent->references()->create($validated);

        return back()->with('success', "Référence ajoutée avec succès");
        return redirect()->route('personnels.show', $agent->ref);
    }

    public function update(Request $request, string $reference)
    {
        $reference = Reference::where('id', $reference);
        $validated = $request->validate([
            'nom' => 'required|string|min:2|max:255',
            'telephone' => 'required|string',
            'email' => 'nullable|email',
            'fonction' => "required|string|max:255"
        ]);

        $reference->update($validated);

        return  back()->with('success', "Référence mise à jour avec succès");
    }

    public function destroy(Reference $reference)
    {
        $reference->delete();
        return response()->json(null, 204);
    }
}