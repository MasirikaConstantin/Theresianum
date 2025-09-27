import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import PaieForm from './Form';
import AppLayout from '@/layouts/app-layout';

export default function Edit({ auth, paie, agents }: PageProps & { 
    paie: any;
    agents: any[];
}) {
    return (
        <AppLayout
            auth={auth}
            breadcrumbs={[
                { title: 'Paies', href: route('paies.index') },
                { title: 'Modifier la paie', href: route('paies.edit', paie.id) },
            ]}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Modifier le bulletin de paie #{paie.ref}
                </h2>
            }
        >
            <Head title={`Modifier la paie ${paie.ref}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <PaieForm 
                                paie={paie}
                                agents={agents}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}