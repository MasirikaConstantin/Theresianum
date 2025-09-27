import { Auth, Contrat, flash, PageProps, Reference } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AppLayout from '@/layouts/app-layout';
import { ChevronLeft, PrinterIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import * as Spinners from 'react-spinners';

import { ReferencesList } from '@/components/ReferencesList';
import { ReferenceModal } from '@/components/ReferenceModal';

interface Agent {
    id: number;
    matricule: string;
    nom: string;
    postnom: string;
    prenom: string;
    numero_cnss: string;
    sexe: string;
    telephone: string;
    adresse: string;
    date_naissance: string;
    lieu_naissance: string;
    etat_civil: string;
    province_origine: string;
    territoire_origine: string;
    district_origine: string;
    commune_origine: string;
    email: string;
    role: string;
    ref : string;
    succursale: {
        name: string;
    };
    statut: string;
    avatar: string;
    signature: string;
    created_at: string;
    updated_at: string;
    createdBy: {
        name: string;
    };
    updatedBy: {
        name: string;
    };
    contrats: Contrat[];
}

export default function Show({ auth, agent,flash }: { agent: Agent,contrats: Contrat[], auth: Auth,flash: flash     }) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };
    const { data, setData, post, processing, errors, reset } = useForm({
        avatar: null as File | null,
        signature: null as File | null,
    });
    
    const updateMedia: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        post(route('personnels.update-media', agent.ref), {
            onSuccess: () => {
                setData({
                    avatar: null,
                    signature: null,
                });
                reset();
                toast.success('Medias mis à jour avec succès.');
            },
            onError: (error) => {
                console.log(error);
                toast.error('Une erreur est survenue lors de la mise à jour des médias.');
            },
            forceFormData: true,
        });
    };


    const [references, setReferences] = useState<Reference[]>([]);
    const [isLoadingReferences, setIsLoadingReferences] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentReference, setCurrentReference] = useState<Reference | null>(null);

    // Fonction pour charger les références
    const loadReferences = async () => {
        setIsLoadingReferences(true);
        try {
            const response = await axios.get(`/api/agents/${agent.id}/references`);
            setReferences(response.data);
        } catch (error) {
            console.error('Error loading references:', error);
        } finally {
            setIsLoadingReferences(false);
        }
    };

    // Chargez les références au montage du composant
    useEffect(() => {
        loadReferences();
    }, [agent.id]);

    const handleShowContrat = (ref: string) => {
        router.visit(route('contrats.show', ref));
    };
    return (
        <AppLayout
            auth={auth}
            breadcrumbs={[
                { title: 'Accueil', href: route('dashboard') },
                { title: 'Gestion du Personnel', href: route('personnels.index') },
                { title: 'Détails de l\'Agent', href: route('personnels.show', agent.id) },
            ]}
        >
            <Head title={`Détails de l'Agent - ${agent.nom} ${agent.prenom}`} />

            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        
                        <Link href={route('personnels.index')}>
                            <Button variant={'outline'}><ChevronLeft className="h-4 w-4" /></Button>
                        </Link>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">Détails de l'Agent</h2>
                    </div>
                     <Button variant="outline" asChild>
                                                <Link href={route('agents.fiche-identification', agent.ref)} target="_blank">
                                                    <PrinterIcon className="mr-2 h-4 w-4" />
                                                    Fiche Identification
                                                </Link>
                                            </Button>
                    <Link href={route('personnels.edit', agent.ref)}>
                            <Button variant="default">Modifier</Button>
                        </Link>
                </div>
                <div className="grid gap-6">
                    <div className="overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                <Card className="w-full md:w-1/3">
                                    <CardHeader className="items-center">
                                        <div className="flex flex-row gap-2">
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage src={agent.avatar_url} />
                                            <AvatarFallback>
                                                {getInitials(`${agent.nom} ${agent.prenom}`)}
                                            </AvatarFallback>
                                        </Avatar>
                                        {agent.signature_url && (
                                            <Avatar className="h-24 w-24">
                                                <AvatarImage src={agent.signature_url} />
                                                <AvatarFallback>
                                                    {getInitials(`${agent.nom} ${agent.prenom}`)}
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                        </div>
                                       
                                        <CardTitle className="text-center mt-4 font-bold">
                                            {agent.nom} {agent.postnom} {agent.prenom}
                                        </CardTitle>
                                        <Badge variant={agent.statut === 'actif' ? 'default' : 'destructive'}>
                                            {agent.statut}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Matricule</p>
                                                <p className='font-bold'>{agent.matricule}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Email</p>
                                                <p className='font-bold'>{agent.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Téléphone</p>
                                                <p className='font-bold'>{agent.telephone || 'Non spécifié'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Rôle</p>
                                                <p className='font-bold'>{agent.role === 'admin' ? 'Administrateur' : agent.role === 'ressource_humaine' ? 'Ressource Humaine' : agent.role === 'communicateur' ? 'Communicateur' : agent.role === 'caissière' ? 'Caissière' : agent.role === 'manager' ? 'Gestionnaire' : agent.role === 'agent' ? 'Agent' : agent.role === 'assistant_direction' ? 'Assistant Direction' : agent.role === 'charge_vente_client' ? 'Charge vente client' : agent.role === 'coiffeuse' ? 'Coiffeuse' : agent.role === 'maquilleuse' ? 'Maquilleuse' : agent.role === 'cleaner' ? 'Cleaner' : agent.role === 'estheticienne' ? 'Esthéticienne' : agent.role === 'prothesiste' ? 'Prothésiste' : 'Autre'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Succursale</p>
                                                <p className='font-bold'>{agent.succursale?.nom}</p>
                                            </div>
                                        </div>
                                        <div className="mt-6 flex flex-col gap-2 mb-2">
                                            <form onSubmit={updateMedia} encType="multipart/form-data">
                                                <div className="flex flex-col gap-2 mb-2">
                                                    <Label>{agent.avatar_url ? 'Modifier la photo' : 'Ajouter une photo'}</Label>
                                                    <Input type="file"
                                                    onChange={(e) => setData('avatar', e.target.files?.[0] || null)}
                                                    className="file:"
                                                    accept="image/*"
                                                     />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <Label> {agent.signature_url ? 'Modifier la signature' : 'Ajouter une signature'}</Label>
                                                    <Input type="file"
                                                    onChange={(e) => setData('signature', e.target.files?.[0] || null)}
                                                    accept="image/*"
                                                     />
                                                </div>
                                                <Button type="submit" className="mt-2">Enregistrer</Button>
                                            </form>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="w-full md:w-2/3">
                                    <CardHeader>
                                        <CardTitle>Informations Personnelles</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Sexe</p>
                                                <p className='font-bold'>{agent.sexe === 'M' ? 'Masculin' : 'Féminin'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Date de Naissance</p>
                                                <p className='font-bold'>{format(new Date(agent.date_naissance), 'PPP', { locale: fr }) || 'Non spécifiée'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Lieu de Naissance</p>
                                                <p className='font-bold'>{agent.lieu_naissance || 'Non spécifié'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">État Civil</p>
                                                <p className='font-bold'>{agent.etat_civil || 'Non spécifié'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Nombre d'enfants</p>
                                                <p className='font-bold'>{agent.nombre_enfant || 'Non spécifié'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Numéro CNSS</p>
                                                <p className='font-bold'>{agent.numero_cnss || 'Non spécifié'}</p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <p className="text-sm text-muted-foreground">Adresse</p>
                                                <p className='font-bold'>{agent.adresse || 'Non spécifiée'}</p>
                                            </div>
                                        </div>

                                        <div className="mt-8">
                                            <h3 className="font-medium mb-4">Origine</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Province</p>
                                                    <p className='font-bold' >{agent.province_origine || 'Non spécifiée'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Territoire</p>
                                                    <p className='font-bold' >{agent.territoire_origine || 'Non spécifié'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">District</p>
                                                    <p className='font-bold' >{agent.district_origine || 'Non spécifié'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Commune</p>
                                                    <p className='font-bold' >{agent.commune_origine || 'Non spécifiée'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8">
                                            <h3 className="font-medium mb-4">Métadonnées</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Créé le</p>
                                                    <p className='font-bold' >{format(new Date(agent.created_at), 'PPPp', { locale: fr })}</p>
                                                    <p className="text-sm text-muted-foreground">par</p>
                                                    <p className='font-bold' >{agent.created_by?.name || 'Système'}</p>
                                                </div>
                                                {agent.updated_at !== agent.created_at && (
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Modifié le</p>
                                                        <p className='font-bold' >{format(new Date(agent.updated_at), 'PPPp', { locale: fr })}</p>
                                                        <p className="text-sm text-muted-foreground">par</p>
                                                        <p className='font-bold' >{agent.updated_by?.name || 'Non modifié'}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex flex-col md:flex-row gap-6 mt-6">
                            <Card className='w-full md:w-1/3'>
                                <CardHeader>
                                    <CardTitle>Contrats</CardTitle>
                                </CardHeader>
                                <CardContent>
                                   {agent.contrats.length > 0 ? (
                                   agent.contrats.map((contrat: Contrat) => (
                                        <div key={contrat.id} onClick={() => handleShowContrat(contrat.ref)} className="mb-4 border-b pb-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:bg-accent hover:text-accent-foreground hover:scale-105 hover:z-10 p-2 rounded-md text-white bg-gray-300">
                                            <p className="text-sm text-muted-foreground">Debut: <span className="font-bold">{contrat.date_debut ? format( new Date(contrat.date_debut), 'PPP', { locale: fr }) : 'N/A'}</span></p>
                                            <p className="text-sm text-muted-foreground">Fin: <span className="font-bold">{contrat.date_fin ? format( new Date(contrat.date_fin), 'PPP', { locale: fr }) : 'N/A'}</span></p>
                                            <p className="text-sm text-muted-foreground">Type: <span className="font-bold">{contrat.type_contrat}</span></p>
                                            <p className="text-sm text-muted-foreground">Fonction: <span className="font-bold">{contrat.fonction}</span></p>
                                            <p className="text-sm text-muted-foreground">Salaire: <span className="font-bold">{contrat.salaire_base}</span></p>
                                            <p className="text-sm text-muted-foreground">Actif: <span className="font-bold"> <Badge variant={contrat.is_active ? 'default' : 'destructive'}>{contrat.is_active ? 'Oui' : 'Non'}</Badge></span></p>    
                                            <p className="text-sm text-muted-foreground">Par: <span className="font-bold">{contrat.created_by?.name}</span></p>
                                            <p className="text-sm text-muted-foreground">Affecté à: <span className="font-bold">{contrat.succursale?.nom}</span></p>
                                        </div>
                                    ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Aucun contrat trouvé</p>
                                    )}
                                </CardContent>
                            </Card>
                            <Card className="w-full md:w-2/3 p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-medium">Personnes de référence</h3>
                                    <Button 
                                        size="sm" 
                                        onClick={() => {
                                            setCurrentReference(null);
                                            setModalOpen(true);
                                        }}
                                    >
                                        Ajouter une référence
                                    </Button>
                                </div>
                                
                                {isLoadingReferences ? (
                                    <div className="flex justify-center py-4">
                                        <Spinners.PuffLoader />
                                    </div>
                                ) : (
                                    <ReferencesList
                                        references={references}
                                        agentId={agent.id}
                                        onRefresh={loadReferences}
                                        flash={flash}
                                        onEdit={(reference) => {
                                            setCurrentReference(reference);
                                            setModalOpen(true);
                                        }}
                                    />
                                )}
                            </Card>
                            </div>

                            {/*Ajoutez le modal à la fin du composant (avant la fermeture de AppLayout)*/}

                            <ReferenceModal
                                open={modalOpen}
                                onClose={() => setModalOpen(false)}
                                agentId={agent.id}
                                reference={currentReference}
                                onSuccess={loadReferences}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}