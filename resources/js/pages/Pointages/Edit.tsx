import { Head, Link } from '@inertiajs/react';
import { Auth, Agent, Pointage } from '@/types';
import Form from './Form';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';

export default function Edit({ auth, pointage, agents }: { auth: Auth; pointage: Pointage; agents: Agent[] }) {
    return (
        <AppLayout
            auth={auth}
            breadcrumbs={[
                { title: 'Pointages', href: route('pointages.index') },
                { title: 'Modifier pointage', href: route('pointages.edit', pointage.id) },
            ]}
        >
            <Head title={`Modifier pointage - ${pointage.date}`} />

            <div className="p-6">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-2xl  leading-tight">Modifier le pointage</h2>
                <div className="space-x-2">
                    <Button asChild variant="outline">
                        <Link href={route('pointages.index')}>Retour à la liste</Link>
                    </Button>
                </div>
            </div>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className=" overflow-hidden ">
                        <div className="p-6">
                            <Form pointage={pointage} agents={agents} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}