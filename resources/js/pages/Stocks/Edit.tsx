import { Head } from '@inertiajs/react';
import StockForm from './StockForm';
import { Auth, SharedData } from '@/types';

interface EditProps {
    auth: Auth;
    stock: any;
    produits: any[];
}

export default function Edit({ auth, stock, produits }: EditProps) {
    
    return (
        <>
            <Head title={`Modifier le stock - ${stock.produit?.name || 'Produit supprimé'}`} />
            <StockForm 
                auth={auth}
                stock={stock}
                produits={produits}
            />
        </>
    );
}