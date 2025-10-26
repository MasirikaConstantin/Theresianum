<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture Proforma {{ $invoice->numero_facture }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
        }
        .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 20px;
        }
        .company-info, .invoice-info {
            flex: 1;
        }
        .invoice-title {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
        }
        .invoice-number {
            font-size: 14px;
            color: #6b7280;
        }
        .client-info {
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #1f2937;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        th {
            background-color: #3b82f6;
            color: white;
            padding: 10px;
            text-align: left;
            font-weight: bold;
        }
        td {
            padding: 10px;
            border-bottom: 1px solid #e5e7eb;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .total-row {
            background-color: #f8fafc;
            font-weight: bold;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 11px;
            color: #6b7280;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-brouillon { background-color: #6b7280; color: white; }
        .status-envoyee { background-color: #3b82f6; color: white; }
        .status-payee { background-color: #10b981; color: white; }
    </style>
</head>
<body>
    <!-- En-tête -->
    <div class="header">
        <div class="company-info">
            <div class="invoice-title">FACTURE PROFORMA</div>
            <div class="invoice-number">N°: {{ $invoice->numero_facture }}</div>
            <div style="margin-top: 15px;">
                <strong>{{ $company['name'] }}</strong><br>
                {{ $company['address'] }}<br>
                Tél: {{ $company['phone'] }}<br>
                Email: {{ $company['email'] }}
            </div>
        </div>
        <div class="invoice-info" style="text-align: right;">
            <div style="margin-bottom: 10px;">
                <span class="status-badge status-{{ $invoice->statut }}">
                    @switch($invoice->statut)
                        @case('brouillon') Brouillon @break
                        @case('envoyee') Envoyée @break
                        @case('payee') Payée @break
                    @endswitch
                </span>
            </div>
            <div><strong>Date:</strong> {{ \Carbon\Carbon::parse($invoice->date_facture)->format('d/m/Y') }}</div>
            @if($invoice->date_echeance)
            <div><strong>Échéance:</strong> {{ \Carbon\Carbon::parse($invoice->date_echeance)->format('d/m/Y') }}</div>
            @endif
        </div>
    </div>

    <!-- Informations client -->
    @if ($invoice->client)
    <div class="client-info">
        <div class="section-title">CLIENT</div>
        <div>
            <strong>{{ $invoice->client->name ?? 'Non spécifié' }}</strong><br>
            @if($invoice->client->email)
            {{ $invoice->client->email }}<br>
            @endif
            @if($invoice->client->telephone)
            {{ $invoice->client->telephone }}<br>
            @endif
            @if($invoice->client->adresse)
            {{ $invoice->client->adresse }}
            @endif
        </div>
    </div> 
    @endif

    <!-- Tableau des articles -->
    <table>
        <thead>
            <tr>
                <th style="width: 15%">Date</th>
                <th style="width: 40%">Désignation</th>
                <th style="width: 10%; text-align: center;">Qté</th>
                <th style="width: 15%; text-align: right;">Prix Unitaire</th>
                <th style="width: 20%; text-align: right;">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($invoice->items as $item)
            <tr>
                <td>{{ \Carbon\Carbon::parse($item->date_item)->format('d/m/Y') }}</td>
                <td>{{ $item->designation }}</td>
                <td style="text-align: center;">{{ $item->quantite }}</td>
                <td style="text-align: right;">{{ number_format($item->prix_unitaire, 2, ',', ' ') }} $</td>
                <td style="text-align: right;">{{ number_format($item->montant_total, 2, ',', ' ') }} $</td>
            </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr class="total-row">
                <td colspan="4" style="text-align: right; padding-right: 20px;"><strong>TOTAL:</strong></td>
                <td style="text-align: right;"><strong>{{ number_format($invoice->montant_total, 2, ',', ' ') }} $</strong></td>
            </tr>
        </tfoot>
    </table>

    <!-- Notes -->
    @if($invoice->notes)
    <div style="margin-top: 30px;">
        <div class="section-title">NOTES</div>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px;">
            {!! nl2br(e($invoice->notes)) !!}
        </div>
    </div>
    @endif

    <!-- Pied de page -->
    <div class="footer">
        <div style="text-align: center;">
            Facture générée le {{ \Carbon\Carbon::now()->format('d/m/Y à H:i') }}<br>
            Référence: {{ $invoice->ref }} | Créée par: {{ $invoice->createdBy->name ?? 'Système' }}
        </div>
    </div>
</body>
</html>