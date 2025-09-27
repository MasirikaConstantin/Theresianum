import { Head, Link } from '@inertiajs/react';
import { Auth, BreadcrumbItem, Conge, flash } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PrinterIcon, CheckIcon, XIcon } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { route } from 'ziggy-js';
import { toast } from 'sonner';


const statusColors = {
    en_attente: 'bg-yellow-100 text-yellow-800',
    approuve: 'bg-green-100 text-green-800',
    rejete: 'bg-red-100 text-red-800',
};

const typeColors = {
    annuel: 'bg-blue-100 text-blue-800',
    maladie: 'bg-purple-100 text-purple-800',
    maternite: 'bg-pink-100 text-pink-800',
    exceptionnel: 'bg-orange-100 text-orange-800',
    sans_solde: 'bg-gray-100 text-gray-800',
};

export default function Show({ auth, conge, canApprove, flash }: {auth: Auth, conge: Conge, canApprove: boolean, flash: flash}) {
    const getTypeLabel = () => {
        const types: Record<string, string> = {
            annuel: 'Congé Annuel',
            maladie: 'Congé de Maladie', 
            maternite: 'Congé de Maternité',
            exceptionnel: 'Congé Exceptionnel',
            sans_solde: 'Congé Sans Solde'
        };
        return types[conge.type] || conge.type;
    };
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Tableau de bord', href: route('dashboard') },
        { title: 'Congés', href: route('conges.index') },
        { title: `Congé de ${conge.agent.nom} ${conge.agent.postnom} ${conge.agent.prenom}`, href: route('conges.show', conge.ref) },
    ];
    if (flash.success) {
        toast.success(flash.success);
    }
    if (flash.error) {
        toast.error(flash.error);
    }
    const fonction = conge.agent.contrats?.[0].fonction;
    return (
        <AppLayout
            auth={auth}
            breadcrumbs={breadcrumbs}
        >
            <Head title={`Détails du congé de ${conge.agent.nom} ${conge.agent.postnom} ${conge.agent.prenom}`} />

            <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                    <h1 className="font-bold text-2xl  leading-tight">
                        Détails du congé
                    </h1>
                    <div className="flex gap-2">
                        <div className="flex justify-end gap-4 no-print">
                            <Button variant="outline" asChild>
                                <Link href={route('conges.index')}>Retour à la liste</Link>
                            </Button>
                            <Button asChild>
                                <Link href={route('conges.edit', conge.ref)}>Modifier</Link>
                            </Button>
                            {conge.statut === 'approuve' && (
                            <Button variant="outline" asChild>
                                <Link href={route('conges.print', conge.ref)} target="_blank">
                                    <PrinterIcon className="mr-2 h-4 w-4" />
                                    Bon de sortie
                                </Link>
                            </Button>
                                )}
                        </div>
                        {canApprove && conge.statut === 'en_attente' && (
                            <>
                                <Button asChild>
                                    <Link method="post" href={route('conges.approve', conge.id)}>
                                        <CheckIcon className="mr-2 h-4 w-4" />
                                        Approuver
                                    </Link>
                                </Button>
                                <Button variant="destructive" asChild>
                                    <Link method="post" href={route('conges.reject', conge.id)}>
                                        <XIcon className="mr-2 h-4 w-4" />
                                        Rejeter
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Informations générales</CardTitle>
                                <Badge className={statusColors[conge.statut as keyof typeof statusColors]}>
                                    {conge.statut === 'approuve' ? 'APPROUVÉ' : 
                                     conge.statut === 'rejete' ? 'REJETÉ' : 'EN ATTENTE'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <p className="text-sm font-medium ">Agent</p>
                                <p className="font-medium"><Link href={route('personnels.show', conge.agent.ref)}><Button variant={'link'}>{conge.agent.nom} {conge.agent.postnom} {conge.agent.prenom}</Button></Link></p>
                                <p className="text-sm ">Matricule: {conge.agent.matricule}</p>
                                <p className='font-bold'>{fonction === 'admin' ? 'Administrateur' : fonction === 'ressource_humaine' ? 'Ressource Humaine' : fonction === 'communicateur' ? 'Communicateur' : fonction === 'caissière' ? 'Caissière' : fonction === 'manager' ? 'Gestionnaire' : fonction === 'agent' ? 'Agent' : fonction === 'assistant_direction' ? 'Assistant Direction' : fonction === 'charge_vente_client' ? 'Charge vente client' : fonction === 'coiffeuse' ? 'Coiffeuse' : fonction === 'maquilleuse' ? 'Maquilleuse' : fonction === 'cleaner' ? 'Cleaner' : fonction === 'estheticienne' ? 'Esthéticienne' : fonction === 'prothesiste' ? 'Prothésiste' : 'Autre'}</p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium ">Type de congé</p>
                                <Badge className={typeColors[conge.type as keyof typeof typeColors]}>
                                    {getTypeLabel()}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Période de congé</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span>Date de début</span>
                                    <span className="font-medium">
                                        {format(new Date(conge.date_debut), 'PPP', { locale: fr })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Date de fin</span>
                                    <span className="font-medium">
                                        {format(new Date(conge.date_fin), 'PPP', { locale: fr })}
                                    </span>
                                </div>
                                <div className="flex justify-between border-t pt-2 font-bold">
                                    <span>Durée totale</span>
                                    <span>{conge.duree_jours} jours</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Statut</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span>Date d'initiation</span>
                                    <span className="font-medium">
                                        {format(new Date(conge.created_at), 'PPPp', { locale: fr })}
                                    </span>
                                </div>
                                {conge.approbateur && (
                                    <div className="flex justify-between">
                                        <span>{conge.statut === 'approuve' ? 'Approuvé par' : 'Rejeté par'}</span>
                                        <span className="font-medium">
                                            {conge.approbateur.name}
                                        </span>
                                    </div>
                                )}
                                {conge.commentaire && (
                                    <div className="pt-2 border-t">
                                        <p className="text-sm font-medium">Commentaire</p>
                                        <p className="text-sm">{conge.commentaire}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Motif du congé</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-line">{conge.motif}</p>
                        </CardContent>
                    </Card>

                    
                </div>
            </div>
        </AppLayout>
    );
}