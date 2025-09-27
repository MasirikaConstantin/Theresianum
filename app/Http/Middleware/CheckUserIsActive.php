<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserIsActive
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        if (!$user) {
            abort(403, '🔐 Identification requise - Connectez-vous pour continuer');
        }
    
        if (!$user->is_active) {
            abort(403, '⛔ Compte désactivé - Contactez l\'administration');
        }
    
        return $next($request);
    }
}