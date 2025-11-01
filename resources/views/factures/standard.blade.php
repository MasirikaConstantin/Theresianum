<!DOCTYPE html>
<html>

<head>
    <title>Facture {{ $vente->ref }}</title>
    <style>
        @page {
            margin: 0;
            padding: 0;
            size: 72mm auto;
        }

        body {
            font-family: DejaVu Sans;
            font-size: 11px;
            margin: 0;
            padding: 2mm;
            background-size: cover 34px;
            background-position: center;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px dotted #000000;
        }

        .table {
            width: 100%;
            border-collapse: collapse;
        }

        .table th,
        .table td {
            border: 1px solid #ddd;
            padding: 8px;
        }

        .badge {
            background-color: #f0f0f0;
            padding: 2px 5px;
            border-radius: 3px;
        }

        .donnee {
            padding-bottom: 2%;
            border-bottom: 2px dotted #000000;
        }

        .ref {
            display: flex;
            justify-content: center;
            gap: 1px;
            margin-top: 15px;
            width: 100%;
        }

        .ref>div {
            text-align: center;
        }

        .ref {
            text-align: center;
            margin-top: 20px;
        }

        .ref div {
            display: inline-block;
            margin: 0 0px;
        }
    </style>

    <style>
        .header {
            text-align: center;
            margin-bottom: 4px;
            padding-bottom: 4px;
            border-bottom: 1px dashed #ccc;
        }

        .header h1 {
            font-size: 12px;
            margin: 2px 0;
        }

        .header p {
            margin: 2px 0;
        }

        .header-logo {
            max-height: 30px;
            max-width: 100%;
            margin-bottom: 5px;
        }

        .info-block {
            margin: 6px 0;
            padding-bottom: 4px;
            border-bottom: 1px dashed #ccc;
        }

        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
        }

        .bold {
            font-weight: bold;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .items-table {
            width: 100%;
            margin: 8px 0;
            border-collapse: collapse;
        }

        .items-table th {
            text-align: left;
            padding: 2px 0;
            border-bottom: 1px solid #ddd;
        }

        .items-table td {
            padding: 3px 0;
            vertical-align: top;
        }

        .items-table .qty {
            white-space: nowrap;
        }

        .total-table {
            width: 100%;
            margin: 1px 0;

        }

        .total-table td {
            padding: 1px 0;
        }

        .total-table tr:last-child td {

            padding-top: 1px;
            font-weight: bold;
        }

        .footer {
            text-align: center;
            margin-top: 10px;
            font-size: 11px;
        }

        .barcode {
            margin-top: 10px;
            text-align: center;
        }

        .table,
        th,
        .td {
            border: 1px solid;
            border-collapse: collapse;

        }

        td,
        tr,
        th {
            height: 20px !important;


        }

        th,
        td {
            padding-left: 4px;
            padding-right: 4px;
        }

        .align {
            text-align: center;
            align-items: center;
            align-content: center;
        }


        .table-container {
            width: 100%;
            margin: 0 auto;
        }

        .table {
            width: 100%;
            max-width: 88mm;
            /* Largeur maximale de 88mm */
            border-collapse: collapse;
            table-layout: fixed;
            /* Essentiel pour le contrôle précis */
            margin: 0 auto;
        }

        .table th,
        .table td {
            border: 2px dotted;
            padding: 2px;
            height: auto;
            word-wrap: break-word;
        }

        /* Répartition des colonnes */
        .table th:nth-child(1),
        .table td:nth-child(1) {
            width: 8%;
            /* Qté */
        }

        .table th:nth-child(2),
        .table td:nth-child(2) {
            width: 30%;
            /* Article */
        }

        .table th:nth-child(3),
        .table td:nth-child(3) {
            width: 16%;
            /* P.U. */
        }

        .table th:nth-child(4),
        .table td:nth-child(4) {
            width: 13%;
            /* P.T. */
        }

        .align {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .ref-text {
            text-align: center;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 2px;
            margin-top: 2px;
            font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
        }

        .header-text {
            text-align: center;
            font-size: 10px;
            font-weight: bold;
            margin: -3px;
        }

        .table,
        th,
        .td {
            border: 1px solid;
            border-collapse: collapse;

        }

        .vendeur {
            margin-bottom: 5px;
        }

        .tva-details {
            margin-top: 5px;
            width: 100%;
        }

        .tva-row {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
        }

        .text-bold {
            font-weight: bold;
        }

        .border-top {
            border-top: 1px dashed #000;
            padding-top: 3px;
        }
    </style>
</head>
@php
    $i=0;
    $produits = $vente->items->filter(fn($item) => $item->produit_id);

    // Calculer le montant HT des produits
    $montant_produits_ht = $produits->sum('montant_total');

    // Calculer la TVA (16%)
    $tva = $montant_produits_ht * 0.16;

    // Montant TTC des produits
    $montant_produits_ttc = $montant_produits_ht + $tva;

    // Montant brut total AVEC TVA (produits TTC)
    $montant_brut_total = $montant_produits_ttc;

    // Calcul de la remise générale
    if ($montant_brut_total > 0) {
    $remise_generale = 1 - ($vente->montant_total / $montant_brut_total);
    $remise_generale_pourcentage = round($remise_generale * 100, 2);
    $montant_remise = $montant_brut_total - $vente->montant_total;
    } else {
    $remise_generale_pourcentage = 0;
    $montant_remise = 0;
    }
    
@endphp

<body>
    <div class="header">
        <h3>{{ $entreprise['nom'] }}</h3>
        <p class="header-text" style="margin: 2px;">Immatriculation : {{ $entreprise['Immatriculation'] }}</p>
        <p class="header-text" style="margin: 2px;">Direction du centre : {{ $entreprise['telephone'] }}</p>
        <p class="header-text" style="margin: 2px;">Réception : {{ $entreprise['telephone_reception'] }}</p>
        <p class="header-text" style="margin: 2px;">Email : {{ $entreprise['email'] }}</p>
        <p class="header-text" style="margin: 2px; font-size: 8px;">Adresse : {{ $entreprise['adresse'] }}</p>
    </div>

    <div class="vendeur">
        <p style="margin: 2px;">Vendeur : <span style="font-weight: bold;">{{ Str::limit($vente->vendeur->name,15)
                }}</span></p>
        <p style="margin: 2px;">Facture : <span style="font-weight: bold;">#{{ $vente->code }}</span></p>
        <p style="margin: 2px;">Date : <span style="font-weight: bold;">{{ $vente->created_at->format('Y-m-d H:i')
                }}</span></p>
        <p style="margin: 2px;">Client : <span style="font-weight: bold;">{{ $vente->client->telephone }}</span></p>
    </div>

    <div class="donnee">
        <table class="table">
            <thead>
                <tr>
                    <th>Qt</th>
                    <th>Désignation</th>
                    <th>Pu</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($vente->items as $item)
                <tr>
                    <td class="align">{{ $item->quantite }}</td>
                    <td>
                        {{ $item->produit->name }}
                    </td>
                    <td>{{ number_format($item->prix_unitaire, 1) }}</td>
                    <td>{{ number_format($item->montant_total, 1) }}
                        {{--
                         @if ($item->remise > 0)
                        <br><span class="badge">{{ $item->remise }}%</span>
                        @endif 
                        --}}
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="tva-details">
        
         {{-- <div class="tva-row">
            <span>Total Produits HT:</span>
            <span class="text-right">{{ number_format($montant_produits_ht, 2) }} USD</span>
            </div>
            <div class="tva-row">
                <span>TVA (16%):</span>
                <span class="text-right">{{ number_format($tva, 2) }} USD</span>
            </div>
            <div class="tva-row">
                <span>Total Produits TTC:</span>
                <span class="text-right">{{ number_format($montant_produits_ttc, 2) }} USD</span>
            </div>
            
            <div class="tva-row border-top">
                <span class="text-bold">Sous-Total:</span>
                <span class="text-right text-bold">{{ number_format($montant_brut_total, 2) }} USD</span>
            </div>
        
            @if ($remise_generale_pourcentage > 0)
            <div class="tva-row">
                <span>Remise ({{ $remise_generale_pourcentage }}%):</span>
                <span class="text-right">-{{ number_format($montant_remise, 2) }} USD</span>
            </div>
            @endif
        --}}
        <div class="tva-row border-top">
            <span class="text-bold">Total à payer:</span>
            <span class="text-right text-bold">{{ number_format($vente->montant_total, 2) }} FC</span><br>
            @if ($currency)
            @if (number_format($vente->montant_total / $currency->exchange_rate, 2) >10)
            Soit : <span class="text-right text-bold">{{ number_format($vente->montant_total / $currency->exchange_rate, 2) }} $</span>
            @endif
            @endif
        </div>
    </div>

    <div style="border-bottom: 2px dotted #000000; padding-bottom: 5px; margin-top: 3px;">
        @if($vente->has_promotion)
        <p style="font-size: 10px;  margin: 0px; text-align: center; font-weight : bold ">--  Au prix promotionnel  --</p>

        @endif
        <p style="font-size: 10px;  margin: 0px;">Mode de paiement: {{ $vente->mode_paiement }}</p>
        <!--p style="font-size: 8px;font-weight: bold;  text-align: center; margin:2px;">Points de fidelité :  {{ $vente->client->fidelite->points }}</p-->
        <p style="font-size: 8px;font-weight: bold;  text-align: center; margin:2px;">Les marchandises vendues ne sont ni échangés ni remboursables</p>
        {{-- <p style="font-size: 8px;font-weight: bold; font-style: italic; text-align: center; margin: 2px;">*La TVA est de
            16% et est appliqué sur les produits*</p> --}}
    </div>

   
</body>

</html>