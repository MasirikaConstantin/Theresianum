import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useEffect } from 'react';

interface ProduitStatsProps extends PageProps {
    data: {
        produit: {
            id: number;
            name: string;
            prix_vente: number;
            
        };
        stats: {
            total_vendu: number;
            chiffre_affaires: number;
            marge: number;
        };
        ventes_par_periode: Array<{
            date: string;
            total_quantite: number;
            total_ca: number;
        }>;
        ventes_par_succursale: Array<{
            id: number;
            nom: string;
            total_quantite: number;
            total_ca: number;
            marge: number;
        }>;
        date_debut: string;
        date_fin: string;
    };
    entreprise: {
        nom: string;
        rccm: string;
        id_national: string;
        telephone: string;
        email: string;
        logo_url: string;
        adresse: string;
    };
    qrWeb: string;
    qrFacebook: string;
    qrInstagram: string;
}

export default function ProduitStats({ data, entreprise, qrWeb, qrFacebook, qrInstagram }: ProduitStatsProps) {
    // Formatage des nombres avec séparateurs de milliers
    const formatNumber = (number: number) => {
        return new Intl.NumberFormat('fr-FR').format(number);
    };

    // Formatage des montants en dollars
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'USD'
        }).format(amount).replace('$US', '$');
    };

    // Auto-impression au chargement
    useEffect(() => {
        const timeout = setTimeout(() => {
            window.print();
        }, 500);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className="p-4 max-w-4xl mx-auto bg-white">
            <Head title={`Statistiques Produit - ${data.produit.name}`} />

            {/* En-tête de l'entreprise */}
            <div className="text-center mb-4 border-b pb-4">
            {entreprise.logo_url && (
                    <img 
                        src={entreprise.logo_url} 
                        alt="Logo entreprise" 
                        className="h-16 mx-auto mb-2"
                    />
                )}
                <h1 className="text-xl font-bold">{entreprise.nom}</h1>
                <p className="text-xs font-bold">
                    {entreprise.rccm}, ID NAT: {entreprise.id_national}
                </p>
                <p className="text-xs">
                    {entreprise.adresse}
                </p>
                <p className="text-xs">
                    Tél: {entreprise.telephone} | E-mail: {entreprise.email}
                </p>
                <h2 className="text-xl font-bold mt-2">STATISTIQUES DU PRODUIT</h2>
                <p className="text-sm">
                    Période du {format(new Date(data.date_debut), 'PPP', { locale: fr })} au {format(new Date(data.date_fin), 'PPP', { locale: fr })}
                </p>
            </div>

            {/* Informations du produit */}
            <div className="mb-4">
                <h3 className="font-bold text-lg border-b pb-1">INFORMATIONS PRODUIT</h3>
                <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                    <div className="flex">
                        <span className="w-32 font-medium">Nom:</span>
                        <span>{data.produit.name}</span>
                    </div>
                    <div className="flex">
                        <span className="w-32 font-medium">Prix d'achat:</span>
                        <span>{formatCurrency(data.produit.prix_vente)}</span>
                    </div>
                </div>
            </div>

            {/* Statistiques principales */}
            <div className="mb-6 grid grid-cols-3 gap-4">
                <div className="border p-3 text-center rounded bg-gray-50">
                    <h4 className="font-bold text-sm">Total Vendu</h4>
                    <p className="text-xl font-bold text-blue-600">{formatNumber(data.stats.total_vendu)}</p>
                    <p className="text-xs">unités</p>
                </div>
                <div className="border p-3 text-center rounded bg-gray-50">
                    <h4 className="font-bold text-sm">Total</h4>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(data.stats.chiffre_affaires)}</p>
                </div>
                <div className="border p-3 text-center rounded bg-gray-50">
                    <h4 className="font-bold text-sm">Marge Bénéficiaire</h4>
                    <p className="text-xl font-bold text-purple-600">{formatCurrency(data.stats.marge)}</p>
                </div>
            </div>

            {/* Ventes par succursale */}
            <div className="mb-6">
                <h4 className="font-bold text-lg border-b pb-1">VENTES PAR BRANCHE</h4>
                <table className="w-full text-sm mt-2">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="text-left p-2 border">Branche</th>
                            <th className="text-right p-2 border">Quantité</th>
                            <th className="text-right p-2 border">Total</th>
                            <th className="text-right p-2 border">Marge</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.ventes_par_succursale.map((succursale, index) => (
                            <tr key={succursale.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="p-2 border">{succursale.nom}</td>
                                <td className="p-2 border text-right">{formatNumber(succursale.total_quantite)}</td>
                                <td className="p-2 border text-right">{formatCurrency(succursale.total_ca)}</td>
                                <td className="p-2 border text-right">{formatCurrency(succursale.marge)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Ventes par période */}
            <div className="mb-6">
                <h4 className="font-bold text-lg border-b pb-1">VENTES PAR PÉRIODE</h4>
                <table className="w-full text-sm mt-2">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="text-left p-2 border">Date</th>
                            <th className="text-right p-2 border">Quantité</th>
                            <th className="text-right p-2 border">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.ventes_par_periode.map((vente, index) => (
                            <tr key={vente.date} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="p-2 border">{format(new Date(vente.date), 'PPP', { locale: fr })}</td>
                                <td className="p-2 border text-right">{formatNumber(vente.total_quantite)}</td>
                                <td className="p-2 border text-right">{formatCurrency(vente.total_ca)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pied de page avec QR codes */}
            <div className="mt-8 border-t pt-4">
                <div className="flex justify-end items-center">
                    <div className="text-xs">
                        <p>Document généré le {format(new Date(), 'PPPp', { locale: fr })}</p>
                    </div>
                </div>
            </div>

            {/* Styles d'impression */}
            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 1cm;
                    }
                    body {
                        font-size: 10pt;
                        background: white !important;
                        color: black !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .border, th, td {
                        border-color: #ccc !important;
                    }
                }
            `}</style>
        </div>
    );
}