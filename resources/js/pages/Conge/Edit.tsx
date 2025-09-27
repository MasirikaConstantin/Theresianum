import { Head } from '@inertiajs/react';
import { Auth } from '@/types';
import CongeForm from './Form';
import AppLayout from '@/layouts/app-layout';

export default function Edit({ auth, conge, agents }: {auth: Auth, conge: {
        id: number;
        agent_id: number;
        type: string;
        date_debut: string;
        date_fin: string;
        motif: string;
        statut: string;
        commentaire?: string;
    },
    agents: {
        id: number;
        matricule: string;
        nom: string;
        postnom: string;
        prenom: string;
    }[];
}) {
    return (
        <AppLayout
            auth={auth}
            breadcrumbs={[
                { title: 'Tableau de bord', href: route('dashboard') },
                { title: 'Congé', href: route('conges.index') },
                { title: `Modifier demande de congé`, href: route('conges.edit', conge.id) },
            ]}
        >
            <Head title={`Modifier congé #${conge.id}`} />

            <div className="p-6">
            <div className="flex justify-between items-center">
                    <h2 className="font-bold text-2xl  leading-tight">
                        Modifier demande de congé
                    </h2>
                </div>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="overflow-hidden ">
                        <div className="p-6">
                            <CongeForm 
                                conge={conge}
                                agents={agents}
                                types={[
                                    'annuel',
                                    'maladie', 
                                    'maternite',
                                    'exceptionnel',
                                    'sans_solde'
                                ]}
                                statuts={[
                                    'en_attente',
                                    'approuve',
                                    'rejete'
                                ]}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}