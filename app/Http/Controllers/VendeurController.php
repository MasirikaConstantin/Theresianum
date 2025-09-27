<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\User;
use App\Models\Vente;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class VendeurController extends Controller
{
    public function index()
{
    $vendeurs = User::with('succursale')
        ->orderBy('name')
        ->get();

    return Inertia::render('Statistiques/Vendeurs', [
        'vendeurs' => $vendeurs,
        'filters' => request()->only(['vendeur_id', 'date_debut', 'date_fin'])
    ]);
}
    /*public function index(Request $request)
    {
        $vendeurs = User::with('succursale')
            ->orderBy('name')
            ->get();

        $selectedVendeur = $request->vendeur_id 
            ? User::with(['succursale'])->find($request->vendeur_id)
            : null;

        // Statistiques
        $stats = null;
        $ventes = [];
        $pointages = [];
        $conges = [];

        if ($selectedVendeur) {
            // Filtres
            $dateDebut = $request->date_debut ? Carbon::parse($request->date_debut) : now()->startOfMonth();
            $dateFin = $request->date_fin ? Carbon::parse($request->date_fin) : now()->endOfMonth();

            // Requêtes optimisées
            $stats = [
                'total_ventes' => Vente::where('vendeur_id', $selectedVendeur->id)
                    ->whereBetween('created_at', [$dateDebut, $dateFin])
                    ->count(),
                'montant_total' => Vente::where('vendeur_id', $selectedVendeur->id)
                    ->whereBetween('created_at', [$dateDebut, $dateFin])
                    ->sum('montant_total'),
                'moyenne_vente' => Vente::where('vendeur_id', $selectedVendeur->id)
                    ->whereBetween('created_at', [$dateDebut, $dateFin])
                    ->avg('montant_total'),
                'produits_vendus' => DB::table('vente_produits')
                    ->join('ventes', 'vente_produits.vente_id', '=', 'ventes.id')
                    ->where('ventes.vendeur_id', $selectedVendeur->id)
                    ->whereBetween('ventes.created_at', [$dateDebut, $dateFin])
                    ->sum('quantite'),
            ];

            $ventes = Vente::where('vendeur_id', $selectedVendeur->id)
                ->with(['client', 'produits', 'services'])
                ->whereBetween('created_at', [$dateDebut, $dateFin])
                ->orderBy('created_at', 'desc')
                ->take(10)
                ->get();

            $pointages = $selectedVendeur->pointages()
                ->whereBetween('date', [$dateDebut, $dateFin])
                ->get();

            $conges = $selectedVendeur->conges()
                ->whereBetween('date_debut', [$dateDebut, $dateFin])
                ->orWhereBetween('date_fin', [$dateDebut, $dateFin])
                ->get();
        }

        return Inertia::render('Statistiques/Vendeurs', [
            'vendeurs' => $vendeurs,
            'selectedVendeur' => $selectedVendeur,
            'stats' => $stats,
            'ventes' => $ventes,
            'pointages' => $pointages,
            'conges' => $conges,
            'filters' => $request->only(['vendeur_id', 'date_debut', 'date_fin'])
        ]);
    }*/

    public function stats(Request $request)
{
    ini_set('memory_limit', '256M');
    $request->validate([
        'vendeur_id' => 'required|exists:users,id',
        'date_debut' => 'nullable|date',
        'date_fin' => 'nullable|date|after_or_equal:date_debut'
    ]);

    $vendeur = User::with(['succursale'])->find($request->vendeur_id);

    // Filtres
    $dateDebut = $request->date_debut ? Carbon::parse($request->date_debut) : now()->startOfMonth();
    $dateFin = $request->date_fin ? Carbon::parse($request->date_fin) : now()->endOfMonth();

    $data = [
        'selectedVendeur' => $vendeur,
        'stats' => [
            'total_ventes' => Vente::where('vendeur_id', $vendeur->id)
                ->whereBetween('created_at', [$dateDebut, $dateFin])
                ->count(),
            'montant_total' => Vente::where('vendeur_id', $vendeur->id)
                    ->whereBetween('created_at', [$dateDebut, $dateFin])
                    ->sum('montant_total'),
            'moyenne_vente' => Vente::where('vendeur_id', $vendeur->id)
                    ->whereBetween('created_at', [$dateDebut, $dateFin])
                    ->avg('montant_total'),
            'produits_vendus' => DB::table('vente_produits')
                    ->join('ventes', 'vente_produits.vente_id', '=', 'ventes.id')
                    ->where('ventes.vendeur_id', $vendeur->id)
                    ->whereBetween('ventes.created_at', [$dateDebut, $dateFin])
                    ->sum('quantite'),
        ],
        'ventes' => Vente::where('vendeur_id', $vendeur->id)
            ->with(['client', 'produits', 'services'])
            ->whereBetween('created_at', [$dateDebut, $dateFin])
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get(),
       
        'date_debut' => $dateDebut->format('d/m/Y'),
        'date_fin' => $dateFin->format('d/m/Y')
    ];

    if ($request->has('export') && $request->export === 'pdf') {
        $data['ventes']= Vente::where('vendeur_id', $vendeur->id)
        ->with(['client', 'produits', 'services'])
        ->whereBetween('created_at', [$dateDebut, $dateFin])
        ->orderBy('created_at', 'desc')
        ->get();
         // Calcul précis de la hauteur (en points - 1mm = 2.83 points)
    $baseHeight = 170; // Hauteur de base en mm (sans articles)
    $perItemHeight = 6; // Hauteur par article en mm
    $totalHeight = $baseHeight + (count($data['ventes']) * $perItemHeight);
    
    // Conversion mm en points (1mm = 2.83 points)
    $widthInPoints = 80 * 2.83;  // 80mm en points
    $heightInPoints = $totalHeight * 2.83;
        $renderer = new ImageRenderer(
            new RendererStyle(100),
            new SvgImageBackEnd()
        );
        $writer = new Writer($renderer);
    
        $qrWeb = 'data:image/svg+xml;base64,' . base64_encode($writer->writeString('https://bellahairmakeup.com/'));  
        $qrFacebook = 'data:image/svg+xml;base64,' . base64_encode($writer->writeString('https://web.facebook.com/Bellawedding1'));  
        $qrInstagram = 'data:image/svg+xml;base64,' . base64_encode($writer->writeString('https://www.instagram.com/bella__hair_makeup/'));  
       
        $pdf = Pdf::loadView('pdf.vendeur-stats', [
            'data'=>$data,
            'entreprise' => [
            'nom' => 'BELLA HAIR MAKEUP',
            'rccm'=>'23-A-07022',
            'id_national'=>'01-G4701-N300623',
            'adresse' => optional($vendeur->succursale)->adresse ?? 'Aucune adresse',
            'telephone' => "+243970054889",
            'email' => 'info@bellahairmakeup.com',
            
        ],
        'qrWeb' => $qrWeb,
        'qrFacebook' => $qrFacebook,
        'qrInstagram' => $qrInstagram
        
        ])->setPaper([0, 0, $widthInPoints, $heightInPoints], 'portrait')
        ->setOption('margin-top', 0)
        ->setOption('margin-bottom', 0)
        ->setOption('margin-left', 0)
        ->setOption('margin-right', 0);
        return $pdf->stream('statistiques-vendeur-'.$vendeur->id.'.pdf');

            //return $pdf->download('statistiques-vendeur-'.$vendeur->id.'.pdf');
    }

    return response()->json($data);
}
public function getSixHoursStats(Request $request)
{
    $request->validate([
        'user_id' => 'required|exists:users,id',
    ]);

    $user = User::find($request->user_id);
    
    // Déterminer l'heure de fin (heure pleine suivante)
    $endHour = now()->addHour()->startOfHour();
    
    // Générer les 6 dernières heures pleines
    $hours = [];
    for ($i = 5; $i >= 0; $i--) {
        $hours[] = $endHour->copy()->subHours($i)->format('H:00');
    }

    // Construire la requête de base
    $query = Vente::where('created_at', '>=', $endHour->copy()->subHours(6))
                ->where('created_at', '<', $endHour);

    // Filtrer par succursale si l'utilisateur n'est pas admin
    if (!$user->hasRole('admin')) {
        if($user->hasRole('coiffeur') || $user->hasRole('caissier')) {
            $query->where('vendeur_id', $user->id);
        } elseif($user->hasRole('gerant')) {
            $query = Vente::where('created_at', '>=', $endHour->copy()->subHours(6))
                ->where('created_at', '<', $endHour);
        }
    }

    // Détection du driver de base de données
    $driver = DB::connection()->getDriverName();
    
    // Récupérer les stats groupées par heure pleine
    $stats = $query->select(
            DB::raw($driver === 'sqlite' 
                ? "strftime('%H:00', created_at) as hour" 
                : "DATE_FORMAT(created_at, '%H:00') as hour"),
            DB::raw('COALESCE(SUM(montant_total), 0) as total_ventes')
        )
        ->groupBy('hour')
        ->get()
        ->keyBy('hour');

    // Combler les trous avec des valeurs à 0
    $result = collect($hours)->map(function ($hour) use ($stats) {
        return [
            'hour' => $hour,
            'total_ventes' => $stats->has($hour) ? (float)$stats[$hour]->total_ventes : 0
        ];
    });

    return response()->json([
        'sixHoursStats' => $result,
        'isAdmin' => $user->hasRole('admin') || $user->hasRole('gerant')
    ]);
}
}