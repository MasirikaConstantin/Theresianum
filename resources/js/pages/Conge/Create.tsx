import { Head } from '@inertiajs/react';
import CongeForm from './Form';
import AppLayout from '@/layouts/app-layout';
import { Auth } from '@/types';
import { Agent } from '@/types';
import { route } from 'ziggy-js';

export default function Create({ auth, agents }: {auth: Auth, agents: Agent[]} & { 
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
                { title: 'Nouvelle demande de congé', href: route('conges.create') },
            ]}            
        >
            <Head title="Nouvelle demande de congé" />

            <div className="p-6">
            <div className="flex justify-between items-center">
                    <h1 className="font-bold text-2xl  leading-tight">
                        Nouvelle demande de congé
                    </h1>
                </div>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="overflow-hidden">
                        <div className="">
                            <CongeForm 
                                agents={agents}
                                types={[
                                    'annuel',
                                    'maladie', 
                                    'maternite',
                                    'exceptionnel',
                                    'sans_solde'
                                ]}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}