import React from 'react';
import { Head } from '@inertiajs/react';
import { ProformaInvoice } from '@/types';
import { DateSimple, Dollar } from '@/hooks/Currencies';

interface Props {
    invoice: ProformaInvoice;
    company: {
        name: string;
        address: string;
        phone: string;
        email: string;
    };
}

const Print: React.FC<Props> = ({ invoice, company }) => {
    React.useEffect(() => {
        // Auto-impression lors du chargement
        window.print();
    }, []);

    const getStatusText = (statut: string) => {
        switch (statut) {
            case 'brouillon': return 'Brouillon';
            case 'envoyee': return 'Envoyée';
            case 'payee': return 'Payée';
            default: return statut;
        }
    };

    return (
        <div className="p-8 bg-white">
            <Head title={`Facture ${invoice.numero_facture}`} />
            
            {/* En-tête */}
            <div className="flex justify-between items-start mb-8 border-b-2 border-blue-500 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">FACTURE PROFORMA</h1>
                    <p className="text-gray-600 text-lg">N°: {invoice.numero_facture}</p>
                    <div className="mt-4">
                        <strong className="text-lg">{company.name}</strong><br />
                        <span className="text-gray-700">{company.address}</span><br />
                        <span className="text-gray-700">Tél: {company.phone}</span><br />
                        <span className="text-gray-700">Email: {company.email}</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="inline-block px-3 py-1 bg-gray-600 text-white rounded text-sm font-bold uppercase">
                        {getStatusText(invoice.statut)}
                    </div>
                    <div className="mt-2 text-lg">
                        <strong>Date:</strong> {DateSimple(invoice.date_facture)}
                    </div>
                    {invoice.date_echeance && (
                        <div className="text-gray-700">
                            <strong>Échéance:</strong> {DateSimple(invoice.date_echeance)}
                        </div>
                    )}
                </div>
            </div>

            {/* Informations client */}
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">CLIENT</h2>
                <div className="text-gray-700">
                    <strong className="text-lg">
                    {invoice.client?.telephone}
                    </strong>
                </div>
            </div>

            {/* Tableau des articles */}
            <table className="w-full border-collapse mb-8">
                <thead>
                    <tr className="bg-blue-500 text-white">
                        <th className="p-3 text-left w-1/6">Date</th>
                        <th className="p-3 text-left w-2/5">Désignation</th>
                        <th className="p-3 text-center w-1/10">Qté</th>
                        <th className="p-3 text-right w-1/6">Prix Unitaire</th>
                        <th className="p-3 text-right w-1/5">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-200">
                            <td className="p-3">{DateSimple(item.date_item)}</td>
                            <td className="p-3">{item.designation}</td>
                            <td className="p-3 text-center">{item.quantite}</td>
                            <td className="p-3 text-right">{Dollar(item.prix_unitaire)}</td>
                            <td className="p-3 text-right font-semibold">{Dollar(item.montant_total)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="bg-gray-50 font-bold">
                        <td colSpan={4} className="p-3 text-right pr-6">TOTAL:</td>
                        <td className="p-3 text-right text-lg">{Dollar(invoice.montant_total)}</td>
                    </tr>
                </tfoot>
            </table>

            {/* Notes */}
            {invoice.notes && (
                <div className="mt-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-3">NOTES</h2>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-line">{invoice.notes}</p>
                    </div>
                </div>
            )}

            {/* Pied de page */}
            <div className="mt-12 pt-6 border-t border-gray-300 text-center text-sm text-gray-500">
                <p>
                    Facture générée le {new Date().toLocaleDateString()} à {new Date().toLocaleTimeString()} | 
                    Référence: {invoice.ref} | 
                    Créée par: {invoice.created_by?.name || 'Système'}
                </p>
            </div>
        </div>
    );
};

export default Print;