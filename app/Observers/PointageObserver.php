<?php
namespace App\Observers;

use App\Models\Pointage;
use App\Models\Conge;
use Carbon\Carbon;
use App\Models\Agent;

class PointageObserver
{
    public static function createDailyPointages()
{
    $today = now()->toDateString();
    
    // Utilisez with() pour charger les relations nécessaires
    $agents = Agent::active()
        ->hasContratActif()
        ->with(['contrats' => function($query) {
            $query->active();
        }])
        ->get();

    foreach ($agents as $agent) {
        if (Pointage::where('agent_id', $agent->id)->where('date', $today)->exists()) {
            continue;
        }

        $isOnLeave = Conge::where('agent_id', $agent->id)
            ->where('date_debut', '<=', $today)
            ->where('date_fin', '>=', $today)
            ->where('statut', 'approuve')
            ->exists();

        Pointage::create([
            'agent_id' => $agent->id,
            'date' => $today,
            'statut' => $isOnLeave ? 'congé' : 'absent',
            'heure_arrivee' => null,
            'heure_depart' => null,
        ]);
    }
}
    
    public static function createMonthlyPointages($year, $month)
    {
        $startDate = Carbon::create($year, $month, 1);
        $endDate = $startDate->copy()->endOfMonth();
        
        $agents = Agent::active()->get();
        
        for ($date = $startDate; $date->lte($endDate); $date->addDay()) {
            foreach ($agents as $agent) {
                // Vérifier si un pointage existe déjà pour cette date
                $existingPointage = Pointage::where('agent_id', $agent->id)
                    ->where('date', $date->toDateString())
                    ->first();
                    
                if ($existingPointage) continue;
                
                // Vérifier si l'agent est en congé
                $isOnLeave = Conge::where('agent_id', $agent->id)
                    ->where('date_debut', '<=', $date)
                    ->where('date_fin', '>=', $date)
                    ->where('statut', 'approuve')
                    ->exists();
                    
                // Créer le pointage
                Pointage::create([
                    'agent_id' => $agent->id,
                    'date' => $date->toDateString(),
                    'statut' => $isOnLeave ? 'congé' : 'absent',
                    'heure_arrivee' => null,
                    'heure_depart' => null,
                ]);
            }
        }
    }
    
    public function updating(Pointage $pointage)
    {
        if ($pointage->isDirty('heure_arrivee')) {
            $pointage->statut_arrivee = $pointage->calculateRetard();
        }
        
        if ($pointage->isDirty('heure_depart')) {
            $departPrecoce = $pointage->calculateDepartPrecoce();
            if ($departPrecoce) {
                $pointage->statut_depart = $departPrecoce;
            }
        }
        
        if ($pointage->isDirty('statut') && $pointage->statut !== 'present') {
            $pointage->heure_arrivee = null;
            $pointage->heure_depart = null;
            $pointage->statut_arrivee = null;
            $pointage->statut_depart = null;
        }
    }
}