import { Head } from '@inertiajs/react';
import StockForm from './StockForm';
import { Auth, SharedData } from '@/types';

interface CreateProps {
    auth: Auth;
    produits: any[];
}

export default function Create({ auth, produits }: CreateProps) {
    return (
        <>
            <Head title="Créer un nouveau stock" />
            <StockForm 
                auth={auth}
                produits={produits}
            />
        </>
    );
}