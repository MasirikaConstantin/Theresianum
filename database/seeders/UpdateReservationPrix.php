<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Reservation;

class UpdateReservationPrix extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
            Reservation::query()->update([
            'montant_payer' => DB::raw('prix_total'),
            'statut_paiement' => 'non_paye'
        ]);
    }
}
