import { Auth, PageProps, Succursale, User } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AppLayout from '@/layouts/app-layout';
import { ChevronLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Agent } from '@/types';

interface Contrat {
    id: number;
    ref: string;
    duree: string;
    date_debut: string;
    date_fin: string | null;
    type_contrat: string;
    anciennete: string | null;
    fonction: string;
    salaire_base: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    agent: Agent;
    succursale?: Succursale;
    created_by: User;
    updated_by?: User;
}

export default function Show({ auth, contrat }: { auth: Auth; contrat: Contrat }) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };
    console.log(contrat);
    return (
        <AppLayout
            auth={auth}
            breadcrumbs={[
                {
                    title: 'Gestion des Contrats',
                    href: '/contrats',
                },
                {
                    title: `Contrat de ${contrat.agent.nom} ${contrat.agent.postnom} ${contrat.agent.prenom}`,
                    href: `/contrats/${contrat.ref}`,
                },
            ]}
        >
            <Head title={`Détails du Contrat - ${contrat.ref}`} />

            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
            <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        
                        <Link href={route('contrats.index')}>
                            <Button variant={'outline'}><ChevronLeft className="h-4 w-4" /></Button>
                        </Link>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">Détails du Contrat de {contrat.agent.nom} {contrat.agent.postnom} {contrat.agent.prenom}</h2>
                    </div>
                    <div className="flex space-x-2">
                        <Link href={route('contrats.edit', contrat.ref)}>
                            <Button variant="outline">Modifier</Button>
                        </Link>
                        
                    </div>
                </div>
                <div className="grid gap-6">
                    <div className="overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                            <Card className="w-full md:w-1/3">
                                    <CardHeader className="items-center">
                                        <div className="flex flex-row gap-2">
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage src={contrat.agent.avatar_url} />
                                            <AvatarFallback>
                                                {getInitials(`${contrat.agent.nom} ${contrat.agent.postnom} ${contrat.agent.prenom}`)}
                                            </AvatarFallback>
                                        </Avatar>
                                        {contrat.agent.signature_url && (
                                            <Avatar className="h-24 w-24">
                                                <AvatarImage src={contrat.agent.signature_url} />
                                                <AvatarFallback>
                                                    {getInitials(`${contrat.agent.nom} ${contrat.agent.prenom}`)}
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                        </div>
                                       
                                        <CardTitle className="text-center mt-4 font-bold">
                                            <Link href={route('personnels.show', contrat.agent.ref)}>
                                            <Button variant="link">{contrat.agent.nom} {contrat.agent.postnom} {contrat.agent.prenom}</Button>
                                            </Link>
                                        </CardTitle>
                                        <Badge variant={contrat.agent.statut === 'actif' ? 'default' : 'destructive'}>
                                            {contrat.agent.statut}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Matricule</p>
                                                <p className='font-bold'>{contrat.agent.matricule}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Email</p>
                                                <p className='font-bold'>{contrat.agent.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Téléphone</p>
                                                <p className='font-bold'>{contrat.agent.telephone || 'Non spécifié'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Rôle</p>
                                                <p className='font-bold'>{contrat.agent.role === 'admin' ? 'Administrateur' : contrat.agent.role === 'ressource_humaine' ? 'Ressource Humaine' : contrat.agent.role === 'communicateur' ? 'Communicateur' : contrat.agent.role === 'caissière' ? 'Caissière' : contrat.agent.role === 'manager' ? 'Gestionnaire' : contrat.agent.role === 'agent' ? 'Agent' : contrat.agent.role === 'assistant_direction' ? 'Assistant Direction' : contrat.agent.role === 'charge_vente_client' ? 'Charge vente client' : contrat.agent.role === 'coiffeuse' ? 'Coiffeuse' : contrat.agent.role === 'maquilleuse' ? 'Maquilleuse' : contrat.agent.role === 'cleaner' ? 'Cleaner' : contrat.agent.role === 'estheticienne' ? 'Esthéticienne' : contrat.agent.role === 'prothesiste' ? 'Prothésiste' : 'Autre'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Succursale</p>
                                                <p className='font-bold'>{contrat.agent.succursale?.nom}</p>
                                            </div>
                                        </div>
                                        
                                    </CardContent>
                                </Card>

                                <Card className="w-full">
                                    <CardHeader>
                                        <CardTitle className="flex justify-between items-center">
                                            <span>Contrat </span>
                                            <Badge variant={contrat.is_active ? 'default' : 'secondary'}>
                                                {contrat.is_active ? 'Actif' : 'Inactif'}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Agent</p>
                                                <p className="font-bold">{`${contrat.agent.nom} ${contrat.agent.postnom} ${contrat.agent.prenom}`}</p>
                                                <p className="text-sm text-muted-foreground">Matricule</p>
                                                <p className="font-bold">{contrat.agent.matricule}</p>
                                            </div>

                                            <div>
                                                <p className="text-sm text-muted-foreground">Type de Contrat</p>
                                                <p className="font-bold">{contrat.type_contrat}</p>
                                                <p className="text-sm text-muted-foreground">Fonction</p>
                                                <p className="font-bold">{contrat.fonction === 'admin' ? 'Administrateur' : contrat.fonction === 'ressource_humaine' ? 'Ressource Humaine' : contrat.fonction === 'communicateur' ? 'Communicateur' : contrat.fonction === 'caissière' ? 'Caissière' : contrat.fonction === 'manager' ? 'Gestionnaire' : contrat.fonction === 'agent' ? 'Agent' : contrat.fonction === 'assistant_direction' ? 'Assistant Direction' : contrat.fonction === 'charge_vente_client' ? 'Charge vente client' : contrat.fonction === 'coiffeuse' ? 'Coiffeuse' : contrat.fonction === 'maquilleuse' ? 'Maquilleuse' : contrat.fonction === 'cleaner' ? 'Cleaner' : contrat.fonction === 'estheticienne' ? 'Esthéticienne' : contrat.fonction === 'prothesiste' ? 'Prothésiste' : 'Autre'}</p>
                                            </div>

                                            <div>
                                                <p className="text-sm text-muted-foreground">Durée</p>
                                                <p className="font-bold">{contrat.duree}</p>
                                                <p className="text-sm text-muted-foreground">Ancienneté</p>
                                                <p className="font-bold">{contrat.anciennete || 'Non spécifiée'}</p>
                                            </div>

                                            <div>
                                                <p className="text-sm text-muted-foreground">Salaire de Base</p>
                                                <p className="font-bold">{contrat.salaire_base || 'Non spécifié'}</p>
                                                <p className="text-sm text-muted-foreground">Succursale</p>
                                                <p className="font-bold">{contrat.succursale?.nom || 'Non spécifiée'}</p>
                                            </div>

                                            <div>
                                                <p className="text-sm text-muted-foreground">Date Début</p>
                                                <p className="font-bold">{format(new Date(contrat.date_debut), 'PPP', { locale: fr })}</p>
                                            </div>

                                            <div>
                                                <p className="text-sm text-muted-foreground">Date Fin</p>
                                                <p className="font-bold">{contrat.date_fin ? format(new Date(contrat.date_fin), 'PPP', { locale: fr }) : 'Non spécifiée'}</p>
                                            </div>
                                        </div>

                                        <div className="mt-8">
                                            <h3 className="font-medium mb-4">Métadonnées</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Créé le</p>
                                                    <p className="font-bold">{format(new Date(contrat.created_at), 'PPPp', { locale: fr })}</p>
                                                    <p className="text-sm text-muted-foreground">par</p>
                                                    <Link href={route('utilisateurs.show', contrat.created_by.ref)} className="font-bold">
                                                    <Button variant="link">{contrat.created_by.name}</Button>
                                                    </Link>
                                                </div>
                                                {contrat.updated_at !== contrat.created_at && (
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Modifié le</p>
                                                        <p className="font-bold">{format(new Date(contrat.updated_at), 'PPPp', { locale: fr })}</p>
                                                        <p className="text-sm text-muted-foreground">par</p>
                                                        <p className="font-bold">{contrat.updated_by?.name || 'Non spécifié'}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}