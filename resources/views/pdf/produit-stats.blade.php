<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Statistiques du produit</title>
    <style>
        @page { margin: 0; padding: 0; size: 72mm auto; }

body { font-family: DejaVu Sans; 
font-size: 11px;
margin: 0;
padding: 2mm;
}
.header { text-align: center; margin-bottom: 20px; border-bottom: 2px dotted #000000; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { border: 1px solid #ddd; padding: 8px; }
.badge { background-color: #f0f0f0; padding: 2px 5px; border-radius: 3px; }
.donnee{padding-bottom: 2%; border-bottom: 2px dotted #000000;}
.ref {
display: flex;
justify-content: center;
gap: 1px;
margin-top: 15px;
width: 100%;
}

.ref > div {
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
.bold { font-weight: bold; }
.text-right { text-align: right; }
.text-center { text-align: center; }
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

.table, th, .td {
border: 1px solid;
border-collapse: collapse;

}
td, tr, th{
height: 20px!important;


}
th, td {
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
max-width: 88mm; /* Largeur maximale de 88mm */
border-collapse: collapse;
table-layout: fixed; /* Essentiel pour le contrôle précis */
margin: 0 auto;
}

.table th, .table td {
border: 2px dotted;
padding: 2px;
height: auto;
word-wrap: break-word;
}

/* Répartition des colonnes */
.table th:nth-child(1), 
.table td:nth-child(1) {
width: 30%; /* # */
}

.table th:nth-child(2), 
.table td:nth-child(2) {
text-align: center;
width: 12%; /* # */

}



.table th:nth-child(3), 
.table td:nth-child(3) {
width: 20%; 
text-align: center;
}

.table th:nth-child(4), 
.table td:nth-child(4) {
width: 15%; 

text-align: center;
}

.table th:nth-child(5), 
.table td:nth-child(5) {
text-align: center;
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
margin: 0px 0px 0px 0px;
}
.table, th, .td {
    border: 1px solid;
    border-collapse: collapse;
    
}
.section-title { background-color: #f5f5f5; padding: 5px; margin: 10px 0 10px 0; }
</style>
</head>
<body>
    <div class="header">
        <h1>Statistiques du produit</h1>
        <p>Période du {{ $data['date_debut'] }} au {{ $data['date_fin'] }}</p>
    </div>

    <div class="info-produit">
        <h5>Produit : {{ $data['produit']->name }}</h5>
        <p>Prix d'achat: {{ number_format($data['produit']->prix_achat, 1) }} $</p>
        <p>Prix de vente: {{ number_format($data['produit']->prix_vente, 1) }} $</p>
    </div>

    <ul class="stats-grid">
        <li>
            Quantité vendue : {{ $data['stats']['total_vendu'] }}
        </li>
        <li>
            Chiffre d'affaires : {{ number_format($data['stats']['chiffre_affaires'], 1) }} $</li>
        <li>
            Marge bénéficiaire : {{ number_format($data['stats']['marge'], 1) }} $</li>
    </ul>

    @if($data['ventes_par_periode']->count() > 0)
    <div class="section-title">Ventes par période</div>
    <table class="table">
        <thead>
            <tr>
                <th>Date</th>
                <th>Q .V</th>
                <th>Mt</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['ventes_par_periode'] as $vente)
            <tr>
                <td>{{ \Carbon\Carbon::parse($vente->date)->format('d/m/Y') }}</td>
                <td>{{ $vente->total_quantite }}</td>
                <td>{{ number_format($vente->total_ca, 1) }} $</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    @if($data['ventes_par_succursale']->count() > 0)
    <div class="section-title">Ventes par succursale</div>
    <table class="table">
        <thead>
            <tr>
                <th>Succursale</th>
                <th>Q .V</th>
                <th>Mt</th>
                <th>Bén</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['ventes_par_succursale'] as $succursale)
            <tr>
                <td>{{ $succursale->nom }}</td>
                <td>{{ $succursale->total_quantite }}</td>
                <td>{{ number_format($succursale->total_ca, 1) }} $</td>
                <td>{{ number_format($succursale->marge, 1) }} $</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    
    @endif
    <ul>
        <li>Mt = Montant total</li>
        <li>Bén = Bénéfice</li>
        <li>Q .V = Quantité vendue</li>
    </ul>
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
    <div class="footer">
        Généré le {{ now()->format('d/m/Y à H:i') }}
    </div>
</body>
</html>