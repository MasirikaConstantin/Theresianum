import { Agent, Auth, Contrat, PageProps, Succursale } from '@/types';
import { Button } from '@/components/ui/button';
import Form from './Form';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { toast } from 'sonner';

export default function Create({ auth, agents,contrat, succursales, typesContrat, flash }: {auth :Auth, agents :Agent,contrat :Contrat, succursales : Succursale, typesContrat :any, flash : any}){
    if(flash.success){
        toast.success(flash.success);
    }
    if(flash.error){
        toast.error(flash.error);
    }
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
            <Head title="Modifier un Contrat" />
            <div className="p-6">
                <div className="flex justify-between items-center">
                        <h1 className="font-semibold  text-2xl">Modifier un  contrat</h1>
                        <Link href={route('contrats.index')}>
                            <Button variant="outline">Retour</Button>
                        </Link>
                    </div>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="overflow-hidden sm:rounded-lg">
                                <Form 
                                    contrat={contrat}
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