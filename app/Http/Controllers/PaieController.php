<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\Paie;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PaieController extends Controller
{
    public function index(Request $request)
    {
        $query = Paie::select(['id', 'ref', 'agent_id', 'date_emission','nom_complet','matricule','net_a_payer', 'created_at','created_by','updated_at'])
            ->with(['agent',"agent.contrats", 'createdBy'])
            ->latest();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nom_complet', 'like', "%{$search}%")
                  ->orWhere('matricule', 'like', "%{$search}%")
                  ->orWhere('ref', 'like', "%{$search}%");
            });
        }

        if ($request->has('month')) {
            $query->whereMonth('date_emission', $request->month);
        }

        if ($request->has('year')) {
            $query->whereYear('date_emission', $request->year);
        }

        $paies = $query->paginate(10);

        return Inertia::render('Paie/Index', [
            'paies' => $paies,
            'filters' => $request->only(['search', 'month', 'year'])
        ]);
    }

    public function create()
    {
        $lastRef = Paie::orderBy('id', 'desc')->first()?->ref;

        return Inertia::render('Paie/Create', [
            'defaultPeriod' => [
                'start' => now()->startOfMonth()->format('Y-m-d'),
                'end' => now()->endOfMonth()->format('Y-m-d'),
                'emission' => now()->format('Y-m-d')
            ],
            
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'agent_id' => 'required|exists:agents,id',
            'date_debut_periode' => 'required|date',
            'date_fin_periode' => 'required|date|after_or_equal:date_debut_periode',
            'date_emission' => 'required|date',
            'salaire_base' => 'required|numeric|min:0',
            'heures_supplementaires' => 'nullable|numeric|min:0',
            'prime_fidelite' => 'nullable|numeric|min:0',
            'avance_salaire' => 'nullable|numeric|min:0',
            'allocation_familiale' => 'nullable|numeric|min:0',
            'allocation_epouse' => 'nullable|numeric|min:0',
            'afm_gratification' => 'nullable|numeric|min:0',
            'cotisation_cnss' => 'nullable|numeric|min:0',
            'impot_revenu' => 'nullable|numeric|min:0',
            'prets_retenus' => 'nullable|numeric|min:0',
            'paie_negative' => 'nullable|numeric|min:0',
            'autres_regularisations' => 'nullable|numeric|min:0',
            'net_a_payer'=>'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {
            $agent = Agent::findOrFail($request->agent_id);

            $paie = new Paie($request->all());
            $paie->fill([
                'matricule' => $agent->matricule,
                'nom_complet' => $agent->nom . ' ' . $agent->postnom . ' ' . $agent->prenom,
                'nombre_enfants' => $agent->nombre_enfant ?? 0,
                'fonction' => $agent->role,
                'affectation' => $agent->succursale_id,
                'numero_cnss' => $agent->numero_cnss,
                'anciennete' => $agent->created_at->diffInYears(now()) . ' ans',
                'allocation_familiale' => $request->allocation_familiale, //$this->calculateFamilyAllocations($agent, $request->salaire_base),
                'cotisation_cnss' => $request->cotisation_cnss, //$request->salaire_base * 0.05,
                'created_by' => auth()->id(),
                'ref' => $request->ref,
            ]);

            // Calcul des totaux
            $this->calculateTotals($paie);

            $paie->save();

            DB::commit();

            return redirect()->route('paies.show', $paie->ref)
                ->with('success', 'Bulletin de paie créé avec succès.');
        } catch (\Exception $e) {
            dd($e->getMessage());
            DB::rollBack();
            return back()->with('error', 'Erreur lors de la création: ' . $e->getMessage());
        }
    }

    public function show(string $ref)
    {
        $paie = Paie::where('ref', $ref)->first();
        $paie->load(['agent','agent.succursale'=>function($query){
            $query->select('id','nom','adresse','ref');
        },'createdBy','updatedBy']);
        
        return Inertia::render('Paie/Show', [
            'paie' => $paie,
            'agent' => $paie->agent,
        ]);
    }

    public function edit(Paie $paie)
    {
        $agents = Agent::active()->get();
        
        return Inertia::render('Paie/Edit', [
            'paie' => $paie,
            'agents' => $agents,
        ]);
    }

    public function update(Request $request, Paie $paie)
    {
        $request->validate([
            'agent_id' => 'required|exists:agents,id',
            'date_debut_periode' => 'required|date',
            'date_fin_periode' => 'required|date|after_or_equal:date_debut_periode',
            'date_emission' => 'required|date',
            'salaire_base' => 'required|numeric|min:0',
            'heures_supplementaires' => 'nullable|numeric|min:0',
            'conges_payes' => 'nullable|numeric|min:0',
            'pecule_conge' => 'nullable|numeric|min:0',
            'gratification' => 'nullable|numeric|min:0',
            'prime_fidelite' => 'nullable|numeric|min:0',
            'prime_diverse' => 'nullable|numeric|min:0',
            'allocation_familiale' => 'nullable|numeric|min:0',
            'allocation_epouse' => 'nullable|numeric|min:0',
            'afm_gratification' => 'nullable|numeric|min:0',
            'cotisation_cnss' => 'nullable|numeric|min:0',
            'impot_revenu' => 'nullable|numeric|min:0',
            'prets_retenus' => 'nullable|numeric|min:0',
            'avance_salaire' => 'nullable|numeric|min:0',
            'paie_negative' => 'nullable|numeric|min:0',
            'autres_regularisations' => 'nullable|numeric|min:0',
            'net_a_payer' => 'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {
            $agent = Agent::findOrFail($request->agent_id);

            $paie->fill($request->all());
            $paie->fill([
                'matricule' => $agent->matricule,
                'nom_complet' => $agent->nom . ' ' . $agent->postnom . ' ' . $agent->prenom,
                'nombre_enfants' => $agent->nombre_enfant ?? 0,
                'allocation_familiale' => $request->allocation_familiale, // $this->calculateFamilyAllocations($agent, $request->salaire_base),
                'cotisation_cnss' => $request->cotisation_cnss, //$request->salaire_base * 0.05,
                'updated_by' => auth()->id(),
            ]);

            $this->calculateTotals($paie);
            $paie->save();

            DB::commit();

            return redirect()->route('paies.show', $paie->id)
                ->with('success', 'Bulletin de paie mis à jour avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Erreur lors de la mise à jour: ' . $e->getMessage());
        }
    }

    public function destroy(Paie $paie)
    {
        $paie->delete();
        return redirect()->route('paies.index')
            ->with('success', 'Bulletin de paie supprimé avec succès.');
    }

    public function print(Paie $paie)
    {
        $paie->load('agent');
        $agent = $paie->agent;
        $agent->load('succursale');
        return Inertia::render('Paie/Print', [
            'paie' => $paie,
            'entreprise' => [
                'name' => config('app.name'),
                'address' => $agent->succursale->adresse,
                'phone' => $agent->succursale->telephone,
                'email' => $agent->succursale->email,
                'logo' => asset("images/logo.png"),
            ]
        ]);
    }

    protected function calculateFamilyAllocations(Agent $agent, float $salaireBase): float
    {
        $nbEnfants = min($agent->nombre_enfant ?? 0, 5);
        return $salaireBase * 0.07 * $nbEnfants; // 7% par enfant (max 5)
    }

    protected function calculateTotals(Paie $paie): void
    {
        // Gains
        $gains = $paie->salaire_base 
            + $paie->heures_supplementaires
            + $paie->conges_payes
            + $paie->pecule_conge
            + $paie->gratification
            + $paie->prime_fidelite
            + $paie->prime_diverse
            + $paie->allocation_familiale
            + $paie->allocation_epouse
            + $paie->afm_gratification;

        // Retenues
        $retenues = $paie->cotisation_cnss
            + $paie->impot_revenu
            + $paie->prets_retenus
            + $paie->avance_salaire
            + $paie->paie_negative
            + $paie->autres_regularisations;

        // Calcul de l'impôt sur le revenu (simplifié)
        $netImposable = $gains - $paie->cotisation_cnss;
        $paie->impot_revenu = $this->calculateIncomeTax($netImposable);
        $retenues = $paie->cotisation_cnss + $paie->impot_revenu + $paie->prets_retenus + $paie->avance_salaire;

        $paie->remuneration_brute = $gains;
        $paie->total_retenues = $retenues;
        $paie->net_imposable = $netImposable;
        //$paie->net_a_payer = $gains - $retenues;
    }

    protected function calculateIncomeTax(float $netImposable): float
    {
        // Barème fiscal RDC (2023 - à adapter selon la loi en vigueur)
        if ($netImposable <= 1500) return 0;
        if ($netImposable <= 5000) return $netImposable * 0.15;
        if ($netImposable <= 10000) return $netImposable * 0.20;
        if ($netImposable <= 15000) return $netImposable * 0.25;
        return $netImposable * 0.30;
    }

    public function getAgent(Request $request)
    {
        try {
            // Convertir les dates ISO en objets Carbon
            $date = Carbon::parse($request->date)->format('Y-m-d');
            $date_fin = Carbon::parse($request->date_fin_periode)->format('Y-m-d');
    
            $agents = Agent::active()
                ->with([
                    'contrats' => function ($query) {
                        $query->where('is_active', true)
                            ->select('id','agent_id','date_debut','date_fin','salaire_base','ref','fonction');
                    },
                    'pointages' => function ($query) use ($date, $date_fin) { 
                        $query->whereBetween('date', [$date, $date_fin]);
                    }
                ])
                ->select('id', 'nom', 'postnom', 'prenom', 'matricule', 'ref', 'nombre_enfant', 'role', 'numero_cnss')
                ->get();
    
            return response()->json($agents);
    
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Invalid date format',
                'details' => $e->getMessage()
            ], 400);
        }
    }
    public function getOneAgent(string $ref)
    {
            $agent = Agent::where('ref', $ref)->with(['succursale'=>function($query){
                $query->select('id','nom','adresse','ref');
            },'contrats'=>function($query){
                $query->where('is_active', true)
                ->select('id','agent_id','date_debut','date_fin','salaire_base','ref','fonction');
            },'references'=>function($query){
                $query->select('id','agent_id','nom','telephone','email','fonction');
            }])->first();
    
            return Inertia::render('Agents/FicheIdentification', [
                'agent' => $agent,
                'entreprise' => [
                    'nom' => config('app.name'),
                    'rccm' => 'RCCM/23-A-07022',
                    'id_nat' => '01-G4701-H300625',
                    'telephone' => '+243970054889',
                    'email' => 'info@entreprise.cd',
                    'logo_url' => asset('images/logo.png'),
                    'image_sexe'=>$agent->sexe === 'M' ? asset('images/icons/male.png') : asset('images/icons/female.png'),
                ]
            ]);
    
        
    }
    
}