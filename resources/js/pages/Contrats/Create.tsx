import { PageProps } from '@/types';
import { Button } from '@/components/ui/button';
import Form from './Form';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';

export default function Create({ auth, agents, succursales, typesContrat }: PageProps<{
    agents: Array<{ id: number; nom: string; postnom: string; prenom: string }>;
    succursales: Array<{ id: number; nom: string }>;
    typesContrat: string[];
}>) {
    return (
        <AppLayout
            auth={auth}
            breadcrumbs={[
                {
                    title: 'Gestion des Contrats',
                    href: '/contrats',
                },
                {
                    title: 'Créer un Contrat',
                    href: '/contrats/create',
                },
            ]}
        >
            <Head title="Créer un Contrat" />
            <div className="p-6">
                <div className="flex justify-between items-center">
                        <h1 className="font-semibold  text-2xl">Créer un nouveau contrat</h1>
                        <Link href={route('contrats.index')}>
                            <Button variant="outline">Retour</Button>
                        </Link>
                    </div>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="overflow-hidden sm:rounded-lg">
                                <Form 
                                    agents={agents} 
                                    succursales={succursales} 
                                    typesContrat={typesContrat} 
                                />
                        </div>
                </div>
            </div>
        </AppLayout>
    );
}