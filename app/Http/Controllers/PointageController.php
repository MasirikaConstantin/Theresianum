<?php
namespace App\Http\Controllers;

use App\Models\Pointage;
use App\Models\Agent;
use App\Models\Succursale;
use App\Observers\PointageObserver;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PointageController extends Controller
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
    public function index(Request $request)
{

    $user = $this->user;
    if($user->role === "caissier"){
        $query = Pointage::with([
            'agent' => function ($query) {
                $query->orderBy('nom')
                      ->select('id', 'nom', 'postnom', 'prenom', 'ref', 'succursale_id');
            }, 
            'agent.succursale' => function($query) {
                $query->select('id', 'nom', 'ref');
            }
        ])
        ->whereHas('agent', function ($query ) use ($user) {
            $query->where('succursale_id', $user->succursale_id);
        })
        ->orderBy('date', 'desc')
        ->orderBy('created_at', 'desc');
                
            // Filtre par agent
            if ($request->filled('agent_id')) {
                $query->where('agent_id', $request->agent_id);
            }
            
            // Filtre par date (format Y-m-d)
            if ($request->filled('date')) {
                $query->whereDate('date', Carbon::parse($request->date)->format('Y-m-d'));
            }
            
            // Filtre par statut (valeurs exactes)
            if ($request->filled('statut')) {
                $query->where('statut', $request->statut);
            }
            
            // Résultats : pas de pagination si "date" est envoyé
            $pointages = $request->filled('date')
            ? ['data' => $query->get()]
            : $query->paginate(20);
        
    }elseif($user->role ==='admin' || $user->role === 'gerant'){
        $query = Pointage::with(['agent'=>function ($data){
            $data->orderBy('nom')->select('id', "nom", "postnom", "prenom",'ref','succursale_id');
        }, 'agent.succursale'=>function($data){
            $data->select('id', 'nom', 'ref');
        }])
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc');
            
        // Filtre par agent
        if ($request->filled('agent_id')) {
            $query->where('agent_id', $request->agent_id);
        }
        
        // Filtre par date (format Y-m-d)
        if ($request->filled('date')) {
            $query->whereDate('date', Carbon::parse($request->date)->format('Y-m-d'));
        }
        
        // Filtre par statut (valeurs exactes)
        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }
        
        // Résultats : pas de pagination si "date" est envoyé
        $pointages = $request->filled('date')
        ? ['data' => $query->get()]
        : $query->paginate(20);
    }
    


    return Inertia::render('Pointages/Index', [
        'pointages' => $pointages,
        'filters' => $request->only(['agent_id', 'date', 'statut']),
        'agents' => Agent::orderBy('nom')->get(['id', 'nom', 'prenom', 'postnom']),
    ]);
}

    
    public function create()
    {
        return Inertia::render('Pointages/Create', [
            'agents' => Agent::orderBy('nom')->select('id', 'nom', "postnom", "prenom", "ref")->get(),
        ]);
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'agent_id' => 'required|exists:agents,id',
            'date' => 'required|date',
            'statut' => 'required|in:present,absent,congé,malade,formation,mission',
            'heure_arrivee' => 'nullable|date_format:H:i',
            'heure_depart' => 'nullable|date_format:H:i|after:heure_arrivee',
            'justifie' => 'boolean',
            'justification' => 'nullable|string|max:500',
            'notes' => 'nullable|string|max:500',
        ]);
        
        $pointage = Pointage::create($validated);
        
        return redirect()->route('pointages.index')->with('success', 'Pointage créé avec succès.');
    }
    
    public function edit(Pointage $pointage)
    {
        return Inertia::render('Pointages/Edit', [
            'pointage' => $pointage->load('agent'),
            'agents' => Agent::orderBy('nom')->get(),
        ]);
    }
    
    public function update(Request $request, Pointage $pointage)
    {
        try{
            $request->validate([
                'agent_id' => 'required|exists:agents,id',
                'date' => 'required|date',
                'statut' => 'required|in:present,absent,congé,malade,formation,mission',
                //'heure_arrivee' => 'nullable|date_format:H:i',
                //'heure_depart' => 'nullable|date_format:H:i|after:heure_arrivee',
                'justifie' => 'boolean',
                'justification' => 'nullable|string|max:500',
                'notes' => 'nullable|string|max:500',
            ]);
        }catch(\Exception $e){
            dd($e->getMessage());
            return back()->with('error', 'Une erreur est survenue lors de la mise à jour du pointage.');
        }
        
        $pointage->update($request->all());
        
        return redirect()->route('pointages.index')->with('success', 'Pointage mis à jour avec succès.');
    }
    
    public function destroy(Pointage $pointage)
    {
        $pointage->delete();
        
        return redirect()->route('pointages.index')->with('success', 'Pointage supprimé avec succès.');
    }
    
    public function generateDaily()
    {
        PointageObserver::createDailyPointages();
        
        return back()->with('success', 'Pointages quotidiens générés avec succès.');
    }
    
    public function generateMonthly(Request $request)
    {
        $request->validate([
            'month' => 'required|date_format:Y-m',
        ]);
        
        [$year, $month] = explode('-', $request->month);
        PointageObserver::createMonthlyPointages($year, $month);
        
        return back()->with('success', 'Pointages mensuels générés avec succès.');
    }

    public function generateTime(Request $request)
    {
        try{
            $request->validate([
                'agent_id' => 'required|exists:agents,id',
                'date' => 'required|date',
                'heure_arrivee' => 'nullable|date_format:H:i:s',
                'heure_depart' => 'nullable|date_format:H:i:s|after:heure_arrivee',
                'pointage_id' => 'required|exists:pointages,id',
            ]);
            $pointage = Pointage::find($request->pointage_id);
            //dd($pointage, $pointage->calculateRetard(), $pointage->calculateDepartPrecoce());
            if($request->heure_arrivee){
                $pointage->update([
                    'heure_arrivee' => $request->heure_arrivee,
                ]);
                $pointage->statut_arrivee = $pointage->calculateRetard();
                $pointage->statut = 'present';
                $pointage->save();
            }
            if($request->heure_depart){
                $pointage->update([
                    'heure_depart' => $request->heure_depart,
                ]);
                $pointage->statut_depart = $pointage->calculateDepartPrecoce();
                $pointage->save();
            }
            
            return back()->with('success', 'Pointage mis à jour avec succès.');
        }catch(\Exception $e){
            return back()->with('error', 'Une erreur est survenue lors de la création du pointage.');
        }
    }
    
    public function print(Request $request)
    {
       try{
        $request->validate([
            'date' => 'required|date',
            'agent_id' => 'nullable|exists:agents,id',
            "statut" => "nullable|in:present,absent,congé,malade,formation,mission",
        ]);
       }catch(\Exception $e){
        return back()->with('error', "Pour imprimer le rapport, veuillez selectionner une date. \n".$e->getMessage());
       }
       $query = Pointage::with(['agent','agent.succursale'])->where('date', $request->date);
        if($request->agent_id){
            $query->where('agent_id', $request->agent_id);
        }
        if($request->statut){
            $query->where('statut', $request->statut);
        }
        $pointages = $query->get();
        $data = $pointages->first();
        return Inertia::render('Pointages/Print', [
            'pointages' => $pointages,
            'entreprise' => [
                'name' => config('app.name'),
                'address' => $data->agent->succursale->adresse,
                'phone' => $data->agent->succursale->telephone,
                'email' => $data->agent->succursale->email ? $data->agent->succursale->email :"" ,
                'logo' => asset('images/logo.png'), 
            ]
        ]);
    }
    public function agent(Request $request)
    {
        
        return Inertia::render('Pointages/RapportPresence', [
            'agents' => Agent::active()->with(['succursale'=>function($data){
                $data->select('id', 'nom', 'ref');
            }])->orderBy('nom')->get(['id', 'nom', 'prenom', 'postnom', 'succursale_id', 'ref']),
            
        ]);
    }
    
    /*public function getAgentPointages(Request $request)
    {
        $request->validate([
            'agent_id' => 'required|exists:agents,id',
            'date' => 'required|date',
        ]);
        $pointages = Pointage::with(['agent','agent.succursale'])
            ->where('agent_id', $request->agent_id)
            ->where('date', $request->date)
            ->get();
        return response()->json($pointages);
    }*/

    public function getAgentPointages(Request $request)
{
    $validated = $request->validate([
        'agent_id' => 'required|exists:agents,id',
        'date' => 'required|date_format:Y-m', // Format attendu: "YYYY-MM"
    ]);

    $pointages = Pointage::query()
        ->with(['agent', 'agent.succursale'])
        ->where('agent_id', $validated['agent_id'])
        ->whereYear('date', substr($validated['date'], 0, 4)) // Extraction de l'année
        ->whereMonth('date', substr($validated['date'], 5, 2)) // Extraction du mois
        ->orderBy('date', 'asc') // Tri chronologique
        ->get()
        ->map(function ($pointage) {
            return [
                'id' => $pointage->id,
                'date' => $pointage->date->format('Y-m-d'), // Formatage de la date
                'heure_arrivee' => $pointage->heure_arrivee,
                'heure_depart' => $pointage->heure_depart,
                'statut' => $pointage->statut,
                'statut_depart' => $pointage->statut_depart,
                'justifie' => (bool)$pointage->justifie,
                'agent' => [
                    'id' => $pointage->agent->id,
                    'nom_complet' => $pointage->agent->nom . ' ' . $pointage->agent->postnom . ' ' . $pointage->agent->prenom,
                ],
                'succursale' => $pointage->agent->succursale ? [
                    'id' => $pointage->agent->succursale->id,
                    'nom' => $pointage->agent->succursale->nom,
                ] : null,
            ];
        });

    return response()->json([
        'success' => true,
        'data' => $pointages,
        'count' => $pointages->count(),
    ]);
}

public function printGrille(string $ref, string $date)
{
    $validated = [
        'ref' => $ref,
        'date' => $date,
    ];
    $agent = Agent::where('ref', $validated['ref'])->first();
    if (!$agent) {
        return back()->with('error', 'Agent non trouvé');
    }

    $pointages = Pointage::query()
        ->with(['agent', 'agent.succursale'])
        ->where('agent_id', $agent->id)
        ->whereYear('date', substr($validated['date'], 0, 4)) // Extraction de l'année
        ->whereMonth('date', substr($validated['date'], 5, 2)) // Extraction du mois
        ->orderBy('date', 'asc') // Tri chronologique
        ->get()
        ->map(function ($pointage) {
            return [
                'id' => $pointage->id,
                'date' => $pointage->date->format('Y-m-d'), // Formatage de la date
                'heure_arrivee' => $pointage->heure_arrivee,
                'heure_depart' => $pointage->heure_depart,
                'statut' => $pointage->statut,
                'statut_depart' => $pointage->statut_depart,
                'justifie' => (bool)$pointage->justifie,
                'agent' => [
                    'id' => $pointage->agent->id,
                    'nom_complet' => $pointage->agent->nom . ' ' . $pointage->agent->postnom . ' ' . $pointage->agent->prenom,
                ],
                'succursale' => $pointage->agent->succursale ? [
                    'id' => $pointage->agent->succursale->id,
                    'nom' => $pointage->agent->succursale->nom,
                ] : null,
            ];
        });
            if(!$agent->succursale){
                $succursale=Succursale::first();
            }
    return Inertia::render('Pointages/PrintGrille', [
        'pointages' => $pointages,
        'agent' => $agent,
        'date' => $validated['date'],
        'entreprise' => [
            'name' => config('app.name'),
            'address' => $agent->succursale? $agent->succursale->adresse :$succursale->adresse,
            'phone' => $agent->succursale? $agent->succursale->telephone : $succursale->adresse,
            'email' => $agent->succursale? $agent->succursale->email : $succursale->email  ,
            'logo' => asset('images/logo.png'), 
        ],
        'Mois' => $validated['date'],
        'statistiques' => [
            'present' => $pointages->where('statut', 'present')->count(),
            'absent' => $pointages->where('statut', 'absent')->count(),
            'conge' => $pointages->where('statut', 'conge')->count(),
            'malade' => $pointages->where('statut', 'malade')->count(),
            'formation' => $pointages->where('statut', 'formation')->count(),
            'mission' => $pointages->where('statut', 'mission')->count(),
        ],
    ]);
}
}