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
    <div className="bg-white text-gray-900 p-8 max-w-[210mm] min-h-[297mm] mx-auto shadow-lg print:shadow-none print:p-0 print:max-w-none">
      {/* En-tête de la facture */}
      <div className="border-b-2 border-gray-300 pb-6 mb-6">
        <div className="flex justify-between items-start">
        <img src="/images/logo.png" alt="" className="w-24 h-24" />

          <div className="ml-6">
            <h1 className="text-xl font-bold text-blue-800">{entrepriseInfo.nom}</h1>
            <p className="text-sm text-gray-600 mt-2"><span className="font-bold">Adresse:</span> {entrepriseInfo.adresse}</p>
            <p className="text-sm text-gray-600"><span className="font-bold">Téléphone Administration:</span> {entrepriseInfo.telephone}</p>
            <p className="text-sm text-gray-600"><span className="font-bold">Email:</span> {entrepriseInfo.email}</p>
            <p className="text-sm text-gray-600"><span className="font-bold">Immatriculation:</span> {entrepriseInfo.Immatriculation}</p>
            <p className="text-sm text-gray-600"><span className="font-bold">ID National:</span> {entrepriseInfo.id_national}</p>
            <p className="text-sm text-gray-600"><span className="font-bold">Téléphone de Reception:</span> {entrepriseInfo.telephone_reception}</p>
           
          </div>
          
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-800">FACTURE</h2>
            <p className="text-sm text-gray-600">
              Date: {DateHeure(reservation.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Informations client et réservation */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">CLIENT</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium">{reservation.client.name}</p>
            <p className="text-sm text-gray-600">Tél: {reservation.client.telephone}</p>
            <p className="text-sm text-gray-600">Email: {reservation.client.email}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">RÉSERVATION</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium">{reservation.chambre?.nom || reservation.salle?.nom}</p>
            <p className="text-sm text-gray-600">Type: {reservation.chambre?.type || reservation.salle?.vocation}</p>
            <p className="text-sm text-gray-600">
              Début: {HeureSimple(reservation.date_debut)}
            </p>
            <p className="text-sm text-gray-600">
              Fin: {HeureSimple(reservation.date_fin)}
            </p>
            
          </div>
        </div>
      </div>

      {/* Détails de la facture */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">DÉTAIL DE LA FACTURE</h3>
        
        {/* Séjour */}
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3 font-semibold">Description</th>
                <th className="text-left p-3 font-semibold">Date</th>
                <th className="text-right p-3 font-semibold">Prix</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="p-3">
                  <div>
                    {isChambre && (
                    <p className="font-medium">{reservation.chambre?.nom || reservation.salle?.nom} - {reservation.chambre?.numero }</p>
                    )}
                    {isSalle && (
                    <p className="font-medium">{reservation.chambre?.nom || reservation.salle?.nom} - {reservation.chambre?.numero }</p>
                    )}
                    <p className="text-xs text-gray-600">{reservation.chambre?.equipements || reservation.salle?.equipements}</p>
                  </div>
                </td>
                <td className="p-3"><ul className="list-disc text-sm" >
                  <li>{DateHeure(reservation.date_debut)}</li>
                  <li>{DateHeure(reservation.date_fin)}</li>
                </ul></td>
                {isChambre && (
                <td className="p-3 text-right">{Dollar(parseFloat(reservation.chambre?.prix.toString()))}</td>
                )}
                {isSalle && (
                <td className="p-3 text-right">{Dollar(parseFloat(reservation.vocation==="nuit" ? reservation.salle?.prix_nuit.toString() : reservation.salle?.prix_journee.toString()))}</td>
                )}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Ventes supplémentaires */}
        {reservation.ventes && reservation.ventes.length > 0 && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3 font-semibold">Services supplémentaires</th>
                  <th className="text-left p-3 font-semibold">Code</th>
                  <th className="text-left p-3 font-semibold">Mode de paiement</th>
                  <th className="text-right p-3 font-semibold">Montant</th>
                </tr>
              </thead>
              <tbody>
                {reservation.ventes.map((vente, index) => (
                  <tr 
                    key={vente.id} 
                    className={index < reservation.ventes.length - 1 ? 'border-b border-gray-200' : ''}
                  >
                    <td className="p-3">
                      <p className="font-medium">Service supplémentaire</p>
                      <p className="text-sm text-gray-600">
                        {FrancCongolais(parseFloat(vente.created_at))}
                      </p>
                    </td>
                    <td className="p-3">{vente.code}</td>
                    <td className="p-3 capitalize">{vente.mode_paiement}</td>
                    <td className="p-3 text-right font-semibold">
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
      <div className="border-t-2 border-gray-300 pt-6">
        <div className="flex justify-between items-start">
          

          <div className="w-full">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Sous-total séjour:</span>
                <span>{Dollar(parseFloat(reservation.prix_total.toString()))}</span>
                {taux_achat?.exchange_rate ? (
                <>
                <span className="font-medium">Vaut</span><br />

                  <p>
                    {FormatCurrency(reservation.prix_total * taux_achat.exchange_rate, taux_achat.code).replace('CDF', 'FC')}
                  </p>
                </>
                ) : ''}
              </div>


              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Montant Payé:</span>
                <span>{Dollar(parseFloat(reservation.montant_payer.toString()))}</span>
                {taux_achat?.exchange_rate ? (
                <>
                <span className="font-medium">Vaut</span><br />

                  <p>
                    {FormatCurrency(reservation.montant_payer * taux_achat.exchange_rate, taux_achat.code).replace('CDF', 'FC')}
                  </p>
                </>
                ) : ''}
              </div>

              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Montant Restant :</span>
                <span>{Dollar(parseFloat((reservation.prix_total -reservation.montant_payer).toString()))}</span>
                {taux_achat?.exchange_rate ? (
                <>
                <span className="font-medium">Vaut</span><br />

                  <p>
                    {FormatCurrency((reservation.prix_total -reservation.montant_payer) * taux_achat.exchange_rate, taux_achat.code).replace('CDF', 'FC')}
                  </p>
                </>
                ) : ''}
              </div>
              
              {reservation.ventes && reservation.ventes.length > 0 && (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Services supplémentaires:</span>
                    <span>
                      {FrancCongolais(
                        parseFloat(reservation.ventes.reduce((total, vente) => total + parseFloat(vente.montant_total.toString()), 0).toString())
                      )}
                    </span>
                    {taux_achat?.exchange_rate ? (
                    <>
                    <span className="font-medium">Vaut</span><br />

                      <p>
                        {FormatCurrency(reservation.ventes.reduce((total, vente) => total + parseFloat(vente.montant_total.toString()), 0) / taux_achat.exchange_rate, "usd").replace('$US', '$')}
                      </p>
                    </>
                    ) : ''}
                  </div>
                  
                  <div className="border-t border-gray-300 my-2 pt-2">
                    <div className="flex justify-between items-center text-lg font-bold">
                    {taux_achat?.exchange_rate ? (
                      <>
                            <span>TOTAL GÉNÉRAL:</span>
                            <span className="text-blue-800">
                              
                              <ul>
                                <li>{FormatCurrency(reservation.prix_total * taux_achat.exchange_rate + reservation.ventes.reduce((total, vente) => total + parseFloat(vente.montant_total.toString()), 0), taux_achat.code).replace('CDF', 'FC')}</li>
                                <li>{FormatCurrency(parseFloat(reservation.prix_total.toString())  + (reservation.ventes.reduce((total, vente) => total + parseFloat(vente.montant_total.toString()), 0) / taux_achat.exchange_rate), "usd").replace('$US', '$')}</li>
                              </ul>
                      </span>

                        </>
                        ) : ''}
                    </div>
                  </div>
                </>
              )}
              
              {(!reservation.ventes || reservation.ventes.length === 0) && (
                <div className="border-t border-gray-300 mt-2 pt-2">
                  <div className="flex justify-between items-center text-lg font-bold">
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

      <div className="w-1/2">
            <h4 className="font-semibold text-gray-800 mb-2">CONDITIONS DE PAIEMENT</h4>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm">
                <span className="font-medium">Statut: </span>
                <span className={`capitalize ${
                  reservation.statut_paiement === 'paye' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {reservation.statut_paiement.replace('_', ' ')}
                </span>
              </p>
              <p className="text-sm">
                <span className="font-medium">Mode de paiement: </span>
                <span className="capitalize">{reservation.type_paiement}</span>
              </p>
              {reservation.statut_paiement !== 'paye' && (
                <p className="text-sm text-red-600 font-medium mt-2">
                  Paiement à régler à la réception
                </p>
              )}
            </div>
          </div>

      {/* Pied de page 
      <div className="mt-12 pt-6 border-t border-gray-300 text-center text-xs text-gray-500">
        <p>Facture établie électroniquement - Valable sans signature</p>
        <p className="mt-1">En cas de question, contactez-nous au {entrepriseInfo.telephone}</p>
      </div>*/}
    </div>
  )
}
