<?php

use App\Http\Controllers\Akiba;
use App\Http\Controllers\Api\Twilo;
use App\Http\Controllers\ClientController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Vente;
use App\Models\Depense;
use App\Http\Controllers\Api\VenteController;
use App\Http\Controllers\BellaHairController;
use App\Http\Controllers\ClientFideliteController;
use App\Http\Controllers\PaieController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\VendeurController;
use App\Http\Controllers\UserController;
use App\Models\Agent;
use App\Models\Succursale;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use App\Models\Pointage;
use App\Models\Stock;
use App\Models\StockSuccursale;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('ventes')->group(function() {
    // Ventes
    Route::get('/recentes', [VenteController::class, 'ventesRecentes']);
    Route::get('/resume', [VenteController::class, 'resumeVentes']);
    Route::post('/', [VenteController::class, 'creerVente']);
});
Route::get('/sales-data', [SalesController::class, 'getSalesData'])->name('sales.data');
Route::get('/product-service-data', [SalesController::class, 'getProductServiceData']);
Route::get('/statistiques-vendeurs/stats', [VendeurController::class, 'stats'])
    ->name('statistiques.vendeurs.stats');
Route::get('/get-six-hours-stats', [VendeurController::class, 'getSixHoursStats'])
    ->name('get-six-hours-stats');
Route::post('/login', [UserController::class, 'login']);


Route::group(['prefix' => 'fidelite'], function() {
    Route::get('/', [ClientFideliteController::class, 'index']);
    Route::get('/{client}', [ClientFideliteController::class, 'show']);
    Route::post('/{client}/cadeau', [ClientFideliteController::class, 'offrirCadeauAnniversaire']);
});
Route::get('/get-succursales',function(Request $request){
    return response()->json($request->all());
    $succursales = Succursale::find($request->id);
    return response()->json($succursales);
 })->name('get-succursales');

Route::get('/get-pointages',function(string $ref){
    $pointages = Pointage::where('ref', $ref)->get();
    return response()->json($pointages);
 })->name('get-pointages');

 Route::get('/get-agent',[PaieController::class,'getAgent'])->name('get-agent');
Route::get('/get-one-agent/{ref}',[PaieController::class,'getOneAgent'])->name('agents.fiche-identification');

Route::get('/sales-reports', [ReportController::class, 'salesReport'])->name('api.sales.reports');

Route::get('/stock-succursales', function () {
    $stocks = Stock::with(['produit'])
        ->where('actif', true)
        // Stocks en rupture (quantité = 0)
        ->where(function($query) {
            $query->where('quantite', 0)
                  // Stocks en alerte (quantité <= seuil_alerte)
                  ->orWhereRaw('quantite <= quantite_alerte')
                  // Stocks proches de l'alerte (dans une marge de 20% au-dessus du seuil)
                  ->orWhereRaw('quantite <= quantite_alerte * 1.2');
        })
        ->orderBy('produit_id')
        ->get();

    return response()->json($stocks);
});


Route::resource('bellahair',BellaHairController::class);