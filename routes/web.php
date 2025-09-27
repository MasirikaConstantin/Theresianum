<?php

use App\Http\Controllers\AccessoiresController;
use App\Http\Controllers\AlertController;
use App\Http\Controllers\CategorieController;
use App\Http\Controllers\ReferenceController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ClientFideliteController;
use App\Http\Controllers\ConfigurationController;
use App\Http\Controllers\CongeController;
use App\Http\Controllers\ContratController;
use App\Http\Controllers\RendezvouController;
use App\Http\Controllers\UtilisateurController;
use App\Http\Controllers\CurrencieController;
use App\Http\Controllers\DocumentationController;
use App\Http\Controllers\MonReportController;
use App\Http\Controllers\PaieController;
use App\Http\Controllers\PointageController;
use App\Http\Controllers\StatistiqueController;
use App\Http\Controllers\TransfertControllerStock;
use App\Http\Controllers\UserStatsController;
use App\Http\Controllers\VendeurController;
use App\Http\Controllers\ProduitController;
use App\Http\Controllers\PromotionController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\StockSuccursaleController;
use App\Models\Currencie;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\VenteController;
use App\Models\Rendezvou;

Route::get('/', function () {

    return Inertia::render('welcome');
})->name('home');



Route::middleware(['auth', 'verified', 'role:admin,gerant,coiffeur,caissier'])->group(function () {
    Route::get('dashboard', function () {
        $user = Auth::user();
        //$pendingTransfersCount =  
        $currencies = Currencie::all();

        return Inertia::render('dashboard', [
            'user' => $user,

            'currencies' => $currencies,
        ]);
    })->name('dashboard');
});

//Route::resource('utilisateurs', UtilisateurController::class)->middleware('role:admin');
Route::middleware('auth', 'actif', 'role:admin,gerant')->group(function () {
    Route::resource('succursales', \App\Http\Controllers\SuccursaleController::class);
    Route::resource('services', \App\Http\Controllers\ServiceController::class);
    Route::patch('services/{service}/update-status', [\App\Http\Controllers\ServiceController::class, 'updateStatus'])->name('services.update-status');
});

Route::middleware('auth', 'actif', 'role:admin,gerant,caissier')->group(function () {
    Route::resource('utilisateurs', \App\Http\Controllers\UserController::class);
    Route::resource('stocks', \App\Http\Controllers\StockController::class);
    Route::resource('produits', \App\Http\Controllers\ProduitController::class);
    Route::patch('produits/{produit}/update-status', [\App\Http\Controllers\ProduitController::class, 'updateStatus'])->name('produits.update-status');

    // Route supplémentaire pour changer le statut
    Route::patch('/stocks/{stock}/toggle-status', [\App\Http\Controllers\StockController::class, 'toggleStatus'])
        ->name('stocks.toggle-status');

    Route::resource('transferts', \App\Http\Controllers\TransfertController::class);

    Route::post('/transferts/{transfert}/validate', [\App\Http\Controllers\TransfertController::class, 'validateTransfert'])
        ->name('transferts.validate');
});
Route::middleware('auth', 'actif', 'role:admin,gerant,coiffeur,caissier')->group(function () {
    Route::resource('clients', \App\Http\Controllers\ClientController::class);
    Route::resource('stock-succursales', \App\Http\Controllers\StockSuccursaleController::class);
    Route::resource('ventes', \App\Http\Controllers\VenteController::class)->middleware('role:admin,gerant,coiffeur,caissier');
});
Route::post('api/clients/quick-create', [ClientController::class, 'quickCreate'])->middleware('auth');
Route::resource('alerts', AlertController::class)
    ->middleware(['auth', 'verified']);
Route::patch('alerts/{alert}/mark-as-read', [AlertController::class, 'markAsRead'])
    ->name('alerts.mark-as-read');

Route::prefix('rendezvous')->group(function () {
    Route::get('/', [RendezvouController::class, 'index'])->name('rendezvous.index')->middleware('auth');;
    Route::get('/create', [RendezvouController::class, 'create'])->name('rendezvous.create');
    Route::post('/', [RendezvouController::class, 'store'])->name('rendezvous.store');
    Route::get('/{rendezvou}', [RendezvouController::class, 'show'])->name('rendezvous.show')->middleware('auth');;
    Route::get('/{rendezvou}/edit', [RendezvouController::class, 'edit'])->name('rendezvous.edit');
    Route::put('/{rendezvou}', [RendezvouController::class, 'update'])->name('rendezvous.update');
    Route::delete('/{rendezvou}', [RendezvouController::class, 'destroy'])->name('rendezvous.destroy')->middleware('auth');;
});

Route::patch('utilisateurs/{utilisateur}/update-succursale', [UtilisateurController::class, 'updateSuccursale'])
    ->name('utilisateurs.update-succursale');
Route::patch('utilisateurs/{utilisateur}/update-status', [UtilisateurController::class, 'updateStatus'])
    ->name('utilisateurs.update-status');

Route::middleware(['auth', 'actif', 'role:admin,gerant'])->group(function () {
    Route::resource('currencies', CurrencieController::class)->except(['show']);
    Route::post('/currencies/{currency}/set-default', [CurrencieController::class, 'setDefault']);
    Route::patch('/currencies/{currency}/set-active', [CurrencieController::class, 'setActive'])->name('currencies.set-active');
    Route::patch('/currencies/{currency}/set-inactive', [CurrencieController::class, 'setInactive'])->name('currencies.set-inactive');
    Route::post('/rendezvous/{rendezvou}/update-status', [RendezvouController::class, 'updateStatus'])
        ->name('rendezvous.update-status')
        ->middleware(['auth', 'verified']);
});
Route::get('/taux', [CurrencieController::class, 'lesTaux'])->name('taux');
Route::get('/ventes/print/{vente}', [VenteController::class, 'print'])
    ->name('ventes.print');
Route::patch('utilisateurs/{utilisateur}/update-role', [UtilisateurController::class, 'updateRole'])
    ->name('utilisateurs.update-role')->middleware('role:admin,gerant');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

Route::get('/get-recent-vente', [VenteController::class, 'getRecentVente'])->name('get-recent-vente');

Route::get('/rendezvous-count', function () {
    $count = 0;

    if(Auth::user()->role==="admin" || Auth::user()->role==="gerant"){
        $count = Rendezvou::where('statut', 'confirmé')
        ->where('date_rdv', '>=', now())
        ->count();
    }elseif(Auth::user()->role ==="caissier" || Auth::user()->role ==="coiffeur") {
        if(Auth::user()->succursale_id) {
            $count = Rendezvou::where('succursale_id', Auth::user()->succursale_id)
                ->where('statut', 'confirmé')
                ->where('date_rdv', '>=', now())
                ->count();
        }else{
            $count = 0;
        }
    }elseif(Auth::user()->role==="admin"){
        
    }

    return response()->json(['count' => $count]);
})->middleware(['auth', 'verified']);


Route::resource('caisses', \App\Http\Controllers\CaisseController::class)
    ->only(['index', 'show'])
    ->middleware(['auth', 'role:admin,gerant']);

Route::resource('depenses', \App\Http\Controllers\DepenseController::class)
    ->except(['edit', 'update'])
    ->middleware(['auth', 'role:admin,gerant,caissier,coiffeur']);

Route::get('/users/{user}/stats', [UserStatsController::class, 'show'])->middleware(['auth', 'role:admin,gerant'])->name('users.stats');
Route::get('/statistiques-ventes', [StatistiqueController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('statistiques.index');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/transferts-central', [TransfertControllerStock::class, 'index'])->name('transferts-central.index');
    Route::get('/transferts-central/create', [TransfertControllerStock::class, 'create'])->name('transferts-central.create');
    Route::post('/transferts-central', [TransfertControllerStock::class, 'store'])->name('transferts-central.store');
    Route::get('/transferts-central/{transfert}', [TransfertControllerStock::class, 'show'])->name('transferts-central.show');
    Route::post('/transferts-central/{transfert}/validate', [TransfertControllerStock::class, 'validateTransfert'])->name('transferts-central.validate');
    Route::post('/transferts-central/{transfert}/reject', [TransfertControllerStock::class, 'rejectTransfert'])->name('transferts-central.reject');
});

Route::get('/statistiques-vendeurs', [VendeurController::class, 'index'])
    ->name('statistiques.vendeurs')
    ->middleware(['auth', 'role:admin,gerant']);

Route::get('/statistiques-produits', [ProduitController::class, 'list'])->name('produits.list');
Route::get('/statistiques-services', [ServiceController::class, 'list'])->name('services.list');
Route::get('/statistiques-stats', [ProduitController::class, 'stats'])->name('produits.stats');
Route::get('/statistiques-services-stats', [ServiceController::class, 'stats'])->name('services.stats');
Route::get('/api/sales-stats', [SalesController::class, 'index'])->middleware('auth');
Route::resource('utilitaires', \App\Http\Controllers\UtilitaireController::class)->middleware(['auth']);
Route::resource('accessoires', AccessoiresController::class)->middleware(['auth']);
Route::get('/succursales-accessoire', [AccessoiresController::class, 'accessoire'])->name('succursales.accessoire');
Route::group(['middleware' => ['auth', 'verified']], function () {
    Route::get('/fidelite', [\App\Http\Controllers\FideliteController::class, 'index'])->name('fidelite.index');
    Route::get('/fidelite/{client}', [\App\Http\Controllers\FideliteController::class, 'show'])->name('fidelite.show');
});

Route::prefix('/reports')->group(function () {
    Route::get('/', [ReportController::class, 'index'])->name('reports.index')->middleware(['auth', 'verified', 'role:admin,gerant']);
    Route::get('/pdf', [ReportController::class, 'generatePdf'])->name('reports.pdf')->middleware(['auth', 'verified', 'role:admin,gerant,caissier']);
    Route::get('/pdf-synthese', [ReportController::class, 'generatePdfsynthese'])->name('reports.pdfsynthese')->middleware(['auth', 'verified', 'role:admin,gerant,caissier']);

    Route::get('/sales', [ReportController::class, 'salesReportIndex'])->name('reports.sales')->middleware(['auth', 'verified', 'role:admin,gerant']);
    Route::get('print', [ReportController::class, 'print'])->name('reports.print')->middleware(['auth', 'verified', 'role:admin,gerant']);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/mon-reports', [MonReportController::class, 'index'])->name('mon-reports.index');
    Route::get('/mon-reports/pdf', [MonReportController::class, 'generatePdf'])->name('mon-reports.pdf');
});
Route::resource("points" , ConfigurationController::class)->middleware(['auth', 'role:admin,gerant']);

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/configurations/points-fidelite', [ConfigurationController::class, 'create'])
         ->name('fidelite.config');
         
    Route::post('/configurations/points-fidelite', [ConfigurationController::class, 'update'])
         ->name('fidelite.config.update');
});

Route::middleware(['auth', 'verified', 'role:admin,gerant,caissier'])->group(function () {
    Route::get('/api/ventes/stats-journalieres', [VenteController::class, 'statsJournalieres']);
});
Route::get('services/{service}/update-image', [ServiceController::class, 'getUpdateImage'])->name('services.get-update-image');
Route::post('services/{service}/update-set-image', [ServiceController::class, 'updateImage'])->name('services.update-image');

Route::get('/documentations', [DocumentationController::class, 'index'])->name('documentations.index');
Route::resource('promotions', PromotionController::class);

Route::resource('personnels', \App\Http\Controllers\AgentController::class)->middleware('role:admin,gerant');
Route::resource('presences', \App\Http\Controllers\PresenceController::class)->middleware('role:admin,gerant,caissier');
Route::post('personnels/{personnel}/update-media', [\App\Http\Controllers\AgentController::class, 'updateMedia'])->name('personnels.update-media');

Route::middleware(['auth', 'verified', 'role:admin,gerant'])->group(function () {
    Route::resource('contrats', ContratController::class);
});


Route::prefix("/api")->middleware(['auth', 'verified', "role:admin,gerant"])->group(function () {
    Route::post('/agents/{agent}/references', [ReferenceController::class, 'store'])->name('agents.references.store');
    Route::put('/references/{reference}', [ReferenceController::class, 'update'])->name('references.update');

    Route::get('/agents/{agent}/references', [ReferenceController::class, 'index'])->name('agents.references.index');

    // Routes "shallow" pour update et destroy
    Route::patch('/references/{reference}', [ReferenceController::class, 'update']); // optionnel
    Route::delete('/references/{reference}', [ReferenceController::class, 'destroy'])->name('references.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('paies', PaieController::class)->except(['show']);
    Route::get('paies/{paie}', [PaieController::class, 'show'])->name('paies.show');
    Route::get('paies/{paie}/print', [PaieController::class, 'print'])->name('paies.print');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('conges', CongeController::class);
    Route::post('conges/{conge}/approve', [CongeController::class, 'approve'])->name('conges.approve');
    Route::post('conges/{conge}/reject', [CongeController::class, 'reject'])->name('conges.reject');
    Route::get('conges/{conge}/print', [CongeController::class, 'print'])->name('conges.print');
});

Route::resource('pointages', PointageController::class)->middleware(['auth', 'verified']);
Route::post('pointages/generate-daily', [PointageController::class, 'generateDaily'])->name('pointages.generate-daily');
Route::post('pointages/generate-monthly', [PointageController::class, 'generateMonthly'])->name('pointages.generate-monthly');
Route::post('pointages/time', [PointageController::class, 'generateTime'])->name('pointages.generate-time');
Route::get('print/pointages', [PointageController::class, 'print'])->name('pointages.print');
Route::get('rapport-presence', [PointageController::class, 'agent'])->name('pointages.agent');
Route::get('get-agent-pointages',[PointageController::class, 'getAgentPointages'])->name('pointages.get-agent-pointages');
Route::get('get-pointages',[PointageController::class, 'getPointages'])->name('pointages.get-pointages');
Route::get('print-grille/{ref}/{date}',[PointageController::class, 'printGrille'])->name('pointages.print-grille');
Route::resource('categories', CategorieController::class)->middleware(['auth', 'verified', 'role:admin']);
Route::get('statistiques-categories', [StatistiqueController::class, 'produitsParCategorie'])
    ->name('statistiques.produits-par-categorie');