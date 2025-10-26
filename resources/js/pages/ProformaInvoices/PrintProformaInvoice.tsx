import React, { useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { usePrint } from '@/lib/usePrint';
import { DateHeure } from '@/hooks/Currencies';

interface Client {
  id: number;
  name: string;
  email?: string;
  telephone?: string;
  adresse?: string;
}

interface InvoiceItem {
  id: number;
  date_item: string;
  designation: string;
  quantite: number;
  prix_unitaire: number;
  montant_total: number;
}

interface User {
  id: number;
  name: string;
}

interface ProformaInvoice {
  id: number;
  numero_facture: string;
  statut: 'brouillon' | 'envoyee' | 'payee';
  date_facture: string;
  date_echeance?: string;
  montant_total: number;
  notes?: string;
  ref: string;
  client: Client;
  createdBy: User;
  items: InvoiceItem[];
}

interface PrintProformaInvoiceProps {
  invoice: ProformaInvoice;
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

const PrintProformaInvoice: React.FC<PrintProformaInvoiceProps> = ({ invoice, company }) => {
  const { handlePrint } = usePrint(true);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      brouillon: { label: 'Brouillon' },
      envoyee: { label: 'Envoyée' },
      payee: { label: 'Payée' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.brouillon;
    
    return (
      <span className="border px-2 py-1 rounded text-xs font-medium">
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
        <Head title={`Facture Proforma ${invoice.numero_facture}`} />
      {/* Boutons d'action (masqués à l'impression) */}
      <div className="no-print mb-4 flex justify-end space-x-2">
        <Button onClick={handlePrint}>
          Imprimer
        </Button>
        <Button variant="outline" onClick={() => router.visit(route('proforma-invoices.show', invoice.id))}>
          Retour
        </Button>
      </div>

      {/* En-tête */}
      <div className="text-center mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold">FACTURE PROFORMA</h1>
        <p className="text-lg">N°: {invoice.numero_facture}</p>
        
        <div className="mt-4">
          <h2 className="text-xl font-bold">{company.name}</h2>
          <p className="text-sm">{company.address}</p>
          <p className="text-sm">Tél: {company.phone} | Email: {company.email}</p>
        </div>
      </div>

      {/* Informations facture et statut */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p><strong>Date:</strong> {formatDate(invoice.date_facture)}</p>
          {invoice.date_echeance && (
            <p><strong>Échéance:</strong> {formatDate(invoice.date_echeance)}</p>
          )}
        </div>
        <div className="text-right">
          <p><strong>Statut:</strong> {getStatusBadge(invoice.statut)}</p>
        </div>
      </div>

      {/* Informations client */}
      {invoice.client && (
        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="font-bold text-lg mb-2">CLIENT</h3>
          <div>
            <p className="font-semibold">{invoice.client.name || 'Non spécifié'}</p>
            {invoice.client.email && <p>Email: {invoice.client.email}</p>}
            {invoice.client.telephone && <p>Téléphone: {invoice.client.telephone}</p>}
            {invoice.client.adresse && <p>Adresse: {invoice.client.adresse}</p>}
          </div>
        </div>
      )}

      {/* Tableau des articles */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-4">DÉTAIL DES ARTICLES</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Date</th>
              <th className="text-left py-2">Désignation</th>
              <th className="text-center py-2">Qté</th>
              <th className="text-right py-2">Prix Unitaire</th>
              <th className="text-right py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-2">{formatDate(item.date_item)}</td>
                <td className="py-2">{item.designation}</td>
                <td className="text-center py-2">{item.quantite}</td>
                <td className="text-right py-2">{formatCurrency(item.prix_unitaire)} $</td>
                <td className="text-right py-2">{formatCurrency(item.montant_total)} $</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <td colSpan={4} className="text-right py-2 pr-4">
                TOTAL:
              </td>
              <td className="text-right py-2">
                {formatCurrency(invoice.montant_total)} $
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-2">NOTES</h3>
          <div className="p-3 border rounded-lg whitespace-pre-wrap">
            {invoice.notes}
          </div>
        </div>
      )}

      {/* Pied de page */}
      <div className="mt-8 pt-4 border-t text-center text-sm">
        <p>
          Facture générée le {DateHeure(new Date().toString())}
        </p>
        <p className="mt-1">
          Créée par: {invoice.createdBy?.name || 'Système'}
        </p>
      </div>

      {/* Styles spécifiques pour l'impression */}
      <style>{`
      @media only screen and (orientation: landscape) {
        /* Styles to apply when in landscape mode */
        .container {
            display: grid;
            grid-template-columns: 1fr 2fr; /* Example: different column layout */
        }
        }
        @media print {
          body {
            font-size: 12pt;
            background: white;
            color: black;
            : landscape;
          }
          @page {
            size: A4;
            margin: 1.5cm;
          }
          body {
            font-size: 10pt;
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          td, th {
            padding: 4px 8px;
            border: 1px solid #ddd;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintProformaInvoice;