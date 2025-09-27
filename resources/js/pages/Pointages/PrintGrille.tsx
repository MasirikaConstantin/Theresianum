"use client"

import { Button } from "@/components/ui/button"
import { Agent, Pointage } from "@/types"
import { Head, Link } from "@inertiajs/react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useEffect } from "react"

export default function PrintGrille({pointages, agent, date, entreprise, Mois, statistiques}: {pointages: Pointage[], agent: Agent, date: string, entreprise: {name: string, address: string, phone: string, email: string, logo?: string}, Mois: string, statistiques: {present: number, absent: number, conge: number, malade: number, formation: number, mission: number}}) {
  const capitalizeFirstLetter = (str: string) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  useEffect(() => {
      const timeout = setTimeout(() => {
        window.print();
      }, 500);
  
      return () => clearTimeout(timeout);
    }, []);
    return (
        <div>
          <Head title={`Pointages ${new Date(date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })}`} />
          <div className="no-print flex justify-end gap-2 p-6">
            <Button onClick={() => window.print()}>Imprimer</Button>
            <Link href={route('pointages.agent')}>
            <Button variant="destructive">Fermer</Button>
            </Link>
          </div>
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
        <p className="text-xs">{entreprise.address}</p>
        <p className="text-xs">Tél: {entreprise.phone} | Email: {entreprise.email}</p>
        <h2 className="text-xl font-bold mt-1 underline">GRILLE DES PRESENCES</h2>
          <p className="text-xs ">
            Mois de:  <span className="font-bold">{String(format(Mois, 'MMMM', { locale: fr })).toUpperCase()} {format(Mois, 'yyyy')}</span>
          </p>
      </div>
            <p>Agent: <span className="font-bold">{agent.nom} {agent.postnom} {agent.prenom}</span></p>
            <p>Matricule: <span className="font-bold">{agent.matricule}</span></p>
            <table className="table-auto w-full border-collapse border border-gray-300 ">
              <thead>
                {/* 1re ligne : "Date" couvre 2 colonnes */}
                <tr>
                  <th className="px-4 py-2 border border-gray-300 text-center" colSpan={2}>
                    Date
                  </th>
                  <th className="px-4 py-2 border border-gray-300 text-center">Heure d'arrivée</th>
                  <th className="px-4 py-2 border border-gray-300 text-center">Heure de départ</th>
                </tr>
              </thead>

              <tbody>
                {pointages.map((pointage) => (
                  <tr key={pointage.id}>
                    {/* Jour (ex: "Dimanche") */}
                    <td className="px-4 py-2 border border-gray-300">
                      {capitalizeFirstLetter(format(new Date(pointage.date), "EEEE", { locale: fr }))}
                    </td>

                    {/* Jour & mois (ex: "2 juin") */}
                    <td className="px-4 py-2 border border-gray-300">
                      {format(new Date(pointage.date), "d MMMM", { locale: fr })}
                    </td>

                    {/* Heures (format HH:mm) */}
                    <td className="px-4 py-2 border border-gray-300">
                      {pointage.heure_arrivee ? pointage.heure_arrivee.slice(0, 5) : "-"}
                    </td>

                    <td className="px-4 py-2 border border-gray-300">
                      {pointage.heure_depart ? pointage.heure_depart.slice(0, 5) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className=" flex flex-col">
             <ul className="grid grid-cols-2">
            <li className="border border-gray-300 p-1 m-0">Présents: <span className="font-bold">{statistiques.present}</span></li>
              <li className="border border-gray-300 p-1 m-0">Absents: <span className="font-bold">{statistiques.absent}</span></li>
              <li className="border border-gray-300 p-1 m-0">Congés: <span className="font-bold">{statistiques.conge}</span></li>
              <li className="border border-gray-300 p-1 m-0">Malades: <span className="font-bold">{statistiques.malade}</span></li>
              <li className="border border-gray-300 p-1 m-0">Formations: <span className="font-bold">{statistiques.formation}</span></li>
              <li className="border border-gray-300 p-1 m-0">Missions: <span className="font-bold">{statistiques.mission}</span></li>
             </ul>
            </div>

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
            size: A4;
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
            padding: 1px 2px;
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
    )
}