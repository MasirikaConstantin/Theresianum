<?php

namespace App\Http\Controllers;

use App\Models\Vente;
use App\Models\Depense;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf as FacadePdf;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Dompdf\Options;
use FPDF;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class MonReportController extends Controller
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
        $vendeur = $this->user;
        $startDate = $request->input('start_date', Carbon::today()->toDateString());
        $endDate = $request->input('end_date', Carbon::today()->toDateString());
        $userId = $vendeur->id;

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

        $vendeurs = User::whereIn('role', ['gerant', 'coiffeur', 'vendeur', 'admin'])->get();

        return inertia('Reports/MonReports/Index', [
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

}
