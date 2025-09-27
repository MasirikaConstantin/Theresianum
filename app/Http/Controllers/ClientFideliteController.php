<?php
namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\ClientFidelite;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ClientFideliteController extends Controller
{
    public function index(Request $request)
{
    $query = Client::with(['fidelite' => function($q) {
    $q->select('client_id', 'points', 'nombre_achats', 'montant_total_achats', 'a_recu_cadeau_anniversaire');
}])
->when($request->has('anniversaire'), function($q) {
    $q->whereMonth('date_naissance', now()->month)
      ->whereDay('date_naissance', now()->day);
})
->when($request->has('meilleurs'), function($q) {
    $q->select('clients.*', 'client_fidelites.montant_total_achats') // Ajout important
      ->join('client_fidelites', 'clients.id', '=', 'client_fidelites.client_id')
      ->orderBy('client_fidelites.montant_total_achats', 'desc');
})
->when($request->has('search'), function($q) use ($request) {
            $search = $request->search;
            $q->where(function($query) use ($search) {
                $query->where('name', 'like', "%$search%")
                      ->orWhere('email', 'like', "%$search%")
                      ->orWhere('telephone', 'like', "%$search%");
            });
        });

    $paginator = $query->get();
    
    // Ajoute l'information d'anniversaire proche à chaque client
    $paginator->transform(function ($client) {
        if ($client->date_naissance) {
            $birthday = Carbon::parse($client->date_naissance);
            $today = Carbon::now();
            $nextBirthday = $birthday->copy()->year($today->year);
            
            if ($nextBirthday->lt($today)) {
                $nextBirthday->addYear();
            }
            
            $daysUntilBirthday = $today->diffInDays($nextBirthday, false);
            
            $client->anniversaire_proche = $daysUntilBirthday >= 0 && $daysUntilBirthday <= 7;
            $client->jours_avant_anniversaire = $daysUntilBirthday;
        } else {
            $client->anniversaire_proche = false;
            $client->jours_avant_anniversaire = null;
        }
        
        return $client;
    });

    $response = $paginator->toArray();
    $response['stats'] = [
        'total_clients' => Client::count(),
        'clients_anniversaire' => Client::whereMonth('date_naissance', now()->month)
            ->whereDay('date_naissance', now()->day)->count(),
        'meilleur_client' => ClientFidelite::with('client')
            ->orderBy('montant_total_achats', 'desc')
            ->first()
    ];

    return response()->json($response);
}


    public function show(Client $client)
    {
        return response()->json([
            'client' => $client->load('fidelite'),
            'ventes' => $client->ventes()->with(['items.produit', 'items.service'])->get(),
            'stats' => [
                'total_ventes' => $client->ventes()->count(),
                'total_depense' => $client->ventes()->sum('montant_total'),
                'moyenne_achat' => $client->ventes()->avg('montant_total'),
            ]
        ]);
    }

    public function offrirCadeauAnniversaire(Client $client)
    {
        try{

            $fidelite = $client->fidelite;
            if ($fidelite && !$fidelite->a_recu_cadeau_anniversaire) {
                $fidelite->update([
                    'points' => $fidelite->points + 50, // 50 points bonus
                    'a_recu_cadeau_anniversaire' => true
                ]);
                
                return response()->json(['success' => 'Cadeau d\'anniversaire offert avec succès']);
            }
        }catch(Exception $e){
            return response()->json(['error' => "Le Client n'a pas de fidelite"]);
        }
        
        
        return response()->json(['error' => "Le Client n'a pas de fidelite"]);
        
        //return response()->json(['error' => 'Cadeau déjà offert ou client non trouvé'], 400);
    }
}