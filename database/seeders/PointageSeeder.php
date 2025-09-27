<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Agent;
use App\Models\Pointage;
use Carbon\Carbon;
use Illuminate\Support\Str;

class PointageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Récupère un agent existant ou en crée un pour les tests
        //$agent = Agent::first() ?? Agent::factory()->create();
        $agent = Agent::find(11);
        // On prend le mois de juillet 2025 par exemple
        $startDate = Carbon::create(2025, 7, 1);
        $endDate = $startDate->copy()->endOfMonth();

        // Boucle sur chaque jour du mois
        for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {

            // On ne crée pas de pointage pour le week-end
            if ($date->isWeekend()) {
                continue;
            }

            // Génère un statut aléatoire (plus de chances d’être "present")
            $statut = collect([
                'present', 'present', 'present', 'absent', 'congé', 'malade', 'formation', 'mission'
            ])->random();

            // Par défaut, on n’a pas d’heures si absent/congé/malade
            $heureArrivee = null;
            $heureDepart = null;
            $statutArrivee = null;
            $statutDepart = null;
            $justifie = false;

            if ($statut === 'present') {
                // Arrivée entre 07h50 et 08h30
                $heureArrivee = Carbon::createFromTime(8, rand(0, 30));
                $statutArrivee = $heureArrivee->lte(Carbon::createFromTime(8, 0)) ? 'a-lheure' : 'en-retard';

                // Départ entre 16h00 et 17h00
                $heureDepart = Carbon::createFromTime(16, rand(0, 59));
                $statutDepart = $heureDepart->gte(Carbon::createFromTime(16, 0)) ? 'a-lheure' : 'parti-tot';
            }

            Pointage::create([
                'agent_id' => $agent->id,
                'date' => $date->format('Y-m-d'),
                'heure_arrivee' => $heureArrivee,
                'heure_depart' => $heureDepart,
                'statut' => $statut,
                'statut_arrivee' => $statutArrivee,
                'statut_depart' => $statutDepart,
                'justifie' => $justifie,
                'justification' => null,
                'notes' => null,
                'ref' => strtoupper(Str::random(8)),
                'created_by' => null,
                'updated_by' => null,
            ]);
        }

        $this->command->info("Pointages pour {$agent->nom} générés pour le mois de {$startDate->format('F Y')}");
    }
}
