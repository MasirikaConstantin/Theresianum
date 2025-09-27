<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class RoleManager
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();
        $authUserRole = $user->role;

        // Vérification du statut du compte
        if ($user->is_active == false) {
            Auth::logout();
            return redirect()->route('login')->with('error', 'Votre compte est désactivé.');
        }

        // Vérification des rôles autorisés
        if (in_array($authUserRole, $roles)) {
            return $next($request);
        }

        // Retourne une réponse 403 au lieu de rediriger
        abort(403, 'Accès non autorisé.');
    }
}