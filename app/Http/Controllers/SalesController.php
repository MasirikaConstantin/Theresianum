<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\Vente;
use App\Models\VenteProduit;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class SalesController extends Controller
{
    protected $user;

    public function __construct()
    {
        // S'assure que l'utilisateur est authentifié
        $this->middleware(function ($request, $next) {
            $this->user = User::where('id', Auth::id())->first();
            return $next($request);
        });
    }
    public function getSalesData(Request $request)
    {
        $range = $request->input('range', 'today');
        
        $query = Vente::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(montant_total) as total_sales'),
            DB::raw('COUNT(*) as transactions')
        )
        ->groupBy('date')
        ->orderBy('date');
        
        switch ($range) {
            case 'week':
                $query->where('created_at', '>=', Carbon::now()->subWeek());
                break;
            case 'month':
                $query->where('created_at', '>=', Carbon::now()->subMonth());
                break;
            default: // today
                $query->whereDate('created_at', Carbon::today());
                break;
        }

        if (!$this->user->hasRole('admin')) {
            if($this->user->hasRole('coiffeur') || $this->user->hasRole('vendeur')) {
                $query->where('ventes.vendeur_id', $this->user->id);
            }else{
                $query->where('ventes.succursale_id', $this->user->succursale_id);
            }
        }        
        $salesData = $query->get();
        
        return response()->json($salesData);
    }

    public function getProductServiceData(Request $request)
    {
        $range = $request->input('range', 'today');
        $user_id = $request->input('user_id');
        $user = User::where('id', $user_id)->first();
            
            if ($user->hasRole('admin') || $user->hasRole('gerant')) {
                $query = VenteProduit::select(
                    DB::raw('DATE(vente_produits.created_at) as date'),
                    DB::raw('SUM(CASE WHEN produit_id IS NOT NULL THEN vente_produits.montant_total ELSE 0 END) as produits'),
                    DB::raw('COUNT(DISTINCT vente_id) as transactions_produits')
                )
                ->join('ventes', 'ventes.id', '=', 'vente_produits.vente_id')
                ->groupBy('date')
                ->orderBy('date'); 
            }elseif($user->hasRole('coiffeur') || $user->hasRole('vendeur')) {
                    $query = VenteProduit::select(
                        DB::raw('DATE(vente_produits.created_at) as date'),
                        DB::raw('SUM(CASE WHEN produit_id IS NOT NULL THEN vente_produits.montant_total ELSE 0 END) as produits'),
                        DB::raw('COUNT(DISTINCT CASE WHEN produit_id IS NOT NULL THEN vente_id END) as transactions_produits')
                    )
                    ->join('ventes', 'ventes.id', '=', 'vente_produits.vente_id')
                    ->where('ventes.vendeur_id', $user->id)
                    ->groupBy('date')
                    ->orderBy('date');  
            }
        
        switch ($range) {
            case 'week':
                $query->where('vente_produits.created_at', '>=', Carbon::now()->subWeek());
                break;
            case 'month':
                $query->where('vente_produits.created_at', '>=', Carbon::now()->subMonth());
                break;
            default: // today
                $query->whereDate('vente_produits.created_at', Carbon::today());
                break;
        }

              
        return response()->json($query->get());
    }



    public function index()
    {
        if($this->user->hasRole('admin') || $this->user->hasRole('gerant')){
        // Produits les plus vendus
        $topProducts = DB::table('vente_produits')
            ->select(
                'produit_id',
                'produits.name',
                DB::raw('SUM(quantite) as total_quantity'),
                DB::raw('SUM(montant_total) as total_amount')
            )
            ->join('produits', 'vente_produits.produit_id', '=', 'produits.id')
            ->whereNotNull('produit_id')
            ->groupBy('produit_id', 'produits.name')
            ->orderByDesc('total_amount')
            ->limit(15)
            ->get();

       
       

        
    }elseif($this->user->hasRole('coiffeur') || $this->user->hasRole('vendeur')){
        // Produits les plus vendus PAR CE VENDEUR
        $topProducts = DB::table('vente_produits')
        ->select(
            'produit_id',
            'produits.name',
            DB::raw('SUM(vente_produits.quantite) as total_quantity'),
            DB::raw('SUM(vente_produits.montant_total) as total_amount')
        )
        ->join('produits', 'vente_produits.produit_id', '=', 'produits.id')
        ->join('ventes', 'vente_produits.vente_id', '=', 'ventes.id') // Jointure avec la table ventes
        ->whereNotNull('produit_id')
        ->where('ventes.vendeur_id', $this->user->id) // Filtre par vendeur
        ->groupBy('produit_id', 'produits.name')
        ->orderByDesc('total_amount')
        ->limit(15)
        ->get();

   
        
    }

    // Transformer les données pour le frontend
    $result = [];

    // Ajouter les produits
    foreach ($topProducts as $product) {
        $result[] = [
            'id' => $product->produit_id,
            'name' => $product->name,
            'type' => 'produit',
            'total_quantity' => $product->total_quantity,
            'total_amount' => $product->total_amount,
        ];
    }
    
        return response()->json($result);
    }
}