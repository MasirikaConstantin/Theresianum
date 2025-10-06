<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Vente;
use App\Observers\VenteObserver;
use App\Models\VenteProduit;
use App\Observers\VenteProduitObserver;
use App\Models\Reservation;
use App\Observers\ReservationObserver;
class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
        Vente::observe(VenteObserver::class);
        VenteProduit::observe(VenteProduitObserver::class);
        Reservation::observe(ReservationObserver::class);
    }
}
