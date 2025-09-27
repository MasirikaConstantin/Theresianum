import { Head, Link } from '@inertiajs/react';
import { Auth, Agent } from '@/types';
import Form from './Form';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';

export default function Create({ auth, agents }: { auth: Auth; agents: Agent[] }) {
    return (
        <AppLayout
            auth={auth}
            breadcrumbs={[
                { title: 'Pointages', href: route('pointages.index') },
                { title: 'Nouveau pointage', href: route('pointages.create') },
            ]}
        >
            <Head title="Créer un pointage" />

            <div className="p-6">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-2xl  leading-tight">Créer un pointage</h2>
                <Button asChild variant="outline">
                    <Link href={route('pointages.index')}>Retour à la liste</Link>
                </Button>
            </div>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="overflow-hidden ">
                        <div className="p-6">
                            <Form agents={agents} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}