import { Button } from '@/components/ui/button';
import { formatMoney } from '@/lib/formatMoney';
import { usePrint } from '@/lib/usePrint';
import { PageProps, PaieShowProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useEffect } from 'react';

interface PrintProps extends PageProps {
    paie: PaieShowProps['paie'];
    entreprise: PaieShowProps['entreprise'];
}

export default function Print({ paie, entreprise }: PrintProps) {
    const { handlePrint } = usePrint(true);
    return (
        <div className="p-8 max-w-4xl mx-auto">
            <Head title={`Bulletin de paie ${paie.ref}`} />
            <div className="no-print mb-4 flex justify-end">
                <Button onClick={handlePrint} className="mr-2">
                    Imprimer
                </Button>
                <Button variant="outline" asChild>
                    <Link href={route('paies.show', paie.ref)}>Retour</Link>
                </Button>
            </div>
           {/* En-tête de l'entreprise */}
      <div className="text-center mb-8 border-b pb-4">
        {entreprise.logo && (
          <img 
            src={entreprise.logo} 
            alt="Logo entreprise" 
            className="h-24 mx-auto mb-2"
          />
        )}
        <h1 className="text-2xl font-bold">{entreprise.name}</h1>
        <p className="text-sm">{entreprise.address}</p>
        <p className="text-sm">Tél: {entreprise.phone} | Email: {entreprise.email}</p>
        <h2 className="text-xl font-bold mt-4">BULLETIN DE PAIE</h2>

        
      </div>
            {/* Informations de base */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                    <p><strong>Nom:</strong> {paie.nom_complet}</p>
                    <p><strong>Matricule:</strong> {paie.matricule}</p>
                    <p><strong>Fonction:</strong> {paie.fonction == 'admin' ? 'Administrateur' : paie.fonction == 'ressource_humaine' ? 'Ressource Humaine' : paie.fonction == 'communicateur' ? 'Communicateur' : paie.fonction == 'caissière' ? 'Caissière' : paie.fonction == 'manager' ? 'Gestionnaire' : paie.fonction == 'agent' ? 'Agent' : paie.fonction == 'assistant_direction' ? 'Assistant Direction' : paie.fonction == 'charge_vente_client' ? 'Charge vente client' : paie.fonction == 'coiffeuse' ? 'Coiffeuse' : paie.fonction == 'maquilleuse' ? 'Maquilleuse' : paie.fonction == 'cleaner' ? 'Cleaner' : paie.fonction == 'estheticienne' ? 'Esthéticienne' : paie.fonction == 'prothesiste' ? 'Prothésiste' : 'Autre'}</p>
                </div>
                <div>
                    <p><strong>Période:</strong> {format(new Date(paie.date_debut_periode), 'PPP', { locale: fr })} au {format(new Date(paie.date_fin_periode), 'PPP', { locale: fr })}</p>
                    <p><strong>Date émission:</strong> {format(new Date(paie.date_emission), 'PPP', { locale: fr })}</p>
                </div>
            </div>

            {/* Détails de la paie */}
            <div className="mb-8">
                <h3 className="font-bold border-b pb-2 mb-4">DÉTAIL DES GAINS</h3>
                <table className="w-full mb-6">
                    <tbody>
                        <tr>
                            <td>Salaire de base</td>
                            <td className="text-right">{formatMoney(paie.salaire_base, 'USD')}</td>
                        </tr>
                        <tr>
                            <td>Heures supplémentaires</td>
                            <td className="text-right">{formatMoney(paie.heures_supplementaires, 'USD')}</td>
                        </tr>
                        <tr>
                            <td>Congés payés</td>
                            <td className="text-right">{formatMoney(paie.conges_payes, 'USD')}</td>
                        </tr>
                        <tr>
                            <td>Pécule de congé</td>
                            <td className="text-right">{formatMoney(paie.pecule_conge, 'USD')}</td>
                        </tr>
                        <tr>
                            <td>Gratification</td>
                            <td className="text-right">{formatMoney(paie.gratification, 'USD')}</td>
                        </tr>
                        <tr>
                            <td>Prime de fidélité</td>
                            <td className="text-right">{formatMoney(paie.prime_fidelite, 'USD')}</td>
                        </tr>
                        <tr>
                            <td>Prime diverse</td>
                            <td className="text-right">{formatMoney(paie.prime_diverse, 'USD')}</td>
                        </tr>
                        <tr>
                            <td>Allocation familiale</td>
                            <td className="text-right">{formatMoney(paie.allocation_familiale, 'USD')}</td>
                        </tr>
                        <tr>
                            <td>Allocation épouse</td>
                            <td className="text-right">{formatMoney(paie.allocation_epouse, 'USD')}</td>
                        </tr>
                        <tr>
                            <td>AFM Gratification</td>
                            <td className="text-right">{formatMoney(paie.afm_gratification, 'USD')}</td>
                        </tr>
                        {/* Ajoutez ici les autres éléments de gains */}
                    </tbody>
                </table>

                <h3 className="font-bold border-b pb-2 mb-4">DÉTAIL DES RETENUES</h3>
                <table className="w-full mb-6">
                    <tbody>
                        <tr>
                            <td>Cotisation CNSS</td>
                            <td className="text-right">{formatMoney(paie.cotisation_cnss, 'USD')}</td>
                        </tr>
                        <tr>
                            <td>Impôt sur le revenu</td>
                            <td className="text-right">{formatMoney(paie.impot_revenu, 'USD')}</td>
                        </tr>
                        <tr>
                            <td>Prêts retenus</td>
                            <td className="text-right">{formatMoney(paie.prets_retenus, 'USD')}</td>
                        </tr>
                        <tr>
                            <td>Avance sur salaire</td>
                            <td className="text-right">{formatMoney(paie.avance_salaire, 'USD')}</td>
                        </tr>
                        <tr>
                            <td>Paie négative</td>
                            <td className="text-right">{formatMoney(paie.paie_negative, 'USD')}</td>
                        </tr>
                        <tr>
                            <td>Autres retenues</td>
                            <td className="text-right">{formatMoney(paie.autres_regularisations, 'USD')}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Totaux */}
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                    <p><strong>Rémunération brute:</strong></p>
                    <p><strong>Total retenues:</strong></p>
                    <p className="font-bold"><strong>Net à payer:</strong></p>
                </div>
                <div className="text-right">
                    <p>{formatMoney(paie.remuneration_brute, 'USD')}</p>
                    <p>{formatMoney(paie.total_retenues, 'USD')}</p>
                    <p className="font-bold">{formatMoney(paie.net_a_payer, 'USD')}</p>
                </div>
            </div>

            {/* Pied de page */}
            <div className="mt-16 text-center text-sm">
                <p>Fait à Kinshasa, le {format(new Date(), 'dd/MM/yyyy', { locale: fr })}</p>
                <div className="mt-8 flex justify-around">
                    <div className="border-t w-1/3 pt-2">Signature employé</div>
                    <div className="border-t w-1/3 pt-2">Signature employeur</div>
                </div>
            </div>

            {/* Styles spécifiques pour l'impression */}
            <style>{`
                
               
                @media print {
                    body {
                        font-size: 12pt;
                        background: white;
                        color: black;
                    }
                    @page {
                        size: A4;
                        margin: 1.5cm;
                    }
                    .no-print {
                        display: none !important;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    td, th {
                        padding: 4px 8px;
                        border: 1px solid #ddd;
                    }
                }
            `}</style>
        </div>
    );
}