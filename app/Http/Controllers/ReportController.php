<?php

namespace App\Http\Controllers;

use App\Models\Vente;
use App\Models\Depense;
use App\Models\Succursale;
use App\Models\User;
use App\Models\VenteProduit;
use Barryvdh\DomPDF\Facade\Pdf as FacadePdf;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Dompdf\Options;
use FPDF;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ReportController extends Controller
{

    public function salesReport(Request $request)
{
    try {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'user_id' => 'nullable|integer|exists:users,id',
            'succursale_id' => 'nullable|integer|exists:succursales,id',
            'type' => 'nullable|in:summary,detailed',
            'export' => 'nullable',
        ]);

        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date)->endOfDay();
        
        // Inclure à la fois les produits et les services dans les relations
        $query = Vente::with([
            'vendeur' => function($q) {
                $q->select('id', 'name', 'avatar'); 
            },
            'client' => function($q) {
                $q->select('id', 'name'); 
            }, 
            'succursale' => function($q) {
                $q->select('id', 'nom'); 
            }, 
            'venteProduits.produit',
            'venteProduits.service'
        ])->whereBetween('created_at', [$startDate, $endDate]);

        // Filtrage par vendeur
        if ($request->has('user_id') && $request->user_id) {
            $query->where('vendeur_id', $request->user_id);
        }

        // Filtrage par succursale
        if ($request->has('succursale_id') && $request->succursale_id) {
            $query->where('succursale_id', $request->succursale_id);
        }

        $ventes = $query->get();
        $type = $request->get('type', 'summary');
        $export = $request->get('export');
        
        // Calcul des statistiques avec les mêmes filtres
        $stats = $this->calculateStats($ventes, $startDate, $endDate, $request->user_id, $request->succursale_id);
        
        if ($type === 'detailed') {
            // Récupération des informations supplémentaires pour l'export PDF
            $vendeur = null;
            $succursale = null;
            
            if ($request->has('user_id') && $request->user_id) {
                $vendeur = User::where('id', $request->user_id)->select('id', 'name', 'avatar')->first();
            }
            
            if ($request->has('succursale_id') && $request->succursale_id) {
                $succursale = Succursale::where('id', $request->succursale_id)->select('id', 'nom')->first();
            }
            
            // Récupération des dépenses filtrées pour l'export PDF
            $depensesQuery = Depense::whereBetween('created_at', [$startDate, $endDate]);
            
            if ($request->has('user_id') && $request->user_id) {
                $depensesQuery->where('user_id', $request->user_id);
            }
            
            // Si vous avez une relation entre dépenses et succursales, ajoutez ce filtre
            // if ($request->has('succursale_id') && $request->succursale_id && method_exists(Depense::class, 'succursale')) {
            //     $depensesQuery->where('succursale_id', $request->succursale_id);
            // }
            
            $depenses = $depensesQuery->get();
            
            if ($export === 'pdf') {
                return Inertia::render('Reports/PrintReport', [
                    'stats' => $stats,
                    'ventes' => $ventes,
                    'depenses' => $depenses, 
                    'vendeur' => $vendeur,
                    'succursale' => $succursale,
                    'filters' => $request->all(),
                    'entreprise' => [
                        'nom' => 'BELLA HAIR MAKEUP',
                        'rccm' => '23-A-07022',
                        'id_national' => '01-G4701-N300623',
                        'address' => $succursale && $succursale->adresse 
                            ? $succursale->adresse 
                            : "Galerie Saint Pierre Avenue Colonel Mondjiba, 374 Kinshasa Ngaliema",
                        'phone' => $succursale && $succursale->telephone 
                            ? $succursale->telephone 
                            : "+243897456311",
                        'email' => $succursale && $succursale->email 
                            ? $succursale->email 
                            : "info@bellahairmakeup.com",
                        'logo' => asset('images/logo.png'), 
                    ]
                ]);
            }
            
            return response()->json([
                'stats' => $stats,
                'ventes' => $ventes,
                'depenses' => $depenses, // ← Et aussi pour la réponse JSON
                'filters' => $request->all()
            ]);
        }
        
        return response()->json([
            'stats' => $stats,
            'filters' => $request->all()
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage()
        ], 422);
    }
}

private function calculateStats($ventes, $startDate, $endDate, $userId = null, $succursaleId = null)
{
    $totalVentes = $ventes->count();
    $montantTotal = $ventes->sum('montant_total');
    $montantRemise = $ventes->sum('remise');
    
    // Construction de la requête pour les items les plus vendus avec les mêmes filtres
    $topItemsQuery = VenteProduit::whereHas('vente', function($q) use ($startDate, $endDate, $userId, $succursaleId) {
        $q->whereBetween('created_at', [$startDate, $endDate]);
        
        if ($userId) {
            $q->where('vendeur_id', $userId);
        }
        
        if ($succursaleId) {
            $q->where('succursale_id', $succursaleId);
        }
    });
    
    $topItems = $topItemsQuery
        ->select(
            'produit_id',
            'service_id',
            DB::raw('SUM(quantite) as total_quantite'),
            DB::raw('SUM(montant_total) as total_montant')
        )
        ->with(['produit', 'service'])
        ->groupBy('produit_id', 'service_id')
        ->orderByDesc('total_quantite')
        ->take(5)
        ->get();
    
    // Transformer les résultats pour inclure produits et services
    $topItemsFormatted = $topItems->map(function ($item) {
        if ($item->produit_id && $item->produit) {
            return [
                'type' => 'produit',
                'item_id' => $item->produit_id,
                'total_quantite' => $item->total_quantite,
                'total_montant' => $item->total_montant,
                'item' => [
                    'id' => $item->produit->id,
                    'name' => $item->produit->name,
                    'avatar' => $item->produit->avatar,
                    'description' => $item->produit->description,
                    'prix_vente' => $item->produit->prix_vente,
                ]
            ];
        } elseif ($item->service_id && $item->service) {
            return [
                'type' => 'service',
                'item_id' => $item->service_id,
                'total_quantite' => $item->total_quantite,
                'total_montant' => $item->total_montant,
                'item' => [
                    'id' => $item->service->id,
                    'name' => $item->service->name,
                    'description' => $item->service->description,
                    'prix' => $item->service->prix,
                ]
            ];
        } else {
            return [
                'type' => 'inconnu',
                'item_id' => null,
                'total_quantite' => $item->total_quantite,
                'total_montant' => $item->total_montant,
                'item' => null
            ];
        }
    });

    // Construction de la requête pour les dépenses avec les mêmes filtres
    $depensesQuery = Depense::whereBetween('created_at', [$startDate, $endDate]);
    
    if ($userId) {
        $depensesQuery->where('user_id', $userId);
    }
    
    // Si vous avez une relation entre dépenses et succursales, ajoutez ce filtre
    // if ($succursaleId && method_exists(Depense::class, 'succursale')) {
    //     $depensesQuery->where('succursale_id', $succursaleId);
    // }
    
    $totalDepenses = $depensesQuery->sum('montant');

    return [
        'total_ventes' => $totalVentes,
        'montant_total' => $montantTotal,
        'montant_remise' => $montantRemise,
        'montant_net' => $montantTotal - $montantRemise,
        'total_depenses' => $totalDepenses,
        'benefice_net' => ($montantTotal - $montantRemise) - $totalDepenses,
        'top_items' => $topItemsFormatted,
        'periode' => [
            'start' => $startDate->format('Y-m-d'),
            'end' => $endDate->format('Y-m-d')
        ],
        'filters_applied' => [
            'user_id' => $userId,
            'succursale_id' => $succursaleId
        ]
    ];
}
    public function index(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::today()->toDateString());
        $endDate = $request->input('end_date', Carbon::today()->toDateString());
        $userId = $request->input('user_id');

        $query = Vente::with(['vendeur', 'venteProduits.produit', 'venteProduits.service'])
            ->whereBetween('created_at', [Carbon::parse($startDate)->startOfDay(), Carbon::parse($endDate)->endOfDay()]);

        if ($userId) {
            $query->where('vendeur_id', $userId);
        }

        $ventes = $query->get();
        $depenses = Depense::with('user')
            ->whereBetween('created_at', [Carbon::parse($startDate)->startOfDay(), Carbon::parse($endDate)->endOfDay()])
            ->when($userId, fn($q) => $q->where('user_id', $userId))
            ->get();

        $vendeurs = User::whereIn('role', ['gerant', 'coiffeur', 'caissier', 'admin'])->get();

        return inertia('Reports/Index', [
            'ventes' => $ventes,
            'depenses' => $depenses,
            'vendeurs' => $vendeurs,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'user_id' => $userId,
            ],
        ]);
    }

    public function salesReportIndex()
{
    // Récupérer les vendeurs et succursales pour les filtres
    $vendeurs = User::select('id', 'name')
    ->orderBy('name')
    ->get();

$succursales = Succursale::select('id', 'nom')
    ->orderBy('nom')
    ->get();

    return inertia('Reports/SalesReport', [
        'vendeurs' => $vendeurs,
        'succursales' => $succursales,
        'filters' => [
            'start_date' => now()->startOfMonth()->format('Y-m-d'),
            'end_date' => now()->format('Y-m-d'),
            'user_id' => null,
            'succursale_id' => null,
        ]
    ]);
}

public function print(Request $request)
{
    $data = $this->salesReport($request);
    $reportData = json_decode($data->getContent(), true);
    
    return inertia('Reports/PrintReport', $reportData);
}
    public function generatePdfa(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::today()->toDateString());
        $endDate = $request->input('end_date', Carbon::today()->toDateString());
        $userId = $request->input('user_id');

        $query = Vente::with(['vendeur', 'venteProduits.produit', 'venteProduits.service'])
            ->whereBetween('created_at', [Carbon::parse($startDate)->startOfDay(), Carbon::parse($endDate)->endOfDay()]);

        if ($userId) {
            $query->where('vendeur_id', $userId);
        }

        $ventes = $query->get();
        $depenses = Depense::with('user')
            ->whereBetween('created_at', [Carbon::parse($startDate)->startOfDay(), Carbon::parse($endDate)->endOfDay()])
            ->when($userId, fn($q) => $q->where('user_id', $userId))
            ->get();

        $vendeur = $userId ? User::find($userId) : null;

        $data = [
            'ventes' => $ventes,
            'depenses' => $depenses,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'vendeur' => $vendeur,
        ];
        $logo = file_get_contents(public_path('images/logo.png'));
        $logoBase64 = base64_encode($logo);
        $data['logo'] = $logoBase64;
        $entreprise = [
            'nom' => 'BELLA HAIR MAKEUP',
            'rccm'=>'23-A-07022',
            'id_national'=>'01-G4701-N300623',
            'adresse' => $vendeur->succursale->adresse,
            'nom_sucursale' => $vendeur->succursale->nom,
            'telephone' => "+243970054889",
            'email' => 'info@bellahairmakeup.com',
            
        ];
        $data['entreprise'] = $entreprise;
       
        $pdf = FacadePdf::loadView('reports.pdf', $data)->setPaper('A4', 'landscape');
        return $pdf->stream('rapport-ventes.pdf');
    }
    
    public function generatePdf(Request $request)
{
    // Validation des paramètres
    $request->validate([
        'start_date' => 'required|date',
        'end_date' => 'required|date|after_or_equal:start_date',
        'user_id' => 'nullable|integer|exists:users,id',
    ]);

    // Vérification de sécurité
    if ($request->user_id && $request->user_id != Auth::user()->id) {
        abort(403);
    }

    $startDate = Carbon::parse($request->start_date)->startOfDay();
    $endDate = Carbon::parse($request->end_date)->endOfDay();
    $userId = $request->user_id ?: Auth::user()->id;

    // Récupération des ventes
    $query = Vente::with(['vendeur','client','succursale','venteProduits.produit','venteProduits.service'])
        ->whereBetween('created_at', [$startDate, $endDate]);

    if ($userId) {
        $query->where('vendeur_id', $userId);
    }

    $ventes = $query->get();

    // Récupération des dépenses AVEC LES MÊMES FILTRES
    $depensesQuery = Depense::with('user')
        ->whereBetween('created_at', [$startDate, $endDate]);

    if ($userId) {
        $depensesQuery->where('user_id', $userId);
    }

    $depenses = $depensesQuery->get();

    $vendeur = User::with('succursale')->find($userId);
    
    // CALCUL DES STATS CORRIGÉ
    $stats = $this->calculateStatsForPdf($ventes, $depenses, $startDate, $endDate, $userId);

    $entreprise = [
        'nom' => 'BELLA HAIR MAKEUP',
        'rccm' => '23-A-07022',
        'id_national' => '01-G4701-N300623',
        'address' => $vendeur && $vendeur->succursale 
            ? $vendeur->succursale->adresse 
            : "Galerie Saint Pierre Avenue Colonel Mondjiba, 374 Kinshasa Ngaliema",
        'nom_sucursale' => $vendeur && $vendeur->succursale ? $vendeur->succursale->nom : null,
        'phone' => "+243970054889",
        'logo' => asset('images/logo.png'),
        'email' => 'info@bellahairmakeup.com',
    ];

    return Inertia::render('Reports/PrintReport', [
        'ventes' => $ventes,
        'depenses' => $depenses,
        'vendeur' => $vendeur,
        'entreprise' => $entreprise,
        'filters' => [
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
            'user_id' => $userId,
        ],
        'stats' => $stats,
        'succursale' => $vendeur ? $vendeur->succursale : null,
    ]);
}

// NOUVELLE MÉTHODE POUR CALCULER LES STATS POUR PDF
private function calculateStatsForPdf($ventes, $depenses, $startDate, $endDate, $userId = null)
{
    $totalVentes = $ventes->count();
    $montantTotal = $ventes->sum('montant_total');
    $montantRemise = $ventes->sum('remise');
    $totalDepenses = $depenses->sum('montant');

    /*/ DEBUG : Log pour vérifier
    \Log::info('Stats PDF calculées', [
        'start_date' => $startDate,
        'end_date' => $endDate,
        'user_id' => $userId,
        'nb_ventes' => $totalVentes,
        'montant_total' => $montantTotal,
        'total_depenses' => $totalDepenses,
        'nb_depenses' => $depenses->count()
    ]);*/

    return [
        'total_ventes' => $totalVentes,
        'montant_total' => $montantTotal,
        'montant_remise' => $montantRemise,
        'montant_net' => $montantTotal - $montantRemise,
        'total_depenses' => $totalDepenses,
        'benefice_net' => ($montantTotal - $montantRemise) - $totalDepenses,
        'periode' => [
            'start' => $startDate->format('Y-m-d'),
            'end' => $endDate->format('Y-m-d')
        ]
    ];
}









public function generatePdfsynthese(Request $request)
{
    ini_set('memory_limit', '256M');    
    $request->validate([
        'start_date' => 'required|date',
        'end_date' => 'required|date|after_or_equal:start_date',
    ]);

    $startDate = Carbon::parse($request->start_date)->startOfDay();
    $endDate = Carbon::parse($request->end_date)->endOfDay();

    // Récupérer les ventes de la période
    $ventes = Vente::where('vendeur_id', Auth::user()->id)
        ->whereBetween('created_at', [$startDate, $endDate])
        ->get();

    // Calculer les statistiques
    $stats = $this->calculateStatsSynthese($ventes, $startDate, $endDate);
    $vendeur = User::find(Auth::user()->id);

    return Inertia::render('Reports/MonReports/IndexSyntese', [
        'vendeur' => $vendeur,
        'stats' => $stats,
        'start_date' => $startDate->format('Y-m-d'),
        'end_date' => $endDate->format('Y-m-d'),
        'entreprise' => [
                        'nom' => 'BELLA HAIR MAKEUP',
                        'rccm'=>'23-A-07022',
                        'id_national'=>'01-G4701-N300623',
                        'address' => (function() use ($vendeur) {
                            if ($vendeur && $vendeur->succursale) {
                                return $vendeur->succursale->adresse;
                            }
                            return "Galerie Saint Pierre Avenue Colonel Mondjiba, 374 Kinshasa Ngaliema";
                        })(),
                        'phone' => (function() use ($vendeur) {
                            if ($vendeur && $vendeur->succursale) {
                                return $vendeur->succursale->telephone;
                            }
                            return "+243897456311";
                        })(),
                        'email' => (function() use ($vendeur) {
                            if ($vendeur && $vendeur->succursale) {
                                return $vendeur->succursale->email;
                            }
                            return "info@bellahairmakeup.com";
                        })(),
                        'logo' => asset('images/logo.png'), 
                    ]
    ]);
}




private function calculateStatsSynthese($ventes, $startDate, $endDate)
{
    ini_set('memory_limit', '256M');  
    $endDate = $endDate->copy()->endOfDay();  
    // Ajuster endDate si startDate et endDate sont identiques
    if ($startDate->format('Y-m-d H:i:s') === $endDate->format('Y-m-d H:i:s')) {
        $endDate = $endDate->copy()->endOfDay();
    }

    $totalVentes = $ventes->count();
    $montantTotal = $ventes->sum('montant_total');
    $montantRemise = $ventes->sum('remise');

    // Produits ET services les plus vendus
    $topItems = VenteProduit::whereHas('vente', function($q) use ($startDate, $endDate) {
            $q->whereBetween('created_at', [$startDate, $endDate]);
        })
        ->select(
            'produit_id',
            'service_id',
            DB::raw('SUM(quantite) as total_quantite'),
            DB::raw('SUM(montant_total) as total_montant')
        )
        ->with(['produit', 'service'])
        ->groupBy('produit_id', 'service_id')
        ->orderByDesc('total_quantite')
        ->take(5)
        ->get();

    // Transformer les résultats pour inclure produits et services
    

    // Dépenses sur la période
    $totalDepenses = Depense::where('user_id', Auth::user()->id)
        ->whereBetween('created_at', [$startDate, $endDate])
        ->sum('montant');

    // Données quotidiennes pour chaque jour de la période
    $dailyData = [];
    $currentDate = $startDate->copy();
    
    while ($currentDate <= $endDate) {
        $dayStart = $currentDate->copy()->startOfDay();
        $dayEnd = $currentDate->copy()->endOfDay();
        
        // Ventes du jour
        $dailyVentes = Vente::where('vendeur_id', Auth::user()->id)
            ->whereBetween('created_at', [$dayStart, $dayEnd])
            ->get();
        
        $dailyVentesCount = $dailyVentes->count();
        $dailyMontantTotal = $dailyVentes->sum('montant_total');
        $dailyMontantRemise = $dailyVentes->sum('remise');
        
        // Dépenses du jour
        $dailyDepenses = Depense::where('user_id', Auth::user()->id)
            ->whereBetween('created_at', [$dayStart, $dayEnd])
            ->sum('montant');
        
        $dailyData[] = [
            'date' => $currentDate->format('Y-m-d'),
            'ventes_count' => $dailyVentesCount,
            'montant_total' => $dailyMontantTotal,
            'montant_remise' => $dailyMontantRemise,
            'montant_net' => $dailyMontantTotal - $dailyMontantRemise,
            'depenses' => $dailyDepenses,
            'benefice_net' => ($dailyMontantTotal - $dailyMontantRemise) - $dailyDepenses
        ];
        
        $currentDate->addDay();
    }
    //dd($dailyData);
    return [
        'total_ventes' => $totalVentes,
        'montant_total' => $montantTotal,
        'montant_remise' => $montantRemise,
        'montant_net' => $montantTotal - $montantRemise,
        'total_depenses' => $totalDepenses,
        'benefice_net' => ($montantTotal - $montantRemise) - $totalDepenses,
        'daily_data' => $dailyData,
        'periode' => [
            'start' => $startDate->format('Y-m-d'),
            'end' => $endDate->format('Y-m-d'),
            'days_count' => count($dailyData)
        ],
        
    ];
}
}

class PDF extends FPDF
{

// Pied de page
function Footer()
{
    // Positionnement à 1,5 cm du bas
    $this->SetY(-15);
    // Police Arial italique 8
    $this->AddFont('Comfortaa'); // Important : sans extension .php
    $this->AddFont('comfortaa', 'B'); 
    $this->SetFont('Comfortaa','B',8);
    // Numéro de page
    $this->Cell(0,10,'Page '.$this->PageNo().'/{nb}',0,0,'C');
}








}
