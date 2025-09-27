import { Head } from '@inertiajs/react';
import { Auth, PageProps } from '@/types';
import PaieForm from './Form';
import AppLayout from '@/layouts/app-layout';

export default function Create({ auth, agents, nextRef }: PageProps & { 
    agents: any[];
    auth: Auth;
    nextRef: string;
}) {
    return (
        <AppLayout
            auth={auth}
            breadcrumbs={[
                { title: 'Paies', href: route('paies.index') },
                { title: 'Nouvelle paie', href: route('paies.create') },
            ]}
            
        >
            <Head title="Créer une paie" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Créer un nouveau bulletin de paie
                </h2>
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <PaieForm 
                                agents={agents} 
                                nextRef={nextRef}
                                defaultPeriod={{
                                    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
                                    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
                                    emission: new Date().toISOString()
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}