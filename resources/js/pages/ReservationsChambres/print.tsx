import BoutonImpression from "./BoutonImpression";
import FactureA4 from "./FactureA4";

export default function PageFacture({ reservation }: { reservation: any }) {
  
    const entrepriseInfo = {
      nom: "Votre Hôtel",
      adresse: "Votre adresse complète",
      telephone: "Votre téléphone",
      email: "votre@email.com",
      siret: "Votre SIRET"
    }
  
    return (
        <>
        <title>Facture {reservation.ref}</title>
      <div className="bg-gray-100 min-h-screen p-4 print:bg-white">
        
        <FactureA4 
          reservation={reservation} 
          entreprise={entrepriseInfo}
        />
        <BoutonImpression />
      </div>
      </>
    )
  }