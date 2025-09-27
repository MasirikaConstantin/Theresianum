import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useEffect } from 'react';
import { Agent } from '@/types';
import { Entreprise } from '@/types';

interface FicheIdentificationProps extends PageProps {
    agent: Agent;
    entreprise: Entreprise;
}

export default function FicheIdentification({ agent, entreprise }: FicheIdentificationProps) {
    // Calcul de l'ancienneté
    const anciennete = () => {
        const dateDebut = new Date(agent.contrats[0]?.date_debut || agent.created_at);
        const diff = new Date().getTime() - dateDebut.getTime();
        const mois = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
        return mois > 0 ? `${mois} mois` : 'Moins de 1 mois';
    };

    // Formatage des dates
    const formatDate = (dateString: string) => {
        return dateString ? format(new Date(dateString), 'dd/MM/yyyy', { locale: fr }) : 'N/A';
    };
    const getInitials = (name: string) => {
        const names = name.split(' ');
        let initials = '';
        for (let i = 0; i < names.length; i++) {
            initials += names[i].charAt(0).toUpperCase();
        }
        return initials;
    };

    // Auto-impression au chargement
    useEffect(() => {
        const timeout = setTimeout(() => {
            window.print();
        }, 500);

        return () => clearTimeout(timeout);
    }, []);
    return (
        <div className="p-1 max-w-4xl mx-auto bg-white">
            <Head title={`Fiche Identification - ${agent.nom}`} />

            {/* En-tête de l'entreprise */}
            <div className="text-center mb-1 pb-1">
                {entreprise.logo_url && (
                    <img 
                        src={entreprise.logo_url} 
                        alt="Logo entreprise" 
                        className="h-16 mx-auto mb-2"
                    />
                )}
                <h1 className="text-xl font-bold">{entreprise.nom}</h1>
                <p className="text-xs font-bold">
                    {entreprise.rccm}, ID NAT: {entreprise.id_nat}
                </p>
                <p className="text-xs">
                Galerie Saint Pierre Avenue Colonel Mondjiba, 374 Kinshasa Ngaliema. Tél: {entreprise.telephone} E-mail: {entreprise.email}
                </p>
                <h2 className="text-2xl underline  font-bold mt-4">FICHE D'IDENTIFICATION</h2>
            </div>

            {/* Nom et fonction */}
            <div className="text-center mb-6">
                {agent.avatar_url ? (
                    <img 
                        src={agent.avatar_url} 
                        className="h-32 mx-auto mb-2 rounded-full"
                    />
                ) : (
                    <>
                        {agent.sexe === 'M' ?(
                            <div className="flex justify-center">
                                <img src={entreprise.image_sexe} className="h-24 w-24" />
                            </div>
                        ) : (
                            <div className="flex justify-center">
                                <img 
                                    src={entreprise.image_sexe} 
                                className="h-24 w-24"
                                />
                            </div>
                        )}
                    </>
                )}
                <h3 className="text-lg font-bold uppercase">
                    {agent.nom} {agent.postnom} {agent.prenom}
                </h3>
                {agent.contrats[0]?.fonction ? <p className="text-sm font-bold">{agent.contrats[0]?.fonction ==="admin" ? "Administrateur" : agent.contrats[0]?.fonction ==="ressource_humaine" ? "Ressource Humaine" : agent.contrats[0]?.fonction ==="communicateur" ? "Communicateur" : agent.contrats[0]?.fonction ==="caissière" ? "Caissière" : agent.contrats[0]?.fonction ==="manager" ? "Gestionnaire" : agent.contrats[0]?.fonction ==="agent" ? "Agent" : agent.contrats[0]?.fonction ==="assistant_direction" ? "Assistant Direction" : agent.contrats[0]?.fonction ==="charge_vente_client" ? "Charge vente client" : agent.contrats[0]?.fonction ==="coiffeuse" ? "Coiffeuse" : agent.contrats[0]?.fonction ==="maquilleuse" ? "Maquilleuse" : agent.contrats[0]?.fonction ==="cleaner" ? "Cleaner" : agent.contrats[0]?.fonction ==="estheticienne" ? "Esthéticienne" : agent.contrats[0]?.fonction ==="prothesiste" ? "Prothésiste" : "Autre"}</p> : <p className="text-sm font-bold">{agent.role ==="admin" ? "Administrateur" : agent.role ==="ressource_humaine" ? "Ressource Humaine" : agent.role ==="communicateur" ? "Communicateur" : agent.role ==="caissière" ? "Caissière" : agent.role ==="manager" ? "Gestionnaire" : agent.role ==="agent" ? "Agent" : agent.role ==="assistant_direction" ? "Assistant Direction" : agent.role ==="charge_vente_client" ? "Charge vente client" : agent.role ==="coiffeuse" ? "Coiffeuse" : agent.role ==="maquilleuse" ? "Maquilleuse" : agent.role ==="cleaner" ? "Cleaner" : agent.role ==="estheticienne" ? "Esthéticienne" : agent.role ==="prothesiste" ? "Prothésiste" : "Autre"}</p>}
            </div>

            {/* Section coordonnées */}
            <div className="mb-6">
                <h4 className="font-bold border-b pb-1 underline">COORDONNÉES</h4>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                    <div className="col-span-1 flex">
                        <span className="w-32 font-medium">SEXE :</span>
                        <span>{agent.sexe === 'M' ? 'Homme' : 'Femme'}, ETAT CIVIL : {agent.sexe === 'M' ? (
                            agent.etat_civil === 'célibataire' ? 'Célibataire' : agent.etat_civil === 'marié(e)' ? 'Marié' : agent.etat_civil === 'divorcé(e)' ? 'Divorcé' : agent.etat_civil === 'veuf(ve)' ? 'Veuf' : 'Autre'
                        ) : (
                            agent.etat_civil === 'célibataire' ? 'Célibataire' : agent.etat_civil === 'marié(e)' ? 'Mariée' : agent.etat_civil === 'divorcé(e)' ? 'Divorcée' : agent.etat_civil === 'veuf(ve)' ? 'Veuf' : 'Autre'
                        )}</span>
                    </div>
                    <div className="flex">
                        <span className="w-40 font-medium">NÉ À :</span>
                        <span>{agent.lieu_naissance}, {format(agent.date_naissance, 'PPP', { locale: fr })}</span>
                    </div>
                    <div className="flex">
                        <span className="w-40 font-medium">PROVINCE :</span>
                        <span>{agent.province_origine}</span>
                    </div>
                    <div className="flex">
                        <span className="w-40 font-medium">DISTRICT :</span>
                        <span>{agent.district_origine}</span>
                    </div>
                    <div className="flex">
                        <span className="w-40 font-medium">TERRITOIRE :</span>
                        <span>{agent.territoire_origine}</span>
                    </div>
                    <div className="flex">
                        <span className="w-40 font-medium">COMMUNE :</span>
                        <span>{agent.commune_origine}</span>
                    </div>
                    <div className="col-span-2 flex">
                        <span className="w-40 font-medium">ADRESSE :</span>
                        <span>{agent.adresse}</span>
                    </div>
                    <div className="flex">
                        <span className="w-40 font-medium">CONTACT :</span>
                        <span>{agent.telephone}</span>
                    </div>
                    <div className="flex">
                        <span className="w-40 font-medium">E-MAIL:</span>
                        <span>{agent.email}</span>
                    </div>
                    <div className="flex">
                        <span className="w-40 font-medium">ENFANTS:</span>
                        <span>{agent.nombre_enfant}</span>
                    </div>
                </div>
            </div>

            {/* Section professionnelle */}
            <div className="mb-3">
                <h4 className="font-bold border-b pb-1 underline">INFORMATIONS PROFESSIONNELLES</h4>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                    <div className="flex">
                        <span className="w-40 font-medium">MATRICULE:</span>
                        <span>{agent.matricule}</span>
                    </div>
                    <div className="flex">
                        <span className="w-40 font-medium">CNSS:</span>
                        <span>{agent.numero_cnss}</span>
                    </div>
                    <div className="flex">
                        <span className="w-40 font-medium">TYPE CONTRAT:</span>
                        <span>CDD</span>
                    </div>
                    {/*<div className="flex">
                        <span className="w-40 font-medium">DUREE:</span>
                        <span>
                            {agent.contrats.length > 0 
                                ? `${Math.floor((new Date(agent.contrats[0].date_fin).getTime() - new Date(agent.contrats[0].date_debut).getTime()) / (1000 * 60 * 60 * 24 * 30))} mois` 
                                : 'N/A'}
                        </span>
                    </div>*/}
                    <div className="flex">
                        <span className="w-40 font-medium">DATE DEBUT:</span>
                        <span>{agent.contrats.length > 0 ? format(agent.contrats[0].date_debut, 'PPP', { locale: fr }) : 'N/A'}</span>
                    </div>
                    <div className="flex">
                        <span className="w-40 font-medium">DATE FIN:</span>
                        <span>{agent.contrats.length > 0 ? format(agent.contrats[0].date_fin, 'PPP', { locale: fr }) : 'N/A'}</span>
                    </div>
                    <div className="flex">
                        <span className="w-40 font-medium">ANCIENNETÉ:</span>
                        <span>{anciennete()}</span>
                    </div>
                    <div className="flex">
                        <span className="w-40 font-medium">FONCTION:</span>
                        <span>{agent.contrats[0]?.fonction ? <p className="text-sm font-bold">{agent.contrats[0]?.fonction ==="admin" ? "Administrateur" : agent.contrats[0]?.fonction ==="ressource_humaine" ? "Ressource Humaine" : agent.contrats[0]?.fonction ==="communicateur" ? "Communicateur" : agent.contrats[0]?.fonction ==="caissière" ? "Caissière" : agent.contrats[0]?.fonction ==="manager" ? "Gestionnaire" : agent.contrats[0]?.fonction ==="agent" ? "Agent" : agent.contrats[0]?.fonction ==="assistant_direction" ? "Assistant Direction" : agent.contrats[0]?.fonction ==="charge_vente_client" ? "Charge vente client" : agent.contrats[0]?.fonction ==="coiffeuse" ? "Coiffeuse" : agent.contrats[0]?.fonction ==="maquilleuse" ? "Maquilleuse" : agent.contrats[0]?.fonction ==="cleaner" ? "Cleaner" : agent.contrats[0]?.fonction ==="estheticienne" ? "Esthéticienne" : agent.contrats[0]?.fonction ==="prothesiste" ? "Prothésiste" : "Autre"}</p> : <p className="text-sm font-bold">{agent.role ==="admin" ? "Administrateur" : agent.role ==="ressource_humaine" ? "Ressource Humaine" : agent.role ==="communicateur" ? "Communicateur" : agent.role ==="caissière" ? "Caissière" : agent.role ==="manager" ? "Gestionnaire" : agent.role ==="agent" ? "Agent" : agent.role ==="assistant_direction" ? "Assistant Direction" : agent.role ==="charge_vente_client" ? "Charge vente client" : agent.role ==="coiffeuse" ? "Coiffeuse" : agent.role ==="maquilleuse" ? "Maquilleuse" : agent.role ==="cleaner" ? "Cleaner" : agent.role ==="estheticienne" ? "Esthéticienne" : agent.role ==="prothesiste" ? "Prothésiste" : "Autre"}</p>}
                        </span>
                    </div>
                    <div className="col-span-2 flex">
                        <span className="w-40 font-medium">LIEU AFFECTATION:</span>
                        <span>{agent.succursale ? agent.succursale.nom : 'Aucune affectation'}</span>
                    </div>
                    <div className="col-span-2 flex">
                        <span className="w-40 font-medium">ADRESSE:</span>
                        <span>{agent.succursale ? agent.succursale.adresse : 'Aucune affectation'}</span>
                    </div>
                </div>
            </div>

            {/* Section références */}
            {agent.references.length > 0 && (
                <div className="mb-2">
                    <h4 className="font-bold border-b underline">RÉFÉRENCES</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        {agent.references.map((ref, index) => (
                            <div key={index} className="border p-2 rounded">
                                Nom : <span className="font-medium">{ref.nom}</span>  est :  {ref.fonction && <span className="font-bold">{ref.fonction}</span>}
                                <p>Tél: {ref.telephone}</p>
                                {ref.email && <p>Email: {ref.email}</p>}
                                
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Signature et date */}
            <div className="mt-12 grid grid-cols-2 gap-8">
                <div className="text-center">
                    {agent.signature_url ? (
                        <img 
                            src={agent.signature_url} 
                            alt="Signature" 
                            className="h-16 mx-auto"
                        />
                    ) : (
                        <div className="border-t-2 border-black w-3/4 mx-auto pt-2">
                            <p>Signature</p>
                        </div>
                    )}
                    <p className="mt-2 uppercase">{agent.nom} {agent.postnom} {agent.prenom}</p>
                </div>
                <div className="text-center">
                    <p>Fait à Kinshasa, le {format(new Date(), 'PPP', { locale: fr })}</p>
                </div>

                
            </div>
            <div className="text-end">
                    <span>Genéré le : {format(new Date(), 'PPPp', { locale: fr })}</span>
                </div>

            {/* Styles d'impression */}
            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 1.3cm;
                    }
                    body {
                        font-size: 12pt;
                        background: white !important;
                        color: black !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}