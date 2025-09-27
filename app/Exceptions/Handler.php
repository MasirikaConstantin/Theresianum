<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Closure;
use Throwable;

class Handler extends ExceptionHandler
{
   // app/Http/Middleware/CheckRole.php

public function handle(Request $request, Closure $next, ...$roles)
{
    if (!$request->user() || !$request->user()->hasAnyRole($roles)) {
        if ($request->wantsJson()) {
            return response()->json([
                'toast' => [
                    'type' => 'error',
                    'title' => 'Erreur de permission',
                    'message' => 'Vous n\'avez pas les droits nécessaires'
                ]
            ], 403);
        }

        return Redirect::to('/')->with([
            'toast' => [
                'type' => 'error',
                'title' => 'Accès refusé',
                'message' => 'Rôle insuffisant pour accéder à cette page',
                'duration' => 5000
            ]
        ]);
    }

    return $next($request);
}
}