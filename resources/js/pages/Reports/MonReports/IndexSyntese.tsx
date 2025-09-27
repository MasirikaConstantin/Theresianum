import React, { useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Auth, PageProps, User } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DailyData {
  date: string;
  ventes_count: number;
  montant_total: number;
  montant_remise: number;
  montant_net: number;
  depenses: number;
  benefice_net: number;
}

interface TopItem {
  type: string;
  item_id: number | null;
  total_quantite: number;
  total_montant: number;
  item: any | null;
}

interface StatsData {
  total_ventes: number;
  montant_total: number;
  montant_remise: number;
  montant_net: number;
  total_depenses: number;
  benefice_net: number;
  top_items: TopItem[];
  daily_data: DailyData[];
  periode: {
    start: string;
    end: string;
    days_count: number;
  };
}

interface ReportPageProps extends PageProps {
  stats: StatsData;
  start_date: string;
  auth: Auth;
  end_date: string;
  entreprise: any;
  vendeur: User | null;
}

export default function SalesReport({ auth, stats, start_date, end_date, entreprise,vendeur }: ReportPageProps) {
  const { props } = usePage<ReportPageProps>();
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount).replace('$US', '$');
  };
  useEffect(() => {
      const timeout = setTimeout(() => {
        window.print();
      }, 500);
  
      return () => clearTimeout(timeout);
    }, []);
     const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'PPP', { locale: fr });
      };
  return (
   

      <div className="container mx-auto p-6 bg-white">
        <Head title={`Rapport synthétique des ventes ${format(new Date(), 'PPP', { locale: fr })}`} />
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
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="text-center mb-6  border-gray-300 pb-4">
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
          Période du {formatDate(start_date)} au {formatDate(end_date)}
        </p>
        
      </div>
          {/* Résumé Statistique */}
          <ul className="mb-6">
            {vendeur && (
              <li className="text-lg">Vendeur : <span className="font-bold">{vendeur.name}</span></li>
            )}
            <li className="text-lg">Nombre de Ventes : <span className="font-bold">{stats.total_ventes}</span></li>
            <li className="text-lg">Total Vendue : <span className="font-bold">{formatCurrency(stats.montant_total)}</span></li>
            <li className="text-lg">Total Dépensé : <span className="font-bold">{formatCurrency(stats.total_depenses)}</span></li>
            <li className="text-lg">Solde : <span className="font-bold">{formatCurrency(stats.benefice_net)}</span></li>
          </ul>
          

          {/* Données Quotidiennes */}
          <div className=" bg-white ">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">
              Données Quotidiennes ({stats.periode.days_count} jours)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                       Total Ventes
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Montant Total
                    </th>
                    {/* <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Remises
                    </th> */}
                    {/* <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Montant Net
                    </th>*/}
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Dépenses
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Solde
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.daily_data.map((day, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {format(new Date(day.date), 'PPP', { locale: fr })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">{day.ventes_count}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right mr-2">
                        <div className="text-sm text-green-600 align-center text-align-center ">
                          {formatCurrency(day.montant_total)}
                        </div>
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-orange-600">
                          {formatCurrency(day.montant_remise)}
                        </div>
                      </td> */}
                      {/* <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-blue-600">
                          {formatCurrency(day.montant_net)}
                        </div>
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-right mr-2">
                        <div className="text-sm text-red-600">
                          {formatCurrency(day.depenses)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right mr-2">
                        <div className={`text-sm font-medium ${
                          day.benefice_net >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(day.benefice_net)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                
              </table>
            </div>
          </div>

          
        </div>
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
}