import { DateHeure, DateSimple, Dollar, FrancCongolais, HeureSimple } from "@/hooks/Currencies"
import { Reservation } from "@/types"
import axios from "axios"
import { useEffect, useState } from "react"

interface FactureA4Props {
  reservation: Reservation
  entreprise?: {
    nom: string
    adresse: string
    telephone: string
    email: string
    Immatriculation?: string
    id_national?: string
    telephone_reception?: string
  }
}

export default function FactureA4({ reservation }: FactureA4Props) {
  
  const [taux_achat, setTauxAchat] = useState<{exchange_rate: number, code: string}>({} as {exchange_rate: number, code: string})

  useEffect(() => {
    const fetchTauxAchat = async () => {
      const response = await axios.get('/get-taux')
      setTauxAchat(response.data)
    }
    fetchTauxAchat()
  }, [])

  const entrepriseInfo = {
    nom: 'ASBL Les Pères Carmes Centre Theresianum de Kinshasa  Ordre des Carmes Déchaux',
    adresse: "C.Kintambo, Q. Nganda, AV. Chrétienne 39b",
    Immatriculation: 'ASBL : 376/CAB/MIN/J',
    id_national: '01-G4701-N300623',
    telephone: "+243826646260",
    telephone_reception: "+243892247450",
    email: 'cthresianum@gmail.com',
  }

  const FormatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const isChambre = reservation.chambre_id !== null;
  const isSalle = reservation.salle_id !== null;

  return (
    <div className="bg-white text-gray-900 p-8 max-w-[297mm] min-h-[210mm] mx-auto shadow-lg print:shadow-none print:p-0 print:max-w-none ">
      {/* En-tête de la facture */}
      <div className="border-b-2 border-gray-300 pb-4 mb-4">
        <div className="flex justify-between items-start">
          <img src="/images/logo.png" alt="" className="w-20 h-20" />

          <div className="ml-4 flex-1">
            <h1 className="text-lg font-bold text-blue-800">{entrepriseInfo.nom}</h1>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-1">
              <p><span className="font-bold">Adresse:</span> {entrepriseInfo.adresse}</p>
              <p><span className="font-bold">Tél Admin:</span> {entrepriseInfo.telephone}</p>
              <p><span className="font-bold">Email:</span> {entrepriseInfo.email}</p>
              <p><span className="font-bold">Tél Réception:</span> {entrepriseInfo.telephone_reception}</p>
              <p><span className="font-bold">Immatriculation:</span> {entrepriseInfo.Immatriculation}</p>
              <p><span className="font-bold">ID National:</span> {entrepriseInfo.id_national}</p>
            </div>
          </div>
          
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-800">FACTURE</h2>
            <p className="text-sm text-gray-600">
              Date: {DateHeure(reservation.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Informations client et réservation */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-md font-semibold text-gray-800 mb-2">CLIENT</h3>
          <div className="bg-gray-50 p-3 rounded border border-gray-200">
            <p className="text-xs text-gray-600">Tél: {reservation.client.telephone}</p>
          </div>
        </div>

        <div>
          <h3 className="text-md font-semibold text-gray-800 mb-2">RÉSERVATION</h3>
          <div className="bg-gray-50 p-3 rounded border border-gray-200">
            <p className="font-medium text-sm">{reservation.chambre?.nom || reservation.salle?.nom}</p>
            <p className="text-xs text-gray-600">Type: {reservation.chambre?.type || reservation.salle?.vocation}</p>
            <p className="text-xs text-gray-600">
              Début: {HeureSimple(reservation.date_debut)}
            </p>
            <p className="text-xs text-gray-600">
              Fin: {HeureSimple(reservation.date_fin)}
            </p>
          </div>
        </div>
      </div>

      {/* Détails de la facture */}
      <div className="mb-6">
        <h3 className="text-md font-semibold text-gray-800 mb-3">DÉTAIL DE LA FACTURE</h3>
        
        {/* Séjour */}
        <div className="border border-gray-300 rounded mb-4">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2 font-semibold border-b border-gray-300 text-sm">Description</th>
                <th className="text-left p-2 font-semibold border-b border-gray-300 text-sm">Date</th>
                <th className="text-right p-2 font-semibold border-b border-gray-300 text-sm">Prix</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border-b border-gray-200">
                  <div>
                    {isChambre && (
                      <p className="font-medium text-sm">{reservation.chambre?.nom} - {reservation.chambre?.numero}</p>
                    )}
                    {isSalle && (
                      <p className="font-medium text-sm">{reservation.salle?.nom}</p>
                    )}
                    <p className="text-xs text-gray-600">{reservation.chambre?.equipements || reservation.salle?.equipements}</p>
                  </div>
                </td>
                <td className="p-2 border-b border-gray-200">
                  <ul className="text-xs list-disc list-inside">
                    <li>{DateHeure(reservation.date_debut)}</li>
                    <li>{DateHeure(reservation.date_fin)}</li>
                  </ul>
                </td>
                {isChambre && (
                  <td className="p-2 text-right border-b border-gray-200 text-sm">
                    {Dollar(parseFloat(reservation.chambre?.prix.toString()))}
                  </td>
                )}
                {isSalle && (
                  <td className="p-2 text-right border-b border-gray-200 text-sm">
                    {Dollar(parseFloat(reservation.vocation === "nuit" ? reservation.salle?.prix_nuit.toString() : reservation.salle?.prix_journee.toString()))}
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Ventes supplémentaires */}
        {reservation.ventes && reservation.ventes.length > 0 && (
          <div className="border border-gray-300 rounded">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-2 font-semibold border-b border-gray-300 text-sm">Services supplémentaires</th>
                  <th className="text-left p-2 font-semibold border-b border-gray-300 text-sm">Code</th>
                  <th className="text-left p-2 font-semibold border-b border-gray-300 text-sm">Mode de paiement</th>
                  <th className="text-right p-2 font-semibold border-b border-gray-300 text-sm">Montant</th>
                </tr>
              </thead>
              <tbody>
                {reservation.ventes.map((vente, index) => (
                  <tr key={vente.id} className={index < reservation.ventes.length - 1 ? 'border-b border-gray-200' : ''}>
                    <td className="p-2">
                      <p className="font-medium text-sm">Service supplémentaire</p>
                      <p className="text-xs text-gray-600">
                        {FrancCongolais(parseFloat(vente.created_at))}
                      </p>
                    </td>
                    <td className="p-2 text-sm">{vente.code}</td>
                    <td className="p-2 text-sm capitalize">{vente.mode_paiement}</td>
                    <td className="p-2 text-right text-sm font-semibold">
                      {FrancCongolais(parseFloat(vente.montant_total.toString()))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Total et informations de paiement */}
      <div className="border-t-2 border-gray-300 pt-4">
        <div className="flex gap-6">
          <div className="w-1/2">
            <h4 className="font-semibold text-gray-800 mb-2 text-sm">CONDITIONS DE PAIEMENT</h4>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-xs mb-1">
                <span className="font-medium">Statut: </span>
                <span className={`capitalize ${
                  reservation.statut_paiement === 'paye' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {reservation.statut_paiement.replace('_', ' ')}
                </span>
              </p>
              <p className="text-xs mb-1">
                <span className="font-medium">Mode de paiement: </span>
                <span className="capitalize">{reservation.type_paiement}</span>
              </p>
              {reservation.statut_paiement !== 'paye' && (
                <p className="text-xs text-red-600 font-medium mt-1">
                  Paiement à régler à la réception
                </p>
              )}
            </div>
          </div>

          <div className="w-1/2">
            <div className="bg-gray-50 rounded border border-gray-200 p-3">
              <div className="flex justify-between items-center mb-2 text-sm">
                <span className="font-medium">Sous-total séjour:</span>
                <div className="text-right">
                  <div>{Dollar(parseFloat(reservation.prix_total.toString()))}</div>
                  {taux_achat?.exchange_rate && (
                    <div className="text-xs text-gray-600">
                      {FormatCurrency(reservation.prix_total * taux_achat.exchange_rate, taux_achat.code).replace('CDF', 'FC')}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mb-2 text-sm">
                <span className="font-medium">Montant Payé:</span>
                <div className="text-right">
                  <div>{Dollar(parseFloat(reservation.montant_payer.toString()))}</div>
                  {taux_achat?.exchange_rate && (
                    <div className="text-xs text-gray-600">
                      {FormatCurrency(reservation.montant_payer * taux_achat.exchange_rate, taux_achat.code).replace('CDF', 'FC')}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mb-2 text-sm">
                <span className="font-medium">Montant Restant:</span>
                <div className="text-right">
                  <div>{Dollar(parseFloat((reservation.prix_total - reservation.montant_payer).toString()))}</div>
                  {taux_achat?.exchange_rate && (
                    <div className="text-xs text-gray-600">
                      {FormatCurrency((reservation.prix_total - reservation.montant_payer) * taux_achat.exchange_rate, taux_achat.code).replace('CDF', 'FC')}
                    </div>
                  )}
                </div>
              </div>
              
              {reservation.ventes && reservation.ventes.length > 0 && (
                <>
                  <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="font-medium">Services supplémentaires:</span>
                    <div className="text-right">
                      <div>
                        {FrancCongolais(
                          parseFloat(reservation.ventes.reduce((total, vente) => total + parseFloat(vente.montant_total.toString()), 0).toString())
                        )}
                      </div>
                      {taux_achat?.exchange_rate && (
                        <div className="text-xs text-gray-600">
                          {FormatCurrency(reservation.ventes.reduce((total, vente) => total + parseFloat(vente.montant_total.toString()), 0) / taux_achat.exchange_rate, "usd").replace('$US', '$')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-300 my-2 pt-2">
                    <div className="flex justify-between items-center font-bold text-sm">
                      {taux_achat?.exchange_rate && (
                        <>
                          <span>TOTAL GÉNÉRAL:</span>
                          <div className="text-right text-blue-800">
                            <div>{FormatCurrency(reservation.prix_total * taux_achat.exchange_rate + reservation.ventes.reduce((total, vente) => total + parseFloat(vente.montant_total.toString()), 0), taux_achat.code).replace('CDF', 'FC')}</div>
                            <div className="text-xs">
                              {FormatCurrency(parseFloat(reservation.prix_total.toString()) + (reservation.ventes.reduce((total, vente) => total + parseFloat(vente.montant_total.toString()), 0) / taux_achat.exchange_rate), "usd").replace('$US', '$')}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
              
              {(!reservation.ventes || reservation.ventes.length === 0) && (
                <div className="border-t border-gray-300 mt-2 pt-2">
                  <div className="flex justify-between items-center font-bold text-sm">
                    <span>TOTAL:</span>
                    <span className="text-blue-800">
                      {Dollar(parseFloat(reservation.prix_total.toString()))}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pied de page 
      <div className="mt-6 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
        <p>Facture établie électroniquement - Valable sans signature</p>
        <p className="mt-1">En cas de question, contactez-nous au {entrepriseInfo.telephone}</p>
      </div>*/}

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
  )
}