import { Auth, SharedData, type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Calendar, Users, DollarSign, Wifi, Tv, Mic, Utensils } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pencil, Trash2, Plus } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Dollar } from '@/hooks/Currencies';

interface Occupation {
    id: number;
    ref: string;
    date_occupation: string;
    statut: string;
    reservation_id: number;
    created_at: string;
}

interface Reservation {
    id: number;
    date_debut: string;
    date_fin: string;
    statut: string;
    prix_total: number;
    ref: string;
    specifications: any;
    client: {
        id: number;
        nom: string;
        prenom: string;
        email: string;
        telephone: string;
    };
    occupations: Occupation[];
}

interface Salle {
    id: number;
    ref: string;
    nom: string;
    capacite_max: number;
    vocation: string;
    prix_journee: number;
    prix_nuit: number;
    equipements: string;
    disponible: boolean;
    created_at: string;
    updated_at: string;
    reservations: Reservation[];
}

interface PageProps {
    auth: Auth;
    salle: Salle;
    occupations: Occupation[];
}

const breadcrumbs = (salle: Salle): BreadcrumbItem[] => [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Salles',
        href: '/salles',
    },
    {
        title: salle.nom,
        href: '#',
    },
];

export default function SalleShow({ auth, salle, occupations }: PageProps) {
    const { flash } = usePage<SharedData>().props;

    flash.error && toast.error(flash.error);
    flash.success && toast.success(flash.success);

    const handleDelete = () => {
        router.delete(route('salles.destroy', salle.id));
    };

    const getVocationBadgeVariant = (vocation: string) => {
        switch (vocation) {
            case 'mixte': return 'default';
            case 'journee': return 'secondary';
            case 'nuit': return 'outline';
            default: return 'secondary';
        }
    };

    const getVocationLabel = (vocation: string) => {
        switch (vocation) {
            case 'journee': return 'Journée';
            case 'nuit': return 'Nuit';
            case 'mixte': return 'Mixte';
            default: return vocation;
        }
    };

    const getReservationStatutBadge = (statut: string) => {
        switch (statut) {
            case 'confirmee': return 'default';
            case 'en_attente': return 'secondary';
            case 'annulee': return 'destructive';
            case 'terminee': return 'outline';
            default: return 'secondary';
        }
    };

    const getOccupationStatutBadge = (statut: string) => {
        switch (statut) {
            case 'occupee': return 'destructive';
            case 'liberee': return 'default';
            default: return 'secondary';
        }
    };

    const getEquipementIcon = (equipement: string) => {
        if (!equipement) return <span className="text-muted-foreground">Aucun équipement</span>;
        
        const equipements = equipement.toLowerCase().split(',').map(e => e.trim());
        
        const icons = [];
        if (equipements.some(e => e.includes('sono') || e.includes('sonorisation'))) {
            icons.push(<Mic key="sono" className="h-4 w-4"  />);
        }
        if (equipements.some(e => e.includes('projecteur') || e.includes('vidéo'))) {
            icons.push(<Tv key="projector" className="h-4 w-4"  />);
        }
        if (equipements.some(e => e.includes('wifi') || e.includes('internet'))) {
            icons.push(<Wifi key="wifi" className="h-4 w-4"  />);
        }
        if (equipements.some(e => e.includes('cuisine') || e.includes('restauration'))) {
            icons.push(<Utensils key="kitchen" className="h-4 w-4"   />);
        }

        return icons.length > 0 ? icons : <span className="text-muted-foreground">Aucun équipement spécifique</span>;
    };

    const reservationsActives = salle.reservations.filter(r => 
        ['confirmee', 'en_attente'].includes(r.statut)
    );

    const reservationsPassees = salle.reservations.filter(r => 
        ['terminee', 'annulee'].includes(r.statut)
    );

    const totalJoursOccupation = occupations.length;

    const canUpdate = auth.user.role === 'admin';
    const canDelete = auth.user.role === 'admin';

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs(salle)}>
            <Head title={salle.nom} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('salles.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Retour aux salles
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Calendar className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">
                                    {salle.nom}
                                </h1>
                                <p className="text-muted-foreground">
                                    • Dernière mise à jour: {format(new Date(salle.updated_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <Link href={route('reservations.create', { salle_id: salle.ref })}>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Nouvelle réservation
                            </Button>
                        </Link>
                        {canUpdate && (
                            <Link href={route('salles.edit', salle.ref)}>
                                <Button variant="outline">
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Modifier
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Grid principal */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Colonne de gauche - Informations générales */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Carte informations principales */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations de la salle</CardTitle>
                                <CardDescription>
                                    Détails complets de la configuration de la salle
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Nom
                                        </label>
                                        <p className="text-lg font-semibold">{salle.nom}</p>
                                    </div>
                                    
                                   
                                    
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Vocation
                                        </label>
                                        <div>
                                            <Badge variant={getVocationBadgeVariant(salle.vocation)}>
                                                {getVocationLabel(salle.vocation)}
                                            </Badge>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Capacité maximale
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-blue-600" />
                                            <span className="text-lg font-semibold">
                                                {salle.capacite_max} personnes
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Prix journée
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-green-600" />
                                            <span className="text-lg font-semibold">
                                                {Dollar(salle.prix_journee)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Prix nuit
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-purple-600" />
                                            <span className="text-lg font-semibold">
                                                {Dollar(salle.prix_nuit)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Statut
                                        </label>
                                        <div>
                                            <Badge variant={salle.disponible ? 'default' : 'secondary'}>
                                                {salle.disponible ? 'Disponible' : 'Indisponible'}
                                            </Badge>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Date de création
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-orange-600" />
                                            <span>
                                                {format(new Date(salle.created_at), 'dd MMMM yyyy', { locale: fr })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Équipements
                                    </label>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        {getEquipementIcon(salle.equipements)}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {salle.equipements}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Réservations actives */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Réservations actives
                                </CardTitle>
                                <CardDescription>
                                    {reservationsActives.length} réservation(s) en cours ou à venir
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {reservationsActives.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Référence</TableHead>
                                                <TableHead>Client</TableHead>
                                                <TableHead>Période</TableHead>
                                                <TableHead>Vocation</TableHead>
                                                <TableHead>Montant</TableHead>
                                                <TableHead>Statut</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {reservationsActives.map((reservation) => {
                                                const dateDebut = new Date(reservation.date_debut);
                                                const dateFin = new Date(reservation.date_fin);
                                                const vocation = reservation.specifications?.vocation || 'journee';
                                                
                                                return (
                                                    <TableRow key={reservation.id}>
                                                        <TableCell className="font-mono text-sm">
                                                            {reservation.ref}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <p className="font-medium">
                                                                    {reservation.client.prenom} {reservation.client.nom}
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {reservation.client.telephone}
                                                                </p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {format(dateDebut, 'dd/MM/yyyy')}
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {format(dateFin, 'dd/MM/yyyy')}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">
                                                                {getVocationLabel(vocation)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="font-semibold">
                                                            {Dollar(reservation.prix_total)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={getReservationStatutBadge(reservation.statut)}>
                                                                {reservation.statut}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-8">
                                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">
                                            Aucune réservation active pour cette salle
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Colonne de droite - Statistiques et actions */}
                    <div className="space-y-6">
                        {/* Carte statistiques */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Statistiques</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <p className="text-2xl font-bold text-blue-600">
                                            {salle.reservations.length}
                                        </p>
                                        <p className="text-sm text-blue-600">Total réservations</p>
                                    </div>
                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <p className="text-2xl font-bold text-green-600">
                                            {reservationsActives.length}
                                        </p>
                                        <p className="text-sm text-green-600">Réservations actives</p>
                                    </div>
                                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                                        <p className="text-2xl font-bold text-orange-600">
                                            {reservationsPassees.length}
                                        </p>
                                        <p className="text-sm text-orange-600">Réservations passées</p>
                                    </div>
                                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                                        <p className="text-2xl font-bold text-purple-600">
                                            {totalJoursOccupation}
                                        </p>
                                        <p className="text-sm text-purple-600">Jours occupés</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Carte occupation récente */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Occupation récente</CardTitle>
                                <CardDescription>
                                    7 derniers jours
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {occupations.slice(0, 7).map((occupation) => (
                                        <div key={occupation.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                            <span className="text-sm">
                                                {format(new Date(occupation.date_occupation), 'EEEE dd/MM', { locale: fr })}
                                            </span>
                                            <Badge variant={getOccupationStatutBadge(occupation.statut)}>
                                                {occupation.statut}
                                            </Badge>
                                        </div>
                                    ))}
                                    {occupations.length === 0 && (
                                        <p className="text-center text-muted-foreground py-4">
                                            Aucune occupation enregistrée
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Carte actions rapides */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions rapides</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Link href={route('reservations.create', { salle_id: salle.ref })} className="w-full">
                                    <Button variant="outline" className="w-full justify-start mb-3">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Nouvelle réservation
                                    </Button>
                                </Link>
                                
                                {canUpdate && (
                                    <Link href={route('salles.edit', salle.ref)} className="w-full">
                                        <Button variant="outline" className="w-full justify-start mb-3">
                                            <Pencil className="h-4 w-4 mr-2" />
                                            Modifier la salle
                                        </Button>
                                    </Link>
                                )}

                                {canDelete && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" className="w-full justify-start">
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Supprimer la salle
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Supprimer {salle.nom} ?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Cette action est irréversible. La salle et toutes ses réservations associées seront définitivement supprimées.
                                                    {reservationsActives.length > 0 && (
                                                        <span className="block mt-2 text-red-600 font-semibold">
                                                            Attention: {reservationsActives.length} réservation(s) active(s) seront également supprimées.
                                                        </span>
                                                    )}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleDelete}>
                                                    Supprimer définitivement
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}