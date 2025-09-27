<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Inertia\Inertia;

class FideliteController extends Controller
{
    public function index()
    {
        return Inertia::render('Fidelite/Index');
    }

    public function show(string $client)
    {
        return Inertia::render('Fidelite/Show', [
            'client' => Client::where('ref', $client)->first()->load('fidelite')
        ]);
    }
}