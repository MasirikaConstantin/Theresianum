<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Closure;
use Inertia\Inertia;
use Throwable;

class Handler extends ExceptionHandler
{

public function handle(Request $request, Throwable $exception)
{
    if ($exception instanceof \Symfony\Component\HttpKernel\Exception\HttpException) {
        if ($exception->getStatusCode() === 403) {
            return Inertia::render('403')
                ->toResponse($request)
                ->setStatusCode(403);
        }
    }
   

    return parent::render($request, $exception);
}
}