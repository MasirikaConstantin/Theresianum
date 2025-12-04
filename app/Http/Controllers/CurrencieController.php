<?php

namespace App\Http\Controllers;
use Illuminate\Support\Str;
use App\Models\Currencie;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CurrencieController extends Controller
{
    public function index()
    {
        $currencies = Currencie::all();
        return inertia('settings/CurrencyExchange', [
            'currencies' => $currencies
        ]);
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'code' => 'required|string|size:3|unique:currencies,code',
                'symbol' => 'required|string|max:5',
                'exchange_rate' => 'required|numeric|min:0.0001',
                'is_active' => 'boolean',
                'is_default' => 'boolean'
            ]);
            Currencie::create($request->all());
        } catch (\Exception $e) {
            return redirect()->back()->withErrors($e->getMessage());
        }

        return redirect()->back();
    }




public function update(Request $request, Currencie $currency)
{
    // Normaliser la casse
    $request->merge(['code' => Str::upper($request->code)]);
    $currency->code = Str::upper($currency->code);

    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'code' => [
            'required',
            'string', 
            'size:3',
            Rule::unique('currencies')->ignore($currency->id)->where(function ($query) use ($request) {
                return $query->whereRaw('BINARY code = ?', [Str::upper($request->code)]);
            })
        ],
        'symbol' => 'required|string|max:5',
        'exchange_rate' => 'required|numeric|min:0.0001',
        'is_active' => 'boolean',
        'is_default' => 'boolean'
    ]);

    // Vérification manuelle de l'unicité
    $existing = Currencie::where('code', Str::upper($validated['code']))
                       ->where('id', '!=', $currency->id)
                       ->first();

    if ($existing) {
        return redirect()->back()
                       ->withInput()
                       ->withErrors(['code' => 'Ce code est déjà utilisé par une autre devise']);
    }

    $currency->update($validated);

    return redirect()->back()->with('success', 'Devise mise à jour avec succès');
}

    public function destroy(Currencie $currency)
    {
        if ($currency->is_default) {
            return redirect()->back()->withErrors('Impossible de supprimer la devise par défaut');
        }

        $currency->delete();
        return redirect()->back();
    }

    public function setDefault(Currencie $currency)
    {
        // Désactiver toutes les autres devises par défaut
        Currencie::where('is_default', true)->update(['is_default' => false]);
        
        // Définir cette devise comme défaut
        $currency->update(['is_default' => true, 'is_active' => true]);
        
        return redirect()->back();
    }

    public function lesTaux()
    {
        $currencies = Currencie::where('is_active', true)->select('id','name', 'code', 'symbol', 'exchange_rate')->first();
        return response()->json($currencies);
    }
    public function setActive(Currencie $currency)
    {
        $currency->update(['is_active' => true]);
        return redirect()->back()->with('success', 'Devise activée');
    }
    public function setInactive(Currencie $currency)
    {
        $currency->update(['is_active' => false]);
        return redirect()->back()->with('success', 'Devise desactivée');
    }
}
