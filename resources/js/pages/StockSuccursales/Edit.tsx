
import { Head } from '@inertiajs/react';
import StockSuccursaleForm from './Form';
import { Auth } from '@/types';

export default function Edit({ auth, stock, produits, succursales }: { 
    auth: Auth;
    stock: any;
    produits: any[];
    succursales: any[];
}) {
    return (
        <>
            <Head title={`Modifier stock - ${stock.produit?.name || 'Produit inconnu'}`} />
            <StockSuccursaleForm 
                auth={auth}
                stock={stock}
                produits={produits}
                succursales={succursales}
            />
        </>
    );
}