import { Auth, Vente, type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, User, Bed, Building, DollarSign, FileText, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import AppLayout from '@/layouts/app-layout';
import { DateHeure, Dollar, FrancCongolais } from '@/hooks/Currencies';
import { fr } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import UpdatePaiementStatus from '@/components/UpdatePaiementStatus';
import { string } from 'zod';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Reservation {
    id: number;
    ref: string;
    type_paiement: 'espece' | 'cheque' | 'virement';
    statut_paiement: 'paye' | 'non_paye';
    type_reservation: 'chambre' | 'salle';
    client: {
        id: number;
        name: string;
        telephone: string;
        email: string;
    };
    salle: {
        id: number;
        nom: string;
        capacite_max: number;
        vocation: string;
        prix_journee: number;
        prix_nuit: number;
    } | null;
    chambre: {
        id: number;
        numero: string;
        type: string;
        prix: number;
    } | null;
    date_debut: string;
    date_fin: string;
    statut: string;
    prix_total: number;
    vocation: string | null;
    created_at: string;
    ventes: Vente[];
}

interface Props {
    auth: Auth;
    reservation: Reservation;
}

export default function ReservationShow({ auth, reservation }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { 
            title: reservation.type_reservation === 'salle' ? 'Réservations Salles' : 'Réservations Chambres', 
            href: reservation.type_reservation === 'salle' ? '/reservations' : '/chambres-reservations' 
        },
        { title: `Réservation ${reservation.client.name}`, href: '#' },
    ];

    const getStatutBadgeVariant = (statut: string) => {
        switch (statut) {
            case 'confirmee': return 'default';
            case 'en_attente': return 'secondary';
            case 'annulee': return 'destructive';
            case 'terminee': return 'outline';
            default: return 'secondary';
        }
    };

    const getStatutLabel = (statut: string) => {
        switch (statut) {
            case 'confirmee': return 'Confirmée';
            case 'en_attente': return 'En attente';
            case 'annulee': return 'Annulée';
            case 'terminee': return 'Terminée';
            default: return statut;
        }
    };

    const getVocationLabel = (vocation: string | null) => {
        if (!vocation) return 'Non définie';
        
        switch (vocation) {
            case 'journee': return 'Journée';
            case 'nuit': return 'Nuit';
            case 'mixte': return 'Mixte';
            default: return vocation;
        }
    };

    const formatDateTime = (dateTime: string) => {
        const date = new Date(dateTime);
        return {
            date: format(date, 'PPP', { locale: fr }),
            time: format(date, 'p', { locale: fr }),
            full: format(date, 'PPP à HH:mm', { locale: fr })
        };
    };

    const getDuree = () => {
        const debut = new Date(reservation.date_debut);
        const fin = new Date(reservation.date_fin);
        const diffTime = fin.getTime() - debut.getTime();
        
        if (reservation.type_reservation === 'salle') {
            const jours = Math.ceil(diffTime / (1000 * 3600 * 24)) + 1;
            return `${jours} jour(s)`;
        } else {
            const nuits = Math.ceil(diffTime / (1000 * 3600 * 24));
            return `${nuits} nuit(s)`;
        }
    };

    const getPrixUnitaire = () => {
        if (reservation.type_reservation === 'salle' && reservation.salle) {
            return reservation.vocation === 'nuit' ? reservation.salle.prix_nuit : reservation.salle.prix_journee;
        } else if (reservation.type_reservation === 'chambre' && reservation.chambre) {
            return reservation.chambre.prix;
        }
        return 0;
    };

    const getUnitePrix = () => {
        if (reservation.type_reservation === 'salle') {
            return reservation.vocation === 'nuit' ? 'nuit' : 'jour';
        } else {
            return 'nuit';
        }
    };

    const debut = formatDateTime(reservation.date_debut);
    const fin = formatDateTime(reservation.date_fin);
    const duree = getDuree();
    const prixUnitaire = getPrixUnitaire();
    const unitePrix = getUnitePrix();

    const canUpdate = auth.user.role === 'admin' || auth.user.role === 'receptionniste';
    const canDelete = auth.user.role === 'admin';
    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title={`Réservation ${reservation.client.name}`} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-6">
                {/* En-tête */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={
                            reservation.type_reservation === 'salle' 
                                ? route('reservations.index') 
                                : route('chambres-reservations.index')
                        }>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Retour
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Réservation {reservation.client.name}
                            </h1>
                            <p className="text-muted-foreground">
                                {reservation.type_reservation === 'salle' ? 'Salle' : 'Chambre'} • 
                                Créée le {DateHeure(reservation.created_at)}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        {canUpdate && (
                            <Link href={
                                reservation.type_reservation === 'salle'
                                    ? route('reservations.edit', reservation.ref)
                                    : route('chambres-reservations.edit', reservation.ref)
                            }>
                                <Button variant="outline">
                                    Modifier
                                </Button>
                            </Link>
                        )}
                        <Link href={route('reservations.print', reservation.ref)}>
                            <Button variant="outline">
                                Imprimer
                            </Button>
                        </Link>
                        <Badge variant={getStatutBadgeVariant(reservation.statut)} className="text-sm px-3 py-1">
                            {getStatutLabel(reservation.statut)}
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Colonne principale */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Informations de réservation */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Informations de la réservation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Type de réservation
                                        </label>
                                        <p className="font-medium capitalize">
                                            {reservation.type_reservation}
                                        </p>
                                    </div>
                                    
                                    {reservation.type_reservation === 'salle' && reservation.vocation && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Vocation
                                            </label>
                                            <p className="font-medium">
                                                {getVocationLabel(reservation.vocation)}
                                            </p>
                                        </div>
                                    )}
                                    
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Durée
                                        </label>
                                        <p className="font-medium">
                                            {duree}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Période */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Période de réservation
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            Arrivée / Début
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-semibold">{debut.date}</p>
                                            <p className="text-sm text-muted-foreground">{debut.time}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            Départ / Fin
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-semibold">{fin.date}</p>
                                            <p className="text-sm text-muted-foreground">{fin.time}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Informations du client */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Informations client
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Client
                                        </label>
                                        <p className="font-medium">{reservation.client.name}</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Téléphone
                                            </label>
                                            <p className="font-medium">{reservation.client.telephone}</p>
                                        </div>
                                        
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Email
                                            </label>
                                            <p className="font-medium">{reservation.client.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5" />
                                    Ventes effectuées sur cette réservation 
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium">
                                    Nombre de ventes : {reservation.ventes?.length || 0} le total est de <span className="font-semibold text-green-500 text-md">{FrancCongolais(reservation.ventes?.reduce((total, vente) => total + parseFloat(vente.montant_total), 0) || 0)}</span>
                                    </label>
                                </div>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Prix total</TableHead>
                                        <TableHead>Client</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reservation.ventes?.map((vente) => (
                                        <TableRow key={vente.id}>
                                            <TableCell>{vente.code}</TableCell>
                                            <TableCell>{FrancCongolais(vente.montant_total)}</TableCell>
                                            <TableCell>{vente.client?.name}</TableCell>
                                            <TableCell>{DateHeure(vente.created_at)}</TableCell>
                                            <TableCell>
                                                <Button variant="outline" onClick={() => router.visit(`/ventes/${vente.ref}`)}>
                                                    Voir
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent></Card>
                    </div>

                    {/* Colonne latérale */}
                    <div className="space-y-6">
                    <UpdatePaiementStatus reservation={reservation} />
                        {/* Informations de la salle/chambre */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {reservation.type_reservation === 'salle' ? (
                                        <Building className="h-5 w-5" />
                                    ) : (
                                        <Bed className="h-5 w-5" />
                                    )}
                                    {reservation.type_reservation === 'salle' ? 'Salle réservée' : 'Chambre réservée'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {reservation.type_reservation === 'salle' && reservation.salle ? (
                                    <>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Salle
                                            </label>
                                            <p className="font-semibold text-lg">{reservation.salle.nom}</p>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">
                                                    Capacité
                                                </label>
                                                <p className="font-medium">{reservation.salle.capacite_max} personnes</p>
                                            </div>
                                            
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">
                                                    Vocation
                                                </label>
                                                <p className="font-medium capitalize">{reservation.salle.vocation}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">
                                                    Prix journée
                                                </label>
                                                <p className="font-medium">{Dollar(reservation.salle.prix_journee)}</p>
                                            </div>
                                            
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">
                                                    Prix nuit
                                                </label>
                                                <p className="font-medium">{Dollar(reservation.salle.prix_nuit)}</p>
                                            </div>
                                        </div>
                                    </>
                                ) : reservation.type_reservation === 'chambre' && reservation.chambre ? (
                                    <>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Chambre
                                            </label>
                                            <p className="font-semibold text-lg">
                                                Chambre {reservation.chambre.numero}
                                            </p>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">
                                                    Type
                                                </label>
                                                <p className="font-medium capitalize">{reservation.chambre.type}</p>
                                            </div>
                                            
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">
                                                    Prix/nuit
                                                </label>
                                                <p className="font-medium">{Dollar(reservation.chambre.prix)}</p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-muted-foreground text-center py-4">
                                        {reservation.type_reservation === 'salle' ? 'Salle' : 'Chambre'} non trouvée
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Récapitulatif financier */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Récapitulatif
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">
                                        Prix par {unitePrix}:
                                    </span>
                                    <span className="font-medium">
                                        {Dollar(prixUnitaire)}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">
                                        Durée:
                                    </span>
                                    <span className="font-medium">
                                        {duree}
                                    </span>
                                </div>
                                
                                <div className="border-t pt-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">Total:</span>
                                        <span className="font-bold text-lg">
                                            {Dollar(reservation.prix_total)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        {canDelete && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                        Supprimer la réservation
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Supprimer la réservation</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Êtes-vous sûr de vouloir supprimer cette réservation ?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => {
                                            router.delete(
                                                reservation.type_reservation === 'salle'
                                                    ? route('reservations.destroy', reservation.id)
                                                    : route('chambres-reservations.destroy', reservation.id)
                                            );
                                        }}>Supprimer</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}