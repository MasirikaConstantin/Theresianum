import { Conge, PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

interface PrintProps extends PageProps {
    conge: Conge;
    entreprise: {
        name: string;
        address: string;
        phone: string;
        email: string;
        logo?: string;
    };
}

export default function Print({ conge, entreprise }: PrintProps) {
    // Auto-impression au chargement
    useEffect(() => {
        const timeout = setTimeout(() => {
            window.print();
        }, 500);

        return () => clearTimeout(timeout);
    }, []);

    const getTypeLabel = () => {
        const types: Record<string, string> = {
            annuel: 'Congé Annuel',
            maladie: 'Congé de Maladie',
            maternite: 'Congé de Maternité',
            exceptionnel: 'Congé Exceptionnel',
            sans_solde: 'Congé Sans Solde'
        };
        return types[conge.type] || conge.type;
    };
    const fonction = conge.agent.contrats?.[0].fonction;

    return (
        <div className="p-4 max-w-4xl mx-auto bg-white">
            <Head title={`Bon de sortie - ${conge.agent.nom}`} />

            {/* Boutons d'action - visibles seulement à l'écran */}
            <div className="no-print flex justify-end gap-4 mb-6">
                <Button onClick={() => window.print()}>
                    Imprimer
                </Button>
                <Button variant="outline" asChild>
                    <Link href={route('conges.show', conge.ref)}>
                        Retour
                    </Link>
                </Button>
            </div>

            {/* En-tête de l'entreprise */}
            <div className="text-center mb-8 border-b pb-4">
                {entreprise.logo && (
                    <img 
                        src={entreprise.logo} 
                        alt="Logo entreprise" 
                        className="h-32 mx-auto mb-2"
                    />
                )}
                <h1 className="text-2xl font-bold">{entreprise.name}</h1>
                <p className="text-sm">{entreprise.address}</p>
                <p className="text-sm">Tél: {entreprise.phone} | Email: {entreprise.email}</p>
                <h2 className="text-xl font-bold mt-4">BON DE SORTIE</h2>
            </div>

            {/* Informations principales */}
            <div className="grid grid-rows-2 gap-8 mb-8 pb-4 border-b">
                <div>
                    <h3 className="font-bold mb-2">INFORMATIONS AGENT</h3>
                    <table className="w-full">
                        <tbody>
                            <tr>
                                <td className="font-medium py-1">Nom complet :</td>
                                <td className="py-1">{conge.agent.nom} {conge.agent.postnom} {conge.agent.prenom}</td>
                            </tr>
                            <tr>
                                <td className="font-medium py-1">Matricule :</td>
                                <td className="py-1">{conge.agent.matricule}</td>
                            </tr>
                            <tr>
                                <td className="font-medium py-1">Fonction :</td>
                                <td className="py-1">{fonction === 'admin' ? 'Administrateur' : fonction === 'ressource_humaine' ? 'Ressource Humaine' : fonction === 'communicateur' ? 'Communicateur' : fonction === 'caissière' ? 'Caissière' : fonction === 'manager' ? 'Gestionnaire' : fonction === 'agent' ? 'Agent' : fonction === 'assistant_direction' ? 'Assistant Direction' : fonction === 'charge_vente_client' ? 'Charge vente client' : fonction === 'coiffeuse' ? 'Coiffeuse' : fonction === 'maquilleuse' ? 'Maquilleuse' : fonction === 'cleaner' ? 'Cleaner' : fonction === 'estheticienne' ? 'Esthéticienne' : fonction === 'prothesiste' ? 'Prothésiste' : 'Autre'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div>
                    <h3 className="font-bold mb-2">DÉTAILS DU CONGÉ</h3>
                    <table className="w-full">
                        <tbody>
                            <tr>
                                <td className="font-medium py-1">Type :</td>
                                <td className="py-1">{getTypeLabel()}</td>
                            </tr>
                            <tr>
                                <td className="font-medium py-1">Période :</td>
                                <td className="py-1">
                                    {format(new Date(conge.date_debut), 'PPP', { locale: fr })} au {' '}
                                    {format(new Date(conge.date_fin), 'PPP', { locale: fr })}
                                    {' '}({conge.duree_jours} jours)
                                </td>
                            </tr>
                            <tr>
                                <td className="font-medium py-1">Statut :</td>
                                <td className="py-1">
                                    <span className={
                                        conge.statut === 'approuve' ? 'text-green-600 font-bold' : 
                                        conge.statut === 'rejete' ? 'text-red-600' : 'text-yellow-600'
                                    }>
                                        {conge.statut === 'approuve' ? 'APPROUVÉ' : 
                                         conge.statut === 'rejete' ? 'REJETÉ' : 'EN ATTENTE'}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Motif et observations */}
            <div className="mb-8">
                <h3 className="font-bold mb-2">MOTIF</h3>
                <div className="border p-4 min-h-20">
                    {conge.motif}
                </div>
            </div>

            {/* Signatures */}
            <div className="mt-12 grid grid-cols-2 gap-8">
                <div className="text-center">
                    <div className="border-t-2 border-black w-3/4 mx-auto pt-2">
                        <p>Signature du demandeur</p>
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
                <p>Fait à Kinshasa, le {format(new Date(conge.created_at), 'PPP', { locale: fr })}</p>
            </div>

            {/* Styles d'impression */}
            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 1.5cm;
                    }
                    body {
                        font-size: 12pt;
                        background: white !important;
                        color: black !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    td {
                        padding: 4px 8px;
                        vertical-align: top;
                    }
                }
            `}</style>
        </div>
    );
}