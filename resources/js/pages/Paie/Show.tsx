import { Head, Link } from '@inertiajs/react';
import { Agent, Auth, PageProps, PaieShowProps } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatMoney } from '@/lib/formatMoney';
import { format } from 'date-fns';
import AppLayout from '@/layouts/app-layout';
import { fr } from 'date-fns/locale';


export default function Show({ auth, paie, agent }: PaieShowProps) {
    const gains = [
        { label: 'Salaire de base', value: paie.salaire_base },
        { label: 'Heures supplémentaires', value: paie.heures_supplementaires },
        { label: 'Congés payés', value: paie.conges_payes },
        { label: 'Pécule de congé', value: paie.pecule_conge },
        { label: 'Gratification', value: paie.gratification },
        { label: 'Prime de fidélité', value: paie.prime_fidelite },
        { label: 'Prime diverse', value: paie.prime_diverse },
        { label: 'Allocation familiale', value: paie.allocation_familiale },
        { label: 'Allocation épouse', value: paie.allocation_epouse },
        { label: 'AFM Gratification', value: paie.afm_gratification },
    ];

    const retenues = [
        { label: 'Cotisation CNSS', value: paie.cotisation_cnss },
        { label: 'Impôt sur le revenu', value: paie.impot_revenu },
        { label: 'Prêts retenus', value: paie.prets_retenus },
        { label: 'Avance sur salaire', value: paie.avance_salaire },
        { label: 'Paie négative', value: paie.paie_negative },
        { label: 'Autres régularisations', value: paie.autres_regularisations },
    ];
    const breadcrumbs = [
        { title: 'Paies', href: route('paies.index') },
        { title: `Bulletin de paie`, href: route('paies.show', paie.id) },
    ];
console.log(agent)
    return (
        <AppLayout
            auth={auth}
            breadcrumbs={breadcrumbs}
        >
            <Head title={`Bulletin de paie`} />

            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Bulletin de paie
                    </h2>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('paies.print', paie.id)}>Imprimer</Link>
                        </Button>
                        <Button asChild>
                            <Link href={route('paies.edit', paie.id)}>Modifier</Link>
                        </Button>
                    </div>
                </div>
                <div className="">
                    <Card className="mb-6">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Informations générales</CardTitle>
                                <Badge variant="outline">{paie.ref}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <p className="text-sm font-medium ">Agent</p>
                                <p className="font-medium">{paie.nom_complet}</p>
                                <p className="text-sm ">Matricule: <span className="font-medium">{paie.matricule}</span></p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium ">Période</p>
                                <p>
                                    <span className="font-medium">{format(new Date(paie.date_debut_periode), 'PPP', { locale: fr })}</span> -{' '}
                                    <span className="font-medium">{format(new Date(paie.date_fin_periode), 'PPP', { locale: fr })}</span>
                                </p>
                                <p className="text-sm ">
                                    Émis le: <span className="font-medium">{format(new Date(paie.date_emission), 'PPP', { locale: fr })}</span>
                                </p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium ">Statut</p>
                                <p>Fonction: <span className="font-medium">{paie.fonction == 'admin' ? 'Administrateur' : paie.fonction == 'ressource_humaine' ? 'Ressource Humaine' : paie.fonction == 'communicateur' ? 'Communicateur' : paie.fonction == 'caissière' ? 'Caissière' : paie.fonction == 'manager' ? 'Gestionnaire' : paie.fonction == 'agent' ? 'Agent' : paie.fonction == 'assistant_direction' ? 'Assistant Direction' : paie.fonction == 'charge_vente_client' ? 'Charge vente client' : paie.fonction == 'coiffeuse' ? 'Coiffeuse' : paie.fonction == 'maquilleuse' ? 'Maquilleuse' : paie.fonction == 'cleaner' ? 'Cleaner' : paie.fonction == 'estheticienne' ? 'Esthéticienne' : paie.fonction == 'prothesiste' ? 'Prothésiste' : 'Autre'}</span></p>
                                <p className="text-sm ">Affectation: <span className="font-medium">{agent.succursale.nom}, adresse: {agent.succursale.adresse}</span></p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Gains ($ USD)</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {gains.map((item) => (
                                    <div key={item.label} className="flex justify-between">
                                        <span>{item.label}</span>
                                        <span className="font-medium">
                                            {formatMoney(item.value, 'USD')}
                                        </span>
                                    </div>
                                ))}
                                <div className="flex justify-between border-t pt-2 font-bold">
                                    <span>Total gains</span>
                                    <span>{formatMoney(paie.remuneration_brute, 'USD')}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Retenues ($ USD)</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {retenues.map((item) => (
                                    <div key={item.label} className="flex justify-between">
                                        <span>{item.label}</span>
                                        <span className="font-medium">
                                            {formatMoney(item.value, 'USD')}
                                        </span>
                                    </div>
                                ))}
                                <div className="flex justify-between border-t pt-2 font-bold">
                                    <span>Total retenues</span>
                                    <span>{formatMoney(paie.total_retenues, 'USD')}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Récapitulatif</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <p className="text-sm font-medium ">Rémunération brute</p>
                                <p className="text-2xl font-bold">
                                    {formatMoney(paie.remuneration_brute, 'USD')}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium ">Total retenues</p>
                                <p className="text-2xl font-bold text-red-300">
                                    {formatMoney(paie.total_retenues, 'USD')}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium ">Net à payer</p>
                                <p className="text-2xl font-bold text-green-300">
                                    {formatMoney(paie.net_a_payer, 'USD')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="text-sm text-gray-500 mt-6">
                        <p>
                            Créé le {format(new Date(paie.created_at), 'PPPp', { locale: fr })} par {paie.created_by.name}
                        </p>
                        {paie.updated_by && (
                            <p>
                                Modifié le {format(new Date(paie.updated_at), 'PPPp', { locale: fr })} par {paie.updated_by.name}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}