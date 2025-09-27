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
            width: 40%;
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
    $services = $vente->items->filter(fn($item) => $item->service_id);

    // Calculer le montant HT des produits
    $montant_produits_ht = $produits->sum('montant_total');

    // Calculer la TVA (16%)
    $tva = $montant_produits_ht * 0.16;

    // Montant TTC des produits
    $montant_produits_ttc = $montant_produits_ht + $tva;

    // Montant des services (pas de TVA)
    $montant_services = $services->sum('montant_total');

    // Montant brut total AVEC TVA (produits TTC + services)
    $montant_brut_total = $montant_produits_ttc + $montant_services;

    // Calcul de la remise générale
    if ($montant_brut_total > 0) {
    $remise_generale = 1 - ($vente->montant_total / $montant_brut_total);
    $remise_generale_pourcentage = round($remise_generale * 100, 2);
    $montant_remise = $montant_brut_total - $vente->montant_total;
    } else {
    $remise_generale_pourcentage = 0;
    $montant_remise = 0;
    }
    $iconPhone= '<svg viewBox="0 0 122.88 118.72" style="enable-background:new 0 0 122.88 118.72" xml:space="preserve">
        <g>
            <path
                d="M29.22,56.54c3.57,6.43,7.67,12.6,13.02,18.24C47.58,80.45,54.24,85.6,62.86,90c0.64,0.31,1.25,0.31,1.78,0.1 c0.82-0.31,1.66-0.99,2.48-1.81c0.64-0.64,1.43-1.66,2.26-2.77c3.31-4.36,7.42-9.77,13.21-7.07c0.13,0.06,0.23,0.13,0.35,0.19 l19.33,11.11c0.06,0.03,0.13,0.1,0.19,0.13c2.55,1.75,3.6,4.46,3.63,7.52c0,3.12-1.15,6.63-2.83,9.58 c-2.22,3.91-5.51,6.5-9.29,8.21c-3.6,1.66-7.61,2.55-11.46,3.12c-6.05,0.89-11.71,0.32-17.5-1.46c-5.67-1.75-11.37-4.65-17.6-8.5 l-0.46-0.29c-2.86-1.78-5.95-3.7-8.98-5.95c-11.1-8.38-22.4-20.47-29.76-33.78C2.03,57.15-1.34,45.09,0.5,33.59 c1.02-6.3,3.72-12.03,8.44-15.82c4.11-3.31,9.64-5.13,16.81-4.49c0.82,0.06,1.56,0.54,1.94,1.24l12.39,20.94 c1.81,2.35,2.04,4.68,1.05,7.01c-0.82,1.91-2.48,3.67-4.74,5.31c-0.67,0.57-1.46,1.15-2.29,1.75c-2.77,2.01-5.92,4.33-4.84,7.07 L29.22,56.54L29.22,56.54L29.22,56.54z M73.35,7.55c-0.51-0.04-0.99-0.18-1.42-0.4c-0.45-0.23-0.84-0.54-1.16-0.91 c-0.32-0.38-0.57-0.81-0.73-1.29C69.9,4.49,69.84,4,69.88,3.49l0.01-0.07c0.04-0.49,0.18-0.95,0.39-1.36l0.04-0.07 c0.22-0.42,0.52-0.79,0.87-1.08c0.37-0.32,0.81-0.57,1.29-0.73c0.45-0.15,0.93-0.21,1.42-0.18l0.1,0.01 c3.43,0.27,6.74,0.79,9.92,1.55c3.21,0.77,6.27,1.8,9.16,3.05c2.91,1.27,5.65,2.78,8.2,4.52c2.54,1.74,4.91,3.71,7.06,5.9 c2.13,2.17,4.06,4.56,5.77,7.15c1.69,2.57,3.16,5.34,4.4,8.28c1.2,2.88,2.18,5.94,2.92,9.18c0.72,3.17,1.21,6.5,1.45,9.98 l0.01,0.17l0,0.18c0,0.46-0.08,0.91-0.23,1.33c-0.16,0.45-0.4,0.85-0.71,1.2c-0.31,0.35-0.68,0.64-1.1,0.86 c-0.39,0.21-0.84,0.34-1.31,0.4l-0.2,0.02l-0.19,0c-0.47,0.01-0.92-0.07-1.34-0.23c-0.44-0.16-0.85-0.4-1.2-0.71 c-0.37-0.32-0.68-0.72-0.9-1.17c-0.21-0.43-0.35-0.92-0.38-1.42c-0.21-3.09-0.63-6.03-1.26-8.8c-0.63-2.83-1.48-5.5-2.52-8.01 c-1.04-2.52-2.29-4.88-3.72-7.06c-1.45-2.21-3.08-4.23-4.88-6.07c-1.82-1.85-3.81-3.51-5.97-4.98c-2.17-1.48-4.51-2.76-7.01-3.84 l-0.04-0.02c-2.48-1.07-5.11-1.95-7.88-2.61C79.29,8.23,76.39,7.78,73.35,7.55L73.35,7.55z M65.03,43.21 c-0.51-0.05-0.99-0.21-1.41-0.43c-0.44-0.24-0.83-0.56-1.13-0.94c-0.29-0.36-0.52-0.78-0.67-1.23c-0.14-0.42-0.2-0.87-0.18-1.33 c0.01-0.13,0.01-0.23,0.03-0.35c0.07-0.48,0.23-0.93,0.45-1.32c0.23-0.41,0.54-0.77,0.9-1.06c0.36-0.29,0.78-0.52,1.23-0.67 c0.42-0.13,0.87-0.2,1.34-0.18l0.35,0.03c1.49,0.16,2.92,0.42,4.3,0.77c1.4,0.36,2.73,0.82,3.98,1.36l0.04,0.02 c1.27,0.56,2.46,1.21,3.57,1.96c1.12,0.76,2.16,1.61,3.12,2.57c0.95,0.95,1.81,1.98,2.57,3.1c0.76,1.11,1.42,2.3,1.99,3.58 c0.55,1.25,1.01,2.58,1.37,3.98c0.35,1.37,0.6,2.83,0.76,4.37c0.05,0.51,0,1.01-0.13,1.47l-0.01,0.04 c-0.14,0.46-0.38,0.89-0.67,1.26l-0.01,0.02c-0.31,0.38-0.69,0.69-1.13,0.93c-0.42,0.23-0.9,0.38-1.41,0.43l-0.05,0 c-0.49,0.04-0.97-0.01-1.42-0.14c-0.48-0.14-0.92-0.38-1.3-0.69l-0.01,0c-0.38-0.31-0.7-0.69-0.94-1.14 c-0.23-0.42-0.38-0.9-0.43-1.4l0-0.04c-0.11-1.09-0.29-2.13-0.54-3.12c-0.25-1.01-0.57-1.95-0.95-2.82 c-0.38-0.87-0.82-1.68-1.32-2.42c-0.51-0.75-1.07-1.43-1.69-2.05c-0.62-0.62-1.31-1.18-2.06-1.68c-0.75-0.5-1.57-0.94-2.46-1.33 l-0.05-0.02c-0.87-0.38-1.81-0.69-2.8-0.94C67.22,43.51,66.15,43.33,65.03,43.21L65.03,43.21z M69.03,25.99l-0.1,0l-0.13-0.02 c-0.47-0.05-0.91-0.19-1.3-0.39c-0.42-0.22-0.79-0.51-1.1-0.85l0,0c-0.32-0.36-0.57-0.77-0.73-1.23c-0.15-0.43-0.23-0.89-0.22-1.38 l0-0.17l0.02-0.16c0.05-0.46,0.19-0.9,0.39-1.29c0.22-0.42,0.51-0.8,0.85-1.1c0.37-0.33,0.8-0.58,1.28-0.75 c0.46-0.16,0.95-0.23,1.46-0.2c2.66,0.16,5.19,0.5,7.58,1.01c2.4,0.51,4.67,1.2,6.78,2.06c2.13,0.87,4.12,1.92,5.96,3.14 c1.82,1.21,3.5,2.6,5.01,4.17c1.5,1.55,2.84,3.27,4,5.15c1.15,1.86,2.14,3.88,2.94,6.05c0.78,2.12,1.4,4.4,1.84,6.84 c0.43,2.4,0.69,4.93,0.77,7.62l0.01,0.14c0,0.48-0.09,0.95-0.27,1.38c-0.18,0.45-0.44,0.85-0.76,1.2c-0.33,0.36-0.74,0.65-1.2,0.85 c-0.43,0.2-0.92,0.31-1.43,0.33l-0.17,0c-0.48-0.01-0.93-0.1-1.35-0.27c-0.45-0.18-0.85-0.44-1.19-0.76 c-0.36-0.34-0.65-0.74-0.86-1.2c-0.2-0.44-0.31-0.92-0.33-1.44c-0.06-2.24-0.28-4.35-0.63-6.34c-0.35-2.01-0.85-3.88-1.47-5.6 c-0.62-1.72-1.38-3.3-2.26-4.75c-0.89-1.46-1.91-2.77-3.05-3.96c-1.16-1.19-2.44-2.26-3.85-3.19c-1.42-0.94-2.99-1.75-4.67-2.43 l-0.04-0.02c-1.7-0.67-3.52-1.22-5.47-1.63c-1.96-0.41-4.05-0.69-6.25-0.82L69.03,25.99L69.03,25.99z">
            </path>
        </g>
    </svg> ';
    $iconEmail = '<svg viewBox="0 0 600 600" version="1.1" id="svg9724" sodipodi:docname="email-close.svg"
        inkscape:version="1.2.2 (1:1.2.2+202212051550+b0a8486541)" width="600" height="600"
        xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
        xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns="http://www.w3.org/2000/svg"
        xmlns:svg="http://www.w3.org/2000/svg">
        <defs id="defs9728" />
        <sodipodi:namedview id="namedview9726" pagecolor="#ffffff" bordercolor="#666666" borderopacity="1.0"
            inkscape:showpageshadow="2" inkscape:pageopacity="0.0" inkscape:pagecheckerboard="0"
            inkscape:deskcolor="#d1d1d1" showgrid="true" inkscape:zoom="0.59480855" inkscape:cx="617.84586"
            inkscape:cy="313.54627" inkscape:window-width="1920" inkscape:window-height="1009" inkscape:window-x="0"
            inkscape:window-y="1080" inkscape:window-maximized="1" inkscape:current-layer="g10449" showguides="true">
            <inkscape:grid type="xygrid" id="grid9972" originx="0" originy="0" />
            <sodipodi:guide position="300,520" orientation="1,0" id="guide385" inkscape:locked="false" />
        </sodipodi:namedview>

        <g id="g10449" transform="matrix(0.95173205,0,0,0.95115787,13.901174,12.168794)" style="stroke-width:1.05103">
            <g id="path10026" inkscape:transform-center-x="-0.59233046" inkscape:transform-center-y="-20.347403"
                transform="matrix(1.3807551,0,0,1.2700888,273.60014,263.99768)" />
            <g id="g11314" transform="matrix(1.5092301,0,0,1.3955555,36.774048,-9.4503933)" style="stroke-width:50.6951" />
            <path
                style="color:#000000;fill:#000000;stroke-linecap:round;stroke-linejoin:round;-inkscape-stroke:none;paint-order:stroke fill markers"
                d="m 132.50586,39.773437 c -80.786884,0 -147.111329,66.380993 -147.111329,147.175783 v 231.32422 c 0,80.79479 66.324445,147.17578 147.111329,147.17578 h 336.20508 c 80.78688,0 147.11328,-66.38099 147.11328,-147.17578 V 186.94922 c 0,-80.79479 -66.3264,-147.175783 -147.11328,-147.175783 z m 0,84.082033 h 336.20508 c 35.63231,0 63.02929,27.39904 63.02929,63.09375 v 231.32422 c 0,35.69471 -27.39698,63.09375 -63.02929,63.09375 H 132.50586 c -35.63231,0 -63.029298,-27.39904 -63.029298,-63.09375 V 186.94922 c 0,-35.69471 27.396988,-63.09375 63.029298,-63.09375 z"
                id="rect240" />
            <path style="color:#000000;fill:#000000;stroke-linecap:round;stroke-linejoin:round;-inkscape-stroke:none"
                d="M 67.464844,81.886719 A 42.041302,42.041302 0 0 0 38.351562,95.591797 42.041302,42.041302 0 0 0 41.162109,154.98047 L 272.31836,365.25195 a 42.045506,42.045506 0 0 0 56.58008,0 L 560.05469,154.98047 a 42.041302,42.041302 0 0 0 2.81054,-59.388673 42.041302,42.041302 0 0 0 -59.38867,-2.808594 L 300.60937,277.31836 97.740234,92.783203 A 42.041302,42.041302 0 0 0 67.464844,81.886719 Z"
                id="path404" />
            <g id="g1810" transform="translate(-0.51901729)">
                <path style="color:#000000;fill:#000000;-inkscape-stroke:none"
                    d="m 418.54102,322.93555 -45.69727,43.45898 130.79492,137.53125 45.69727,-43.45898 z" id="path1686" />
                <path style="color:#000000;fill:#000000;-inkscape-stroke:none"
                    d="M 183.54297,323.11719 52.748047,462.84961 98.787109,505.94531 229.58203,366.21289 Z"
                    id="path1686-3" />
            </g>
        </g>
    </svg>';
    $iconAddress = '<svg viewBox="0 0 92.25 122.88" style="enable-background:new 0 0 92.25 122.88" xml:space="preserve">
        <style type="text/css">
            .st0 {
                fill-rule: evenodd;
                clip-rule: evenodd;
            }
        </style>
        <g>
            <path class="st0"
                d="M68.51,106.28c-5.59,6.13-12.1,11.62-19.41,16.06c-0.9,0.66-2.12,0.74-3.12,0.1 c-10.8-6.87-19.87-15.12-27-24.09C9.14,86.01,2.95,72.33,0.83,59.15c-2.16-13.36-0.14-26.22,6.51-36.67 c2.62-4.13,5.97-7.89,10.05-11.14C26.77,3.87,37.48-0.08,48.16,0c10.28,0.08,20.43,3.91,29.2,11.92c3.08,2.8,5.67,6.01,7.79,9.49 c7.15,11.78,8.69,26.8,5.55,42.02c-3.1,15.04-10.8,30.32-22.19,42.82V106.28L68.51,106.28z M46.12,23.76 c12.68,0,22.95,10.28,22.95,22.95c0,12.68-10.28,22.95-22.95,22.95c-12.68,0-22.95-10.27-22.95-22.95 C23.16,34.03,33.44,23.76,46.12,23.76L46.12,23.76z" />
        </g>
    </svg>';
    $base64Phone = 'data:image/svg+xml;base64,' . base64_encode($iconPhone);
    $base64Email = 'data:image/svg+xml;base64,' . base64_encode($iconEmail);
    $base64Address = 'data:image/svg+xml;base64,' . base64_encode($iconAddress);
@endphp

<body>
    <div class="header">
        <h2>{{ $entreprise['nom'] }}</h2>
        <p class="header-text" style="margin: 2px;">RCCM : {{ $entreprise['rccm'] }}</p>
        <p class="header-text" style="margin: 2px;">ID National : {{ $entreprise['id_national'] }}</p>
        <p class="header-text" style="margin: 2px;"><img src="{{ $base64Phone }}" alt="SVG" width="15" height="15"
                style="margin-right: 5px; padding: 2px;"> : {{ $entreprise['telephone'] }}</p>
        <p class="header-text" style="margin: 2px;"><img src="{{ $base64Email }}" alt="SVG" width="15" height="15"
                style="margin-right: 5px; padding: 2px;"> : {{ $entreprise['email'] }}</p>
        <p class="header-text" style="margin: 2px;"><img src="{{ $base64Address }}" alt="SVG" width="15" height="15"
                style="margin-right: 5px; padding: 2px;"> : {{ $vente->succursale->adresse }}</p>
    </div>

    <div class="vendeur">
        <p style="margin: 2px;">Vendeur : <span style="font-weight: bold;">{{ Str::limit($vente->vendeur->name,15)
                }}</span></p>
        <p style="margin: 2px;">Facture : <span style="font-weight: bold;">#{{ $vente->code }}</span></p>
        <p style="margin: 2px;">Date : <span style="font-weight: bold;">{{ $vente->created_at->format('Y-m-d H:i')
                }}</span></p>
        <p style="margin: 2px;">Client : <span style="font-weight: bold;">{{ $vente->client->name }}</span></p>
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
                        @if($item->produit)
                            {{ $item->produit->name }}
                        @elseif($item->service)
                            {{ $item->service->name }}
                        @else
                            N/A
                        @endif
                    </td>
                    <td>{{ number_format($item->prix_unitaire, 2) }}</td>
                    <td>{{ number_format($item->montant_total, 2) }}
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
            <div class="tva-row">
                <span>Total Services:</span>
                <span class="text-right">{{ number_format($montant_services, 2) }} USD</span>
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
            <span class="text-right text-bold">{{ number_format($vente->montant_total, 2) }} USD</span>
        </div>
    </div>

    <div style="border-bottom: 2px dotted #000000; padding-bottom: 5px; margin-top: 3px;">
        @if($vente->has_promotion)
        <p style="font-size: 10px;  margin: 0px; text-align: center; font-weight : bold ">--  Au prix promotionnel  --</p>

        @endif
        <p style="font-size: 10px;  margin: 0px;">Mode de paiement: {{ $vente->mode_paiement }}</p>
        <p style="font-size: 8px;font-weight: bold;  text-align: center; margin:2px;">Points de fidelité :  {{ $vente->client->fidelite->points }}</p>
        <p style="font-size: 8px;font-weight: bold;  text-align: center; margin:2px;">Les services rendus et
            marchandises vendues ne sont ni échangés ni remboursables</p>
        {{-- <p style="font-size: 8px;font-weight: bold; font-style: italic; text-align: center; margin: 2px;">*La TVA est de
            16% et est appliqué sur les produits*</p> --}}
    </div>

    <div class="ref">
        <div>
            <p class="ref-text">Web</p>
            <img src="{{ $qrWeb }}" alt="QR Code Web" width="60">
        </div>
        <div>
            <p class="ref-text">Facebook</p>
            <img src="{{ $qrFacebook }}" alt="QR Code Facebook" width="60">
        </div>
        <div>
            <p class="ref-text">Instagram</p>
            <img src="{{ $qrInstagram }}" alt="QR Code Instagram" width="60">
        </div>
    </div>
</body>

</html>