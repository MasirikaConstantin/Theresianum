"use client"

import { FrancCongolais } from '@/hooks/Currencies';
import { Depense, Succursale, User } from '@/types';
import { SalesStats, Vente } from '@/types/report';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import React, { useEffect } from 'react';

interface PrintReportProps {
  stats: SalesStats;
  ventes: Vente[];
  filters: any;
  vendeur: User | null;
  succursale: Succursale | null;
  entreprise: any;
  depenses : Depense
}

const PrintSalesReport: React.FC<PrintReportProps> = ({ stats, ventes, filters, vendeur, succursale,entreprise,depenses }) => {
 

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP', { locale: fr });
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'PPP', { locale: fr });
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      window.print();
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  // Calculer le total des items par vente pour l'affichage détaillé
  const getVenteItemsTotal = (vente: Vente) => {
    return vente.vente_produits.reduce((total, item) => total + Number(item.montant_total), 0);
  };

  return (
    <div className="container mx-auto p-6 bg-white text-black">
        <Head title={`Rapport des Ventes ${format(new Date(), 'PPPpp', { locale: fr })}`} />
      {/* Boutons d'action (non imprimés) */}
      <div className="no-print flex justify-end gap-2 p-4 mb-4 bg-gray-100 rounded-lg">
        <button 
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Imprimer
        </button>
        <button 
          onClick={() => window.close()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Fermer
        </button>
      </div>

      {/* En-tête du rapport */}
      <div className="text-center mb-6  border-gray-300 pb-4 text-black">
        {/* En-tête de l'entreprise */}
      <div className="text-center mb-2 border-b pb-4">
        {entreprise.logo && (
          <img 
            src={entreprise.logo} 
            alt="Logo entreprise" 
            className="h-20 mx-auto mb-2"
          />
        )}
        <h1 className="text-xl font-bold">{entreprise.name}</h1>
        <p className="text-xs">RCCM: <span className="font-bold">{entreprise.rccm}</span> | ID National: <span className="font-bold">{entreprise.id_national}</span></p>
        <p className="text-xs">Adresse: <span className="font-bold">{entreprise.address}</span></p>
        <p className="text-xs">Tél: <span className="font-bold">{entreprise.phone}</span> | Email: <span className="font-bold">{entreprise.email}</span></p>
        </div>
        <h1 className="text-2xl font-bold uppercase">Rapport des Ventes</h1>
        <p className="text-lg">
          Période du {formatDate(filters.start_date)} au {formatDate(filters.end_date)}
        </p>
        {filters.succursale_id && (
          <p className="text-sm">
            Succursale: <span className="font-bold">{succursale?.nom || 'Non spécifiée'}</span>
          </p>
        )}
        {filters.user_id && (
          <p className="text-sm">
            Vendeur: <span className="font-bold">{vendeur?.name || 'Non spécifié'}</span>
          </p>
        )}
      </div>

      {/* Résumé statistique */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3">Résumé Statistique</h2>
        <div className="">
          <ul className="list-disc list-inside">
            <li>Total Ventes: <span className="font-bold">{stats.total_ventes}</span></li>
            <li>Total Montant: <span className="font-bold">{FrancCongolais(stats.montant_total)}</span></li>
            <li>Total Dépenses: <span className="font-bold">{FrancCongolais(stats.total_depenses)}</span></li>
            <li>Benefice Net: <span className="font-bold">{FrancCongolais(stats.benefice_net)}</span></li>
          </ul>
        </div>

        
      </div>


      {/* Détail des ventes */}
      {ventes.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3">Détail des Ventes ({ventes.length})</h2>
          <div className="space-y-4">
          <table className='border-3 border-black w-full caption-bottom text-sm '>
                <thead >
                  <tr>
                    <th className="w-[100px]">Code </th>
                    <th>Date</th>
                    <th>Client</th>
                    <th>Mode de paiement</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
            {ventes.map((vente) => (
                    <tr key={vente.id} className='hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors'>
                      <td className="font-medium p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]">{vente.code}</td>
                      <td>{format(new Date(vente.created_at), 'PPPp', { locale: fr })}</td>
                      <td>{vente.client?.name || "Aucun"}</td>
                      <td>{vente.mode_paiement}</td>
                      <td className="text-right font-semibold">{FrancCongolais(Number(vente.montant_total))}</td>
                    </tr>
              
            ))}
            </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Détail des depenses */}
      {depenses.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3">Détail des depenses ({depenses.length})</h2>
          <div className="space-y-4">
          <table className='border-3 border-black w-full caption-bottom text-sm '>
                <thead >
                  <tr>
                    <th className="w-[100px]">Date </th>
                    <th>Libellé</th>
                    <th>Montant</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
            {depenses.map((depense) => (
                    <tr key={depense.id} className='hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors'>
                      <td className="font-medium p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]">{format(new Date(depense.created_at), 'PPPp', { locale: fr })}</td>
                      <td>{depense.libelle || "Aucun"}</td>
                      <td>{FrancCongolais(depense.montant)}</td>
                      <td className="font-semibold">{((depense.description))}</td>
                    </tr>
              
            ))}
            </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pied de page */}
      <div className="mt-8 pt-18 border-t-2 border-gray-300">
        <div className="grid grid-cols-2 gap-8">
          <div className="text-center">
            <div className="border-t-2 border-black w-3/4 mx-auto pt-2">
              <p className="text-sm">Signature Responsable</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t-2 border-black w-3/4 mx-auto pt-2">
              <p className="text-sm">Cachet & Signature</p>
            </div>
          </div>
        </div>

        <div className="mt-4 text-right text-xs text-gray-600">
          <p>Rapport généré le {format(new Date(), 'PPPp', { locale: fr })}</p>
        </div>
      </div>

      {/* Styles d'impression landscape */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 1cm;
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
          .container {
            width: 100%;
            padding: 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8pt;
          }
          th, td {
            padding: 2px 4px;
            border: 1px solid #000;
          }
          th {
            background-color: #f8f9fa !important;
            font-weight: bold;
          }
          .bg-blue-50, .bg-green-50, .bg-red-50, .bg-purple-50, .bg-gray-50 {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .break-before {
            page-break-before: always;
          }
          .break-after {
            page-break-after: always;
          }
          .break-inside-avoid {
            page-break-inside: avoid;
          }
        }
        
        @media screen {
          body {
            background-color: #f5f5f5;
          }
          .container {
            max-width: 1200px;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintSalesReport;