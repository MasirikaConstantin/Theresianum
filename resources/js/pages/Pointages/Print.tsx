import { useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Head } from '@inertiajs/react';

interface Pointage {
  id: number;
  agent_id: number;
  date: string;
  heure_arrivee: string | null;
  heure_depart: string | null;
  statut: string;
  statut_arrivee: string | null;
  statut_depart: string | null;
  justifie: boolean;
  justification: string | null;
  notes: string | null;
  ref: string;
  created_by: number;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  agent: {
    id: number;
    nom: string;
    postnom: string;
    prenom: string;
    ref: string;
    succursale_id: string;
    avatar_url: string | null;
    signature_url: string | null;
    succursale: {
      id: number;
      nom: string;
      ref: string;
    };
  };
}

interface PrintPointagesProps {
  pointages: Pointage[];
  entreprise: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
  };
  periode?: {
    debut: string;
    fin: string;
  };
}

export default function PrintPointages({ pointages, entreprise, periode }: PrintPointagesProps) {
  // Auto-impression au chargement
  useEffect(() => {
    const timeout = setTimeout(() => {
      window.print();
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  const getStatutLabel = (statut: string) => {
    const statuts: Record<string, string> = {
      present: 'Présent',
      absent: 'Absent',
      retard: 'Retard',
      congé: 'En congé',
      permission: 'Permission',
      mission: 'Mission'
    };
    return statuts[statut] || statut;
  };

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      present: 'text-green-600',
      absent: 'text-red-600',
      retard: 'text-orange-600',
      congé: 'text-blue-600',
      permission: 'text-purple-600',
      mission: 'text-indigo-600'
    };
    return colors[statut] || 'text-gray-600';
  };

  const formatHeure = (heure: string | null) => {
    if (!heure) return '-';
    try {
      return format(new Date(heure), 'HH:mm');
    } catch {
      return heure;
    }
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'PPP', { locale: fr });
    } catch {
      return date;
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto bg-white">
      <Head>
        <title>Pointages</title>
      </Head>
      {/* Boutons d'action - visibles seulement à l'écran */}
      <div className="no-print flex justify-end gap-4 mb-6">
        <button 
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Imprimer
        </button>
        <button 
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Retour
        </button>
      </div>

      {/* En-tête de l'entreprise */}
      <div className="text-center mb-8 border-b pb-4">
        {entreprise.logo && (
          <img 
            src={entreprise.logo} 
            alt="Logo entreprise" 
            className="h-24 mx-auto mb-2"
          />
        )}
        <h1 className="text-2xl font-bold">{entreprise.name}</h1>
        <p className="text-sm">{entreprise.address}</p>
        <p className="text-sm">Tél: {entreprise.phone} | Email: {entreprise.email}</p>
        <h2 className="text-xl font-bold mt-4">RAPPORT DE POINTAGE</h2>
        {periode && (
          <p className="text-sm mt-2">
            Période: du {formatDate(periode.debut)} au {formatDate(periode.fin)}
          </p>
        )}
      </div>

      {/* Statistiques générales */}
      <div className="mb-6">
        <ul>
          <li>Date:  <span className="font-bold">{formatDate(pointages[0].date)}</span></li>
          <li>Nombre total de pointages: <span className="font-bold">{pointages.length}</span></li>
          <li>Nombre de présents: <span className="font-bold">{pointages.filter(p => p.statut === 'present').length}</span></li>
          <li>Nombre d'absents: <span className="font-bold">{pointages.filter(p => p.statut === 'absent').length}</span></li>
          <li>Nombre de retards: <span className="font-bold">{pointages.filter(p => p.statut === 'retard').length}</span></li>
        </ul>
      </div>

      {/* Tableau des pointages */}
      <div className="mb-6">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Agent</th>
              <th className="border p-2 text-left">Succursale</th>
              <th className="border p-2 text-left">Date</th>
              <th className="border p-2 text-center">Arrivée</th>
              <th className="border p-2 text-center">Départ</th>
              <th className="border p-2 text-center">Statut</th>
              <th className="border p-2 text-center">Justifié</th>
            </tr>
          </thead>
          <tbody>
            {pointages.map((pointage) => (
              <tr key={pointage.id} className="hover:bg-gray-50">
                <td className="border p-2">
                  <div className="font-medium">
                    {pointage.agent.nom} {pointage.agent.postnom} {pointage.agent.prenom}
                  </div>
                </td>
                <td className="border p-2">
                  {pointage.agent?.succursale?.nom || "-"}
                </td>
                <td className="border p-2">
                  {formatDate(pointage.date)}
                </td>
                <td className="border p-2 text-center">
                  <div>{formatHeure(pointage.heure_arrivee)}</div>
                  {pointage.statut_arrivee && (
                    <div className="text-xs text-gray-500">
                      ({pointage.statut_arrivee})
                    </div>
                  )}
                </td>
                <td className="border p-2 text-center">
                  <div>{formatHeure(pointage.heure_depart)}</div>
                  {pointage.statut_depart && (
                    <div className="text-xs text-gray-500">
                      ({pointage.statut_depart})
                    </div>
                  )}
                </td>
                <td className="border p-2 text-center">
                  <span className={`font-medium ${getStatutColor(pointage.statut)}`}>
                    {getStatutLabel(pointage.statut)}
                  </span>
                </td>
                <td className="border p-2 text-center">
                  {pointage.statut_arrivee === 'a-lheure' && pointage.statut_depart === 'a-lheure' ? (
                    <>
                    </>
                  ) : (
                    <>
                    {pointage.statut === 'congé' ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-red-600">✗</span>
                    )}
                    </>
                  )}
                  
                  
                </td>
               
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Résumé par statut 
      <div className="mb-8">
        <h3 className="font-bold mb-4">RÉSUMÉ PAR STATUT</h3>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(
            pointages.reduce((acc, p) => {
              acc[p.statut] = (acc[p.statut] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          ).map(([statut, count]) => (
            <div key={statut} className="border p-3 rounded">
              <div className={`font-bold ${getStatutColor(statut)}`}>
                {getStatutLabel(statut)}
              </div>
              <div className="text-xl">{count} pointages</div>
              <div className="text-sm text-gray-600">
                {((count / pointages.length) * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>*/}

      {/* Signatures */}
      <div className="mt-12 grid grid-cols-2 gap-8">
        <div className="text-center">
          <div className="border-t-2 border-black w-3/4 mx-auto pt-2">
            <p>Signature Responsable RH</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t-2 border-black w-3/4 mx-auto pt-2">
            <p>Cachet & Signature {entreprise.name}</p>
          </div>
        </div>
      </div>

      {/* Date d'émission */}
      <div className="mt-8 text-right text-sm">
        <p>Généré le {format(new Date(), 'PPP à HH:mm', { locale: fr })}</p>
      </div>

      {/* Styles d'impression */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 1cm;
          }
          body {
            font-size: 10pt;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9pt;
          }
          th, td {
            padding: 2px 4px;
            border: 1px solid #000;
            vertical-align: top;
          }
          th {
            background-color: #f0f0f0 !important;
            font-weight: bold;
          }
          .truncate {
            max-width: none;
            white-space: normal;
          }
        }
      `}</style>
    </div>
  );
}