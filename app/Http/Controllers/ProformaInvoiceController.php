<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\ProformaInvoice;
use App\Models\Chambre;
use App\Models\Client;
use App\Models\Currencie;
use App\Models\Salle;
use App\Models\Produit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProformaInvoiceController extends Controller
{
    public function index(Request $request)
    {
        $invoices = ProformaInvoice::with(['client', 'createdBy'])
                ->orderBy('created_at', 'desc')
                ->paginate(10);

        return Inertia::render('ProformaInvoices/Index', [
            'invoices' => $invoices,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        $chambres = Chambre::where('statut', 'disponible')->get();
        $salles = Salle::where('disponible', true)->get();
        $produits = Produit::where('actif', true)->orderBy('name', 'asc')->get();
        return Inertia::render('ProformaInvoices/Create', [
            'chambres' => $chambres,
            'salles' => $salles,
            'produits' => $produits,
            'currencies' => Currencie::where('is_active', true)->orWhere('code', 'CDF')->get(),
            'clients' => Client::select('id','ref', "name","telephone", 'email')->get(),
        ]);
    }
    public function store(Request $request)
    {
        
        try {
            $validated = $request->validate([
                'client_id' => 'nullable|exists:clients,id',
                'date_facture' => 'required|date',
                'date_echeance' => 'nullable|date|after:date_facture',
                'notes' => 'nullable|string',
                'montant_total' => 'required|numeric|min:0',
                'items' => 'required|array|min:1',
                'items.*.type' => 'required|in:chambre,salle,produit',
                'items.*.item_id' => 'required|integer',
                'items.*.quantite' => 'required|integer|min:1',
                'items.*.prix_unitaire' => 'required|numeric|min:0',
                'items.*.montant_total' => 'required|numeric|min:0',
                'items.*.date_item' => 'required|date'
            ]);
    
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->validator)
                ->withInput();
        }
      
       
        // Créer la facture avec le montant total
        $invoice = ProformaInvoice::create([
            'client_id' => $validated['client_id'],
            'date_facture' => $validated['date_facture'],
            'date_echeance' => $validated['date_echeance'],
            'notes' => $validated['notes'],
            'montant_total' => $validated['montant_total']
        ]);
        // Créer les items
        foreach ($validated['items'] as $item) {
            $designation = $this->getDesignation($item['type'], $item['item_id']);
            
            $invoice->items()->create([
                'type' => $item['type'],
                'item_id' => $item['item_id'],
                'designation' => $designation,
                'quantite' => $item['quantite'],
                'prix_unitaire' => $item['prix_unitaire'],
                'montant_total' => $item['montant_total'],
                'date_item' => $item['date_item']
            ]);
        }
    
        return redirect()->route('proforma-invoices.show', $invoice->id)
            ->with('success', 'Facture proforma créée avec succès.');
    }
   
    public function show(ProformaInvoice $proformaInvoice)
    {
        // Charger les relations nécessaires
        $proformaInvoice->load([
            'client:id,name,telephone,email',
            'createdBy:id,name',
            'updatedBy:id,name',
            'items'
        ]);

        return Inertia::render('ProformaInvoices/Show', [
            'invoice' => $proformaInvoice,
        ]);
    }

   /* public function download(ProformaInvoice $proformaInvoice)
{
    // Charger les relations
    $proformaInvoice->load([
        'client',
        'createdBy',
        'items'
    ]);

    return Inertia::render('ProformaInvoices/Print', [
        'invoice' => $proformaInvoice,
        'company' => [
            'name' => config('app.name', 'Votre Entreprise'),
            'address' => 'Adresse de votre entreprise',
            'phone' => '+XX X XX XX XX XX',
            'email' => 'contact@entreprise.com',
        ]
    ]);
}*/

public function print(ProformaInvoice $proformaInvoice)
    {
        // Charger les relations nécessaires
        $proformaInvoice->load([
            'client',
            'createdBy',
            'items'
        ]);

        return Inertia::render('ProformaInvoices/PrintProformaInvoice', [
            'invoice' => $proformaInvoice,
            'company' => [
                'name' => config('app.name', 'Votre Entreprise'),
                'address' => 'Adresse de votre entreprise',
                'phone' => '+XX X XX XX XX XX',
                'email' => 'contact@entreprise.com',
            ]
        ]);
    }
    public function destroy(ProformaInvoice $proformaInvoice)
    {
        $proformaInvoice->delete();

        return redirect()->route('proforma-invoices.index')
            ->with('success', 'Facture proforma supprimée avec succès.');
    }

    private function getDesignation($type, $itemId)
    {
        switch ($type) {
            case 'chambre':
                $chambre = Chambre::find($itemId);
                return $chambre ? 'Logement - ' . $chambre->nom : 'Logement';
            
            case 'salle':
                $salle = Salle::find($itemId);
                return $salle ? 'Salle - ' . $salle->nom : 'Salle';
            
            case 'produit':
                $produit = Produit::find($itemId);
                return $produit ? $produit->name : 'Produit';
            
            default:
                return 'Article';
        }
    }


    public function edit(ProformaInvoice $proformaInvoice)
{
    // Charger les relations
    $proformaInvoice->load(['client', 'items']);

    $chambres = Chambre::where('statut', 'disponible')->get();
    $salles = Salle::where('disponible', true)->get();
    $produits = Produit::where('actif', true)->get();

    return Inertia::render('ProformaInvoices/Edit', [
        'invoice' => $proformaInvoice,
        'chambres' => $chambres,
        'salles' => $salles,
        'produits' => $produits,
        'clients' => Client::select('id','ref', "name","telephone", 'email', 'adresse')->get(),
    ]);
}

public function update(Request $request, ProformaInvoice $proformaInvoice)
{
    try {
        $validated = $request->validate([
            'client_id' => 'nullable|exists:clients,id',
            'date_facture' => 'required|date',
            'date_echeance' => 'nullable|date|after:date_facture',
            'notes' => 'nullable|string',
            'montant_total' => 'required|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.type' => 'required|in:chambre,salle,produit',
            'items.*.item_id' => 'required|integer',
            'items.*.quantite' => 'required|integer|min:1',
            'items.*.prix_unitaire' => 'required|numeric|min:0',
            'items.*.montant_total' => 'required|numeric|min:0',
            'items.*.date_item' => 'required|date'
        ]);

    } catch (\Illuminate\Validation\ValidationException $e) {
        return redirect()->back()
            ->withErrors($e->validator)
            ->withInput();
    }

    // Démarrer une transaction
    DB::beginTransaction();

    try {
        // Mettre à jour la facture
        $proformaInvoice->update([
            'client_id' => $validated['client_id'],
            'date_facture' => $validated['date_facture'],
            'date_echeance' => $validated['date_echeance'],
            'notes' => $validated['notes'],
            'montant_total' => $validated['montant_total'],
        ]);

        // Supprimer les anciens items
        $proformaInvoice->items()->delete();

        // Créer les nouveaux items
        foreach ($validated['items'] as $item) {
            $designation = $this->getDesignation($item['type'], $item['item_id']);
            
            $proformaInvoice->items()->create([
                'type' => $item['type'],
                'item_id' => $item['item_id'],
                'designation' => $designation,
                'quantite' => $item['quantite'],
                'prix_unitaire' => $item['prix_unitaire'],
                'montant_total' => $item['montant_total'],
                'date_item' => $item['date_item']
            ]);
        }

        DB::commit();

        return redirect()->route('proforma-invoices.show', $proformaInvoice->id)
            ->with('success', 'Facture proforma mise à jour avec succès.');

    } catch (\Exception $e) {
        DB::rollBack();
        
        return redirect()->back()
            ->withErrors(['error' => 'Erreur lors de la mise à jour: ' . $e->getMessage()])
            ->withInput();
    }
}
}