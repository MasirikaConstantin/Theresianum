<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule)
    {
        // Exécuter toutes les minutes
        $schedule->command('reservations:update-status')->everyMinute();
        
        // Ou toutes les 5 minutes pour moins de charge
        // $schedule->command('reservations:update-status')->everyFiveMinutes();
    }

    protected function commands()
    {
        $this->load(__DIR__.'/Commands');
        require base_path('routes/console.php');
    }
}