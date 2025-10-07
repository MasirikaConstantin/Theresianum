import { FrancCongolais } from '@/hooks/Currencies';
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
       
        date_debut: string;
        date_fin: string;
    };
    entreprise: {
        nom1: string;
        nom2: string;
        nom3: string;
        Immatriculation: string;
        telephone: string;
        telephone_reception: string;
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

    

    /*/ Auto-impression au chargement
    useEffect(() => {
        const timeout = setTimeout(() => {
            window.print();
        }, 500);

        return () => clearTimeout(timeout);
    }, []);*/

    return (
        <div className="p-4 max-w-4xl mx-auto bg-white text-black">
            <Head title={`Statistiques Produit - ${data.produit.name}`} />
            <div className='grid grid-cols-2 gap-20 mb-6'>
                <div className=" w-xl items-center justify-center flex pr-16"  >
                    <div className=''>
                        <img src={entreprise.logo_url} alt="" className="w-24 h-24" />
                    </div>
                    {/* En-tête de l'entreprise */}
                    <div className="ml-6">
                        <h1 className="text-xl font-bold ">{entreprise.nom1}</h1>
                        <h1 className="text-xl font-bold ">{entreprise.nom2}</h1>
                        <h1 className="text-xl font-bold ">{entreprise.nom3}</h1>
                        
                        <p className="text-sm text-gray-600"><span className="font-bold">Téléphone Administration:</span> {entreprise.telephone}</p>
                        <p className="text-sm text-gray-600"><span className="font-bold">Email:</span> {entreprise.email}</p>
                        <p className="text-sm text-gray-600"><span className="font-bold">Immatriculation:</span> {entreprise.Immatriculation}</p>
                        <p className="text-sm text-gray-600"><span className="font-bold">Téléphone de Reception:</span> {entreprise.telephone_reception}</p>
                    </div>
                </div>
                <div className=" ms-36">
                    <div>
                        <p className="text-sm textpgray-600">C.Kintambo, Q. Nganda</p>
                        <p className="text-sm text-gray-600">Av.Chrétienne, n°39 b</p>
                    </div>
                    
                </div>
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
                        <span>{FrancCongolais(data.produit.prix_vente)}</span>
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
                    <p className="text-xl font-bold text-green-600">{FrancCongolais(data.stats.chiffre_affaires)}</p>
                </div>
                <div className="border p-3 text-center rounded bg-gray-50">
                    <h4 className="font-bold text-sm">Marge Bénéficiaire</h4>
                    <p className="text-xl font-bold text-purple-600">{FrancCongolais(data.stats.marge)}</p>
                </div>
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
                                <td className="p-2 border text-right">{FrancCongolais(vente.total_ca)}</td>
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