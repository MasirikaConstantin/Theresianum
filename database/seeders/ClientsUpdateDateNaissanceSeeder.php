<?php

namespace Database\Seeders;

use App\Models\Client;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class ClientsUpdateDateNaissanceSeeder extends Seeder
{
    public function run(): void
    {
        Client::whereNull('date_naissance')->chunkById(100, function ($clients) {
            foreach ($clients as $client) {
                $client->update([
                    'date_naissance' => Carbon::createFromTimestamp(rand(
                        Carbon::parse('1970-01-01')->timestamp,
                        Carbon::parse('2005-12-31')->timestamp
                    ))->toDateString()
                ]);
            }
        });

        $this->command->info('Les dates de naissance manquantes ont été générées avec succès.');
    }
}
