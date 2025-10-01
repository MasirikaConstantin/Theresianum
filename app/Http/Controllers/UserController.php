<?php

namespace App\Http\Controllers;

use App\Models\Depense;
use App\Models\User;
use App\Models\Vente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        if (Auth::user()->role === 'vendeur') {
            $users = User::where('user_id', Auth::user()->user_id)->with(['creator', 'updater'])
                ->orderBy('created_at', 'desc')
                ->get();
        } elseif(Auth::user()->role ==="admin" || Auth::user()->role ==="gerant") {
            $users = User::with(['creator', 'updater'])
                ->orderBy('created_at', 'desc')
                ->get();
        }else{
            $users = new User();
        }

        return Inertia::render('Users/Index', [
            'users' => $users,
            'is_admin' => Auth::user()->role === 'admin' || Auth::user()->role === 'gerant',
        ]);
    }

    public function create()
    {
        return Inertia::render('Users/Create', [
            'roles' => ['admin', 'gerant', 'vendeur', 'aucun'],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', Rules\Password::defaults()],
            'avatar' => 'nullable|image|max:2048',
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:255',
            'date_embauche' => 'nullable|date',
            'role' => 'required|in:admin,gerant,vendeur,aucun',
            'is_active' => 'boolean',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'telephone' => $request->telephone,
            'adresse' => $request->adresse,
            'date_embauche' => $request->date_embauche,
            'role' => $request->role,
            'is_active' => $request->is_active ?? false,
        ]);

        if ($request->hasFile('avatar')) {
            $user->update([
                'avatar' => $request->file('avatar')->store('avatars', 'public'),
            ]);
        }

        return redirect()->route('utilisateurs.index')->with('success', 'Utilisateur créé avec succès');
    }

    public function show(string $user)
    {
        $user = User::where('ref', $user)->first();
        $user->load(['creator', 'updater']);

         // Récupérer le nombre total de ventes et dépenses
         $ventesCount = Vente::where('vendeur_id', $user->id)->count();
         $depensesCount = Depense::where('user_id', $user->id)->count();
         
         // Récupérer les données mensuelles pour le graphique
         $monthlyData = $this->getMonthlyStats($user->id);
        return Inertia::render('Users/Show', [
            'user' => $user,
            'stats' => [
                'total' => [
                    'ventes' => $ventesCount,
                    'depenses' => $depensesCount,
                ],
                'monthly' => $monthlyData,
            ],
        ]);
    }

    public function edit(string $user)
    {
        $user = User::where('ref', $user)->first();
        return Inertia::render('Users/Edit', [
            'user' => $user,
            'roles' => ['admin', 'gerant', 'coiffeur', 'vendeur', 'aucun'],
            'is_admin' => Auth::user()->role === 'admin' || Auth::user()->role === 'gerant',
        ]);
    }

    public function update(Request $request, string $user)
    {
        $user = User::findOrFail($user);
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'avatar' => 'nullable|image|max:2048',
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:255',
            'date_embauche' => 'nullable|date',
            'role' => 'required|in:admin,gerant,vendeur,aucun',
            'is_active' => 'boolean',
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'telephone' => $request->telephone,
            'adresse' => $request->adresse,
            'date_embauche' => $request->date_embauche,
            'role' => $request->role,
            'is_active' => $request->is_active ?? false,
        ]);

        if ($request->hasFile('avatar')) {
            $user->update([
                'avatar' => $request->file('avatar')->store('avatars', 'public'),
            ]);
        }

        return redirect()->route('utilisateurs.index')->with('success', 'Utilisateur mis à jour avec succès');
    }

    public function destroy(string $user)
    {
        $user = User::findOrFail($user);
        $user->delete();
        return redirect()->route('utilisateurs.index')->with('success', 'Utilisateur supprimé avec succès');
    }

    protected function getMonthlyStats($userId)
{
    // Déterminer la fonction d'extraction du mois selon le driver de base de données
    $monthFunction = config('database.default') === 'sqlite' 
        ? "strftime('%m', created_at)" 
        : "MONTH(created_at)";

    $ventesParMois = Vente::where('vendeur_id', $userId)
        ->selectRaw("{$monthFunction} as month, COUNT(*) as count")
        ->groupBy('month')
        ->get()
        ->keyBy('month');

    $depensesParMois = Depense::where('user_id', $userId)
        ->selectRaw("{$monthFunction} as month, COUNT(*) as count")
        ->groupBy('month')
        ->get()
        ->keyBy('month');

    $months = [
        '1' => 'Janvier', '2' => 'Fevrier', '3' => 'Mars', 
        '4' => 'Avril', '5' => 'Mai', '6' => 'Juin', 
        '7' => 'Juillet', '8' => 'Aout', '9' => 'Septembre', 
        '10' => 'Octobre', '11' => 'Novembre', '12' => 'Decembre'
    ];

    // Pour SQLite, les mois sont retournés comme '01', '02', etc., donc nous devons convertir
    if (config('database.default') === 'sqlite') {
        $ventesParMois = $ventesParMois->keyBy(function($item) {
            return (string)(int)$item->month; // Convertit '01' en '1'
        });
        
        $depensesParMois = $depensesParMois->keyBy(function($item) {
            return (string)(int)$item->month; // Convertit '01' en '1'
        });
    }

    $data = [];
    foreach ($months as $num => $name) {
        $data[] = [
            'month' => $name,
            'ventes' => $ventesParMois->has($num) ? $ventesParMois[$num]->count : 0,
            'depenses' => $depensesParMois->has($num) ? $depensesParMois[$num]->count : 0,
        ];
    }

    return array_slice($data, -6);
}

public function login(Request $request)
{
    $credentials = $request->only('email', 'password');

    if (Auth::attempt($credentials)) {
        return response()->json([
            'success' => true,
            'message' => 'Connexion réussie',
            'token' => Auth::user()->createToken('auth-token')->plainTextToken,
            'user' => Auth::user()
        ]);
    }

    return response()->json([
        'success' => false,
        'message' => 'Identifiants invalides'
    ], 401);
}

}