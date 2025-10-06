<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Reservation;
use Carbon\Carbon;

class UpdateReservationStatus extends Command
{
    protected $signature = 'reservations:update-status';
    protected $description = 'Mettre à jour automatiquement le statut des réservations';

    public function handle()
    {
        $now = Carbon::now();
        
        // Mettre à jour les réservations dont la date_fin est passée
        $updatedCount = Reservation::where('statut', '!=', 'terminee')
            ->where('statut', '!=', 'annulee')
            ->where('date_fin', '<=', $now)
            ->update(['statut' => 'terminee']);
            
        $this->info("{$updatedCount} réservations mises à jour en 'terminée'");
        
        return Command::SUCCESS;
    }
}