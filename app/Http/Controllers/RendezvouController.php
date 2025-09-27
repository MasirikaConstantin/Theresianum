<?php

namespace App\Http\Controllers;

use App\Models\Rendezvou;
use App\Models\Client;
use App\Models\Succursale;
use App\Models\Service;
use App\Models\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Str;

class RendezvouController extends Controller
{
    protected $user;

    public function __construct()
    {
        // S'assure que l'utilisateur est authentifié
        $this->middleware(function ($request, $next) {
            $this->user = Auth::user();
            return $next($request);
        });
    }

    public function index()
    {
        if($this->user->role == 'admin' || $this->user->role == 'gerant' ){
            $rendezvous = Rendezvou::with(['client', 'succursale'])
            ->latest()
            ->paginate(10);
        }else{
            $rendezvous = Rendezvou::where("succursale_id",$this->user->succursale_id)->with(['client', 'succursale'])
            ->latest()
            ->paginate(10);
        }

        return Inertia::render('Rendezvous/Index', [
            'rendezvous' => $rendezvous,
        ]);
    }

    /*
        public function create()
        {
            return Inertia::render('Rendezvous/Create', [
                'clients' => Client::all(),
                'succursales' => Succursale::all(),
                'services' => Service::all(),
                'employes' => User::select('id', 'name')->where('is_active', true)->get(),
            ]);
        }

        public function store(Request $request)
        {
            $request->validate([
                'client_id' => 'nullable|exists:clients,id',
                'succursale_id' => 'required|exists:succursales,id',
                'date_heure' => 'required|date',
                'duree_prevue' => 'required|integer|min:15',
                'statut' => 'required|in:confirmé,annulé,terminé,no-show,en_attente',
                'notes' => 'nullable|string',
                'services' => 'required|array|min:1',
                'services.*.service_id' => 'required|exists:services,id',
                'services.*.prix_effectif' => 'required|numeric|min:0',
            ]);
            // Convertir la date UTC en heure locale avant stockage
                $dateHeure = Carbon::parse($request->date_heure)
                ->timezone(config('app.timezone'))
                ->format('Y-m-d H:i:s');
                    $rendezvous = Rendezvou::create([
                        'client_id' => $request->client_id,
                        'succursale_id' => $request->succursale_id,
                        'date_heure' => $dateHeure,
                        'duree_prevue' => $request->duree_prevue,
                        'statut' => $request->statut,
                        'notes' => $request->notes,
                    ]);

                    foreach ($request->services as $service) {
                        $rendezvous->services()->attach($service['service_id'], [
                            'user_id' => auth()->user()->id,
                            'prix_effectif' => $service['prix_effectif'],
                            'notes' => $service['notes'] ?? null,
                            'ref' => \Illuminate\Support\Str::uuid(),
                        ]);
                    }

            return redirect()->route('rendezvous.index')
                ->with('success', 'Rendez-vous créé avec succès');
        }
    */

    public function show(string $rendezvou)
    {
        $rendezvou = Rendezvou::where('ref', $rendezvou)->firstOrFail();
        $ids = json_decode($rendezvou->services ?? '[]');
        $services = Service::whereIn('id', $ids)->get(['id', 'ref', 'name', 'prix']);
        return Inertia::render('Rendezvous/Show', [
            'rendezvous' => $rendezvou->load(['client', 'succursale']),
            'services' => $services,
        ]);
    }

    public function getServicesJsonAttribute()
    {
        $ids = json_decode($this->services ?? '[]');
        return Service::whereIn('id', $ids)->get(['id', 'ref', 'name', 'prix']);
    }


    public function edit(string $rendezvou)
    {
        $rendezvou = Rendezvou::where('ref',$rendezvou)->firstOrFail();
        return Inertia::render('Rendezvous/Edit', [
            'rendezvous' => $rendezvou->load('rendezvou_services', 'rendezvou_services.user', 'rendezvou_services.service'),
            'clients' => Client::all(),
            'succursales' => Succursale::all(),
            'services' => Service::all(),
            'employes' => User::where('role', 'employe')->get(),
        ]);
    }

    public function update(Request $request, Rendezvou $rendezvou)
{
    try {
        $validated = $request->validate([
           'client_id' => 'nullable|exists:clients,id',
            'succursale_id' => 'required|exists:succursales,id',
            'date_heure' => 'required|date',
            'duree_prevue' => 'required|integer|min:15',
            'statut' => 'required|in:confirmé,annulé,terminé,no-show,en_attente',
            'notes' => 'nullable|string',
            'services' => 'required|array|min:1',
            
        ]);
    } catch (Exception $e) {
        dd($e->getMessage());
        return redirect()->back()->withErrors($e->getMessage());
    }
 dd($validated);
    // Convertir la date UTC en heure locale avant stockage
    $dateHeure = Carbon::parse($validated['date_heure'])
        ->timezone(config('app.timezone'))
        ->format('Y-m-d H:i:s');

    $rendezvou->update([
        'client_id' => $validated['client_id'],
        'succursale_id' => $validated['succursale_id'],
        'date_heure' => $dateHeure,
        'duree_prevue' => $validated['duree_prevue'],
        'statut' => $validated['statut'],
        'notes' => $validated['notes'],
    ]);

    // Sync services avec gestion des données pivot
    $servicesData = collect($validated['services'])->mapWithKeys(function ($service) {
        return [
            $service['service_id'] => [
                'user_id' => auth()->user()->id,
                'prix_effectif' => $service['prix_effectif'],
                'notes' => $service['notes'] ?? null,
                'ref' => \Illuminate\Support\Str::uuid(),
            ]
        ];
    });

    $rendezvou->services()->sync($servicesData);

    return redirect()->route('rendezvous.index')
        ->with('success', 'Rendez-vous mis à jour avec succès');
}

    public function destroy(Rendezvou $rendezvou)
    {
        $rendezvou->delete();

        return redirect()->route('rendezvous.index')
            ->with('success', 'Rendez-vous supprimé avec succès');
    }

    public function updateStatus(Request $request, Rendezvou $rendezvou)
{
   try {
    $validated = $request->validate([
        'statut' => 'required|in:confirmé,annulé,terminé,no-show,en_attente'
    ]);
   } catch (Exception $e) {
    dd($e->getMessage());
   }

    $rendezvou->update($validated);

    return back()->with('success', 'Statut mis à jour');
}






public function create()
    {
        $succursales = Succursale::all();
        $services = Service::all();
        return inertia('Rendezvous/RendezVous/Create', compact('succursales', 'services'));
    }

    public function store(Request $request)
    {
        try{
            $request->validate([
                'succursale_id' => 'required|exists:succursales,id',
                'date_rdv' => 'required|date|after_or_equal:today',
                'heure_debut' => 'required',
                'heure_fin' => 'required',
                'nom' => 'required',
                'email' => 'nullable|email',
                'telephone' => 'required',
                'date_naissance' => 'nullable|date',
                'notes' => 'nullable|string',
                'services' => 'required|array|min:1',
            ]);
        }catch(Exception $e){
            dd($e->getMessage());
            return response()->json($e->getMessage());
        }
        // Gestion du client
        if ($request->telephone) {
            $telephone = Str::after($request->telephone, '+243');
            
            $client = Client::where('telephone', 'LIKE', '%' . $telephone . '%')
            ->where('telephone', 'LIKE', '%' . $request->telephone . '%')
            ->where('telephone', 'LIKE', '%' . Str::after($request->telephone, '0') . '%')
            ->first();
            if($client){
                //return redirect()->back()->withErrors('Le client existe déjà');
                $client = $client;
            } else {
                $client = Client::create([
                    'name' => $request->nom,
                    'email' => $request->email,
                    'telephone' => $request->telephone,
                    'date_naissance' => $request->date_naissance,

                ]);
            }
        }

        // Création du rendez-vous
        $rendezVous = Rendezvou::create([
            'client_id' => $client->id,
            'succursale_id' => $request->succursale_id,
            'date_rdv' => $request->date_rdv,
            'heure_debut' => $request->heure_debut,
            'heure_fin' => $request->heure_fin,
            'statut' => 'en_attente',
            'notes' => $request->notes,
            'ref' => Str::uuid(),
            'services' => json_encode($request->services),
        ]);

        return back()->with('success', 'Rendez-vous créé avec succès');
    }

    public function getAvailableSlots($succursaleId, $date)
    {
        // Logique pour récupérer les créneaux disponibles
        // Exemple simplifié :
        $occupiedSlots = Rendezvou::where('succursale_id', $succursaleId)
            ->whereDate('date_rdv', $date)
            ->pluck('heure_debut')
            ->toArray();

        $allSlots = [
            '09:00-10:00',
            '10:00-11:00',
            '11:00-12:00',
            '14:00-15:00',
            '15:00-16:00',
            '16:00-17:00',
        ];

        $availableSlots = array_diff($allSlots, $occupiedSlots);

        return response()->json(array_values($availableSlots));
    }
}